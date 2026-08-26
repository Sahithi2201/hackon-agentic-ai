import React, { useState } from 'react';
import { 
  Building2, 
  ArrowLeft, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Activity, 
  Radio, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { verifyGovernmentCredentials, loginAsOwner, isDevEnvironment } from '../services/authService';
import govCommandBg from '../assets/images/gov_cabinet_meeting_1787490869751.jpg';

interface GovernmentLoginPageProps {
  onNavigate: (view: AppView) => void;
  onLoginSuccess: (userRole: 'citizen' | 'gov', user?: UserProfile) => void;
}

export const GovernmentLoginPage: React.FC<GovernmentLoginPageProps> = ({
  onNavigate,
  onLoginSuccess
}) => {
  const [govId, setGovId] = useState('anita.verma@municipal.gov.in');
  const [password, setPassword] = useState('2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      const result = verifyGovernmentCredentials(govId, password);
      if (!result.success || !result.user) {
        setIsSubmitting(false);
        setErrorMsg(result.error || 'Invalid government credentials. Access restricted to authorized personnel.');
        return;
      }
      setIsSubmitting(false);
      onLoginSuccess('gov', result.user);
      onNavigate('gov-dashboard');
    }, 400);
  };

  const handleDemoLogin = () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setTimeout(() => {
      const user = loginAsOwner();
      setIsSubmitting(false);
      onLoginSuccess('gov', user);
      onNavigate('gov-dashboard');
    }, 300);
  };

  return (
    <div 
      className="h-screen w-screen overflow-hidden text-[#0F172A] flex items-center justify-center p-4 sm:p-6 relative select-none"
      style={{
        backgroundImage: `url(${govCommandBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-900/20 backdrop-blur-[1px]" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden">
        
        {/* LEFT SIDE: Enterprise Authority & Live City Stats */}
        <div className="md:col-span-6 p-7 sm:p-8 bg-gradient-to-br from-slate-50 to-blue-50/50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Landing Page</span>
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold mb-2.5">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                <span>Municipal Command Terminal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Government AI <br />
                <span className="text-blue-700">Command Center</span>
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Real-time civic intelligence for faster and smarter public service delivery across all municipal wards and departments.
              </p>
            </div>

            {/* LIVE KPI STATS PREVIEW */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Active Cases</span>
                <span className="text-lg font-black text-slate-900 font-mono">1,248</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-red-200 shadow-xs text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-red-600 block">Critical</span>
                <span className="text-lg font-black text-red-600 font-mono">47</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-emerald-200 shadow-xs text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 block">SLA Rate</span>
                <span className="text-lg font-black text-emerald-700 font-mono">91.4%</span>
              </div>
            </div>

            {/* Quick Security Badge */}
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Restricted to authorized Municipal Corporation Commissioners and Department Field Directors.</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>GovNet Secure Node</span>
            <span className="font-mono text-emerald-700 font-bold">● Network 99.8% OK</span>
          </div>
        </div>

        {/* RIGHT SIDE: Officer Sign In Form */}
        <div className="md:col-span-6 p-7 sm:p-8 flex flex-col justify-between bg-white">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Officer Authentication</h3>
              <p className="text-xs text-slate-500 mt-0.5">Access city-wide GIS maps, AI triage engine, and dispatch matrix.</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Government ID / Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={govId}
                    onChange={(e) => setGovId(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white transition-all font-medium"
                    placeholder="officer@municipal.gov.in"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Security Passcode
                  </label>
                  <button type="button" className="text-xs text-blue-700 font-semibold hover:underline">
                    Reset Token
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying Credentials...
                  </span>
                ) : (
                  <>
                    <span>ACCESS COMMAND CENTER</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-slate-400 font-bold font-mono">Quick Access</span>
              </div>
            </div>

            {/* DEMO ADMINISTRATOR BUTTON */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>CONTINUE AS DEMO ADMINISTRATOR</span>
            </button>

            {/* FIELD OFFICER DIRECT LOGIN LINK */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => onNavigate('officer-login')}
                className="text-xs text-blue-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Field Officer? Open Officer Workspace Portal →</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Session: </span>
            <span className="font-bold text-slate-800">Super Administrator • Central Operations</span>
          </div>
        </div>

      </div>
    </div>
  );
};
