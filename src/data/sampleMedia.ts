import { SampleMediaItem } from '../types';

// Real SVG/Canvas-based data URIs for immediate 1-click testing
export const SAMPLE_MEDIA: SampleMediaItem[] = [
  {
    id: 'sample-ai-portrait',
    name: 'synthetic-portrait-studio.png',
    type: 'image',
    description: 'AI-generated human portrait generated via diffusion model with hyper-symmetrical features and skin smoothing.',
    expectedVerdict: 'Likely AI-Generated',
    tags: ['AI Portrait', 'Diffusion Artifacts', 'Subtle Asymmetry'],
    sampleDataUrl: createAiPortraitDataUrl(),
  },
  {
    id: 'sample-authentic-photo',
    name: 'authentic-urban-street.jpg',
    type: 'image',
    description: 'Natural 35mm street capture featuring realistic optical lens depth, natural motion blur and authentic sensor noise.',
    expectedVerdict: 'Likely Authentic',
    tags: ['Natural Photo', 'Optical Bokeh', 'Sensor Noise'],
    sampleDataUrl: createAuthenticPhotoDataUrl(),
  },
  {
    id: 'sample-altered-doc',
    name: 'wire-transfer-invoice-amended.txt',
    type: 'document',
    description: 'Scanned financial invoice exhibiting spliced bank routing information and font mismatching anomalies.',
    expectedVerdict: 'Potentially Manipulated',
    tags: ['Invoice', 'Typography Mismatch', 'Spliced Figures'],
    sampleText: `INVOICE & WIRE TRANSFER AUTHORIZATION
Apex Global Supply Corp. · 440 Montgomery St, San Francisco CA
Invoice Ref: AG-90214-B
Date: October 14, 2026

Bill To: Pacific Maritime Logistics Inc.
Attn: Accounts Payable

Line Items:
1. Optical Sensor Modules (Lot #488) - Qty 12 - $14,400.00
2. Industrial Enclosure Mounting Plates - Qty 24 - $3,840.00
3. Expedited Freight Delivery - Flat Rate - $750.00

TOTAL PAYABLE: $18,990.00

*** WIRE TRANSFER INSTRUCTIONS (AMENDED VIA REVISED MEMO) ***
Bank: Metro International Bank NA
SWIFT: MTRBUS33XXX
Routing / ABA: 021000089 [Note: Font size 11.5pt Arial, body uses 10pt Helvetica]
Beneficiary Account: 8849-0021-9941
Beneficiary Name: Apex Expedited Offshore Clearing (HK) Limited
Note: Please route funds immediately to the updated offshore clearing account to avoid warehouse release delays.`,
  },
  {
    id: 'sample-video-interview',
    name: 'deepfake-press-briefing-frames.mp4',
    type: 'video',
    description: 'Sampled keyframe sequence exhibiting face-swap boundary jitter, boundary pixel blending, and eye-blink anomalies.',
    expectedVerdict: 'Potentially Manipulated',
    tags: ['Keyframe Sequence', 'Face Swap Jitter', 'Boundary Seams'],
    sampleDataUrl: createVideoThumbnailDataUrl(),
  },
];

// Helper to generate visually authentic data URLs for standalone test demonstrations
function createAiPortraitDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 600, 600);
  grad.addColorStop(0, '#e2e8f0');
  grad.addColorStop(0.5, '#cbd5e1');
  grad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 600);

  // Soft studio bokeh spots
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(150, 150, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(480, 200, 100, 0, Math.PI * 2);
  ctx.fill();

  // Silhouette / portrait features
  ctx.fillStyle = '#475569';
  // Head
  ctx.beginPath();
  ctx.ellipse(300, 260, 110, 140, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoulders
  ctx.beginPath();
  ctx.ellipse(300, 520, 220, 160, 0, 0, Math.PI * 2);
  ctx.fill();

  // Studio soft rim light
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(300, 260, 112, Math.PI * 0.7, Math.PI * 1.3);
  ctx.stroke();

  // Label banner on canvas
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.roundRect(140, 530, 320, 38, 8);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sample AI Studio Portrait (Synthetic Diffusion)', 300, 554);

  return canvas.toDataURL('image/png');
}

function createAuthenticPhotoDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Natural sunset urban scene
  const grad = ctx.createLinearGradient(0, 0, 0, 600);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.4, '#bae6fd');
  grad.addColorStop(0.7, '#fcd34d');
  grad.addColorStop(1, '#f97316');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 600);

  // Natural buildings silhouettes
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(40, 300, 80, 300);
  ctx.fillRect(140, 220, 110, 380);
  ctx.fillRect(270, 270, 90, 330);
  ctx.fillRect(380, 180, 120, 420);
  ctx.fillRect(520, 320, 70, 280);

  // Authentic sensor noise overlay
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 600;
    const y = Math.random() * 600;
    const alpha = Math.random() * 0.15;
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }

  // Label banner
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.roundRect(140, 530, 320, 38, 8);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Authentic 35mm Natural Street Photo', 300, 554);

  return canvas.toDataURL('image/png');
}

function createVideoThumbnailDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 600, 340);

  // Video timeline stripes
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, 560, 260);

  // 3 frame cells inside
  for (let i = 0; i < 3; i++) {
    const x = 35 + i * 180;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, 35, 160, 220);

    // Simulated frame portrait
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(x + 80, 110, 40, 0, Math.PI * 2);
    ctx.fill();

    // Timestamp badge
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x + 10, 215, 60, 22);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.fillText(`00:0${i * 2 + 1}.00`, x + 16, 230);
  }

  // Video footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sample Keyframe Extraction: Interview Deepfake Analysis', 300, 315);

  return canvas.toDataURL('image/png');
}
