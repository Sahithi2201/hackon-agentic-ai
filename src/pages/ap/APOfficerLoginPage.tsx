import React, { useState } from 'react';
import { 
  UserCheck, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  KeyRound, 
  Info,
  ChevronRight
} from 'lucide-react';
import { APOfficer, APCity, APDepartment } from '../../types/apProjectTypes';
import { AP_CITIES, AP_DEPARTMENTS, GENERATED_OFFICERS } from '../../data/apProjectData';
import handComplaintStampBg from '../../assets/images/hand_wooden_complaint_stamp_1787390509621.jpg';

interface APOfficerLoginPageProps {
  onLogin: (officer: APOfficer) => void;
  onBackToLanding: () => void;
}

export const APOfficerLoginPage: React.FC<APOfficerLoginPageProps> = ({
  onLogin,
  onBackToLanding
}) => {
  const [selectedCity, setSelectedCity] = useState<APCity>('Visakhapatnam');
  const [selectedDept, setSelectedDept] = useState<APDepartment>('Roads & Infrastructure');
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('AP-VSP-RDS-01');

  // Filter available officers for the selected city and department
  const matchingOfficers = GENERATED_OFFICERS.filter(
    (o) => o.city === selectedCity && o.department === selectedDept
  );

  const activeSelectedOfficer = GENERATED_OFFICERS.find((o) => o.officerId === selectedOfficerId) || matchingOfficers[0];

  const handleCityChange = (city: APCity) => {
    setSelectedCity(city);
    const newMatches = GENERATED_OFFICERS.filter(
      (o) => o.city === city && o.department === selectedDept
    );
    if (newMatches.length > 0) {
      setSelectedOfficerId(newMatches[0].officerId);
    }
  };

  const handleDeptChange = (dept: APDepartment) => {
    setSelectedDept(dept);
    const newMatches = GENERATED_OFFICERS.filter(
      (o) => o.city === selectedCity && o.department === dept
    );
    if (newMatches.length > 0) {
      setSelectedOfficerId(newMatches[0].officerId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSelectedOfficer) {
      onLogin(activeSelectedOfficer);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 relative select-none">
      
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

      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003366] via-[#0A4D8C] to-[#003366] text-white p-6 sm:p-8 text-center relative border-b border-amber-400/30">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/30 mb-3">
            <UserCheck className="w-4 h-4" />
            <span>OFFICER AUTHENTICATION PORTAL</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Government Officer Login
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-md mx-auto">
            Andhra Pradesh Project Execution & Monitoring Interface. Select your official department credentials to proceed.
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-3 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Demo Portal Notice:</strong> 450 verified officer accounts are pre-configured across all 10 cities and 9 departments. No photo upload required on login.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Select City */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-900" />
                1. Select Assigned City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value as APCity)}
                className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              >
                {AP_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* 2. Select Department */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-900" />
                2. Select Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => handleDeptChange(e.target.value as APDepartment)}
                className="w-full text-xs font-bold border border-slate-300 rounded-xl p-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              >
                {AP_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Select Specific Officer (5 Officers per Dept in this City) */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                3. Choose Officer Account (5 Officers Available)
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                {selectedCity} • {selectedDept}
              </span>
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {matchingOfficers.map((officer) => (
                <div
                  key={officer.officerId}
                  onClick={() => setSelectedOfficerId(officer.officerId)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedOfficerId === officer.officerId
                      ? 'border-blue-900 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                      selectedOfficerId === officer.officerId
                        ? 'bg-blue-900 text-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {officer.officerId.split('-').pop()}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">
                        {officer.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {officer.designation} • ID: <span className="font-mono font-bold text-slate-700">{officer.officerId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-black">
                      {officer.assignedProjects} Projects
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBackToLanding}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Back to Portal
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-[#003366] to-[#0A4D8C] hover:from-[#002244] hover:to-[#083D6F] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 cursor-pointer transition-all hover:scale-102"
            >
              <span>Login as {activeSelectedOfficer?.name || 'Officer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
