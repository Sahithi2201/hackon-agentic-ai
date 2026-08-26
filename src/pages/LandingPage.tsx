import React, { useState } from 'react';
import { 
  Radio, 
  Sparkles, 
  ArrowRight, 
  UserCheck, 
  Building2, 
  CheckCircle2, 
  Compass, 
  Activity, 
  X,
  MapPin,
  Cpu,
  Layers,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { AppView } from '../types';
import handComplaintStampBg from '../assets/images/complaint_hero_bg_1787391111476.jpg';
import { APPortalPickerModal } from '../components/ap/APPortalPickerModal';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
  onOpenReport: () => void;
  onOpenTrack: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenReport,
  onOpenTrack
}) => {
  const [activeModal, setActiveModal] = useState<'about' | 'how-it-works' | null>(null);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState<boolean>(false);

  return (
    <div className="h-screen w-screen overflow-hidden text-[#0F172A] flex flex-col justify-between relative select-none">
      
      {/* Background Layer: Hand holding wooden COMPLAINT stamp photograph replacing white background */}
      <div 
        className="fixed inset-0 pointer-events-none -z-20 overflow-hidden"
        style={{
          backgroundImage: `url(${handComplaintStampBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 1,
        }}
      />

      {/* 1. TOP STICKY HEADER */}
      <header className="w-full z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo + Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  CivicMind
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  AI v2.4
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 hidden sm:block">
                AI-Powered Civic Complaint-to-Resolution Intelligence
              </p>
            </div>
          </div>

          {/* Quick Informational Modals & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveModal('about')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => setActiveModal('how-it-works')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => onNavigate('officer-login')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Officer Portal</span>
            </button>
            <button
              onClick={() => onNavigate('citizen-track')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Track Case</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. CENTER HERO & PORTAL CHOICES (FITS EXACTLY IN VIEWPORT, NO SCROLL) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center py-4 z-10">
        
        {/* Label Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          <span>AGENTIC AI FOR SMART GOVERNANCE</span>
        </div>

        {/* Large Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[44px] font-black tracking-tight text-slate-900 leading-tight max-w-4xl">
          From Citizen Complaints <br />
          to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Intelligent Resolution.</span>
        </h1>

        {/* Short Subtitle */}
        <p className="mt-2.5 text-xs sm:text-sm md:text-base text-slate-600 max-w-3xl leading-relaxed font-normal">
          CivicMind uses AI to understand civic complaints, detect duplicate issues, prioritize public impact, route cases to the correct department, monitor service deadlines, and provide transparent resolution tracking.
        </p>

        {/* TWO LARGE PRIMARY PORTAL CHOICES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mt-5 sm:mt-7 w-full max-w-4xl text-left">
          
          {/* PORTAL CARD 1: CITIZEN PORTAL */}
          <div className="group relative p-6 sm:p-7 rounded-3xl bg-white border-2 border-slate-200 hover:border-blue-500 shadow-md hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  PUBLIC PORTAL
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Citizen Portal
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Report civic problems, upload evidence, receive AI-powered analysis, and track every stage of the resolution process.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigate('citizen-login')}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ENTER CITIZEN PORTAL</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* PORTAL CARD 2: GOVERNMENT AI COMMAND CENTER */}
          <div className="group relative p-6 sm:p-7 rounded-3xl bg-white border-2 border-slate-200 hover:border-blue-700 shadow-md hover:shadow-xl hover:shadow-blue-700/10 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-700 group-hover:bg-slate-900 group-hover:text-cyan-300 transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold font-mono px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ENTERPRISE AI
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Government AI Command Center
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Monitor live civic issues, detect patterns, prioritize risk, coordinate departments, and manage resolution intelligently.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100">
              <button
                onClick={() => setIsPortalModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ENTER COMMAND CENTER</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* PORTAL PICKER MODAL (GOVERNMENT OR OFFICER) */}
      <APPortalPickerModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        onSelectOption={(option) => {
          setIsPortalModalOpen(false);
          if (option === 'government') {
            onNavigate('gov-login');
          } else {
            onNavigate('officer-login');
          }
        }}
      />

      {/* 3. CLEAN BOTTOM MUNICIPAL BAR */}
      <footer className="w-full bg-white border-t border-slate-200 py-2.5 px-4 text-center shrink-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autonomous Civic Intelligence Grid Active</span>
          </div>
          <div>
            CivicMind Smart City Operations Framework • Confidential & Secure
          </div>
        </div>
      </footer>

      {/* ABOUT MODAL */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Radio className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">About CivicMind</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              CivicMind is an end-to-end autonomous smart governance platform engineered to bridge the gap between citizen grievance reporting and municipal resolution execution.
            </p>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-Agent Neural Architecture (8 specialized governance sub-agents)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Computer Vision verification for pothole, drainage, and utility damage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Spatial deduplication & automated department dispatch</span>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* HOW IT WORKS MODAL */}
      {activeModal === 'how-it-works' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">How CivicMind Works</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-blue-600 block">1. Citizen Submission</span>
                <p className="text-slate-600 mt-1 text-[11px]">Upload image & location. AI extracts metadata and defect details.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-cyan-600 block">2. Cluster Deduplication</span>
                <p className="text-slate-600 mt-1 text-[11px]">Detects nearby duplicate complaints within 50m radius.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-amber-600 block">3. Impact & SLA Matrix</span>
                <p className="text-slate-600 mt-1 text-[11px]">Evaluates school/hospital proximity to calculate urgency.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-emerald-600 block">4. Optical Verification</span>
                <p className="text-slate-600 mt-1 text-[11px]">Validates repair photo with before/after AI audit before closing.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
