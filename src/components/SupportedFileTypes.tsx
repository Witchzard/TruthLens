import React from 'react';
import { Image, Video, FileText, CheckCircle2 } from 'lucide-react';

export const SupportedFileTypes: React.FC = () => {
  const formats = [
    {
      title: 'Digital Photography & Graphics',
      category: 'Images',
      icon: Image,
      extensions: ['JPG', 'JPEG', 'PNG', 'WEBP'],
      maxSize: '35 MB',
      checks: [
        'Midjourney, Stable Diffusion, DALL-E & Flux markers',
        'Facial boundary seams & localized clone-stamping',
        'Specular lighting and shadow directionality vectors',
        'Resampling noise continuity and sensor physics',
      ],
    },
    {
      title: 'Recorded Video & Broadcast Feeds',
      category: 'Videos',
      icon: Video,
      extensions: ['MP4', 'WEBM', 'MOV'],
      maxSize: '35 MB (High Definition)',
      checks: [
        'Browser-native HTML5 keyframe sampling',
        'Inter-frame jawline and facial temporal micro-jitter',
        'Generative video morphing & physical glitches',
        'Compression quantization discrepancies',
      ],
    },
    {
      title: 'Contracts, Invoices & Statements',
      category: 'Documents',
      icon: FileText,
      extensions: ['PDF', 'DOCX', 'TXT'],
      maxSize: '35 MB',
      checks: [
        'Font typeface, size, and kerning shifts',
        'Digital whiteout blocks & spliced payment codes',
        'Balanced AI drafting versus deceptive forgery',
        'Creation vs modification date metadata audit',
      ],
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#FAFAFA] border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-2">
            Coverage & Compatibility
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Supported Media Formats
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-slate-600 leading-relaxed text-balance">
            Every file is ingested in-memory and processed through specialized forensic models matching its exact container specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {formats.map((fmt, idx) => {
            const Icon = fmt.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-500">
                      Limit: {fmt.maxSize}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
                    {fmt.title}
                  </h3>
                  <div className="text-xs font-semibold text-indigo-600 mb-4">
                    {fmt.category}
                  </div>

                  {/* Formats Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {fmt.extensions.map((ext) => (
                      <span
                        key={ext}
                        className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-slate-100 text-slate-700"
                      >
                        .{ext}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    {fmt.checks.map((chk, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{chk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
