import React, { useState } from 'react';
import { ShieldCheck, Mail, ExternalLink, X } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenWorkspace: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenWorkspace }) => {
  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'terms' | 'contact' | null>(null);

  return (
    <footer id="about" className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-bold text-slate-900 text-base">
                TruthLens <span className="text-indigo-600">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Intelligent media authenticity verification platform engineered to detect synthetic imagery, deepfakes, and manipulated documents.
            </p>
            <div className="text-xs text-slate-400 pt-1">
              Tagline: "See beyond what you see. Verify what you trust."
            </div>
          </div>

          {/* Verification Products */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Capabilities
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={onOpenWorkspace} className="hover:text-indigo-600 transition-colors">
                  AI Image Detection
                </button>
              </li>
              <li>
                <button onClick={onOpenWorkspace} className="hover:text-indigo-600 transition-colors">
                  Video Deepfake Analysis
                </button>
              </li>
              <li>
                <button onClick={onOpenWorkspace} className="hover:text-indigo-600 transition-colors">
                  Document Integrity Audit
                </button>
              </li>
              <li>
                <button onClick={onOpenWorkspace} className="hover:text-indigo-600 transition-colors">
                  PDF Report Generation
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-indigo-600 transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('capabilities')} className="hover:text-indigo-600 transition-colors">
                  Forensic Methodologies
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('about')} className="hover:text-indigo-600 transition-colors">
                  About TruthLens AI
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('contact')} className="hover:text-indigo-600 transition-colors">
                  Research Collaboration
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => setActiveModal('privacy')} className="hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('terms')} className="hover:text-indigo-600 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('about')} className="hover:text-indigo-600 transition-colors">
                  Ethics & Calibrated Scoring
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('contact')} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Contact Support
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} TruthLens AI. All rights reserved. Automated analysis is an indicative assessment.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Powered by Gemini 3.8 Flash Multimodal Vision</span>
          </div>
        </div>
      </div>

      {/* Info Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {activeModal === 'about' && 'About TruthLens AI'}
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'terms' && 'Terms of Service'}
                {activeModal === 'contact' && 'Contact & Collaboration'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 text-xs text-slate-600 space-y-3 leading-relaxed">
              {activeModal === 'about' && (
                <>
                  <p>
                    TruthLens AI was built to bring media forensics into the hands of ordinary citizens, reporters, students, and organizations in an era where synthetic generation tools can fabricate hyper-realistic video, photography, and documentation.
                  </p>
                  <p>
                    <strong>Our Core Commitment:</strong> Unlike black-box tools that produce arbitrary probability scores, TruthLens AI provides transparent, explainable evidence breakdowns detailing visible anatomical, spectral, and temporal signals.
                  </p>
                  <p>
                    Automated analysis is intended to support human judgment and investigation rather than serve as legal or scientific certification.
                  </p>
                </>
              )}

              {activeModal === 'privacy' && (
                <>
                  <p>
                    <strong>Zero Data Persistence:</strong> Your uploaded images, video keyframes, and documents are processed in-memory for the duration of the analysis request and are discarded immediately after report generation.
                  </p>
                  <p>
                    <strong>No Model Training:</strong> TruthLens AI does not sell, retain, or use your uploaded content to train public models.
                  </p>
                  <p>
                    Temporary client-side processing handles video keyframe extraction directly in your browser using standard HTML5 Canvas, ensuring complete local privacy prior to inspection.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    <strong>Indicative Assessment Only:</strong> TruthLens AI reports reflect algorithmic probability and visible artifact detection. Media verification cannot guarantee 100% certainty due to evolving synthetic techniques.
                  </p>
                  <p>
                    <strong>Permitted Use:</strong> You agree not to upload non-consensual explicit material, malware, or content in violation of applicable laws.
                  </p>
                  <p>
                    Reports and findings should be independently corroborated for formal legal, journalistic, or judicial proceedings.
                  </p>
                </>
              )}

              {activeModal === 'contact' && (
                <>
                  <p>
                    For press inquiries, academic research partnerships, or API integrations, contact our verification team at:
                  </p>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-800 text-[11px]">
                    contact@truthlens.ai · forensic-lab@truthlens.ai
                  </div>
                  <p>
                    We welcome dataset submissions of novel generative diffusion signatures and deepfake benchmarks.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
