import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Compass, 
  User, 
  ArrowLeftRight, 
  LogOut, 
  Menu, 
  X,
  Sparkles, 
  Radio, 
  CheckCircle2, 
  Bell,
  ShieldCheck,
  ChevronRight,
  Mail,
  Phone
} from 'lucide-react';
import { AppView } from '../types';
import { getCurrentUser, logoutUser, canAccessGovernmentPortal } from '../services/authService';
import citizenPortalBg from '../assets/images/citizen_grievance_desk_1787490850787.jpg';

interface CitizenLayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onSwitchToGov: () => void;
  onOpenReport: () => void;
  children: React.ReactNode;
}

export const CitizenLayout: React.FC<CitizenLayoutProps> = ({
  currentView,
  onNavigate,
  onSwitchToGov,
  onOpenReport,
  children
}) => {
  const currentUser = getCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const displayName = currentUser?.username || currentUser?.full_name || 'Citizen';
  const displayFullName = currentUser?.full_name || currentUser?.username || 'Registered Citizen';
  const displayCitizenId = currentUser?.citizen_id || currentUser?.id || 'Citizen';
  const displayEmail = currentUser?.email || '';
  const displayPhone = currentUser?.phone || 'Not provided';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CT';

  const navItems = [
    {
      id: 'citizen-dashboard' as AppView,
      label: 'My Complaints',
      icon: LayoutDashboard,
      active: currentView === 'citizen-dashboard'
    },
    {
      id: 'citizen-report' as AppView,
      label: 'Report Issue',
      icon: PlusCircle,
      active: currentView === 'citizen-report' || currentView === 'citizen-ai-analysis'
    },
    {
      id: 'citizen-track' as AppView,
      label: 'Track Resolution',
      icon: Compass,
      active: currentView === 'citizen-track'
    }
  ];

  const handleLogout = () => {
    logoutUser();
    onNavigate('citizen-login');
  };

  return (
    <div 
      className="min-h-screen text-[#0F172A] flex flex-col md:flex-row relative"
      style={{
        backgroundImage: `url(${citizenPortalBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Background overlay to ensure optimal contrast and readability while keeping the image clear */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-900/15 backdrop-blur-[1px]" />
      
      {/* 1. STICKY LEFT SIDEBAR (DESKTOP) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white/95 backdrop-blur-md border-r border-slate-200/90 shrink-0 sticky top-0 h-screen z-30 justify-between">
        
        {/* Top: Branding */}
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900">CivicMind</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  CITIZEN
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Citizen Portal</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    item.active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.active && <ChevronRight className="w-4 h-4 text-white/80" />}
                </button>
              );
            })}

            {/* Profile Tab */}
            <button
              onClick={() => setProfileModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Citizen Profile</span>
            </button>
          </nav>
        </div>

        {/* Bottom: Profile & Switching */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* User Badge */}
          <div 
            onClick={() => setProfileModalOpen(true)}
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                {initials}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{displayName}</div>
                <div className="text-[10px] text-slate-500 font-mono">{displayCitizenId}</div>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>

          {/* Quick Actions / Logout */}
          <div className="space-y-2">
            {canAccessGovernmentPortal(currentUser) && (
              <button
                onClick={onSwitchToGov}
                className="w-full py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Access Government Admin Portal"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                <span>Switch to Gov Portal</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Logout ({displayName})</span>
            </button>
          </div>
        </div>

      </aside>

      {/* 2. MAIN APPLICATION WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* STICKY TOP HEADER */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shrink-0">
          
          {/* Mobile brand & toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Radio className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900">CivicMind</span>
            </div>
          </div>

          {/* Desktop Title / Context */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              CITIZEN PORTAL
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Signed in as <strong className="text-slate-800">{displayName}</strong> ({displayCitizenId})
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenReport}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Report Issue</span>
            </button>

            <button
              onClick={() => onNavigate('citizen-track')}
              className="hidden sm:flex py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Track ID</span>
            </button>
          </div>

        </header>

        {/* MOBILE NAVIGATION DRAWER */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white p-4 space-y-2">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                  item.active ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              {canAccessGovernmentPortal(currentUser) ? (
                <button
                  onClick={() => {
                    onSwitchToGov();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs text-blue-600 font-bold cursor-pointer"
                >
                  Government Access
                </button>
              ) : <div />}
              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 font-bold cursor-pointer"
              >
                Logout ({displayName})
              </button>
            </div>
          </div>
        )}

        {/* VIEWPORT CONTENT CONTAINER */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>

      {/* CITIZEN PROFILE MODAL */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {initials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{displayFullName}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Citizen ID: #{displayCitizenId}</p>
                </div>
              </div>
              <button 
                onClick={() => setProfileModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Username</span>
                <div className="font-bold text-slate-900">{displayName}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{displayEmail}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</span>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{displayPhone}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Account Status</span>
                <div className="font-bold text-emerald-700">Verified Citizen Account • Active</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
