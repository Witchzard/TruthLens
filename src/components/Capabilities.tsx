import React from 'react';
import { Image, Video, FileText, CheckCircle2, Sparkles, Layers, Sliders, Shield } from 'lucide-react';

interface CapabilitiesProps {
  onSelectCategory: (category: 'image' | 'video' | 'document') => void;
}

export const Capabilities: React.FC<CapabilitiesProps> = ({ onSelectCategory }) => {
  return (
    <section id="capabilities" className="py-20 md:py-28 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-2">
            Engine Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Forensic Intelligence Across All Modalities
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-slate-600 leading-relaxed text-balance">
            Every digital format presents unique synthetic signatures. TruthLens AI applies specialized multimodal models calibrated for each content medium.
          </p>
        </div>

        {/* 3 Modality Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Image Verification */}
          <div className="flex flex-col justify-between p-8 rounded-2xl bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
                <Image className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Image Verification
              </h3>
              <p className="text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
                Detects generative diffusion artifacts, localized editing boundaries, clone-stamping, and optical anomalies in static photography.
              </p>

              <div className="space-y-3 pt-2 border-t border-slate-200/60">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">AI-Generated Image Detection:</span> Identifies skin smoothing, pupil irregularities, and Midjourney/Flux artifacts.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Face Swap Identification:</span> Highlights seam lines around jawlines and hairline boundaries.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Manipulation & Cloning:</span> Uncovers copy-move forgery, erased objects, and resampling noise variance.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Lighting Inconsistency:</span> Audits shadow directionality and light vector coherence across subjects.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('image')}
              className="mt-8 w-full py-2.5 px-4 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer text-center"
            >
              Verify An Image
            </button>
          </div>

          {/* Card 2: Video Verification */}
          <div className="flex flex-col justify-between p-8 rounded-2xl bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Video Verification
              </h3>
              <p className="text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
                Applies client-side keyframe extraction followed by multimodal temporal inspection to flag deepfakes and generative video glitches.
              </p>

              <div className="space-y-3 pt-2 border-t border-slate-200/60">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Deepfake Detection:</span> Uncovers neural face replacement, expression anomalies, and unnatural blinking.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Temporal Keyframe Inspection:</span> Accurately inspects sampled timestamps to observe inter-frame warping.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Physics & Geometry Glitches:</span> Detects morphing background objects, limb warping, and generative fluid errors.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Compression Discrepancies:</span> Isolates differences between head bounding boxes and natural video compression.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('video')}
              className="mt-8 w-full py-2.5 px-4 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer text-center"
            >
              Verify A Video
            </button>
          </div>

          {/* Card 3: Document Verification */}
          <div className="flex flex-col justify-between p-8 rounded-2xl bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Document Verification
              </h3>
              <p className="text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
                Inspects PDF financial invoices, contracts, academic transcripts, and text files for unauthorized insertions and forged clauses.
              </p>

              <div className="space-y-3 pt-2 border-t border-slate-200/60">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Document Alteration Detection:</span> Identifies digital patch overlays on invoices, receipts, and bank statements.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Typographic Inconsistencies:</span> Scans for font family, weight, and kerning shifts that indicate spliced text.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Balanced AI-Writing Signals:</span> Distinguishes legitimate AI assistance from fabricated official statements.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Structure & Signature Audit:</span> Evaluates header metadata, official seals, and alignment regularity.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('document')}
              className="mt-8 w-full py-2.5 px-4 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer text-center"
            >
              Verify A Document
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
