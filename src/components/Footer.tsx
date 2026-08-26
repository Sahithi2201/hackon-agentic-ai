import React from 'react';
import { MapPin, Cpu, ShieldCheck, Activity, Award, HeartHandshake, ExternalLink } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="w-full bg-[#07111F] border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Municipal Overview */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#146CFF] to-[#21D4FD] flex items-center justify-center text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                CivicLens<span className="text-[#21D4FD]">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered Civic Complaint-to-Resolution Intelligence Platform for Smart Cities and Municipal Corporations.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Activity className="w-3 h-3 animate-pulse" /> All AI Sub-Systems Active
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Shortcuts */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-[#21D4FD] transition-colors cursor-pointer">
                  Platform Overview
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('report')} className="hover:text-[#21D4FD] transition-colors cursor-pointer">
                  Report Citizen Issue
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('command-center')} className="hover:text-[#21D4FD] transition-colors cursor-pointer">
                  Command Center Operations
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('city-intelligence')} className="hover:text-[#21D4FD] transition-colors cursor-pointer">
                  City Intelligence & Hotspots
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('ai-engine')} className="hover:text-[#21D4FD] transition-colors cursor-pointer">
                  AI Multi-Agent Resolution Engine
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Smart City AI Specs */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">AI Engine Architecture</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#21D4FD]" /> 8 Specialized Autonomous Agents
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Automated Computer Vision Auditing
              </li>
              <li className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" /> 91.4% Dynamic SLA Compliance
              </li>
              <li className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-purple-400" /> Semantic Duplicate Deduplication
              </li>
            </ul>
          </div>

          {/* Col 4: National Hackathon Showcase Badge */}
          <div className="p-4 rounded-2xl bg-[#0B1C33] border border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-[#21D4FD] uppercase">Hackathon Edition</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#146CFF] text-white">v2.6 Enterprise</span>
            </div>
            <h5 className="text-xs font-bold text-white">National Smart City AI Showcase</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Designed for Urban Local Bodies (ULBs), Municipal Commissioners, Field Engineers, and Citizens.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status: Ready for Pilot</span>
              <span className="text-emerald-400 font-bold">● Active</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 CivicLens AI Platform. Developed for Smart City Urban Intelligence.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors">Privacy Charter</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">SLA Guidelines</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">ISO 37120 Smart City Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
