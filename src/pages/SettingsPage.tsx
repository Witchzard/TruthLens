import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Cpu,
  Save,
  Check,
  Lock,
  Database,
  Trash2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [sensitivity, setSensitivity] = useState<'standard' | 'high' | 'relaxed'>('high');
  const [retainHistory, setRetainHistory] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [autoExportPdf, setAutoExportPdf] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearLocalStorage = () => {
    if (confirm('Clear all local analysis history? This action cannot be undone.')) {
      localStorage.removeItem('truthlens_reports_history');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Forensic Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Configure forensic sensitivity thresholds, privacy safeguards, and profile details.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Account & Profile Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Investigator Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue="R. Venkat"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Authorized Email</label>
              <input
                type="email"
                defaultValue="rovenkat2007@gmail.com"
                disabled
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organization / Entity</label>
              <input
                type="text"
                defaultValue="Media Verification Group"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Investigator Role</label>
              <input
                type="text"
                defaultValue="Senior Media Forensic Analyst"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Forensic Sensitivity Thresholds */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Analysis Engine Calibration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Forensic Detection Sensitivity
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Controls the rigor of anomaly flagging for subtle micro-inconsistencies and diffusion textures.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setSensitivity('high')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    sensitivity === 'high'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">High Sensitivity (Default)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Flags micro-blemishes, fine texture smoothing, and subtle kerning shifts.
                  </div>
                </div>

                <div
                  onClick={() => setSensitivity('standard')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    sensitivity === 'standard'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">Balanced Standard</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Optimized for general consumer photography and standard documentation.
                  </div>
                </div>

                <div
                  onClick={() => setSensitivity('relaxed')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    sensitivity === 'relaxed'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">Permissive / Relaxed</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Permits social media re-compression noise without raising false positive warnings.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Storage Safeguards */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Privacy & Data Governance</h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={retainHistory}
                onChange={(e) => setRetainHistory(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-semibold text-slate-900">Local Archive Retention</span>
                <p className="text-slate-500 mt-0.5">
                  Stores completed reports in your browser's private local storage so you can review previous investigations.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoExportPdf}
                onChange={(e) => setAutoExportPdf(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-semibold text-slate-900">Instant PDF Archive Trigger</span>
                <p className="text-slate-500 mt-0.5">
                  Automatically initiates client-side PDF compilation immediately upon report generation.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-900">Clear Local Storage</div>
              <div className="text-[11px] text-slate-500">Purges all archived reports from this browser session.</div>
            </div>
            <button
              type="button"
              onClick={handleClearLocalStorage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences saved!
            </span>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-slate-300" />
            <span>Save Preferences</span>
          </button>
        </div>

      </form>
    </div>
  );
};
