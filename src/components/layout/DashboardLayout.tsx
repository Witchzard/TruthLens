import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  PlusCircle,
  History,
  Settings,
  HelpCircle,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Mail,
  User,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'New Analysis', path: '/dashboard/analyze', icon: PlusCircle },
    { name: 'Analysis History', path: '/dashboard/history', icon: History },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/dashboard') return 'Platform Overview';
    if (p === '/dashboard/analyze') return 'Media Verification Workspace';
    if (p === '/dashboard/history') return 'Analysis Archive';
    if (p === '/dashboard/settings') return 'Account & Forensic Settings';
    if (p.startsWith('/dashboard/report/')) return 'Authenticity Report';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-bold text-slate-900 text-base">
            TruthLens <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle navigation drawer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Persistent Left Sidebar (Desktop) / Slide-over Drawer (Mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 flex-1 flex flex-col">
          {/* Brand Wordmark & Back to Site */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-base tracking-tight leading-tight">
                  TruthLens <span className="text-indigo-600">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Workspace v2.4</span>
              </div>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            <div className="pt-5 mt-5 border-t border-slate-100">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Support & Guides
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowHelpModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer text-left"
              >
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Help & Support</span>
              </button>

              <Link
                to="/"
                className="flex items-center justify-between px-3 py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                <span>Back to Public Website</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </nav>
        </div>

        {/* User Profile Box at bottom of sidebar */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              RV
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                R. Venkat
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Forensic Investigator
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-16 px-6 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
            <Link to="/dashboard" className="hover:text-slate-800 font-medium">
              Dashboard
            </Link>
            {location.pathname !== '/dashboard' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-900 truncate">
                  {getPageTitle()}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {location.pathname !== '/dashboard/analyze' && (
              <button
                onClick={() => navigate('/dashboard/analyze')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-lg shadow-xs transition-all whitespace-nowrap cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-300" />
                <span>New Analysis</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Help & Forensic Support
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed mb-6">
              <p>
                <strong>How to interpret Confidence:</strong> Model confidence reflects how strongly the visual, spectral, or typographic patterns correlate with known generative synthesis markers or digital splicing.
              </p>
              <p>
                <strong>Video Frame Sampling:</strong> Videos are sampled evenly at 5 keyframe intervals inside your browser before submission to conserve bandwidth and protect privacy.
              </p>
              <p>
                <strong>Need dedicated forensic assistance?</strong> Contact our investigative support engineers at <span className="font-mono text-indigo-600">support@truthlens.ai</span>.
              </p>
            </div>

            <div className="text-right">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30 md:hidden backdrop-blur-xs"
        />
      )}
    </div>
  );
};
