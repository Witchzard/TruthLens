import { GoogleGenAI, Type } from '@google/genai';
import { ForensicFinding, SignalMetric } from '../types/forensic.js';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check your environment configuration.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const geminiForensicResponseSchema = {
  type: Type.OBJECT,
  properties: {
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          category: {
            type: Type.STRING,
            description: 'One of: visual_inconsistency, ai_generation, editing_artifact, metadata, facial_anomaly, temporal_artifact, text_formatting',
          },
          severity: {
            type: Type.STRING,
            description: 'One of: low, medium, high',
          },
          explanation: { type: Type.STRING },
          locationOrTimestamp: {
            type: Type.STRING,
            description: 'Exact spatial region in image, timestamp in video, or page/paragraph in document where the anomaly is visible.',
          },
          indicators: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          technicalObservation: {
            type: Type.STRING,
            description: 'Strict empirical observation of visible pixels or text without conjecture.',
          },
          aiInterpretation: {
            type: Type.STRING,
            description: 'Reasoning explaining why this observation suggests synthetic generation or manipulation.',
          },
          limitations: {
            type: Type.STRING,
            description: 'Alternative non-malicious explanations (e.g. natural low light noise, camera compression, lens bokeh).',
          },
        },
        required: ['id', 'title', 'category', 'severity', 'explanation', 'indicators', 'technicalObservation', 'aiInterpretation'],
      },
    },
    signals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          score: {
            type: Type.NUMBER,
            description: 'Authenticity rating 0-100 where 100 represents pristine authentic characteristics and 0 represents severe anomaly.',
          },
          status: {
            type: Type.STRING,
            description: 'One of: normal, suspicious, anomaly, unverified',
          },
          observation: { type: Type.STRING },
        },
        required: ['name', 'score', 'status', 'observation'],
      },
    },
    aiSynthesisEvaluation: {
      type: Type.OBJECT,
      properties: {
        isLikelySynthetic: { type: Type.BOOLEAN },
        confidenceEstimate: { type: Type.NUMBER, description: 'Model confidence 0-100 based on observed visual artifacts.' },
        rationale: { type: Type.STRING },
      },
      required: ['isLikelySynthetic', 'confidenceEstimate', 'rationale'],
    },
    manipulationEvaluation: {
      type: Type.OBJECT,
      properties: {
        isLikelyManipulated: { type: Type.BOOLEAN },
        confidenceEstimate: { type: Type.NUMBER },
        rationale: { type: Type.STRING },
      },
      required: ['isLikelyManipulated', 'confidenceEstimate', 'rationale'],
    },
    summaryText: {
      type: Type.STRING,
      description: 'A 2-3 sentence technical overview of what was observed.',
    },
    plainLanguageExplanation: {
      type: Type.STRING,
      description: 'Clear explanation for an ordinary person explaining what was found and what it means.',
    },
  },
  required: [
    'findings',
    'signals',
    'aiSynthesisEvaluation',
    'manipulationEvaluation',
    'summaryText',
    'plainLanguageExplanation',
  ],
};

function parseJsonSafely(raw: string | undefined): any {
  if (!raw) return {};
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
        return {};
      }
    }
    return {};
  }
}

async function callGeminiWithRetry(fn: () => Promise<any>, maxRetries = 3): Promise<any> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const isRetryable =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes('503') ||
        err?.message?.includes('429') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('quota') ||
        err?.message?.includes('RESOURCE_EXHAUSTED');

      if (isRetryable && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`Gemini API transient rate/demand spike (attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

/**
 * Genuine Multimodal Image Inspection with Gemini 3.8 Flash
 */
export async function inspectImageWithGemini(params: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  metadataSummary: string;
}): Promise<any> {
  const ai = getGeminiClient();
  const base64Data = params.buffer.toString('base64');

  const systemInstruction = `You are the Multimodal Forensic Vision Engine for TruthLens AI.
Your role is to perform rigorous forensic media analysis on the uploaded image.
CRITICAL FORENSIC RULES:
1. Do NOT invent image metadata, camera serial numbers, or EXIF history. Technical metadata has already been extracted separately: [${params.metadataSummary}].
2. Distinguish strictly between factual technical observations (what pixels actually show) and AI interpretations (what it might indicate).
3. Check specifically for:
   - AI generation indicators: skin porelessness, waxy smoothing, melting hair strands, irregular pupil catchlights, asymmetrical teeth/ears, bizarre background morphing, nonsensical pseudotext.
   - Splicing and digital editing: clone-stamp repetition, inconsistent shadow directions, lighting temperature mismatches, boundary edge halos, localized resolution differences.
   - Authentic camera markers: natural optical bokeh, sensor noise continuity, lens chromatic aberration.
4. If the image appears authentic, say so clearly. Do not manufacture fake anomalies.
5. If image resolution is low or compression makes it ambiguous, label observations as unverified or inconclusive.`;

  const prompt = `Conduct a complete forensic visual inspection of "${params.fileName}". Inspect anatomical coherence, lighting vectors, and spatial textures. Output structured JSON matching the schema.`;

  const response = await callGeminiWithRetry(() =>
    ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: params.mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: geminiForensicResponseSchema,
      },
    })
  );

  return parseJsonSafely(response?.text);
}

/**
 * Genuine Video Keyframe Inspection with Gemini 3.8 Flash
 */
export async function inspectVideoFramesWithGemini(params: {
  frames: Array<{ timestamp: string; base64: string; mimeType: string }>;
  fileName: string;
  totalDurationSeconds: number;
  metadataSummary: string;
}): Promise<any> {
  const ai = getGeminiClient();

  const systemInstruction = `You are the Video Temporal Forensics Engine for TruthLens AI.
You are evaluating sequential representative keyframes sampled across the video "${params.fileName}" (Duration: ${params.totalDurationSeconds}s).
Container metadata: [${params.metadataSummary}].

FORENSIC VIDEO RULES:
1. State clearly which timestamps and frames were analyzed. Do not claim whole-video analysis if sampled keyframes were inspected.
2. Check for:
   - Facial boundary temporal stability: face-swapping seam jitter along chin/jawline, unnatural pupil shifts between frames, teeth warping across intervals.
   - Generative video markers: morphing objects, vanishing limbs, physics violations.
   - Lighting and motion blur consistency across consecutive frames.
3. Separate observed facts from interpretations. Do not hallucinate audio sync issues if only visual frames are provided.`;

  const parts: any[] = [];
  params.frames.forEach((frame, idx) => {
    const cleanBase64 = frame.base64.replace(/^data:[^;]+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: frame.mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    });
    parts.push({
      text: `[Sampled Keyframe #${idx + 1} at timestamp ${frame.timestamp}]`,
    });
  });

  parts.push({
    text: `Perform a temporal and facial consistency audit across these ${params.frames.length} keyframes for video "${params.fileName}". Output structured JSON matching schema.`,
  });

  const response = await callGeminiWithRetry(() =>
    ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: geminiForensicResponseSchema,
      },
    })
  );

  return parseJsonSafely(response?.text);
}

/**
 * Genuine Document Content & Structure Inspection with Gemini 3.8 Flash
 */
export async function inspectDocumentWithGemini(params: {
  pdfBuffer?: Buffer;
  extractedText: string;
  fileName: string;
  metadataSummary: string;
  pageCount: number;
}): Promise<any> {
  const ai = getGeminiClient();

  const systemInstruction = `You are the Document Forensics & Integrity Engine for TruthLens AI.
You are evaluating document content from "${params.fileName}" (Pages: ${params.pageCount}).
Document metadata: [${params.metadataSummary}].

CRITICAL DOCUMENT FORENSIC PRINCIPLES:
1. Do NOT claim that AI-written text alone proves a document is fake. Professional authors and legitimate businesses use AI assistance.
2. Do NOT claim that unusual formatting proves alteration; look for concrete evidence of spliced figures, amended clauses, contradictory payment routing, or altered dates.
3. Check for:
   - Spliced banking / invoice routing figures.
   - Contradictory clauses or altered terms.
   - Mismatched typography, kerning, or margin anomalies.
   - Fabricated credentials or citations.
4. For every finding, provide: page number, relevant text, what appears inconsistent, why it may be suspicious, and whether it is a technical observation or an interpretation.`;

  const parts: any[] = [];

  if (params.pdfBuffer) {
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: params.pdfBuffer.toString('base64'),
      },
    });
    parts.push({
      text: `Inspect this PDF document for visual and textual alterations. Extracted text preview: \n${params.extractedText.slice(0, 15000)}`,
    });
  } else {
    parts.push({
      text: `Inspect this extracted document text for integrity and alterations:\n\n${params.extractedText.slice(0, 25000)}`,
    });
  }

  const response = await callGeminiWithRetry(() =>
    ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: geminiForensicResponseSchema,
      },
    })
  );

  return parseJsonSafely(response?.text);
}
