export type MediaType = 'image' | 'video' | 'document';

export type ClassificationType =
  | 'Likely Authentic'
  | 'Potentially Manipulated'
  | 'Likely AI-Generated'
  | 'Inconclusive';

export type RiskLevel = 'Low Concern' | 'Moderate Concern' | 'High Concern' | 'Inconclusive';

export type CheckStatus = 'completed' | 'failed' | 'unavailable' | 'not_applicable';

export type EvidenceSource =
  | 'technical_metadata'
  | 'file_structure'
  | 'c2pa_provenance'
  | 'gemini_multimodal_vision'
  | 'ffmpeg_temporal_analysis'
  | 'document_parser';

export type FindingNature = 'observed_technical_fact' | 'ai_interpretive_finding' | 'provenance_finding';

export interface ForensicCheck {
  id: string;
  name: string;
  category: 'metadata' | 'integrity' | 'ai_synthesis' | 'manipulation' | 'provenance' | 'temporal';
  status: CheckStatus;
  details: string;
  toolOrModel: string;
}

export interface Finding {
  id: string;
  title: string;
  category:
    | 'visual_inconsistency'
    | 'ai_generation'
    | 'editing_artifact'
    | 'metadata'
    | 'facial_anomaly'
    | 'temporal_artifact'
    | 'text_formatting';
  severity: 'low' | 'medium' | 'high';
  nature?: FindingNature;
  source?: EvidenceSource;
  explanation: string;
  technicalObservation?: string;
  aiInterpretation?: string;
  locationOrTimestamp?: string;
  indicators: string[];
  limitations?: string;
}

export interface Signal {
  name: string;
  score: number; // 0-100 authenticity score (higher = more authentic)
  status: 'normal' | 'suspicious' | 'anomaly' | 'unverified';
  observation: string;
}

export interface AuthenticityReport {
  id: string;
  fileName: string;
  fileHashSha256?: string;
  fileType: MediaType;
  mimeType: string;
  fileSizeBytes: number;
  analyzedAt: string;
  modelName: string;
  processingTimeMs: number;
  classification: ClassificationType;
  confidenceScore: number;
  riskLevel: RiskLevel;
  classificationRationale?: string;
  authenticityOverview: string;
  plainEnglishExplanation: string;
  checksPerformed?: ForensicCheck[];
  stats: {
    framesExtracted?: number;
    framesAnalyzed?: number;
    coveragePercentage?: number;
    totalDurationSeconds?: number;
    pagesAnalyzed?: number;
    extractedWordCount?: number;
    resolution?: string;
    audioAnalysisStatus?: string;
    detectionMethodology: string;
  };
  findings: Finding[];
  signals: Signal[];
  metadataExtracted?: Record<string, any>;
  modelsUsed?: Array<{
    name: string;
    version: string;
    role: string;
    status: 'active' | 'unavailable';
  }>;
  disclaimer: string;
}

export interface ExtractedFrame {
  timestamp: string;
  timestampSeconds: number;
  base64: string;
  mimeType: string;
}

export interface SampleMediaItem {
  id: string;
  name: string;
  type: MediaType;
  description: string;
  expectedVerdict: ClassificationType;
  fileUrl?: string;
  sampleDataUrl?: string;
  sampleText?: string;
  tags: string[];
}
