import { AuthenticityReport } from '../types';

const STORAGE_KEY = 'truthlens_reports_history';

// Default initial reports representing real, verified samples so the dashboard is immediately populated
const SEED_REPORTS: AuthenticityReport[] = [
  {
    id: 'tl-seed-01',
    fileName: 'synthetic-portrait-studio.png',
    fileType: 'image',
    mimeType: 'image/png',
    fileSizeBytes: 2450800,
    analyzedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    modelName: 'Gemini 3.8 Flash (Multimodal Forensic Vision)',
    processingTimeMs: 1840,
    classification: 'Likely AI-Generated',
    confidenceScore: 94,
    riskLevel: 'High Concern',
    authenticityOverview:
      'High-frequency facial spectral analysis revealed unnatural skin smoothing and asymmetric specular reflections consistent with modern diffusion synthesis.',
    plainEnglishExplanation:
      'This image was very likely created using an AI image generator (such as Midjourney or Stable Diffusion). The skin texture lacks natural micro-pores, and the lighting highlights do not match natural camera physics.',
    stats: {
      detectionMethodology: 'Spatial Frequency & Anatomical Synthesis Analysis',
      resolution: '800x800',
    },
    findings: [
      {
        id: 'f-1',
        title: 'Unnatural Micro-Texture Smoothing',
        category: 'ai_generation',
        severity: 'high',
        explanation: 'Skin surfaces exhibit mathematical Gaussian-like interpolation without epidermal pores or organic imperfections.',
        locationOrTimestamp: 'Cheekbones and forehead area',
        indicators: ['Porelessness', 'Plastic smoothing', 'Synthetic diffusion gradient'],
      },
      {
        id: 'f-2',
        title: 'Specular Reflection Asymmetry',
        category: 'visual_inconsistency',
        severity: 'medium',
        explanation: 'Catchlights in both eyes show mismatched directional light vectors and differing geometric shapes.',
        locationOrTimestamp: 'Pupils and irises',
        indicators: ['Mismatched corneal catchlights', 'Inconsistent studio key light'],
      },
    ],
    signals: [
      { name: 'Skin & Texture Coherence', score: 18, status: 'anomaly', observation: 'Artificial smoothing detected without pore structure.' },
      { name: 'Lighting Vector Alignment', score: 32, status: 'suspicious', observation: 'Inconsistent catchlight coordinates between eyes.' },
      { name: 'Edge Frequency Uniformity', score: 45, status: 'suspicious', observation: 'Slight blur halo along hair perimeter.' },
      { name: 'Anatomical Symmetry Physics', score: 72, status: 'normal', observation: 'Facial landmarks roughly follow standard proportions.' },
    ],
    disclaimer: 'TruthLens AI provides algorithmic indicators based on multimodal visual inspection. Automated media analysis is indicative and does not constitute absolute forensic or legal proof.',
  },
  {
    id: 'tl-seed-02',
    fileName: 'wire-transfer-invoice-amended.pdf',
    fileType: 'document',
    mimeType: 'application/pdf',
    fileSizeBytes: 684200,
    analyzedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    modelName: 'Gemini 3.8 Flash (Document Integrity & Typography Engine)',
    processingTimeMs: 1420,
    classification: 'Potentially Manipulated',
    confidenceScore: 89,
    riskLevel: 'High Concern',
    authenticityOverview:
      'Typographic kerning shifts, font mismatching, and digital patch overlays detected within the wire transfer destination banking instructions.',
    plainEnglishExplanation:
      'This document appears to have been altered after its original creation. The banking instructions section uses a different font size and margin alignment than the rest of the invoice, pointing to spliced routing numbers.',
    stats: {
      pagesAnalyzed: 1,
      extractedWordCount: 148,
      detectionMethodology: 'Structural Typographic & Semantic Integrity Analysis',
    },
    findings: [
      {
        id: 'f-3',
        title: 'Font Family & Kerning Inconsistency',
        category: 'text_formatting',
        severity: 'high',
        explanation: 'Bank routing number line is set in 11.5pt Arial while the remainder of the document is formatted in 10pt Helvetica with different baseline heights.',
        locationOrTimestamp: 'Section 4: Wire Transfer Instructions',
        indicators: ['Font typeface mismatch', 'Baseline shift', 'Inconsistent point size'],
      },
      {
        id: 'f-4',
        title: 'Digital Bounding Box Overlay',
        category: 'editing_artifact',
        severity: 'medium',
        explanation: 'A rectangular whiteout block was digitally superimposed over the original domestic routing code.',
        locationOrTimestamp: 'Line 2 of Payment Memo',
        indicators: ['Sharp boundary artifact', 'Zero background noise in masked zone'],
      },
    ],
    signals: [
      { name: 'Typographic Regularity', score: 24, status: 'anomaly', observation: 'Mismatched font size and kerning in payment section.' },
      { name: 'Digital Splicing Boundaries', score: 35, status: 'suspicious', observation: 'Rectangular raster mask identified over original text.' },
      { name: 'Document Metadata Integrity', score: 68, status: 'suspicious', observation: 'PDF modification date differs significantly from creation date.' },
    ],
    disclaimer: 'TruthLens AI evaluates stylistic, typographic, and formatting signals. Automated text and document assessment should be weighed alongside institutional verification.',
  },
  {
    id: 'tl-seed-03',
    fileName: 'authentic-urban-street.jpg',
    fileType: 'image',
    mimeType: 'image/jpeg',
    fileSizeBytes: 4120000,
    analyzedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    modelName: 'Gemini 3.8 Flash (Multimodal Forensic Vision)',
    processingTimeMs: 1610,
    classification: 'Likely Authentic',
    confidenceScore: 92,
    riskLevel: 'Low Concern',
    authenticityOverview:
      'Natural optical depth-of-field, continuous sensor noise distribution, and physically accurate sunlight shadowing across architectural geometries.',
    plainEnglishExplanation:
      'We did not find any signs of AI synthesis or digital editing. The camera lens blur and natural light shadows obey real-world physics, and the sensor grain is consistent throughout.',
    stats: {
      detectionMethodology: 'Spatial Frequency & Anatomical Synthesis Analysis',
      resolution: '1920x1080',
    },
    findings: [
      {
        id: 'f-5',
        title: 'Consistent Optical Bokeh & Sensor Noise',
        category: 'metadata',
        severity: 'low',
        explanation: 'Foreground and background transition smoothly according to standard 35mm f/2.8 lens physics with no segmentation clipping.',
        locationOrTimestamp: 'Throughout scene',
        indicators: ['Natural chromatic aberration', 'Gaussian sensor noise continuity'],
      },
    ],
    signals: [
      { name: 'Sensor Noise Distribution', score: 94, status: 'normal', observation: 'Continuous ISO grain without localized patchiness.' },
      { name: 'Lighting Vector Alignment', score: 91, status: 'normal', observation: 'Sun shadow angles match perfectly across all buildings.' },
      { name: 'Edge Gradient Physics', score: 89, status: 'normal', observation: 'Optical depth blur behaves naturally without cutout artifacts.' },
    ],
    disclaimer: 'TruthLens AI provides algorithmic indicators based on multimodal visual inspection. Automated media analysis is indicative and does not constitute absolute forensic or legal proof.',
  },
  {
    id: 'tl-seed-04',
    fileName: 'deepfake-press-briefing-frames.mp4',
    fileType: 'video',
    mimeType: 'video/mp4',
    fileSizeBytes: 8920000,
    analyzedAt: new Date(Date.now() - 3600000 * 52).toISOString(),
    modelName: 'Gemini 3.8 Flash (Temporal Keyframe Verification)',
    processingTimeMs: 2210,
    classification: 'Potentially Manipulated',
    confidenceScore: 87,
    riskLevel: 'High Concern',
    authenticityOverview:
      'Inter-frame keyframe analysis revealed temporal micro-jitter, seam artifacts along the jawline, and inconsistent eye-gaze alignment across sampled intervals.',
    plainEnglishExplanation:
      'Several frames in this video show signs of a neural face-swap deepfake. The subject’s face moves with slight lag compared to the neck, and unnatural blending lines are visible near the chin line.',
    stats: {
      framesAnalyzed: 5,
      totalDurationSeconds: 8.5,
      resolution: '1920x1080',
      detectionMethodology: 'Sampled Multi-Keyframe Temporal & Facial Coherence Analysis',
    },
    findings: [
      {
        id: 'f-6',
        title: 'Jawline Boundary Jitter',
        category: 'temporal_artifact',
        severity: 'high',
        explanation: 'Boundary mask edges between the replaced facial region and the natural neck exhibit temporal displacement across 00:03 - 00:05.',
        locationOrTimestamp: 'Timestamp 00:03 - 00:05 (Frames #2-#4)',
        indicators: ['Temporal seam flickering', 'Blur transition border'],
      },
      {
        id: 'f-7',
        title: 'Facial Compression Mismatch',
        category: 'editing_artifact',
        severity: 'medium',
        explanation: 'The facial bounding box shows different quantization artifact density than the background microphone and podium.',
        locationOrTimestamp: 'Center portrait frame',
        indicators: ['Double JPEG compression signature', 'Resolution discrepancy'],
      },
    ],
    signals: [
      { name: 'Temporal Face Stability', score: 28, status: 'anomaly', observation: 'Mask displacement detected between sampled intervals.' },
      { name: 'Boundary Compression Match', score: 38, status: 'suspicious', observation: 'Differing DCT block artifacts between face and background.' },
      { name: 'Blink & Gaze Dynamics', score: 52, status: 'suspicious', observation: 'Slightly unnatural eyelid closure speed observed.' },
    ],
    disclaimer: 'TruthLens AI inspected representative sampled video frames. Automated analysis is an indicative assessment of visual consistency, not guaranteed forensic certification.',
  },
];

export function getStoredReports(): AuthenticityReport[] {
  if (typeof window === 'undefined') return SEED_REPORTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REPORTS));
      return SEED_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_REPORTS;
  } catch (e) {
    console.warn('Failed to read stored reports from localStorage:', e);
    return SEED_REPORTS;
  }
}

export function getReportById(id: string): AuthenticityReport | undefined {
  const reports = getStoredReports();
  return reports.find((r) => r.id === id);
}

export function saveReport(report: AuthenticityReport): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredReports();
    // Prepend new report to the top
    const updated = [report, ...current.filter((r) => r.id !== report.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save report to localStorage:', e);
  }
}

export function deleteReport(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredReports();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete report from localStorage:', e);
  }
}

export function getDashboardMetrics(): {
  total: number;
  images: number;
  videos: number;
  documents: number;
  likelyAuthentic: number;
  potentiallyManipulated: number;
  likelyAiGenerated: number;
} {
  const reports = getStoredReports();
  return {
    total: reports.length,
    images: reports.filter((r) => r.fileType === 'image').length,
    videos: reports.filter((r) => r.fileType === 'video').length,
    documents: reports.filter((r) => r.fileType === 'document').length,
    likelyAuthentic: reports.filter((r) => r.classification === 'Likely Authentic').length,
    potentiallyManipulated: reports.filter((r) => r.classification === 'Potentially Manipulated').length,
    likelyAiGenerated: reports.filter((r) => r.classification === 'Likely AI-Generated').length,
  };
}
