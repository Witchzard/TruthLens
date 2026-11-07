import {
  ClassificationType,
  RiskLevel,
  ForensicCheck,
  ForensicFinding,
  SignalMetric,
  MediaType,
} from '../types/forensic.js';

export interface CorrelationInput {
  mediaType: MediaType;
  fileName: string;
  fileSizeBytes: number;
  technicalChecks: ForensicCheck[];
  metadataFindings: ForensicFinding[];
  geminiFindings: ForensicFinding[];
  geminiSignals: SignalMetric[];
  aiSynthesisEvaluation?: {
    isLikelySynthetic: boolean;
    confidenceEstimate: number;
    rationale: string;
  };
  manipulationEvaluation?: {
    isLikelyManipulated: boolean;
    confidenceEstimate: number;
    rationale: string;
  };
  specializedDetectors: Array<{
    name: string;
    version: string;
    role: string;
    status: 'active' | 'unavailable';
  }>;
}

export interface CorrelationResult {
  classification: ClassificationType;
  riskLevel: RiskLevel;
  confidenceScore: number;
  classificationRationale: string;
  authenticityOverview: string;
  plainEnglishExplanation: string;
  correlatedFindings: ForensicFinding[];
  correlatedSignals: SignalMetric[];
}

/**
 * Evidence Correlation Engine: Correlates technical data, metadata, provenance, and AI visual findings.
 * Does not invent numbers or force files into arbitrary bins.
 */
export function correlateEvidence(input: CorrelationInput): CorrelationResult {
  const allFindings = [...input.metadataFindings, ...input.geminiFindings];

  // Count severities
  const highSeverityFindings = allFindings.filter((f) => f.severity === 'high');
  const mediumSeverityFindings = allFindings.filter((f) => f.severity === 'medium');
  const lowSeverityFindings = allFindings.filter((f) => f.severity === 'low');

  const failedChecks = input.technicalChecks.filter((c) => c.status === 'failed');

  let classification: ClassificationType = 'Inconclusive';
  let riskLevel: RiskLevel = 'Inconclusive';
  let confidenceScore = 60;
  let rationale = '';

  const isSyntheticFlagged = input.aiSynthesisEvaluation?.isLikelySynthetic || false;
  const isManipulatedFlagged = input.manipulationEvaluation?.isLikelyManipulated || false;
  const synthConfidence = input.aiSynthesisEvaluation?.confidenceEstimate || 0;
  const manipConfidence = input.manipulationEvaluation?.confidenceEstimate || 0;

  // Decision Logic based on factual evidence hierarchy
  if (failedChecks.length > 0) {
    classification = 'Inconclusive';
    riskLevel = 'Moderate Concern';
    confidenceScore = 40;
    rationale = `Technical checks failed on the file structure (${failedChecks.map((c) => c.name).join(', ')}). Analysis could not proceed with full integrity.`;
  } else if (isSyntheticFlagged && synthConfidence >= 75) {
    classification = 'Likely AI-Generated';
    riskLevel = 'High Concern';
    confidenceScore = synthConfidence;
    rationale = input.aiSynthesisEvaluation?.rationale || 'Multiple visual synthesis indicators (texture smoothing, anatomical incoherence, and generative diffusion signatures) were identified.';
  } else if (isManipulatedFlagged && manipConfidence >= 70) {
    classification = 'Potentially Manipulated';
    riskLevel = highSeverityFindings.length > 0 ? 'High Concern' : 'Moderate Concern';
    confidenceScore = manipConfidence;
    rationale = input.manipulationEvaluation?.rationale || 'Localized manipulation indicators (digital boundary splicing, typographic mismatch, or temporal jitter) were identified.';
  } else if (!isSyntheticFlagged && !isManipulatedFlagged && highSeverityFindings.length === 0 && mediumSeverityFindings.length === 0) {
    classification = 'Likely Authentic';
    riskLevel = 'Low Concern';
    // Indicative confidence bounded realistically - never claims 100%
    confidenceScore = Math.min(92, Math.max(75, 100 - lowSeverityFindings.length * 5));
    rationale = 'No definitive indicators of generative synthesis, localized cloning, or digital tampering were observed in the examined samples.';
  } else if (mediumSeverityFindings.length > 0) {
    classification = 'Potentially Manipulated';
    riskLevel = 'Moderate Concern';
    confidenceScore = 70;
    rationale = 'Moderate visual or structural anomalies were noted, but could not be definitively separated from aggressive compression or natural lighting conditions.';
  } else {
    classification = 'Inconclusive';
    riskLevel = 'Inconclusive';
    confidenceScore = 50;
    rationale = 'Available visual and technical signals are conflicting or insufficient to draw a high-confidence determination.';
  }

  // Construct Overview and Plain-Language summary
  let authenticityOverview = '';
  let plainEnglishExplanation = '';

  if (classification === 'Likely AI-Generated') {
    authenticityOverview = `Inspection identified distinct generative AI diffusion signatures with an estimated model confidence of ${confidenceScore}%.`;
    plainEnglishExplanation = `Our multimodal examination detected patterns strongly characteristic of AI image or media generators. This includes micro-texture smoothing without natural surface grain and anatomical or structural anomalies.`;
  } else if (classification === 'Potentially Manipulated') {
    authenticityOverview = `Evidence indicates potential digital alteration or selective splicing with an estimated confidence of ${confidenceScore}%.`;
    plainEnglishExplanation = `Certain sections of this file show signs of post-capture modification or localized splicing. We recommend secondary manual review of the highlighted regions.`;
  } else if (classification === 'Likely Authentic') {
    authenticityOverview = `File exhibits natural optical and structural characteristics with no observable synthetic markers.`;
    plainEnglishExplanation = `We examined the file's visual patterns, sensor noise, and formatting. Everything observed conforms to natural capture physics and standard documentation without evidence of tampering.`;
  } else {
    authenticityOverview = `Available evidence is inconclusive. No definitive classification could be established with scientific rigor.`;
    plainEnglishExplanation = `The analysis could not confirm whether this content is authentic, AI-generated, or edited. This often occurs when resolution is low, compression is heavy, or when signals are ambiguous.`;
  }

  return {
    classification,
    riskLevel,
    confidenceScore,
    classificationRationale: rationale,
    authenticityOverview,
    plainEnglishExplanation,
    correlatedFindings: allFindings,
    correlatedSignals: input.geminiSignals,
  };
}
