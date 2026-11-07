import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Image as ImageIcon,
  Video,
  FileText,
  ChevronRight,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { getStoredReports, deleteReport } from '../utils/reportStorage';
import { AuthenticityReport, MediaType } from '../types';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<AuthenticityReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | MediaType>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');

  useEffect(() => {
    setReports(getStoredReports());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this verification report from your local archive?')) {
      deleteReport(id);
      setReports(getStoredReports());
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || r.fileType === typeFilter;
    const matchesClass =
      classificationFilter === 'all' || r.classification === classificationFilter;
    return matchesSearch && matchesType && matchesClass;
  });

  const getVerdictBadge = (classification: string) => {
    switch (classification) {
      case 'Likely Authentic':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Likely Authentic
          </span>
        );
      case 'Potentially Manipulated':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Potentially Manipulated
          </span>
        );
      case 'Likely AI-Generated':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Likely AI-Generated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            Inconclusive
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analysis History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Persisted record of all digital media evaluated by TruthLens AI.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/analyze')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 text-indigo-300" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by file name or report ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Modality selector */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${typeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'}`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('image')}
              className={`px-2.5 py-1 rounded-md transition-colors ${typeFilter === 'image' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'}`}
            >
              Images
            </button>
            <button
              onClick={() => setTypeFilter('video')}
              className={`px-2.5 py-1 rounded-md transition-colors ${typeFilter === 'video' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'}`}
            >
              Videos
            </button>
            <button
              onClick={() => setTypeFilter('document')}
              className={`px-2.5 py-1 rounded-md transition-colors ${typeFilter === 'document' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'}`}
            >
              Docs
            </button>
          </div>

          {/* Classification dropdown */}
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Verdicts</option>
            <option value="Likely Authentic">Likely Authentic</option>
            <option value="Potentially Manipulated">Potentially Manipulated</option>
            <option value="Likely AI-Generated">Likely AI-Generated</option>
          </select>
        </div>

      </div>

      {/* Reports Table / Card List */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3">
          <p className="text-sm font-semibold text-slate-700">No reports matched your search criteria.</p>
          <p className="text-xs text-slate-500">Try adjusting your filters or upload a new file.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setClassificationFilter('all');
            }}
            className="px-3 py-1.5 text-xs text-indigo-600 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
          {filteredReports.map((item) => (
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
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {item.fileName}
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                    <span className="uppercase text-slate-600 font-semibold">{item.fileType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{(item.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(item.analyzedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                {getVerdictBadge(item.classification)}
                
                <span className="text-xs font-mono font-medium text-slate-500 tabular-nums hidden md:inline">
                  {item.confidenceScore}% conf
                </span>

                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  title="Remove from archive"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
