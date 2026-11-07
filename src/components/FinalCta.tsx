import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface FinalCtaProps {
  onStartAnalyzing: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onStartAnalyzing }) => {
  return (
    <section className="py-20 md:py-28 bg-[#FAFAFA] border-b border-slate-200/60 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-6 shadow-md shadow-slate-900/10">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight text-balance mb-4">
          Think Before You Trust.
        </h2>

        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed mb-8 text-balance">
          Empower yourself with transparent media verification. Inspect digital photography, deepfake videos, and suspicious documents in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartAnalyzing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Start Analyzing</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        <div className="mt-8 text-xs text-slate-500">
          No credit card required · Instant automated analysis · Privacy preserved
        </div>
      </div>
    </section>
  );
};
