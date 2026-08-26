import React from 'react';
import { Building2, UserCheck, X, Shield, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

interface APPortalPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'government' | 'officer') => void;
}

export const APPortalPickerModal: React.FC<APPortalPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectOption
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-xl w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003366] to-[#0A4D8C] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-2.5 border border-amber-400/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Government of Andhra Pradesh Portal Access</span>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            Select Your Government Portal Interface
          </h3>
          <p className="text-slate-200 text-xs mt-1">
            Choose the designated portal corresponding to your role in the Andhra Pradesh Administration.
          </p>
        </div>

        {/* Options Grid */}
        <div className="p-6 space-y-4">
          {/* OPTION 1: GOVERNMENT */}
          <button
            onClick={() => onSelectOption('government')}
            className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-700 bg-white hover:bg-blue-50/40 transition-all shadow-2xs hover:shadow-md group cursor-pointer flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-900">
                  Option 1
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-extrabold flex items-center gap-1">
                  Directorate / Admin
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mt-0.5 group-hover:text-blue-900 transition-colors">
                Government Portal
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                For State Secretariat, Department Directors & Municipal Commissioners. Complete monitoring across all 10 cities, budget analytics, and progress review approvals.
              </p>

              <div className="flex items-center gap-1.5 text-xs font-black text-blue-900 mt-3 group-hover:translate-x-1 transition-transform">
                <span>Enter Government Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* OPTION 2: OFFICER */}
          <button
            onClick={() => onSelectOption('officer')}
            className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-700 bg-white hover:bg-blue-50/40 transition-all shadow-2xs hover:shadow-md group cursor-pointer flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                  Option 2
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-extrabold flex items-center gap-1">
                  Department Officer
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mt-0.5 group-hover:text-emerald-900 transition-colors">
                Officer Portal
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                For assigned Engineers, Project Directors, and Field Officers. View assigned city projects, update situation reports, adjust expenditures, and submit photos.
              </p>

              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 mt-3 group-hover:translate-x-1 transition-transform">
                <span>Enter Officer Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-slate-500 text-[11px]">
          <span>Single-Sign-On with Andhra Pradesh e-Pragati</span>
          <span className="font-semibold text-slate-700">Amaravati Digital Governance</span>
        </div>
      </div>
    </div>
  );
};
