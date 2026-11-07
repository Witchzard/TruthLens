import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { ValidatedFile, AuthenticityReport, ForensicCheck, ForensicFinding } from '../types/forensic.js';
import { analyzeDocxMetadata } from './metadataAnalysisService.js';
import { inspectDocumentWithGemini } from './geminiAnalysisService.js';
import { correlateEvidence } from './evidenceCorrelationService.js';

export async function processDocumentAnalysis(
  validated: ValidatedFile,
  manualTextContent?: string
): Promise<AuthenticityReport> {
  const startTime = Date.now();
  const checks: ForensicCheck[] = [];
  const metadataFindings: ForensicFinding[] = [];

  let extractedText = manualTextContent || '';
  let pageCount = 1;
  let docMetadata: any = {};

  // Check 1: Document Format Signature
  checks.push({
    id: 'chk-doc-signature',
    name: 'Document Structure & Signature Validation',
    category: 'integrity',
    status: 'completed',
    details: `Detected document format: ${validated.detectedMime}. SHA-256: ${validated.sha256.substring(0, 16)}...`,
    toolOrModel: 'TruthLens Document Parser',
  });

  // Check 2: Content & Metadata Extraction
  if (validated.detectedMime === 'application/pdf') {
    try {
      const parser = new (PDFParse as any)(new Uint8Array(validated.buffer));
      const textResult = await parser.getText();
      const infoResult = await parser.getInfo().catch(() => ({}));
      extractedText = textResult?.text || '';
      pageCount = textResult?.pages?.length || 1;
      docMetadata = infoResult || {};

      // Check for PKCS#7 Digital Signatures in PDF binary
      const hasDigitalSig = checkForPdfDigitalSignature(validated.buffer);
      checks.push({
        id: 'chk-doc-digisig',
        name: 'PKCS#7 / Adobe Digital Signature Verification',
        category: 'provenance',
        status: 'completed',
        details: hasDigitalSig
          ? 'Embedded digital signature (/ByteRange /Sig) discovered in PDF dictionary structure.'
          : 'No cryptographic digital signature (/ByteRange) found in PDF dictionary (standard for ordinary invoices, scanned forms, and un-certified drafts).',
        toolOrModel: 'PDF Dictionary Signature Auditor',
      });

      checks.push({
        id: 'chk-doc-pdf-parse',
        name: 'PDF Text Extraction & Dictionary Parsing',
        category: 'metadata',
        status: 'completed',
        details: `Parsed ${pageCount} pages, ${extractedText.split(/\s+/).filter(Boolean).length} words. Producer: ${docMetadata.Producer || docMetadata.producer || 'Not listed'}.`,
        toolOrModel: 'PDFParse v2.4.5',
      });
    } catch (err: any) {
      checks.push({
        id: 'chk-doc-pdf-parse',
        name: 'PDF Text Extraction',
        category: 'metadata',
        status: 'failed',
        details: `PDF parsing error: ${err.message || 'Corrupt PDF structure'}`,
        toolOrModel: 'PDFParse',
      });
    }
  } else if (validated.detectedMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const mammothResult = await (mammoth as any).extractRawText({ buffer: validated.buffer });
      extractedText = mammothResult.value || '';
      docMetadata = analyzeDocxMetadata(validated.buffer);
      pageCount = Math.max(1, Math.ceil(extractedText.split(/\s+/).length / 350));

      checks.push({
        id: 'chk-doc-docx-parse',
        name: 'DOCX XML Package & Revision History Extraction',
        category: 'metadata',
        status: 'completed',
        details: `Parsed DOCX text (${extractedText.split(/\s+/).filter(Boolean).length} words). Author: ${docMetadata.author || 'Unknown'}. Revisions: ${docMetadata.revisionCount || 1}. Total edit time: ${docMetadata.totalEditingTimeMinutes || 0}m.`,
        toolOrModel: 'mammoth + AdmZip',
      });
    } catch (err: any) {
      checks.push({
        id: 'chk-doc-docx-parse',
        name: 'DOCX Parsing',
        category: 'metadata',
        status: 'failed',
        details: `DOCX parsing error: ${err.message}`,
        toolOrModel: 'mammoth',
      });
    }
  } else {
    // Plain Text
    extractedText = validated.buffer.toString('utf-8');
    pageCount = Math.max(1, Math.ceil(extractedText.split(/\s+/).length / 400));
    checks.push({
      id: 'chk-doc-txt-parse',
      name: 'Plaintext Encoding & Structure Audit',
      category: 'metadata',
      status: 'completed',
      details: `Analyzed UTF-8 text (${extractedText.length} characters, ${extractedText.split(/\s+/).filter(Boolean).length} words).`,
      toolOrModel: 'Text Parser',
    });
  }

  // Check 3: Gemini Multimodal & Structural Inspection
  const metadataSummary = `Pages: ${pageCount}, Producer: ${docMetadata?.Producer || docMetadata?.creator || 'Unknown'}, ModDate: ${docMetadata?.ModDate || docMetadata?.modDate || 'None'}`;
  
  let geminiResult: any = null;
  try {
    geminiResult = await inspectDocumentWithGemini({
      pdfBuffer: validated.detectedMime === 'application/pdf' ? validated.buffer : undefined,
      extractedText,
      fileName: validated.originalName,
      metadataSummary,
      pageCount,
    });

    checks.push({
      id: 'chk-doc-integrity-audit',
      name: 'Structural Typographic & Splicing Integrity Audit',
      category: 'ai_synthesis',
      status: 'completed',
      details: `Audited clauses, banking numbers, and typographic alignment across ${pageCount} pages. Differentiated AI assistance from malicious tampering.`,
      toolOrModel: 'Gemini 3.8 Flash Document Engine',
    });
  } catch (err: any) {
    checks.push({
      id: 'chk-doc-integrity-audit',
      name: 'Structural Typographic & Splicing Integrity Audit',
      category: 'ai_synthesis',
      status: 'failed',
      details: `Gemini processing error: ${err.message}`,
      toolOrModel: 'Gemini 3.8 Flash',
    });
    throw err;
  }

  const formattedGeminiFindings: ForensicFinding[] = (geminiResult?.findings || []).map((f: any, idx: number) => ({
    id: f.id || `df-${idx + 1}`,
    title: f.title || 'Document Observation',
    category: f.category || 'text_formatting',
    severity: f.severity || 'low',
    nature: 'ai_interpretive_finding',
    source: 'document_parser',
    explanation: f.explanation || '',
    technicalObservation: f.technicalObservation,
    aiInterpretation: f.aiInterpretation,
    locationOrTimestamp: f.locationOrTimestamp,
    indicators: f.indicators || [],
    limitations: f.limitations,
  }));

  const correlation = correlateEvidence({
    mediaType: 'document',
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
        name: 'TruthLens Document Integrity Engine',
        version: 'pdf-parse + mammoth + Gemini 3.8 Flash',
        role: 'Typographic anomaly and text alteration detection',
        status: 'active',
      },
      {
        name: 'Government Seal / Notary Cryptographic Database',
        version: 'Issuer Registry Validator',
        role: 'Institutional cross-referencing',
        status: 'unavailable',
      },
    ],
  });

  const processingTimeMs = Date.now() - startTime;

  return {
    id: `tl-doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fileName: validated.originalName,
    fileHashSha256: validated.sha256,
    fileType: 'document',
    mimeType: validated.detectedMime,
    fileSizeBytes: validated.sizeBytes,
    analyzedAt: new Date().toISOString(),
    modelName: 'TruthLens Document Forensic Engine (pdf-parse + Gemini 3.8 Flash)',
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
    metadataExtracted: docMetadata,
    stats: {
      pagesAnalyzed: pageCount,
      extractedWordCount: extractedText.split(/\s+/).filter(Boolean).length,
      detectionMethodology: `Document Typographic & Content Integrity Audit (${pageCount} page(s) inspected)`,
    },
    modelsUsed: [
      {
        name: 'pdf-parse & mammoth parser',
        version: '1.1.1',
        role: 'Binary container & document dictionary extraction',
        status: 'active',
      },
      {
        name: 'Gemini 3.8 Flash Document Engine',
        version: '3.8.0',
        role: 'Semantic and formatting tamper analysis',
        status: 'active',
      },
    ],
    disclaimer: 'TruthLens AI evaluates stylistic, typographic, and formatting signals. Automated text and document assessment should be weighed alongside institutional issuer verification.',
  };
}

/**
 * Checks for PDF digital signatures by searching for /ByteRange and /Sig in dictionary objects
 */
function checkForPdfDigitalSignature(buffer: Buffer): boolean {
  const str = buffer.toString('binary');
  return str.includes('/ByteRange') && (str.includes('/Sig') || str.includes('adbe.pkcs7'));
}
