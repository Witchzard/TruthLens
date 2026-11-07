import { ValidatedFile, AuthenticityReport, ForensicCheck, ForensicFinding } from '../types/forensic.js';
import { analyzeImageMetadata } from './metadataAnalysisService.js';
import { inspectImageWithGemini } from './geminiAnalysisService.js';
import { correlateEvidence } from './evidenceCorrelationService.js';

export async function processImageAnalysis(validated: ValidatedFile): Promise<AuthenticityReport> {
  const startTime = Date.now();
  const checks: ForensicCheck[] = [];
  const metadataFindings: ForensicFinding[] = [];

  // Check 1: File Signature & Magic Bytes
  checks.push({
    id: 'chk-img-signature',
    name: 'Binary File Signature Verification',
    category: 'integrity',
    status: 'completed',
    details: `Magic bytes verified: ${validated.detectedMime}. SHA-256: ${validated.sha256.substring(0, 16)}...`,
    toolOrModel: 'TruthLens Binary Inspector',
  });

  // Check 2: Metadata & C2PA Credentials
  let metadataSummary = 'No EXIF metadata present.';
  let metadataResult: any = null;

  try {
    metadataResult = await analyzeImageMetadata(validated.buffer);
    checks.push({
      id: 'chk-img-exif',
      name: 'EXIF, TIFF & XMP Metadata Extraction',
      category: 'metadata',
      status: metadataResult.hasExif ? 'completed' : 'completed',
      details: metadataResult.hasExif
        ? `Extracted ${metadataResult.rawTagsCount} tags. Device: ${metadataResult.make || 'Unknown'} ${metadataResult.model || ''}. Software: ${metadataResult.software || 'None noted'}.`
        : 'EXIF metadata header was stripped or not present.',
      toolOrModel: 'exifr v7.1.3',
    });

    checks.push({
      id: 'chk-img-c2pa',
      name: 'C2PA Content Credentials / JUMBF Manifest Audit',
      category: 'provenance',
      status: 'completed',
      details: metadataResult.c2paDetails,
      toolOrModel: 'C2PA JUMBF Manifest Scanner',
    });

    metadataSummary = `EXIF Present: ${metadataResult.hasExif}, Device: ${metadataResult.make || 'Unknown'} ${metadataResult.model || ''}, Software: ${metadataResult.software || 'None'}, C2PA: ${metadataResult.c2paDetected}`;

    if (metadataResult.software && /photoshop|gimp|lightroom|canva|procreate/i.test(metadataResult.software)) {
      metadataFindings.push({
        id: 'mf-software',
        title: `Editing Application Tag: ${metadataResult.software}`,
        category: 'metadata',
        severity: 'medium',
        nature: 'observed_technical_fact',
        source: 'technical_metadata',
        explanation: `Container metadata explicitly tags "${metadataResult.software}" in the software field, indicating post-capture processing.`,
        indicators: [`Software: ${metadataResult.software}`],
      });
    }
  } catch (err: any) {
    checks.push({
      id: 'chk-img-metadata',
      name: 'Metadata Extraction',
      category: 'metadata',
      status: 'failed',
      details: `Metadata parsing error: ${err.message}`,
      toolOrModel: 'exifr',
    });
  }

  // Check 3: Gemini Multimodal Forensic Vision
  let geminiResult: any = null;
  try {
    geminiResult = await inspectImageWithGemini({
      buffer: validated.buffer,
      mimeType: validated.detectedMime,
      fileName: validated.originalName,
      metadataSummary,
    });

    checks.push({
      id: 'chk-img-vision',
      name: 'Multimodal Neural Vision & Texture Inspection',
      category: 'ai_synthesis',
      status: 'completed',
      details: `Evaluated micro-textures, anatomical coherence, and lighting vectors across resolution: ${metadataResult?.dimensions?.width || 'native'}x${metadataResult?.dimensions?.height || 'native'}.`,
      toolOrModel: 'Gemini 3.8 Flash Multimodal Vision',
    });
  } catch (err: any) {
    checks.push({
      id: 'chk-img-vision',
      name: 'Multimodal Neural Vision & Texture Inspection',
      category: 'ai_synthesis',
      status: 'failed',
      details: `Vision inspection error: ${err.message || 'API processing failure'}`,
      toolOrModel: 'Gemini 3.8 Flash',
    });
    throw err;
  }

  // Format Gemini findings to ensure nature and source are accurately flagged
  const formattedGeminiFindings: ForensicFinding[] = (geminiResult?.findings || []).map((f: any, idx: number) => ({
    id: f.id || `gf-${idx + 1}`,
    title: f.title || 'Visual Observation',
    category: f.category || 'visual_inconsistency',
    severity: f.severity || 'low',
    nature: 'ai_interpretive_finding',
    source: 'gemini_multimodal_vision',
    explanation: f.explanation || '',
    technicalObservation: f.technicalObservation,
    aiInterpretation: f.aiInterpretation,
    locationOrTimestamp: f.locationOrTimestamp,
    indicators: f.indicators || [],
    limitations: f.limitations,
  }));

  // Correlate all facts
  const correlation = correlateEvidence({
    mediaType: 'image',
    fileName: validated.originalName,
    fileSizeBytes: validated.sizeBytes,
    technicalChecks: checks,
    metadataFindings,
    geminiFindings: formattedGeminiFindings,
    geminiSignals: geminiResult?.signals || [],
    aiSynthesisEvaluation: geminiResult?.aiSynthesisEvaluation,
    manipulationEvaluation: geminiResult?.manipulationEvaluation,
    specializedDetectors: [
      {
        name: 'TruthLens Multimodal Forensic Vision',
        version: 'Gemini 3.8 Flash Vision Engine',
        role: 'Diffusion synthesis, anatomical coherence & splicing inspection',
        status: 'active',
      },
      {
        name: 'C2PA Cryptographic Provenance Verifier',
        version: 'ISO 19566-5 JUMBF Scanner',
        role: 'Cryptographic digital signature and provenance auditing',
        status: 'active',
      },
    ],
  });

  const processingTimeMs = Date.now() - startTime;

  return {
    id: `tl-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fileName: validated.originalName,
    fileHashSha256: validated.sha256,
    fileType: 'image',
    mimeType: validated.detectedMime,
    fileSizeBytes: validated.sizeBytes,
    analyzedAt: new Date().toISOString(),
    modelName: 'TruthLens Forensic Engine (Gemini 3.8 Flash + exifr + C2PA)',
    processingTimeMs,
    classification: correlation.classification,
    confidenceScore: correlation.confidenceScore,
    riskLevel: correlation.riskLevel,
    classificationRationale: correlation.classificationRationale,
    authenticityOverview: correlation.authenticityOverview,
    plainEnglishExplanation: correlation.plainEnglishExplanation,
    checksPerformed: checks,
    findings: correlation.correlatedFindings,
    signals: correlation.correlatedSignals,
    metadataExtracted: metadataResult,
    stats: {
      resolution: metadataResult?.dimensions?.width ? `${metadataResult.dimensions.width}x${metadataResult.dimensions.height}` : 'Inspected native resolution',
      detectionMethodology: 'Dual-Layer Technical Metadata Audit & Multimodal Neural Synthesis Inspection',
    },
    modelsUsed: [
      {
        name: 'Gemini 3.8 Flash Multimodal Vision',
        version: '3.8.0',
        role: 'Neural diffusion texture & anatomical anomaly inspection',
        status: 'active',
      },
      {
        name: 'exifr Parser',
        version: '7.1.3',
        role: 'Binary EXIF, TIFF, XMP & ICC extraction',
        status: 'active',
      },
    ],
    disclaimer: 'TruthLens AI provides algorithmic indicators based on technical metadata and multimodal visual inspection. Automated media analysis is indicative and does not constitute absolute forensic or legal proof.',
  };
}
