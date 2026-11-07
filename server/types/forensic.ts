export type MediaType = 'image' | 'video' | 'document';

export type ClassificationType =
  | 'Likely Authentic'
  | 'Potentially Manipulated'
  | 'Likely AI-Generated'
  | 'Inconclusive';

export type RiskLevel = 'Low Concern' | 'Moderate Concern' | 'High Concern' | 'Inconclusive';

export type CheckStatus = 'completed' | 'failed' | 'unavailable' | 'not_applicable';

export type EvidenceSource = 'technical_metadata' | 'file_structure' | 'c2pa_provenance' | 'gemini_multimodal_vision' | 'ffmpeg_temporal_analysis' | 'document_parser';

export type FindingNature = 'observed_technical_fact' | 'ai_interpretive_finding' | 'provenance_finding';

export interface ForensicCheck {
  id: string;
  name: string;
  category: 'metadata' | 'integrity' | 'ai_synthesis' | 'manipulation' | 'provenance' | 'temporal';
  status: CheckStatus;
  details: string;
  toolOrModel: string;
}

export interface ForensicFinding {
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
  nature: FindingNature;
  source: EvidenceSource;
  explanation: string;
  technicalObservation?: string;
  aiInterpretation?: string;
  locationOrTimestamp?: string;
  indicators: string[];
  limitations?: string;
}

export interface SignalMetric {
  name: string;
  score: number; // 0-100 rating (higher = more authentic)
  status: 'normal' | 'suspicious' | 'anomaly' | 'unverified';
  observation: string;
}

export interface AuthenticityReport {
  id: string;
  fileName: string;
  fileHashSha256: string;
  fileType: MediaType;
  mimeType: string;
  fileSizeBytes: number;
  analyzedAt: string;
  modelName: string;
  processingTimeMs: number;
  
  // Classification
  classification: ClassificationType;
  confidenceScore: number;
  riskLevel: RiskLevel;
  classificationRationale: string;
  
  // Summaries
  authenticityOverview: string;
  plainEnglishExplanation: string;
  
  // Audit Checklist
  checksPerformed: ForensicCheck[];
  
  // Findings
  findings: ForensicFinding[];
  
  // Signals
  signals: SignalMetric[];
  
  // Technical details
  metadataExtracted?: Record<string, any>;
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
  
  // Models and Adapters
  modelsUsed: Array<{
    name: string;
    version: string;
    role: string;
    status: 'active' | 'unavailable';
  }>;
  
  disclaimer: string;
}

export interface ValidatedFile {
  buffer: Buffer;
  originalName: string;
  detectedMime: string;
  declaredMime: string;
  sizeBytes: number;
  sha256: string;
  extension: string;
  isValid: boolean;
  error?: string;
}
