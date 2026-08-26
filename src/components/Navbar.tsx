import React, { useState } from 'react';
import { 
  MapPin, 
  Cpu, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  BarChart3,
  Building2,
  UserCheck,
  Sparkles,
  Plus
} from 'lucide-react';
import { AIInsightItem, AppView } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (dark: boolean) => void;
  insights: AIInsightItem[];
  userRole?: 'citizen' | 'gov' | 'guest';
  onSwitchRole?: (role: 'citizen' | 'gov') => void;
  onOpenReport?: () => void;
  onSelectInsightCase?: (caseItem: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  insights,
  userRole = 'guest',
  onSwitchRole,
  onOpenReport
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(insights.length);

  const mainNavItems = [
    { id: 'landing', label: 'Platform' },
    { id: 'citizen-dashboard', label: 'Citizen Portal' },
    { id: 'citizen-report', label: 'Report Issue' },
    { id: 'gov-dashboard', label: 'Command Center' },
    { id: 'city-intelligence', label: 'City Intelligence' },
    { id: 'ai-engine', label: 'AI Resolution Engine' },
    { id: 'departments', label: 'Departments' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'citizen-track', label: 'Track Case' },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#07111F]/90 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo Brand */}
          <div 
            id="brand-logo-btn"
            onClick={() => handleTabClick('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#146CFF] to-[#21D4FD] p-0.5 shadow-lg shadow-[#146CFF]/25 group-hover:shadow-[#21D4FD]/40 transition-all duration-300">
              <div className="w-full h-full bg-[#07111F] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[#146CFF]/15 group-hover:bg-[#146CFF]/30 transition-colors" />
                <div className="relative flex items-center justify-center text-[#21D4FD]">
                  <MapPin className="w-5 h-5 text-[#21D4FD] absolute -top-0.5" />
                  <Cpu className="w-3.5 h-3.5 text-white absolute bottom-1" />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  CivicMind<span className="text-[#21D4FD] ml-0.5">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-[#146CFF]/20 text-[#21D4FD] border border-[#146CFF]/30 font-mono">
                  NATIONAL HACKATHON
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
                Complaint-to-Resolution Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Center Navigation */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-full border border-slate-800 shadow-inner">
            {mainNavItems.map((item) => {
              const isActive = 
                activeTab === item.id || 
                (item.id === 'landing' && activeTab === 'home') ||
                (item.id === 'gov-dashboard' && activeTab === 'command-center') ||
                (item.id === 'citizen-report' && activeTab === 'report') ||
                (item.id === 'citizen-track' && activeTab === 'track');

              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#146CFF] to-[#21D4FD] text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Quick Report + Notifications + Portal Quick Switch */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Quick Action Button */}
            <button
              id="header-quick-report-btn"
              onClick={() => handleTabClick('citizen-report')}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#146CFF] to-[#21D4FD] hover:from-blue-600 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Report Issue</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors relative cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 text-cyan-400" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0B1C33] border border-slate-700/80 shadow-2xl p-4 space-y-3 z-50 backdrop-blur-xl animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Autonomous AI Pulse
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                      Live Stream
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {insights.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          handleTabClick('gov-dashboard');
                        }}
                        className="p-2.5 rounded-xl bg-[#07111F] border border-slate-800/80 hover:border-cyan-500/40 transition-colors cursor-pointer space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white">{item.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <button 
                      onClick={() => setUnreadCount(0)}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Mark all read
                    </button>
                    <button 
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        handleTabClick('gov-dashboard');
                      }}
                      className="text-[11px] text-cyan-400 hover:underline font-semibold"
                    >
                      Open Command Feed →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#0B1C33] border-b border-slate-800 px-4 py-5 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-[#146CFF] to-[#21D4FD] text-white'
                    : 'bg-[#07111F] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleTabClick('citizen-login')}
              className="p-2.5 rounded-xl bg-blue-900/30 border border-blue-700/40 text-cyan-300 text-xs font-bold text-center"
            >
              Citizen Login
            </button>
            <button
              onClick={() => handleTabClick('gov-login')}
              className="p-2.5 rounded-xl bg-cyan-900/30 border border-cyan-700/40 text-cyan-300 text-xs font-bold text-center"
            >
              Government Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
