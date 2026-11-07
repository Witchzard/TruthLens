import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { Hero } from '../components/Hero';
import { TrustIndicators } from '../components/TrustIndicators';
import { Capabilities } from '../components/Capabilities';
import { HowItWorks } from '../components/HowItWorks';
import { SupportedFileTypes } from '../components/SupportedFileTypes';
import { TrustPrivacySection } from '../components/TrustPrivacySection';
import { FinalCta } from '../components/FinalCta';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleOpenDashboard = (modality?: string) => {
    if (modality) {
      navigate(`/dashboard/analyze?type=${modality}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      
      {/* Public Marketing Navbar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onAnalyzeClick={() => handleOpenDashboard()}
          onExploreClick={() => handleNavigateSection('how-it-works')}
        />

        {/* Trust Indicators Strip */}
        <TrustIndicators />

        {/* Feature Showcase Capabilities */}
        <Capabilities
          onSelectCategory={(category) => handleOpenDashboard(category)}
        />

        {/* How It Works Section */}
        <HowItWorks onStartAnalyzing={() => handleOpenDashboard()} />

        {/* Supported File Types Section */}
        <SupportedFileTypes />

        {/* Trust & Privacy Section */}
        <TrustPrivacySection />

        {/* Final CTA */}
        <FinalCta onStartAnalyzing={() => handleOpenDashboard()} />
      </main>

      {/* Public Footer */}
      <Footer
        onNavigate={handleNavigateSection}
        onOpenWorkspace={() => handleOpenDashboard()}
      />

    </div>
  );
};
