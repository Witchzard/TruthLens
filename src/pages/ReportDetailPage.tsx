import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Download,
  Share2,
  RefreshCw,
  MapPin,
  Info,
  ShieldCheck,
  Check,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Cpu,
  Hash,
  AlertCircle,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import { getReportById } from '../utils/reportStorage';
import { AuthenticityReport, CheckStatus } from '../types';
import { generatePdfReport } from '../utils/pdfGenerator';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<AuthenticityReport | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    if (id) {
      // First check local storage cache
      const found = getReportById(id);
      if (found) {
        setReport(found);
      } else {
        // Fetch from backend API
        fetch(`/api/reports/${id}`)
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error('Not found');
          })
          .then((data) => setReport(data))
          .catch(() => {});
      }
    }
  }, [id]);

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Report Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested verification report ({id}) could not be located in your local archive or server database.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    const summary = `TruthLens AI Verification Report:
File: ${report.fileName}
Verdict: ${report.classification} (${report.confidenceScore}% Model Confidence)
Risk Level: ${report.riskLevel}
Overview: ${report.authenticityOverview}
Verified via TruthLens AI Platform.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  const getVerdictTheme = () => {
    switch (report.classification) {
      case 'Likely Authentic':
        return {
          bg: 'bg-emerald-50/70',
          border: 'border-emerald-200',
          textColor: 'text-emerald-700',
          icon: CheckCircle2,
        };
      case 'Potentially Manipulated':
        return {
          bg: 'bg-amber-50/70',
          border: 'border-amber-200',
          textColor: 'text-amber-700',
          icon: AlertTriangle,
        };
      case 'Likely AI-Generated':
        return {
          bg: 'bg-rose-50/70',
          border: 'border-rose-200',
          textColor: 'text-rose-700',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          textColor: 'text-slate-700',
          icon: HelpCircle,
        };
    }
  };

  const theme = getVerdictTheme();
  const VerdictIcon = theme.icon;

  const filteredFindings = report.findings.filter((f) => {
    if (activeFilter === 'all') return true;
    return f.severity === activeFilter;
  });

  const getCheckStatusBadge = (status: CheckStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> COMPLETED
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> FAILED
          </span>
        );
      case 'unavailable':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <MinusCircle className="w-3 h-3 text-slate-400" /> UNAVAILABLE
          </span>
        );
      case 'not_applicable':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
            N/A
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <Link to="/dashboard/history" className="hover:text-slate-900 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Archive
            </Link>
            <span aria-hidden="true">·</span>
            <span>Report ID: {report.id}</span>
            <span aria-hidden="true">·</span>
            <span>{new Date(report.analyzedAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Authenticity Assessment
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => generatePdfReport(report)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/dashboard/analyze')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
            <span>Analyze Another File</span>
          </button>
        </div>
      </div>

      {/* Main Authenticity Verdict Banner Card */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${theme.border} ${theme.bg} shadow-xs relative overflow-hidden`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                Primary Classification
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-xs font-medium text-slate-600">
                Risk Rating: <strong className="text-slate-900">{report.riskLevel}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0 ${theme.textColor}`}>
                <VerdictIcon className="w-6 h-6" />
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.textColor}`}>
                {report.classification}
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed max-w-2xl">
              {report.authenticityOverview}
            </p>

            {report.classificationRationale && (
              <div className="text-xs text-slate-600 bg-white/70 p-3 rounded-lg border border-slate-200/60">
                <strong>Forensic Rationale:</strong> {report.classificationRationale}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-white/90 backdrop-blur-xs p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Model Confidence
              </span>
              <span className="text-lg font-extrabold font-mono text-slate-900 tabular-nums">
                {report.confidenceScore}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                style={{ width: `${report.confidenceScore}%` }}
              />
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-slate-500 leading-tight">
              <Info className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
              <span>
                Indicative neural pattern alignment score; not a calibrated absolute forensic probability.
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Technical Forensic Checks Checklist */}
      {report.checksPerformed && report.checksPerformed.length > 0 && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Technical Forensic Checks ({report.checksPerformed.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent log showing which tests completed, failed, or were unavailable.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {report.checksPerformed.map((chk) => (
              <div
                key={chk.id}
                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-xs text-slate-900">
                    {chk.name}
                  </div>
                  {getCheckStatusBadge(chk.status)}
                </div>

                <div className="text-[11px] text-slate-600 leading-relaxed">
                  {chk.details}
                </div>

                <div className="text-[10px] font-mono text-slate-400">
                  Tool: {chk.toolOrModel}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Explanations & Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Plain English & Evidence findings */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Plain-Language Explanation
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {report.plainEnglishExplanation}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <strong className="text-slate-700">Detection Methodology:</strong>{' '}
              {report.stats.detectionMethodology}
            </div>
          </div>

          {/* Evidence Findings */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Evidence Breakdown ({report.findings.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Separating empirical observations from AI interpretations.
                </p>
              </div>

              <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 self-start sm:self-auto">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('high')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === 'high' ? 'bg-white text-rose-700 shadow-xs font-semibold' : 'hover:text-slate-900'}`}
                >
                  High
                </button>
                <button
                  onClick={() => setActiveFilter('medium')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === 'medium' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'hover:text-slate-900'}`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setActiveFilter('low')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === 'low' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'}`}
                >
                  Low
                </button>
              </div>
            </div>

            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-sm text-slate-500">
                No findings match the selected severity filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFindings.map((finding) => {
                  const isHigh = finding.severity === 'high';
                  const isMedium = finding.severity === 'medium';

                  return (
                    <div
                      key={finding.id}
                      className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                              isHigh
                                ? 'bg-rose-100 text-rose-800'
                                : isMedium
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {finding.severity}
                          </span>

                          {finding.nature && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {finding.nature === 'observed_technical_fact'
                                ? 'Observed Technical Fact'
                                : finding.nature === 'provenance_finding'
                                ? 'Provenance Signature'
                                : 'AI Visual Interpretation'}
                            </span>
                          )}

                          <h4 className="text-sm font-bold text-slate-900">
                            {finding.title}
                          </h4>
                        </div>

                        {finding.locationOrTimestamp && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 shrink-0">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{finding.locationOrTimestamp}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {finding.explanation}
                      </p>

                      {/* Technical observation vs AI interpretation */}
                      {(finding.technicalObservation || finding.aiInterpretation) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
                          {finding.technicalObservation && (
                            <div>
                              <strong className="text-slate-800 font-semibold block mb-0.5">Technical Observation:</strong>
                              <span className="text-slate-600">{finding.technicalObservation}</span>
                            </div>
                          )}
                          {finding.aiInterpretation && (
                            <div>
                              <strong className="text-slate-800 font-semibold block mb-0.5">AI Interpretation:</strong>
                              <span className="text-slate-600">{finding.aiInterpretation}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Limitations note */}
                      {finding.limitations && (
                        <div className="text-[11px] text-slate-500 italic">
                          <span className="font-semibold text-slate-600">Alternative explanation / Limitations:</span> {finding.limitations}
                        </div>
                      )}

                      {finding.indicators && finding.indicators.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-medium text-slate-400">Indicators:</span>
                          {finding.indicators.map((ind, i) => (
                            <span
                              key={i}
                              className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded"
                            >
                              {ind}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Signals & Metadata */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Signal Metrics */}
          {report.signals && report.signals.length > 0 && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Forensic Signal Metrics
                </h3>
                <span className="text-xs text-slate-400">Authenticity Rating</span>
              </div>

              <div className="space-y-3.5">
                {report.signals.map((sig, idx) => {
                  const isAnomaly = sig.status === 'anomaly';
                  const isSuspicious = sig.status === 'suspicious';

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{sig.name}</span>
                        <span className="font-mono tabular-nums text-slate-600 font-medium">
                          {sig.score}/100
                        </span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isAnomaly
                              ? 'bg-rose-500'
                              : isSuspicious
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${sig.score}%` }}
                        />
                      </div>

                      <div className="text-[11px] text-slate-500">
                        {sig.observation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Technical Metadata Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Analysis Metadata & Audit Log
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">File Name</span>
                <span className="font-medium text-slate-900 truncate max-w-[200px]">
                  {report.fileName}
                </span>
              </div>

              {report.fileHashSha256 && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">SHA-256 Hash</span>
                  <span className="font-mono text-slate-700 truncate max-w-[180px]">
                    {report.fileHashSha256.substring(0, 16)}...
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Media Modality</span>
                <span className="font-medium text-slate-900 uppercase">
                  {report.fileType} ({report.mimeType})
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">File Size</span>
                <span className="font-mono text-slate-900 tabular-nums">
                  {(report.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              {report.stats.framesAnalyzed !== undefined && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Keyframes Sampled</span>
                  <span className="font-mono text-indigo-600 font-semibold tabular-nums">
                    {report.stats.framesAnalyzed} frames
                  </span>
                </div>
              )}

              {report.stats.pagesAnalyzed !== undefined && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Pages Evaluated</span>
                  <span className="font-mono text-indigo-600 font-semibold tabular-nums">
                    {report.stats.pagesAnalyzed} page(s)
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Processing Time</span>
                <span className="font-mono text-slate-900 tabular-nums">
                  {(report.processingTimeMs / 1000).toFixed(2)} seconds
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Vision Model</span>
                <span className="font-medium text-slate-900 truncate max-w-[200px]">
                  {report.modelName}
                </span>
              </div>
            </div>
          </div>

          {/* Specialized Models & Detectors Registry */}
          {report.modelsUsed && report.modelsUsed.length > 0 && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                Specialized Detectors & Model Registry
              </h3>

              <div className="space-y-2">
                {report.modelsUsed.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{m.name} <span className="font-mono text-slate-400 font-normal">v{m.version}</span></div>
                      <div className="text-[11px] text-slate-500">{m.role}</div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                        m.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {m.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal / Scientific Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Forensic & Legal Disclaimer</span>
            </div>
            <p>
              {report.disclaimer ||
                'Automated media authenticity analysis is an algorithmic assessment based on observed visual, temporal, and typographic markers. It is intended to inform human verification and does not constitute definitive scientific or judicial proof.'}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
