import React from 'react';
import { Image, Video, FileText, Cpu, CheckCircle } from 'lucide-react';

export const TrustIndicators: React.FC = () => {
  const indicators = [
    {
      title: 'Image Analysis',
      subtitle: 'GAN & Diffusion Synthesis',
      icon: Image,
      description: 'Diffusion artifacts, clone-stamping & lighting vectors',
    },
    {
      title: 'Video Deepfake Detection',
      subtitle: 'Temporal Keyframe Sampling',
      icon: Video,
      description: 'Facial boundary stability & inter-frame jitter',
    },
    {
      title: 'Document Verification',
      subtitle: 'Typographic & Splicing Audit',
      icon: FileText,
      description: 'Font variance, altered financial figures & text synthesis',
    },
    {
      title: 'AI Content Detection',
      subtitle: 'Multimodal Neural Inspection',
      icon: Cpu,
      description: 'Calibrated signals distinguishing AI assistance from forgery',
    },
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group p-5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-sans tracking-tight">
                  {item.title}
                </h3>
                <div className="text-xs font-medium text-indigo-600 mt-0.5">
                  {item.subtitle}
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
