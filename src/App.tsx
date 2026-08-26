import React, { useState, useEffect } from 'react';
import { 
  CivicCase, 
  CityHotspot, 
  AIAgentDefinition, 
  AIInsightItem, 
  CausalNode, 
  AppView
} from './types';
import { 
  INITIAL_CASES, 
  MOCK_CASES,
  CITY_HOTSPOTS, 
  AI_AGENTS_LIST, 
  AI_LIVE_INSIGHTS, 
  CAUSAL_CHAIN_STEPS
} from './data/mockData';
import { 
  subscribeToComplaints
} from './services/complaintsService';
import { 
  getActiveOfficer,
  getCurrentUser,
  canAccessGovernmentPortal,
  canAccessOfficerPortal,
  isDevEnvironment
} from './services/authService';

// AP Project Monitoring Imports
import { 
  APProject, 
  APOfficer 
} from './types/apProjectTypes';
import { 
  subscribeToAPProjects, 
  getActiveAPOfficer, 
  setActiveAPOfficer 
} from './services/apProjectService';
import { GENERATED_OFFICERS } from './data/apProjectData';
import { APGovernmentDashboard } from './pages/ap/APGovernmentDashboard';
import { APOfficerDashboard } from './pages/ap/APOfficerDashboard';
import { APOfficerLoginPage } from './pages/ap/APOfficerLoginPage';
import { APProjectUpdateModal } from './components/ap/APProjectUpdateModal';
import { APProjectDetailsModal } from './components/ap/APProjectDetailsModal';

// Layout Components
import { CitizenLayout } from './components/CitizenLayout';
import { GovernmentLayout } from './components/GovernmentLayout';

// CivicMind Pages
import { LandingPage } from './pages/LandingPage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { CitizenLoginPage } from './pages/CitizenLoginPage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { CitizenAiAnalysisPage } from './pages/CitizenAiAnalysisPage';
import { CitizenCaseDetailsPage } from './pages/CitizenCaseDetailsPage';
import { TrackCasePage } from './pages/TrackCasePage';

import { GovernmentLoginPage } from './pages/GovernmentLoginPage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { CaseIntelligencePage } from './pages/CaseIntelligencePage';
import { CityIntelligencePage } from './pages/CityIntelligencePage';
import { AiResolutionEnginePage } from './pages/AiResolutionEnginePage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

import { OfficerLoginPage } from './pages/OfficerLoginPage';
import { OfficerWorkspacePage } from './pages/OfficerWorkspacePage';

// Modals / Drawers
import { CaseDetailsModal } from './components/CaseDetailsModal';
import handComplaintStampBg from './assets/images/hand_wooden_complaint_stamp_1787390509621.jpg';

export function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [reportAnalysisCase, setReportAnalysisCase] = useState<CivicCase | null>(null);

  // AP Project Monitoring State
  const [apProjects, setApProjects] = useState<APProject[]>([]);
  const [selectedAPProject, setSelectedAPProject] = useState<APProject | null>(null);
  const [updatingAPProject, setUpdatingAPProject] = useState<APProject | null>(null);
  const [activeAPOfficer, setActiveAPOfficer] = useState<APOfficer>(() => {
    return getActiveAPOfficer() || GENERATED_OFFICERS[0];
  });

  // Core Data State
  const [cases, setCases] = useState<CivicCase[]>(MOCK_CASES);
  const [hotspots] = useState<CityHotspot[]>(CITY_HOTSPOTS);
  const [aiAgents] = useState<AIAgentDefinition[]>(AI_AGENTS_LIST);
  const [insights] = useState<AIInsightItem[]>(AI_LIVE_INSIGHTS);
  const [causalChain] = useState<CausalNode[]>(CAUSAL_CHAIN_STEPS);

  // Subscribe to live complaints
  useEffect(() => {
    const unsubscribe = subscribeToComplaints((updatedCases) => {
      setCases(updatedCases);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to AP Projects
  useEffect(() => {
    const unsubscribe = subscribeToAPProjects((projects) => {
      setApProjects(projects);
    });
    return () => unsubscribe();
  }, []);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
  };

  const handleCloseCaseModal = () => {
    setSelectedCaseId(null);
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || null;

  // Decide Layout wrapper
  const isCitizenView = [
    'citizen-dashboard',
    'citizen-report',
    'citizen-ai-analysis',
    'citizen-case-details',
    'citizen-track'
  ].includes(currentView);

  const isGovView = [
    'gov-dashboard',
    'gov-live-cases',
    'city-intelligence',
    'ai-resolution-engine',
    'departments',
    'analytics',
    'ap-projects',
    'gov-projects',
    'ap-gov-dashboard'
  ].includes(currentView);

  // 1. LANDING PAGE
  if (currentView === 'landing' || currentView === 'home') {
    return (
      <LandingPage
        onNavigate={handleNavigate}
        onOpenReport={() => handleNavigate('citizen-report')}
        onOpenTrack={() => handleNavigate('citizen-track')}
      />
    );
  }

  // 2. AUTHENTICATION PAGES
  if (currentView === 'citizen-login') {
    return (
      <CitizenLoginPage
        onNavigate={handleNavigate}
        onLoginSuccess={() => handleNavigate('citizen-dashboard')}
      />
    );
  }

  if (currentView === 'gov-login' || currentView === 'ap-gov-login') {
    return (
      <GovernmentLoginPage
        onNavigate={handleNavigate}
        onLoginSuccess={() => handleNavigate('gov-dashboard')}
      />
    );
  }

  if (currentView === 'officer-login') {
    return (
      <OfficerLoginPage
        onNavigate={handleNavigate}
        onLoginSuccess={() => handleNavigate('officer-workspace')}
      />
    );
  }

  if (currentView === 'ap-officer-login') {
    return (
      <APOfficerLoginPage
        onNavigate={(view) => {
          if (view === 'ap-officer-dashboard') {
            handleNavigate('ap-officer-dashboard');
          } else {
            handleNavigate(view as AppView);
          }
        }}
        onLoginSuccess={(officer) => {
          setActiveAPOfficer(officer);
          handleNavigate('ap-officer-dashboard');
        }}
      />
    );
  }

  // 3. AP DEDICATED OFFICER DASHBOARD
  if (currentView === 'ap-officer-dashboard') {
    if (!canAccessOfficerPortal(getCurrentUser(), getActiveOfficer()) && !activeAPOfficer) {
      return (
        <APOfficerLoginPage
          onNavigate={(view) => {
            if (view === 'ap-officer-dashboard') {
              handleNavigate('ap-officer-dashboard');
            } else {
              handleNavigate(view as AppView);
            }
          }}
          onLoginSuccess={(officer) => {
            setActiveAPOfficer(officer);
            handleNavigate('ap-officer-dashboard');
          }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative select-none">
        
        {/* Background Layer: Hand holding wooden COMPLAINT stamp photo */}
        <div 
          className="fixed inset-0 pointer-events-none -z-20 overflow-hidden"
          style={{
            backgroundImage: `url(${handComplaintStampBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.15,
          }}
        />

        {/* Top Minimal Bar */}
        <header className="bg-[#003366] text-white py-3 px-6 shadow-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigate('landing')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              ← Back to Portal
            </button>
            <div className="text-sm font-black tracking-tight text-white hidden sm:block">
              Government of Andhra Pradesh • Officer Project Monitoring System
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate('officer-workspace')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              Field Incidents Workspace →
            </button>
            <button
              onClick={() => handleNavigate('officer-login')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        <APOfficerDashboard
          officer={activeAPOfficer}
          projects={apProjects}
          onOpenUpdateModal={(project) => setUpdatingAPProject(project)}
          onSelectProject={(project) => setSelectedAPProject(project)}
          onSwitchOfficer={() => handleNavigate('ap-officer-login')}
        />

        {/* Update Modal */}
        <APProjectUpdateModal
          isOpen={!!updatingAPProject}
          project={updatingAPProject}
          officer={activeAPOfficer}
          onClose={() => setUpdatingAPProject(null)}
          onSuccess={(updatedProject) => {
            setUpdatingAPProject(null);
          }}
        />

        {/* Details Modal */}
        <APProjectDetailsModal
          isOpen={!!selectedAPProject}
          project={selectedAPProject}
          onClose={() => setSelectedAPProject(null)}
          onOpenUpdate={(p) => {
            setSelectedAPProject(null);
            setUpdatingAPProject(p);
          }}
        />
      </div>
    );
  }

  // 4. OFFICER WORKSPACE
  if (currentView === 'officer-workspace') {
    if (!canAccessOfficerPortal(getCurrentUser(), getActiveOfficer())) {
      return (
        <OfficerLoginPage
          onNavigate={handleNavigate}
          onLoginSuccess={() => handleNavigate('officer-workspace')}
        />
      );
    }

    return (
      <OfficerWorkspacePage
        onNavigate={handleNavigate}
        activeOfficer={getActiveOfficer()}
      />
    );
  }

  // 5. CITIZEN VIEWS (Wrapped with CitizenLayout)
  if (isCitizenView) {
    if (currentView === 'citizen-dashboard' && !getCurrentUser() && !isDevEnvironment()) {
      return (
        <CitizenLoginPage
          onNavigate={handleNavigate}
          onLoginSuccess={() => handleNavigate('citizen-dashboard')}
        />
      );
    }

    return (
      <CitizenLayout
        currentView={currentView}
        onNavigate={handleNavigate}
        onSwitchToGov={() => handleNavigate('gov-login')}
        onOpenReport={() => handleNavigate('citizen-report')}
      >
        {currentView === 'citizen-dashboard' && (
          <CitizenDashboardPage
            cases={cases}
            onNavigate={handleNavigate}
            onSelectCase={(id) => {
              setSelectedCaseId(id);
              handleNavigate('citizen-case-details');
            }}
            onOpenReport={() => handleNavigate('citizen-report')}
          />
        )}

        {currentView === 'citizen-report' && (
          <ReportIssuePage
            onNavigate={handleNavigate}
            onCaseCreated={(newCase) => {
              setSelectedCaseId(newCase.id);
            }}
            onViewCase={(caseId) => {
              setSelectedCaseId(caseId);
              handleNavigate('citizen-case-details');
            }}
            onAnalysisReady={(newCase) => {
              setReportAnalysisCase(newCase);
              handleNavigate('citizen-ai-analysis');
            }}
          />
        )}

        {currentView === 'citizen-ai-analysis' && reportAnalysisCase && (
          <CitizenAiAnalysisPage
            initialCase={reportAnalysisCase}
            onNavigate={handleNavigate}
            onViewDetails={(caseId) => {
              setSelectedCaseId(caseId);
              handleNavigate('citizen-case-details');
            }}
            onCreateComplaint={(newCase) => {
              setSelectedCaseId(newCase.id);
              handleNavigate('citizen-case-details');
            }}
          />
        )}

        {currentView === 'citizen-case-details' && (
          <CitizenCaseDetailsPage
            caseId={selectedCaseId}
            caseItem={selectedCase}
            cases={cases}
            onNavigate={handleNavigate}
            onBack={() => handleNavigate('citizen-dashboard')}
          />
        )}

        {currentView === 'citizen-track' && (
          <TrackCasePage
            cases={cases}
            onNavigate={handleNavigate}
            onSelectCase={(id) => {
              setSelectedCaseId(id);
              handleNavigate('citizen-case-details');
            }}
          />
        )}
      </CitizenLayout>
    );
  }

  // 6. GOVERNMENT VIEWS (Wrapped with GovernmentLayout)
  if (isGovView) {
    if (!canAccessGovernmentPortal(getCurrentUser())) {
      return (
        <GovernmentLoginPage
          onNavigate={handleNavigate}
          onLoginSuccess={() => handleNavigate('gov-dashboard')}
        />
      );
    }

    return (
      <GovernmentLayout
        currentView={currentView}
        onNavigate={handleNavigate}
        onSwitchToCitizen={() => handleNavigate('citizen-login')}
        insights={insights}
      >
        {currentView === 'gov-dashboard' && (
          <CommandCenterPage
            cases={cases}
            hotspots={hotspots}
            insights={insights}
            onSelectCase={handleSelectCase}
            onNavigate={handleNavigate}
          />
        )}

        {(currentView === 'ap-projects' || currentView === 'gov-projects' || currentView === 'ap-gov-dashboard') && (
          <APGovernmentDashboard
            projects={apProjects}
            onSelectProject={(project) => setSelectedAPProject(project)}
            onOpenUpdateModal={(project) => setUpdatingAPProject(project)}
          />
        )}

        {currentView === 'gov-live-cases' && (
          <CaseIntelligencePage
            cases={cases}
            onSelectCase={handleSelectCase}
          />
        )}

        {currentView === 'city-intelligence' && (
          <CityIntelligencePage
            hotspots={hotspots}
            cases={cases}
            onSelectHotspot={(h) => {}}
          />
        )}

        {currentView === 'ai-resolution-engine' && (
          <AiResolutionEnginePage
            agents={aiAgents}
            causalChain={causalChain}
          />
        )}

        {currentView === 'departments' && (
          <DepartmentsPage
            cases={cases}
            onSelectCase={handleSelectCase}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsPage
            cases={cases}
            hotspots={hotspots}
          />
        )}

        {/* Selected Case Modal */}
        {selectedCase && (
          <CaseDetailsModal
            incident={selectedCase}
            isOpen={!!selectedCase}
            onClose={handleCloseCaseModal}
          />
        )}

        {/* Selected AP Project Details Modal */}
        <APProjectDetailsModal
          isOpen={!!selectedAPProject}
          project={selectedAPProject}
          onClose={() => setSelectedAPProject(null)}
          onOpenUpdate={(p) => {
            setSelectedAPProject(null);
            setUpdatingAPProject(p);
          }}
        />

        {/* AP Project Update Modal (for Government test or Officer) */}
        <APProjectUpdateModal
          isOpen={!!updatingAPProject}
          project={updatingAPProject}
          officer={activeAPOfficer}
          onClose={() => setUpdatingAPProject(null)}
          onSuccess={(updatedProject) => {
            setUpdatingAPProject(null);
          }}
        />
      </GovernmentLayout>
    );
  }

  // Default Fallback
  return (
    <LandingPage
      onNavigate={handleNavigate}
      onOpenReport={() => handleNavigate('citizen-report')}
      onOpenTrack={() => handleNavigate('citizen-track')}
    />
  );
}

export default App;
