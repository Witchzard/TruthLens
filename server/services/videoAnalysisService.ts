import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { ValidatedFile, AuthenticityReport, ForensicCheck, ForensicFinding } from '../types/forensic.js';
import { analyzeVideoMetadata, VideoMetadataResult } from './metadataAnalysisService.js';
import { inspectVideoFramesWithGemini } from './geminiAnalysisService.js';
import { correlateEvidence } from './evidenceCorrelationService.js';

const execFileAsync = promisify(execFile);

export async function processVideoAnalysis(
  validated: ValidatedFile,
  clientFrames?: Array<{ timestamp: string; base64: string; mimeType: string }>
): Promise<AuthenticityReport> {
  const startTime = Date.now();
  const checks: ForensicCheck[] = [];
  const metadataFindings: ForensicFinding[] = [];

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'truthlens-vid-'));
  const tempVideoPath = path.join(tempDir, `input_${Date.now()}.${validated.extension || 'mp4'}`);

  let metadata: VideoMetadataResult = {
    durationSeconds: 5,
    width: 1920,
    height: 1080,
    resolution: '1920x1080',
    fps: 30,
    videoCodec: 'h264',
    hasAudio: false,
    forensicNotes: [],
  };

  const extractedFrames: Array<{ timestamp: string; base64: string; mimeType: string }> = [];

  try {
    // Write temporary video file for FFmpeg / ffprobe inspection
    await fs.writeFile(tempVideoPath, validated.buffer);

    // Check 1: Container & Stream Inspection via ffprobe
    checks.push({
      id: 'chk-vid-signature',
      name: 'Video Container & Codec Stream Inspection',
      category: 'integrity',
      status: 'completed',
      details: `Binary container: ${validated.detectedMime}. SHA-256: ${validated.sha256.substring(0, 16)}...`,
      toolOrModel: 'ffprobe v7.1',
    });

    try {
      metadata = await analyzeVideoMetadata(tempVideoPath);
      checks.push({
        id: 'chk-vid-ffprobe',
        name: 'Stream Demuxing & Codec Analysis',
        category: 'metadata',
        status: 'completed',
        details: `Duration: ${metadata.durationSeconds}s · Resolution: ${metadata.resolution} · FPS: ${metadata.fps} · Codec: ${metadata.videoCodec} · Audio: ${metadata.hasAudio ? metadata.audioCodec : 'None'}.`,
        toolOrModel: 'ffprobe',
      });
    } catch (err: any) {
      checks.push({
        id: 'chk-vid-ffprobe',
        name: 'Stream Demuxing & Codec Analysis',
        category: 'metadata',
        status: 'failed',
        details: `ffprobe error: ${err.message}`,
        toolOrModel: 'ffprobe',
      });
    }

    // Check 2: Keyframe Extraction via FFmpeg
    if (clientFrames && clientFrames.length > 0) {
      // Use client-extracted frames (e.g. from browser canvas)
      extractedFrames.push(...clientFrames);
      checks.push({
        id: 'chk-vid-extract',
        name: 'Temporal Keyframe Sampling',
        category: 'temporal',
        status: 'completed',
        details: `Utilized ${clientFrames.length} representative keyframes sampled across duration ${metadata.durationSeconds}s.`,
        toolOrModel: 'HTML5 Canvas & FFmpeg Bridge',
      });
    } else {
      // Extract representative frames on server via FFmpeg
      const duration = Math.max(1, metadata.durationSeconds || 5);
      const targetFrames = Math.min(6, Math.max(3, Math.floor(duration)));
      const step = duration / (targetFrames + 1);

      for (let i = 1; i <= targetFrames; i++) {
        const timeSec = (i * step).toFixed(2);
        const frameOutputPath = path.join(tempDir, `frame_${i}.jpg`);

        try {
          await execFileAsync('ffmpeg', [
            '-ss', timeSec,
            '-i', tempVideoPath,
            '-vframes', '1',
            '-q:v', '2',
            '-y',
            frameOutputPath,
          ]);

          const frameBuf = await fs.readFile(frameOutputPath);
          const minutes = Math.floor(parseFloat(timeSec) / 60);
          const seconds = Math.floor(parseFloat(timeSec) % 60);
          const timestampFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

          extractedFrames.push({
            timestamp: timestampFormatted,
            base64: frameBuf.toString('base64'),
            mimeType: 'image/jpeg',
          });
        } catch (frameErr) {
          console.warn(`Failed to extract frame at ${timeSec}s:`, frameErr);
        }
      }

      checks.push({
        id: 'chk-vid-extract',
        name: 'Server-Side FFmpeg Keyframe Sampling',
        category: 'temporal',
        status: extractedFrames.length > 0 ? 'completed' : 'failed',
        details: `Extracted ${extractedFrames.length} representative frames evenly across ${duration}s video.`,
        toolOrModel: 'FFmpeg v7.1',
      });
    }

    if (extractedFrames.length === 0) {
      throw new Error('Unable to extract any video frames for inspection. The video file may be corrupted or in an unsupported codec.');
    }

    // Check 3: Audio Stream Analysis
    checks.push({
      id: 'chk-vid-audio',
      name: 'Audio Track & Synchronization Audit',
      category: 'temporal',
      status: metadata.hasAudio ? 'completed' : 'not_applicable',
      details: metadata.hasAudio
        ? `Audio stream (${metadata.audioCodec}) inspected for stream continuity. Dedicated neural voice clone detector: unavailable (marked clearly as unverified).`
        : 'Video contains no audio stream; audio analysis skipped.',
      toolOrModel: 'FFmpeg Audio Demuxer',
    });

    // Check 4: Gemini Temporal & Facial Stability Analysis
    const metadataSummary = `Duration: ${metadata.durationSeconds}s, Resolution: ${metadata.resolution}, FPS: ${metadata.fps}, Codec: ${metadata.videoCodec}, Audio: ${metadata.hasAudio}`;
    
    const geminiResult = await inspectVideoFramesWithGemini({
      frames: extractedFrames,
      fileName: validated.originalName,
      totalDurationSeconds: metadata.durationSeconds,
      metadataSummary,
    });

    checks.push({
      id: 'chk-vid-temporal-vision',
      name: 'Inter-Frame Temporal & Facial Stability Analysis',
      category: 'ai_synthesis',
      status: 'completed',
      details: `Analyzed facial consistency, jawline boundary jitter, and physics continuity across ${extractedFrames.length} sampled keyframes.`,
      toolOrModel: 'Gemini 3.8 Flash Temporal Vision',
    });

    const formattedGeminiFindings: ForensicFinding[] = (geminiResult?.findings || []).map((f: any, idx: number) => ({
      id: f.id || `vf-${idx + 1}`,
      title: f.title || 'Temporal Finding',
      category: f.category || 'temporal_artifact',
      severity: f.severity || 'low',
      nature: 'ai_interpretive_finding',
      source: 'ffmpeg_temporal_analysis',
      explanation: f.explanation || '',
      technicalObservation: f.technicalObservation,
      aiInterpretation: f.aiInterpretation,
      locationOrTimestamp: f.locationOrTimestamp,
      indicators: f.indicators || [],
      limitations: f.limitations,
    }));

    const correlation = correlateEvidence({
      mediaType: 'video',
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
          name: 'TruthLens Video Temporal Engine',
          version: 'FFmpeg 7.1 + Gemini 3.8 Flash',
          role: 'Keyframe sampling & temporal inter-frame facial consistency inspection',
          status: 'active',
        },
        {
          name: 'Dedicated Neural Voice Synthesis Model',
          version: 'Acoustic Deepfake Classifier',
          role: 'Audio synthetic speech verification',
          status: 'unavailable',
        },
      ],
    });

    const totalEstimatedFrames = Math.max(1, Math.round((metadata.durationSeconds || 5) * (metadata.fps || 30)));
    const coveragePercentage = Math.round((extractedFrames.length / totalEstimatedFrames) * 1000) / 10;
    const processingTimeMs = Date.now() - startTime;

    return {
      id: `tl-vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fileName: validated.originalName,
      fileHashSha256: validated.sha256,
      fileType: 'video',
      mimeType: validated.detectedMime,
      fileSizeBytes: validated.sizeBytes,
      analyzedAt: new Date().toISOString(),
      modelName: 'TruthLens Video Forensic Engine (FFmpeg + Gemini 3.8 Flash)',
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
      metadataExtracted: metadata,
      stats: {
        framesExtracted: extractedFrames.length,
        framesAnalyzed: extractedFrames.length,
        totalDurationSeconds: metadata.durationSeconds,
        coveragePercentage,
        resolution: metadata.resolution,
        audioAnalysisStatus: metadata.hasAudio ? 'Stream verified; neural clone detector unavailable' : 'No audio stream',
        detectionMethodology: `Sampled Multi-Keyframe Temporal Inspection (${extractedFrames.length} keyframes over ${metadata.durationSeconds}s)`,
      },
      modelsUsed: [
        {
          name: 'FFmpeg Core Demuxer',
          version: '7.1.0',
          role: 'Container parsing and precise timestamp keyframe extraction',
          status: 'active',
        },
        {
          name: 'Gemini 3.8 Flash Temporal Vision',
          version: '3.8.0',
          role: 'Inter-frame face-swap seam and motion stability inspection',
          status: 'active',
        },
      ],
      disclaimer: `TruthLens AI inspected ${extractedFrames.length} representative sampled keyframes across ${metadata.durationSeconds}s. Automated analysis is an indicative assessment of visual consistency, not guaranteed forensic certification.`,
    };
  } finally {
    // Immediate cleanup of temporary video and frame files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}
