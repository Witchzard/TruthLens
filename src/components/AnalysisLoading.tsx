import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle2, Loader2, Sparkles, Scan, Eye, FileSearch, Layers } from 'lucide-react';

interface AnalysisLoadingProps {
  currentStageIndex: number;
  fileName: string;
  fileType: 'image' | 'video' | 'document';
  extractedFrameCount?: number;
}

const STAGES = [
  { id: 0, label: 'Upload received', description: 'File received and verified securely in memory buffer.' },
  { id: 1, label: 'Extracting content', description: 'Decoding resolution, color profiles, or sampling keyframes.' },
  { id: 2, label: 'Examining visual patterns', description: 'Scanning lighting vectors, skin textures, and spatial noise.' },
  { id: 3, label: 'Checking manipulation indicators', description: 'Testing for face swaps, generative diffusion artifacts, and splicing.' },
  { id: 4, label: 'Preparing authenticity report', description: 'Synthesizing evidence breakdown and calibrating risk score.' },
];

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  currentStageIndex,
  fileName,
  fileType,
  extractedFrameCount,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-100">
      
      {/* Top Banner */}
      <div className="text-center mb-10">
        <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-indigo-50 border border-indigo-100"
            animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <Scan className="w-8 h-8 text-indigo-600 relative z-10" />
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-600"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          Verifying Media Authenticity
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto truncate">
          Analyzing: <span className="font-mono text-slate-700 font-medium">{fileName}</span>
          {fileType === 'video' && extractedFrameCount ? ` (${extractedFrameCount} keyframes sampled)` : ''}
        </p>
      </div>

      {/* Dynamic Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-2">
          <span>Verification Pipeline</span>
          <span className="font-mono text-indigo-600 font-semibold tabular-nums">
            Stage {Math.min(currentStageIndex + 1, 5)} of 5
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
            initial={{ width: '10%' }}
            animate={{
              width: `${Math.min(100, Math.max(15, ((currentStageIndex + 1) / 5) * 100))}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Step Sequence List */}
      <div className="space-y-3.5">
        {STAGES.map((stage, idx) => {
          const isCompleted = currentStageIndex > idx;
          const isCurrent = currentStageIndex === idx;
          const isPending = currentStageIndex < idx;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 ${
                isCurrent
                  ? 'bg-indigo-50/50 border-indigo-200 shadow-xs'
                  : isCompleted
                  ? 'bg-slate-50/60 border-slate-200/80'
                  : 'bg-white border-transparent opacity-40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-mono text-slate-400">
                    {idx + 1}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold tracking-tight ${
                      isCurrent ? 'text-indigo-950 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-mono font-medium text-indigo-600 uppercase tracking-wider animate-pulse">
                      In Progress
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] font-mono font-medium text-emerald-600 uppercase tracking-wider">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety & Real Pipeline Notice */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Model: Gemini 3.8 Flash Multimodal Vision</span>
        <span>Secure in-memory processing</span>
      </div>

    </div>
  );
};
