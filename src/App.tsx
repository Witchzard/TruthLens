/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { AnalyzeWorkspacePage } from './pages/AnalyzeWorkspacePage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportDetailPage } from './pages/ReportDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing Landing Page (Independent layout, no dashboard, no sidebar) */}
        <Route path="/" element={<LandingPage />} />

        {/* Dedicated SaaS Dashboard (Completely different layout with persistent sidebar) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="analyze" element={<AnalyzeWorkspacePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="report/:id" element={<ReportDetailPage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
