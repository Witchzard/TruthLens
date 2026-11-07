import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import { validateFile } from '../server/services/fileValidationService.js';
import { analyzeImageMetadata, analyzeDocxMetadata } from '../server/services/metadataAnalysisService.js';
import { correlateEvidence } from '../server/services/evidenceCorrelationService.js';
import { saveReportToDb, getReportByIdFromDb, getAllReportsFromDb } from '../server/db/reportRepository.js';
import { AuthenticityReport, ForensicCheck } from '../server/types/forensic.js';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const testResults: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void> | void) {
  const t0 = Date.now();
  try {
    await fn();
    testResults.push({ name, passed: true, durationMs: Date.now() - t0 });
    console.log(`  ✓ [PASS] ${name} (${Date.now() - t0}ms)`);
  } catch (err: any) {
    testResults.push({ name, passed: false, error: err.message, durationMs: Date.now() - t0 });
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
  }
}

async function executeTestSuite() {
  console.log('\n======================================================');
  console.log('   TRUTHLENS AI - FORENSIC BACKEND ENGINE TEST SUITE   ');
  console.log('======================================================\n');

  // 1. File Validation - Valid PNG
  await runTest('1. File Validation: Valid PNG buffer detected and hashed', () => {
    // 1x1 transparent PNG magic bytes
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
      0x42, 0x60, 0x82,
    ]);

    const res = validateFile(pngBuffer, 'camera_shot.png', 'image/png');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.detectedMime, 'image/png');
    assert.ok(res.sha256.length === 64, 'SHA-256 must be 64 hex characters');
  });

  // 2. File Validation - Extension Mismatch Disguised File
  await runTest('2. File Validation: Disguised text file with .png extension rejected', () => {
    const textBuffer = Buffer.from('This is a plain text file pretending to be an image.');
    const res = validateFile(textBuffer, 'malicious.png', 'image/png');
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error?.includes('File signature') || res.error?.includes('Unrecognized'));
  });

  // 3. File Validation - Empty File
  await runTest('3. File Validation: Zero-byte empty file rejected with clear error', () => {
    const emptyBuffer = Buffer.alloc(0);
    const res = validateFile(emptyBuffer, 'empty.jpg', 'image/jpeg');
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error?.includes('empty'));
  });

  // 4. File Validation - Corrupt Header
  await runTest('4. File Validation: Corrupted binary header rejected', () => {
    const corruptBuffer = Buffer.from([0x00, 0x11, 0x22, 0x33, 0x44, 0x55]);
    const res = validateFile(corruptBuffer, 'corrupt.pdf', 'application/pdf');
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error?.includes('Unrecognized or invalid file signature'));
  });

  // 5. File Validation - Valid PDF Signature
  await runTest('5. File Validation: Genuine PDF signature verified', () => {
    const pdfBuffer = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
    const res = validateFile(pdfBuffer, 'invoice.pdf', 'application/pdf');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.detectedMime, 'application/pdf');
  });

  // 6. Metadata Service - C2PA Manifest Scanner
  await runTest('6. Metadata Service: C2PA JUMBF Manifest scanner audit', async () => {
    // Buffer with embedded 'jumb' box
    const bufferWithC2pa = Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff, 0xe1]),
      Buffer.from('test c2pa container data jumb manifest claim signature'),
      Buffer.from([0xff, 0xd9]),
    ]);

    const meta = await analyzeImageMetadata(bufferWithC2pa);
    assert.strictEqual(meta.c2paDetected, true);
    assert.ok(meta.c2paDetails?.includes('C2PA'));
  });

  // 7. Evidence Correlation Engine - Synthetic Detection
  await runTest('7. Evidence Correlation: Generative AI Diffusion indicators evaluated without random scores', () => {
    const checks: ForensicCheck[] = [
      { id: '1', name: 'File Signature', category: 'integrity', status: 'completed', details: 'Valid', toolOrModel: 'Validator' },
      { id: '2', name: 'Vision Inspection', category: 'ai_synthesis', status: 'completed', details: 'Diffusion patterns', toolOrModel: 'Gemini' },
    ];

    const result = correlateEvidence({
      mediaType: 'image',
      fileName: 'midjourney_portrait.png',
      fileSizeBytes: 2000000,
      technicalChecks: checks,
      metadataFindings: [],
      geminiFindings: [
        {
          id: 'f1',
          title: 'Epidermal Pore Smoothing',
          category: 'ai_generation',
          severity: 'high',
          nature: 'ai_interpretive_finding',
          source: 'gemini_multimodal_vision',
          explanation: 'Skin texture exhibits mathematical smoothing devoid of natural pores.',
          indicators: ['Porelessness'],
        },
      ],
      geminiSignals: [{ name: 'Skin Coherence', score: 15, status: 'anomaly', observation: 'Excessive Gaussian smoothing' }],
      aiSynthesisEvaluation: {
        isLikelySynthetic: true,
        confidenceEstimate: 92,
        rationale: 'Characteristic diffusion smoothing and pupil asymmetry.',
      },
      specializedDetectors: [],
    });

    assert.strictEqual(result.classification, 'Likely AI-Generated');
    assert.strictEqual(result.riskLevel, 'High Concern');
    assert.strictEqual(result.confidenceScore, 92);
  });

  // 8. Evidence Correlation Engine - Inconclusive Handling
  await runTest('8. Evidence Correlation: Ambiguous or failed checks yield INCONCLUSIVE verdict', () => {
    const checks: ForensicCheck[] = [
      { id: '1', name: 'File Signature', category: 'integrity', status: 'failed', details: 'Corrupted payload', toolOrModel: 'Validator' },
    ];

    const result = correlateEvidence({
      mediaType: 'image',
      fileName: 'unclear.jpg',
      fileSizeBytes: 50000,
      technicalChecks: checks,
      metadataFindings: [],
      geminiFindings: [],
      geminiSignals: [],
      specializedDetectors: [],
    });

    assert.strictEqual(result.classification, 'Inconclusive');
    assert.ok(result.classificationRationale.includes('failed'));
  });

  // 9. Persistent Database Repository - Save & Retrieve
  await runTest('9. Database Repository: Save report, retrieve by ID, and list reports', async () => {
    const testReport: AuthenticityReport = {
      id: `test-rpt-${Date.now()}`,
      fileName: 'automated-test-file.png',
      fileHashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fileType: 'image',
      mimeType: 'image/png',
      fileSizeBytes: 1024,
      analyzedAt: new Date().toISOString(),
      modelName: 'TruthLens Test Suite',
      processingTimeMs: 120,
      classification: 'Likely Authentic',
      confidenceScore: 88,
      riskLevel: 'Low Concern',
      classificationRationale: 'Automated test suite verification.',
      authenticityOverview: 'Test overview.',
      plainEnglishExplanation: 'Test explanation.',
      checksPerformed: [],
      findings: [],
      signals: [],
      stats: { detectionMethodology: 'Test Suite' },
      modelsUsed: [],
      disclaimer: 'Test report.',
    };

    await saveReportToDb(testReport);

    const retrieved = await getReportByIdFromDb(testReport.id);
    assert.ok(retrieved, 'Report must be retrievable by ID');
    assert.strictEqual(retrieved?.id, testReport.id);
    assert.strictEqual(retrieved?.fileName, 'automated-test-file.png');

    const all = await getAllReportsFromDb();
    assert.ok(all.some((r) => r.id === testReport.id), 'Saved report must appear in report list');
  });

  // 10. System Video Engine Check (ffprobe / ffmpeg)
  await runTest('10. System Video Engine: FFmpeg and ffprobe available on host', async () => {
    const { execFile } = await import('child_process');
    const { promisify } = await import('util');
    const execFileAsync = promisify(execFile);

    const { stdout: ffmpegOut } = await execFileAsync('ffmpeg', ['-version']);
    assert.ok(ffmpegOut.includes('ffmpeg version'), 'FFmpeg must be installed and executable');

    const { stdout: ffprobeOut } = await execFileAsync('ffprobe', ['-version']);
    assert.ok(ffprobeOut.includes('ffprobe version'), 'ffprobe must be installed and executable');
  });

  console.log('\n======================================================');
  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = testResults.filter((r) => !r.passed).length;
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED (Total: ${testResults.length})`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

executeTestSuite().catch((err) => {
  console.error('Test runner encountered fatal error:', err);
  process.exit(1);
});
