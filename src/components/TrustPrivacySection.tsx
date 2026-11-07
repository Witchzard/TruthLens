import React from 'react';
import { Shield, Lock, EyeOff, Scale } from 'lucide-react';

export const TrustPrivacySection: React.FC = () => {
  const points = [
    {
      title: 'Zero Permanent Storage',
      description: 'Your uploaded media files are held strictly in temporary server memory during the active inspection lifecycle, then immediately purged upon report compilation.',
      icon: Lock,
    },
    {
      title: 'Local Client-Side Keyframing',
      description: 'For video files, representative keyframe sampling runs inside your own browser using HTML5 Canvas, minimizing raw network bandwidth and maximizing privacy.',
      icon: EyeOff,
    },
    {
      title: 'Calibrated Confidence',
      description: 'We do not generate deceptive 99.9% certainty badges. TruthLens AI transparently distinguishes indicative AI neural patterns from certified forensic proof.',
      icon: Scale,
    },
    {
      title: 'No Model Retraining',
      description: 'Your private documents, proprietary imagery, and organizational records are never collected, repurposed, or used to fine-tune external generative models.',
      icon: Shield,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-2">
            Ethics & Confidentiality
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Engineered for Uncompromising Privacy
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-slate-600 leading-relaxed text-balance">
            Verification shouldn’t require sacrificing confidentiality. Discover how TruthLens AI protects user data at every stage of analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {points.map((pt, idx) => {
            const Icon = pt.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#FAFAFA] border border-slate-200/80 hover:border-slate-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-indigo-600 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">
                  {pt.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pt.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
