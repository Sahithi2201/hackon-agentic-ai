import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  BarChart3, 
  Layers, 
  LogOut, 
  FileText,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { APOfficer } from '../../types/apProjectTypes';
import { getCurrentUser, canAccessGovernmentPortal, canAccessOfficerPortal } from '../../services/authService';

interface APNavbarProps {
  currentView: 'landing' | 'gov-dashboard' | 'officer-dashboard' | 'officer-login' | 'gov-login';
  onNavigate: (view: 'landing' | 'gov-dashboard' | 'officer-dashboard' | 'officer-login' | 'gov-login') => void;
  activeOfficer: APOfficer | null;
  isGovLoggedIn: boolean;
  onLogout: () => void;
  onOpenPortalPicker: () => void;
}

export const APNavbar: React.FC<APNavbarProps> = ({
  currentView,
  onNavigate,
  activeOfficer,
  isGovLoggedIn,
  onLogout,
  onOpenPortalPicker
}) => {
  const currentUser = getCurrentUser();
  const isAdmin = canAccessGovernmentPortal(currentUser);
  const isOfficer = canAccessOfficerPortal(currentUser) || !!activeOfficer;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Top Gold & Navy State Banner */}
      <div className="bg-gradient-to-r from-[#003366] via-[#0A4D8C] to-[#003366] text-white px-4 py-1.5 text-xs font-semibold flex flex-wrap items-center justify-between border-b border-amber-400/40">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Government of Andhra Pradesh • Official Project Monitoring & Accountability System</span>
        </div>
        <div className="flex items-center gap-4 text-slate-200 text-[11px]">
          <span className="hidden sm:inline">e-Pragati E-Governance Initiative</span>
          <span className="hidden md:inline">• Amaravati Secretariat</span>
          <span className="text-amber-300 font-bold">STATE: ANDHRA PRADESH</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#0D5CAD] text-amber-300 flex items-center justify-center shadow-md font-black text-lg border border-amber-400/30 group-hover:scale-105 transition-transform">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none group-hover:text-blue-900 transition-colors">
                Andhra Pradesh Project Portal
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                GovAP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Transparent • Accountable • Digital
            </p>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === 'landing'
                ? 'bg-slate-100 text-blue-900 font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Public Transparency
          </button>

          {isAdmin && (
            <button
              onClick={() => onNavigate('gov-dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'gov-dashboard'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Government Dashboard</span>
            </button>
          )}

          {(isAdmin || isOfficer) && (
            <button
              onClick={() => onNavigate(activeOfficer ? 'officer-dashboard' : 'officer-login')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'officer-dashboard' || currentView === 'officer-login'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Officer Portal</span>
              {activeOfficer && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Active Role Indicator or Portal Trigger */}
          {isGovLoggedIn && currentView === 'gov-dashboard' ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-black text-slate-900">State Secretariat Admin</span>
                <span className="text-[10px] text-emerald-600 font-bold">Authenticated Directorate</span>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Log Out Government Session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : activeOfficer && currentView === 'officer-dashboard' ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right max-w-[160px]">
                <span className="text-xs font-black text-slate-900 truncate">{activeOfficer.name}</span>
                <span className="text-[10px] text-blue-600 font-bold truncate">{activeOfficer.city} • {activeOfficer.department}</span>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Switch / Log Out Officer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">Switch</span>
              </button>
            </div>
          ) : isAdmin ? (
            <button
              onClick={onOpenPortalPicker}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#003366] to-[#0A4D8C] hover:from-[#002244] hover:to-[#083D6F] text-white text-xs font-black flex items-center gap-2 shadow-md shadow-blue-900/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Government Portal</span>
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </header>
  );
};
