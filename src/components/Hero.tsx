import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Search, FileText, Video, Image as ImageIcon } from 'lucide-react';

interface HeroProps {
  onAnalyzeClick: () => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyzeClick, onExploreClick }) => {
  const [activeVisualMode, setActiveVisualMode] = useState<0 | 1 | 2>(0);

  // Cycle through visual simulation preview: 0: Image scan, 1: Video deepfake scan, 2: Document verification
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveVisualMode((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/70 bg-gradient-to-b from-white via-[#FAFAFA] to-white">
      {/* Subtle organic ambient gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-tr from-indigo-50/50 via-blue-50/30 to-purple-50/30 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50/80 px-3 py-1 rounded-md border border-indigo-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TruthLens AI Forensic Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] text-balance">
              Not Everything You See Is Real.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl text-balance">
              AI-powered media verification that helps you uncover deepfakes, manipulated images, suspicious documents, and synthetic content with transparent evidence.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onAnalyzeClick}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer"
              >
                <span>Analyze Now</span>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </button>

              <button
                onClick={onExploreClick}
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 active:scale-[0.98] rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer"
              >
                Explore How It Works
              </button>
            </div>

            {/* Subtext Trust Markers */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Multimodal Vision Analysis
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Inter-frame Temporal Verification
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Typographic & Document Tampering
              </span>
            </div>
          </div>

          {/* Right Column: Animated Media Scanning Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-5 overflow-hidden">
              
              {/* Top simulation control bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">verification-engine</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <button
                    onClick={() => setActiveVisualMode(0)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${activeVisualMode === 0 ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-100'}`}
                  >
                    Image
                  </button>
                  <button
                    onClick={() => setActiveVisualMode(1)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${activeVisualMode === 1 ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-100'}`}
                  >
                    Video
                  </button>
                  <button
                    onClick={() => setActiveVisualMode(2)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${activeVisualMode === 2 ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-100'}`}
                  >
                    Doc
                  </button>
                </div>
              </div>

              {/* Dynamic Media Container */}
              <div className="relative my-4 aspect-[4/3] rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {activeVisualMode === 0 && (
                    <motion.div
                      key="image-scan"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-slate-800 flex flex-col justify-center items-center p-4 text-center"
                    >
                      {/* Simulated Portrait with inspection boxes */}
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-400 to-violet-300 relative mb-3 shadow-inner flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-white/80" />
                        {/* Inspected facial region box */}
                        <div className="absolute inset-0 border border-dashed border-indigo-300/80 rounded-full animate-pulse" />
                      </div>
                      <div className="text-xs font-medium text-slate-200">Portrait_Studio_Diffusion.png</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">800x800 · PNG · Spectral Filter Active</div>
                    </motion.div>
                  )}

                  {activeVisualMode === 1 && (
                    <motion.div
                      key="video-scan"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-slate-950 flex flex-col justify-center items-center p-4 text-center"
                    >
                      <div className="w-full flex items-center justify-center gap-2 mb-3">
                        <div className="w-16 h-20 rounded bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-[10px] text-slate-400 font-mono">
                          <Video className="w-4 h-4 mb-1 text-indigo-400" />
                          00:01
                        </div>
                        <div className="w-16 h-20 rounded bg-slate-800 border border-indigo-500/80 shadow-xs shadow-indigo-500/20 flex flex-col items-center justify-center text-[10px] text-indigo-300 font-mono">
                          <Video className="w-4 h-4 mb-1 text-indigo-300" />
                          00:03
                        </div>
                        <div className="w-16 h-20 rounded bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-[10px] text-slate-400 font-mono">
                          <Video className="w-4 h-4 mb-1 text-indigo-400" />
                          00:05
                        </div>
                      </div>
                      <div className="text-xs font-medium text-slate-200">Deepfake_Sample_Interview.mp4</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">Sampled Keyframe Temporal Stability Check</div>
                    </motion.div>
                  )}

                  {activeVisualMode === 2 && (
                    <motion.div
                      key="doc-scan"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-slate-900 flex flex-col justify-center items-center p-5 text-left"
                    >
                      <div className="w-48 bg-slate-800/90 rounded border border-slate-700 p-3 space-y-1.5 shadow-md">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          Wire_Transfer_Form.pdf
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded w-full" />
                        <div className="h-1.5 bg-slate-700 rounded w-4/5" />
                        <div className="h-2 bg-amber-500/30 border border-amber-500/50 rounded w-full flex items-center px-1">
                          <span className="text-[8px] text-amber-300 font-mono">Font variance: 11pt Arial vs 10pt</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-3 text-center">Typographic Integrity & Splicing Audit</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Animated Scanner Bar */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_rgba(99,102,241,0.8)] pointer-events-none"
                  animate={{
                    top: ['5%', '92%', '5%'],
                  }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>

              {/* Bottom Result Card Simulation */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span className="text-xs font-semibold text-slate-900">
                      {activeVisualMode === 0 ? 'Synthetic Artifacts Detected' : activeVisualMode === 1 ? 'Facial Seam Inconsistency' : 'Altered Typography Section'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-600 tabular-nums">
                    {activeVisualMode === 0 ? '94% Confidence' : activeVisualMode === 1 ? '88% Confidence' : '91% Confidence'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {activeVisualMode === 0
                    ? 'Excessive skin smoothing and asymmetric specular reflections indicate generative synthesis.'
                    : activeVisualMode === 1
                    ? 'Boundary micro-jitter along jawline across frames 00:03-00:05 suggests face substitution.'
                    : 'Font metadata and kerning variance in wire transfer section indicates digital splicing.'}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
