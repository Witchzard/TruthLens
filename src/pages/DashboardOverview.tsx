import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Image as ImageIcon,
  Video,
  FileText,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { getStoredReports, getDashboardMetrics } from '../utils/reportStorage';
import { AuthenticityReport } from '../types';

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(getDashboardMetrics());
  const [recentReports, setRecentReports] = useState<AuthenticityReport[]>([]);

  useEffect(() => {
    setMetrics(getDashboardMetrics());
    setRecentReports(getStoredReports().slice(0, 5));
  }, []);

  const getVerdictBadge = (classification: string) => {
    switch (classification) {
      case 'Likely Authentic':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Likely Authentic
          </span>
        );
      case 'Potentially Manipulated':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/80">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Potentially Manipulated
          </span>
        );
      case 'Likely AI-Generated':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200/80">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Likely AI-Generated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
            Inconclusive
          </span>
        );
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      
      {/* Welcome Heading Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to TruthLens
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Understand what's real. Investigate what's suspicious.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Gemini 3.8 Flash Vision Ready</span>
        </div>
      </div>

      {/* Real Stored Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Analyses */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold text-slate-600">Total Analyses</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tabular-nums">
            {metrics.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Archived verified media
          </div>
        </div>

        {/* Images Analyzed */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold text-slate-600">Images Analyzed</span>
            <ImageIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tabular-nums">
            {metrics.images}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Diffusion & clone checks
          </div>
        </div>

        {/* Videos Analyzed */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold text-slate-600">Videos Analyzed</span>
            <Video className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tabular-nums">
            {metrics.videos}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Temporal deepfake audits
          </div>
        </div>

        {/* Documents Analyzed */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold text-slate-600">Documents Analyzed</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tabular-nums">
            {metrics.documents}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Invoices, contracts & text
          </div>
        </div>

      </div>

      {/* Start New Analysis: 3 Distinct Upload Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Start New Analysis
          </h2>
          <p className="text-xs text-slate-500">
            Select a media format to begin multi-signal forensic verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Analyze Image */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Analyze Image
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Scan photographs for generative AI synthesis (Midjourney, DALL-E, Flux), facial swaps, spliced regions, and lighting anomalies.
              </p>
              <div className="mt-3 text-[11px] font-mono text-slate-400">
                JPG · PNG · WEBP up to 35MB
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard/analyze?type=image')}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-900 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl border border-slate-200 hover:border-slate-900 transition-all cursor-pointer"
            >
              <span>Upload Image</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Analyze Video */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Analyze Video
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Extract representative keyframes client-side to inspect inter-frame temporal stability, jawline seam jitter, and facial deepfake models.
              </p>
              <div className="mt-3 text-[11px] font-mono text-slate-400">
                MP4 · WEBM · MOV up to 35MB
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard/analyze?type=video')}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-900 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl border border-slate-200 hover:border-slate-900 transition-all cursor-pointer"
            >
              <span>Upload Video</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Verify Document */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Verify Document
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Audit PDF invoices, statements, and transcripts for typographic discrepancies, spliced routing details, and forged clauses.
              </p>
              <div className="mt-3 text-[11px] font-mono text-slate-400">
                PDF · DOCX · TXT up to 35MB
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard/analyze?type=document')}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-900 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl border border-slate-200 hover:border-slate-900 transition-all cursor-pointer"
            >
              <span>Verify Document</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recent Activity
            </h2>
            <p className="text-xs text-slate-500">
              Previously completed media verification records.
            </p>
          </div>

          <Link
            to="/dashboard/history"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All ({metrics.total})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-sm text-slate-500">
            No media analyses recorded yet. Start your first analysis above!
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
            {recentReports.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/dashboard/report/${item.id}`)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {item.fileType === 'image' && <ImageIcon className="w-5 h-5" />}
                    {item.fileType === 'video' && <Video className="w-5 h-5" />}
                    {item.fileType === 'document' && <FileText className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {item.fileName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                      <span className="uppercase">{item.fileType}</span>
                      <span aria-hidden="true">·</span>
                      <span>{(item.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(item.analyzedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {getVerdictBadge(item.classification)}
                  <span className="text-xs font-mono font-medium text-slate-500 tabular-nums hidden sm:inline">
                    {item.confidenceScore}% conf
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
