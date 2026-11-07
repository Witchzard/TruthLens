import React from 'react';
import { UploadCloud, ScanEye, FileCheck2, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onStartAnalyzing: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartAnalyzing }) => {
  const steps = [
    {
      step: '01',
      title: 'Upload Media',
      subtitle: 'Images, Videos, or Documents',
      description:
        'Drag and drop any digital asset up to 35MB. TruthLens supports standard image formats, high-definition videos with client-side keyframe extraction, and native PDFs or text documents.',
      icon: UploadCloud,
      meta: 'Supports JPG · PNG · WEBP · MP4 · MOV · PDF · DOCX',
    },
    {
      step: '02',
      title: 'Multimodal Deep Inspection',
      subtitle: 'Cross-Signal Forensic Processing',
      description:
        'Our Gemini 3.8 Flash multimodal vision engine inspects spatial textures, anatomical consistency, clone stamping, inter-frame temporal stability, and typographic alignment.',
      icon: ScanEye,
      meta: 'Spectral textures · Temporal coherence · Kerning analysis',
    },
    {
      step: '03',
      title: 'Discover & Verify Evidence',
      subtitle: 'Transparent, Calibrated Reporting',
      description:
        'Receive an interpretable authenticity assessment with risk rating, localized evidence breakdown, signal scores, and a downloadable formal PDF report for record keeping.',
      icon: FileCheck2,
      meta: 'Executive summary · Localized evidence · Exportable PDF',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#FAFAFA] border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-2">
            Verification Methodology
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            How TruthLens AI Verifies Media
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-slate-600 leading-relaxed text-balance">
            A three-step verification pipeline engineered to give ordinary people, journalists, and researchers clarity without black-box opacity.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative flex flex-col justify-between p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-mono font-bold text-slate-300 tabular-nums">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-indigo-600 mb-3.5">
                    {item.subtitle}
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
                  {item.meta}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 text-center">
          <button
            onClick={onStartAnalyzing}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer group"
          >
            <span>Ready to test your first file?</span>
            <span className="font-bold underline underline-offset-4 flex items-center gap-1 group-hover:gap-1.5 transition-all">
              Go to Analysis Workspace <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>

      </div>
    </section>
  );
};
