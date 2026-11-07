import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  onOpenWorkspace: () => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenWorkspace, activeSection }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left text-slate-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center shadow-sm ring-1 ring-slate-900/10 group-hover:scale-[1.02] transition-transform">
            <ShieldCheck className="w-5 h-5 text-indigo-300" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
            TruthLens <span className="text-indigo-600 font-semibold">AI</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links (single-line, clean text) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('home')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${activeSection === 'home' ? 'text-indigo-600 font-semibold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            How It Works
          </button>
          <button
            onClick={() => onNavigate('capabilities')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Capabilities
          </button>
          <button
            onClick={() => onNavigate('about')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            About
          </button>
        </nav>

        {/* Zone 3: Primary Action CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenWorkspace}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm whitespace-nowrap shrink-0"
          >
            <span>Analyze Media</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
