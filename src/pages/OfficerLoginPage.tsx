import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  UserCheck, 
  Search, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  BadgeCheck, 
  Phone, 
  Sparkles,
  HardHat,
  ChevronRight
} from 'lucide-react';
import { AppView, DepartmentOfficer } from '../types';
import { CIVIC_DEPARTMENTS_CONFIG, getAllOfficersList, validateOfficerCredentials } from '../services/complaintsService';
import { setActiveOfficer } from '../services/authService';
import handComplaintStampBg from '../assets/images/hand_wooden_complaint_stamp_1787390509621.jpg';

interface OfficerLoginPageProps {
  onNavigate: (view: AppView) => void;
  onLoginSuccess: (officer: DepartmentOfficer) => void;
}

export const OfficerLoginPage: React.FC<OfficerLoginPageProps> = ({
  onNavigate,
  onLoginSuccess
}) => {
  const allOfficers = useMemo(() => getAllOfficersList(), []);
  
  const [selectedDeptKey, setSelectedDeptKey] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOfficer, setSelectedOfficer] = useState<DepartmentOfficer>(allOfficers[0]);
  const [securityPin, setSecurityPin] = useState<string>('2026');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredOfficers = useMemo(() => {
    return allOfficers.filter(o => {
      const matchesDept = selectedDeptKey === 'all' || o.departmentKey === selectedDeptKey;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        o.name.toLowerCase().includes(q) || 
        o.id.toLowerCase().includes(q) || 
        o.departmentName.toLowerCase().includes(q) ||
        (o.designation && o.designation.toLowerCase().includes(q));
      return matchesDept && matchesSearch;
    });
  }, [allOfficers, selectedDeptKey, searchQuery]);

  const handleVerifyAndLogin = (officerToUse?: DepartmentOfficer) => {
    const officer = officerToUse || selectedOfficer;
    if (!officer) {
      setErrorMsg('Please select an authorized department officer.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    const validation = validateOfficerCredentials(officer.id, officer.name);
    if (!validation.isValid || !validation.officer) {
      setIsVerifying(false);
      setErrorMsg(validation.message || 'Unauthorized officer credential. Officer not found in municipal registry.');
      return;
    }

    setTimeout(() => {
      setActiveOfficer(validation.officer!);
      setIsVerifying(false);
      onLoginSuccess(validation.officer!);
      onNavigate('officer-workspace');
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between relative select-none p-4 sm:p-6 lg:p-8">
      
      {/* Background Layer: Hand holding wooden COMPLAINT stamp photo */}
      <div 
        className="fixed inset-0 pointer-events-none -z-20 overflow-hidden"
        style={{
          backgroundImage: `url(${handComplaintStampBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.85,
        }}
      />
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-900/20" />

      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:bg-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Landing Page</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('gov-login')}
            className="text-xs font-bold text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Central Admin Login
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={() => onNavigate('citizen-login')}
            className="text-xs font-bold text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Citizen Portal
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto my-auto py-6">
        
        {/* Title & Badge */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-extrabold uppercase tracking-wider">
            <HardHat className="w-3.5 h-3.5 text-blue-600" />
            <span>MUNICIPAL FIELD OPERATIONS PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Department Officer Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Select or verify your officer credential to enter your private task workspace. You will only see complaints assigned directly to you.
          </p>
        </div>

        {/* 2-Column Split: Officer Selection Matrix + Verification Gate */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Left Column: Quick Officer Directory (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-7 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between space-y-5 bg-slate-50/50">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>1. Select Municipal Officer</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-500 font-mono">
                  {filteredOfficers.length} Officers Registered
                </span>
              </div>

              {/* Department Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDeptKey('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDeptKey === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All Departments
                </button>
                {CIVIC_DEPARTMENTS_CONFIG.map((dept) => (
                  <button
                    key={dept.key}
                    type="button"
                    onClick={() => setSelectedDeptKey(dept.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDeptKey === dept.key
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {dept.name.split('&')[0].trim()}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search officer name or badge ID (e.g., Ravi, OFF-ROA-01)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Officer Cards List */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredOfficers.map((officer) => {
                  const isSelected = selectedOfficer?.id === officer.id;
                  return (
                    <div
                      key={officer.id}
                      onClick={() => {
                        setSelectedOfficer(officer);
                        setErrorMsg(null);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {officer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900">{officer.name}</span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {officer.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {officer.designation || officer.departmentName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {officer.status}
                        </span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Demo Tip */}
            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2 mt-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Quick Access:</strong> Select any officer from the list. The system will load tasks assigned to that officer in the dedicated Officer Workspace.
              </span>
            </div>

          </div>

          {/* Right Column: Security Verification Box (5 Cols) */}
          <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between bg-white space-y-6">
            
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>2. Officer Verification Gate</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Confirms your identity before entering the restricted Officer Workspace.
                </p>
              </div>

              {/* Selected Officer Summary Card */}
              {selectedOfficer && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-3 shadow-md">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium border-b border-white/10 pb-2">
                    <span className="font-mono">{selectedOfficer.id}</span>
                    <span className="bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      VERIFIED OFFICER
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-white">{selectedOfficer.name}</h4>
                    <p className="text-xs text-slate-300 font-medium">{selectedOfficer.departmentName}</p>
                    <p className="text-[11px] text-cyan-300 mt-0.5">{selectedOfficer.designation || 'Field Lead Officer'}</p>
                  </div>

                  <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{selectedOfficer.phone || '+91 98765 00000'}</span>
                    </span>
                    <span className="text-emerald-400 font-bold">● Active Status</span>
                  </div>
                </div>
              )}

              {/* Passcode Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Officer Security PIN</span>
                  </label>
                  <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded">
                    Demo PIN: 2026
                  </span>
                </div>
                <input
                  type="password"
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  placeholder="Enter 4-digit PIN..."
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleVerifyAndLogin()}
                disabled={isVerifying}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isVerifying ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying Officer Identity...
                  </span>
                ) : (
                  <>
                    <span>VERIFY & ENTER OFFICER WORKSPACE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Security: GovNet Token v2.4</span>
              <span className="font-mono text-emerald-700 font-bold">● Isolated Workspace</span>
            </div>

          </div>

        </div>

      </main>

      {/* Bottom Footer Note */}
      <footer className="text-center text-xs text-slate-400 py-2">
        CivicMind Municipal Operations Security Protocol • Department Field Personnel Access
      </footer>

    </div>
  );
};
