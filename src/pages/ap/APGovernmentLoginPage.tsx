import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  Info, 
  CheckCircle2,
  Lock
} from 'lucide-react';

interface APGovernmentLoginPageProps {
  onLogin: () => void;
  onBackToLanding: () => void;
}

export const APGovernmentLoginPage: React.FC<APGovernmentLoginPageProps> = ({
  onLogin,
  onBackToLanding
}) => {
  const [email, setEmail] = useState<string>('admin.monitoring@ap.gov.in');
  const [department, setDepartment] = useState<string>('State Project Monitoring Directorate');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003366] via-[#0A4D8C] to-[#003366] text-white p-6 sm:p-8 text-center relative border-b border-amber-400/30">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30 mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>STATE SECRETARIAT ACCESS</span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Government Directorate Login
          </h2>
          <p className="text-xs text-slate-200 mt-1">
            Official Andhra Pradesh Executive Project Monitoring Directorate & Secretariat Control.
          </p>
        </div>

        {/* Demo Notification */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Official Demo Credentials Pre-configured.</strong> Click below to access full statewide monitoring.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Secretariat User Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Monitoring Wing / Directorate
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
            >
              <option value="State Project Monitoring Directorate">State Project Monitoring Directorate (Amaravati)</option>
              <option value="Department of Municipal Administration & Urban Development">MA&UD Department</option>
              <option value="Roads & Buildings Directorate">Roads & Buildings Directorate</option>
              <option value="Panchayat Raj & Rural Water Supply">Panchayat Raj & Rural Water Supply</option>
            </select>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBackToLanding}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
            >
              Back
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#003366] to-[#0A4D8C] hover:from-[#002244] hover:to-[#083D6F] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 cursor-pointer hover:scale-102 transition-transform"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Enter Government Dashboard</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
