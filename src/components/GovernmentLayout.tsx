import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Map, 
  Cpu, 
  Building2, 
  BarChart3, 
  ShieldAlert, 
  ArrowLeftRight, 
  LogOut, 
  Radio, 
  Sparkles, 
  Menu, 
  X,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Settings,
  Bell,
  Activity
} from 'lucide-react';
import { AppView, AIInsightItem } from '../types';
import { getCurrentUser, logoutUser, isOwnerUser } from '../services/authService';
import govCommandBg from '../assets/images/gov_cabinet_meeting_1787490869751.jpg';

interface GovernmentLayoutProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onSwitchToCitizen: () => void;
  insights: AIInsightItem[];
  children: React.ReactNode;
}

export const GovernmentLayout: React.FC<GovernmentLayoutProps> = ({
  currentView,
  onNavigate,
  onSwitchToCitizen,
  insights,
  children
}) => {
  const currentUser = getCurrentUser();
  const isOwner = isOwnerUser(currentUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    onNavigate('landing');
  };

  const navItems = [
    {
      id: 'gov-dashboard' as AppView,
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: currentView === 'gov-dashboard' || currentView === 'command-center'
    },
    {
      id: 'gov-live-cases' as AppView,
      label: 'Live Cases',
      icon: Layers,
      active: currentView === 'gov-live-cases' || currentView === 'case-intelligence'
    },
    {
      id: 'city-intelligence' as AppView,
      label: 'City Intelligence',
      icon: Map,
      active: currentView === 'city-intelligence' || currentView === 'gov-city-intelligence'
    },
    {
      id: 'ai-resolution-engine' as AppView,
      label: 'AI Resolution Engine',
      icon: Cpu,
      active: currentView === 'ai-resolution-engine' || currentView === 'ai-engine' || currentView === 'gov-ai-engine'
    },
    {
      id: 'departments' as AppView,
      label: 'Departments',
      icon: Building2,
      active: currentView === 'departments' || currentView === 'gov-departments'
    },
    {
      id: 'analytics' as AppView,
      label: 'Pattern Analytics',
      icon: BarChart3,
      active: currentView === 'analytics' || currentView === 'gov-analytics'
    },
    {
      id: 'ap-projects' as AppView,
      label: 'AP Projects Monitor',
      icon: ShieldCheck,
      active: currentView === 'ap-projects' || currentView === 'gov-projects' || currentView === 'ap-gov-dashboard'
    }
  ];

  return (
    <div 
      className="min-h-screen text-[#0F172A] flex flex-col md:flex-row relative"
      style={{
        backgroundImage: `url(${govCommandBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Background overlay */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-900/15 backdrop-blur-[1px]" />
      
      {/* 1. STICKY LEFT SIDEBAR (DESKTOP) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white/95 backdrop-blur-md border-r border-slate-200/90 shrink-0 sticky top-0 h-screen z-30 justify-between">
        
        {/* Top: Branding */}
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-cyan-400 shadow-md shadow-slate-900/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900">CivicMind</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  GOV
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">AI Command Center</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
              Operations Terminal
            </div>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    item.active
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.active ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.active && <ChevronRight className="w-4 h-4 text-cyan-400" />}
                </button>
              );
            })}

            {/* Settings Tab */}
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>System Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom: Profile & Switching */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Administrator Badge */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full ${isOwner ? 'bg-purple-900 text-purple-200' : 'bg-slate-900 text-cyan-400'} font-bold text-xs flex items-center justify-center`}>
                {isOwner ? '👑' : (currentUser?.username?.slice(0, 2).toUpperCase() || 'AD')}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                  {currentUser?.full_name || currentUser?.username || 'Municipal Admin'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {isOwner ? 'System Owner • Full Access' : 'Operations Chief • Gov Admin'}
                </div>
              </div>
            </div>
            <ShieldCheck className={`w-4 h-4 ${isOwner ? 'text-purple-600' : 'text-blue-600'}`} />
          </div>

          {/* Quick Portal Switch */}
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('officer-login')}
              className="w-full py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-slate-700"
              title="Open Officer Field Portal"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Officer Field Portal</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onSwitchToCitizen}
                className="py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Switch to Citizen Portal"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                <span>Citizen</span>
              </button>

              <button
                onClick={handleLogout}
                className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Logout</span>
              </button>
            </div>
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
              className="p-2 rounded-xl bg-slate-100 text-slate-700"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-cyan-400">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900">CivicMind Gov</span>
            </div>
          </div>

          {/* Desktop Status / Context */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-900 text-cyan-300">
              CENTRAL OPERATIONS GRID
            </span>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>8 Autonomous Agents Active</span>
            </div>
          </div>

          {/* Right Live Insights & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span>{insights.length} Pattern Alerts Flagged</span>
            </div>

            <button
              onClick={() => onNavigate('ai-resolution-engine')}
              className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>Run AI Engine</span>
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
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                  item.active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onSwitchToCitizen();
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs text-blue-600 font-bold"
              >
                Switch to Citizen Portal
              </button>
              <button
                onClick={() => {
                  onNavigate('landing');
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs text-rose-600 font-bold"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {/* VIEWPORT CONTENT CONTAINER */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>

      {/* SYSTEM SETTINGS MODAL */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">System Configuration</h3>
                  <p className="text-[11px] text-slate-500">Autonomous Governance Parameters</p>
                </div>
              </div>
              <button 
                onClick={() => setSettingsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Automatic P1 Escalation</span>
                  <span className="text-slate-500 text-[11px]">Auto-escalate if unresolved in 4 hours</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Spatial Deduplication (50m)</span>
                  <span className="text-slate-500 text-[11px]">Merge concurrent complaints into cluster</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Optical AI Repair Audit</span>
                  <span className="text-slate-500 text-[11px]">Require before/after CV comparison</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
              </div>
            </div>

            <button
              onClick={() => setSettingsModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
