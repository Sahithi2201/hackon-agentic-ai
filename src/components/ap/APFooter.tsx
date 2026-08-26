import React from 'react';
import { Shield, MapPin, ExternalLink, CheckCircle2 } from 'lucide-react';
import { AP_CITIES } from '../../data/apProjectData';

export const APFooter: React.FC = () => {
  return (
    <footer className="bg-[#001D3D] text-slate-300 border-t border-amber-400/30 text-xs mt-auto">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: State Portal Identity */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg border border-amber-400/30">
              🏛️
            </div>
            <div>
              <div className="font-black text-white text-sm">Government of Andhra Pradesh</div>
              <div className="text-[11px] text-amber-300 font-semibold">State Project Monitoring & Transparency System</div>
            </div>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
            An official digital governance initiative for continuous oversight of municipal roads, drinking water schemes, health facilities, education campuses, and urban housing townships across Andhra Pradesh.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Statewide Real-time Project Verification Protocol Active</span>
          </div>
        </div>

        {/* Col 2: Covered Municipal Corporations */}
        <div className="space-y-2">
          <h4 className="font-black text-white text-xs uppercase tracking-wider text-amber-300">
            10 District Headquarters
          </h4>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
            {AP_CITIES.map((c) => (
              <span key={c} className="hover:text-white transition-colors">• {c}</span>
            ))}
          </div>
        </div>

        {/* Col 3: Key Departments */}
        <div className="space-y-2">
          <h4 className="font-black text-white text-xs uppercase tracking-wider text-amber-300">
            Executing Departments
          </h4>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div>• Roads & Infrastructure</div>
            <div>• Water Supply (RWS & Urban)</div>
            <div>• Sanitation & Solid Waste</div>
            <div>• Health (GGH & CHC Infra)</div>
            <div>• Education (Nadu-Nedu)</div>
            <div>• YSR Jagananna Housing</div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer */}
      <div className="bg-[#00142A] border-t border-slate-800 px-4 py-4 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
        <span>© {new Date().getFullYear()} Government of Andhra Pradesh. All rights reserved.</span>
        <span>e-Governance Directorate, State Secretariat, Amaravati, Andhra Pradesh, India.</span>
      </div>
    </footer>
  );
};
