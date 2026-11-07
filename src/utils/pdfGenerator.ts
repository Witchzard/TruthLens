import { jsPDF } from 'jspdf';
import { AuthenticityReport } from '../types';

export function generatePdfReport(report: AuthenticityReport): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header band
  doc.setFillColor(248, 250, 252); // soft off-white
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('TruthLens AI', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Media Authenticity & Forensic Verification Engine', margin, 20);

  // Report ID & Date (Right aligned)
  doc.setFontSize(8);
  doc.text(`Report ID: ${report.id}`, pageWidth - margin, 14, { align: 'right' });
  doc.text(`Generated: ${new Date(report.analyzedAt).toLocaleString()}`, pageWidth - margin, 20, { align: 'right' });

  y = 36;

  // Verdict Section Card
  let verdictColor: [number, number, number] = [15, 23, 42];
  if (report.classification === 'Likely Authentic') verdictColor = [22, 163, 74];
  else if (report.classification === 'Potentially Manipulated') verdictColor = [217, 119, 6];
  else if (report.classification === 'Likely AI-Generated') verdictColor = [225, 29, 72];
  else verdictColor = [100, 116, 139];

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('AUTHENTICITY VERDICT', margin + 6, y + 8);

  doc.setFontSize(16);
  doc.setTextColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.text(report.classification, margin + 6, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Confidence: ${report.confidenceScore}% (Indicative Model Confidence) · Risk: ${report.riskLevel}`, margin + 6, y + 26);

  // File metadata block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('File Name:', margin + 110, y + 10);
  doc.text('Format / Size:', margin + 110, y + 18);
  doc.text('Model:', margin + 110, y + 26);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(report.fileName.length > 25 ? report.fileName.substring(0, 22) + '...' : report.fileName, margin + 135, y + 10);
  doc.text(`${report.fileType.toUpperCase()} · ${(report.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`, margin + 135, y + 18);
  doc.text(`${(report.processingTimeMs / 1000).toFixed(1)}s via Flash Vision`, margin + 135, y + 26);

  y += 42;

  // Executive Overview Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Executive Summary', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const overviewLines = doc.splitTextToSize(report.authenticityOverview, contentWidth);
  doc.text(overviewLines, margin, y);
  y += overviewLines.length * 4.5 + 4;

  // Plain English Explanation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('Plain-Language Breakdown:', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const plainLines = doc.splitTextToSize(report.plainEnglishExplanation, contentWidth);
  doc.text(plainLines, margin, y);
  y += plainLines.length * 4.2 + 8;

  // Evidence Findings Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Key Evidence & Observations (${report.findings.length} findings)`, margin, y);
  y += 6;

  if (report.findings.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No anomalies or suspicious modifications detected in inspected samples.', margin, y);
    y += 8;
  } else {
    for (const finding of report.findings.slice(0, 4)) {
      if (y > pageHeight - 35) {
        doc.addPage();
        y = margin;
      }

      doc.setDrawColor(241, 245, 249);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

      // Severity Tag
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      let sevColor: [number, number, number] = [100, 116, 139];
      if (finding.severity === 'high') sevColor = [225, 29, 72];
      else if (finding.severity === 'medium') sevColor = [217, 119, 6];
      else sevColor = [22, 163, 74];

      doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
      doc.text(`[${finding.severity.toUpperCase()}]`, margin + 4, y + 6);

      doc.setTextColor(15, 23, 42);
      doc.text(finding.title, margin + 20, y + 6);

      if (finding.locationOrTimestamp) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Region/Time: ${finding.locationOrTimestamp}`, pageWidth - margin - 4, y + 6, { align: 'right' });
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const explLines = doc.splitTextToSize(finding.explanation, contentWidth - 8);
      doc.text(explLines.slice(0, 2), margin + 4, y + 12);

      y += 24;
    }
  }

  // Signal Indicators
  if (report.signals && report.signals.length > 0 && y < pageHeight - 45) {
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Forensic Signal Integrity Metrics', margin, y);
    y += 6;

    const colWidth = (contentWidth - 6) / 2;
    report.signals.slice(0, 4).forEach((sig, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const posX = margin + col * (colWidth + 6);
      const posY = y + row * 14;

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(posX, posY, colWidth, 12, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(sig.name, posX + 3, posY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`${sig.score}/100 · ${sig.status}`, posX + colWidth - 3, posY + 5, { align: 'right' });

      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      const obs = sig.observation.length > 45 ? sig.observation.substring(0, 42) + '...' : sig.observation;
      doc.text(obs, posX + 3, posY + 9.5);
    });

    y += Math.ceil(Math.min(report.signals.length, 4) / 2) * 14 + 6;
  }

  // Footer Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const disclaimerLines = doc.splitTextToSize(
    report.disclaimer || 'TruthLens AI provides algorithmic indicators based on multimodal visual inspection. Automated media analysis is indicative and does not constitute absolute forensic or legal proof.',
    contentWidth
  );
  doc.text(disclaimerLines, margin, pageHeight - 13);

  // Save the PDF
  const safeName = report.fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`TruthLens_Report_${safeName}_${report.id.substring(0, 8)}.pdf`);
}
