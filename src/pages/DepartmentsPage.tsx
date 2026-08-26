import React, { useState } from 'react';
import { 
  Building2, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Users, 
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
  Wrench
} from 'lucide-react';
import { CivicCase, DepartmentName, CivicCategory, AppView } from '../types';
import { DEPARTMENT_PERFORMANCE, DEPARTMENT_SLA_DATA } from '../data/mockData';
import { getCivicImageUrl, resolveCivicImageKey } from '../utils/imageAssets';
import { getSeverityInfo } from '../utils/operationsFormatters';

interface DepartmentsPageProps {
  cases: CivicCase[];
  onSelectCase: (caseId: string) => void;
  onNavigate: (view: AppView) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  cases,
  onSelectCase,
  onNavigate
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('Roads & Infrastructure Department');
  const [broadcastNotif, setBroadcastNotif] = useState<string | null>(null);

  const DEPARTMENTS_DATA = [
    {
      id: 'dept-roads',
      name: 'Roads & Infrastructure Department',
      shortName: 'Roads & Infrastructure',
      category: 'Roads & Infrastructure' as CivicCategory,
      imageKey: 'roads',
      lead: 'Chief Engineer K. R. Ramanathan',
      activeCases: 474,
      criticalCases: 19,
      avgResolutionHours: '14.2 Hours',
      slaCompliance: 91.1,
      rapidSquads: '12 Active Squads',
      aiAction: 'Pre-allocate asphalt compactor crews to Ward 12 & Ward 5 before evening rush.'
    },
    {
      id: 'dept-water',
      name: 'Water Supply & Sewerage Board',
      shortName: 'Water Services',
      category: 'Water Supply & Pipelines' as CivicCategory,
      imageKey: 'water',
      lead: 'Superintending Engineer Anita Sen',
      activeCases: 224,
      criticalCases: 11,
      avgResolutionHours: '7.8 Hours',
      slaCompliance: 94.6,
      rapidSquads: '8 Valve Isolation Units',
      aiAction: 'Inspect 600mm arterial pipeline telemetry near Gandhi Chowk junction for pressure drops.'
    },
    {
      id: 'dept-drainage',
      name: 'Drainage & Stormwater Division',
      shortName: 'Drainage & Sewage',
      category: 'Drainage & Sewage' as CivicCategory,
      imageKey: 'drinage',
      lead: 'Executive Engineer M. Deshmukh',
      activeCases: 275,
      criticalCases: 14,
      avgResolutionHours: '16.4 Hours',
      slaCompliance: 86.9,
      rapidSquads: '6 Super Sucker Jetting Trucks',
      aiAction: 'Reassign 2 idle vacuum desilting machines from Ward 3 to Nehru Nagar low-lying area.'
    },
    {
      id: 'dept-waste',
      name: 'Solid Waste Management',
      shortName: 'Waste Management',
      category: 'Waste & Sanitation' as CivicCategory,
      imageKey: 'waste',
      lead: 'Sanitation Officer Dr. V. Nair',
      activeCases: 150,
      criticalCases: 3,
      avgResolutionHours: '5.2 Hours',
      slaCompliance: 96.0,
      rapidSquads: '24 Compactor Tipper Trucks',
      aiAction: 'Optimize early morning clearance route for Station Road commercial packaging corridor.'
    },
    {
      id: 'dept-electric',
      name: 'Electrical & Street Lighting Bureau',
      shortName: 'Electrical & Streetlights',
      category: 'Streetlights & Electrical' as CivicCategory,
      imageKey: 'street images',
      lead: 'Assistant Engineer Farhan Qureshi',
      activeCases: 87,
      criticalCases: 4,
      avgResolutionHours: '9.1 Hours',
      slaCompliance: 94.2,
      rapidSquads: '7 Aerial Bucket Vans',
      aiAction: 'Replace severed feeder line on Lake View promenade to illuminate 400m dark stretch.'
    },
    {
      id: 'dept-public',
      name: 'Public Works & Urban Facilities',
      shortName: 'Public Facilities',
      category: 'Public Facilities' as CivicCategory,
      imageKey: 'public facilities',
      lead: 'Facility Manager Priya Sharma',
      activeCases: 38,
      criticalCases: 2,
      avgResolutionHours: '21.0 Hours',
      slaCompliance: 86.8,
      rapidSquads: '4 Maintenance Workshops',
      aiAction: 'Dismantle hazardous rusted play equipment in Nehru Memorial Garden immediately.'
    }
  ];

  const currentDeptData = DEPARTMENTS_DATA.find(d => d.name === selectedDept) || DEPARTMENTS_DATA[0];

  const departmentCases = cases.filter(c => 
    c.assignedDepartment === selectedDept || c.category === currentDeptData.category
  );

  return (
    <div className="min-h-full text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-blue-700 uppercase">
                MUNICIPAL COORDINATION MATRIX
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Department Operations & Dispatch
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Cross-department accountability, SLA benchmark tracking, and AI squad dispatch recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-blue-700">
              6 Municipal Departments Online
            </span>
          </div>
        </div>

        {broadcastNotif && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center justify-between">
            <span>{broadcastNotif}</span>
            <button onClick={() => setBroadcastNotif(null)} className="text-emerald-900 hover:underline">Dismiss</button>
          </div>
        )}

        {/* 6 DEPARTMENT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS_DATA.map((dept) => {
            const isSelected = selectedDept === dept.name;

            return (
              <div
                key={dept.id}
                onClick={() => setSelectedDept(dept.name)}
                className={`group relative rounded-3xl p-6 transition-all duration-300 cursor-pointer overflow-hidden border shadow-xs ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 -translate-y-0.5'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:-translate-y-0.5'
                }`}
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {dept.shortName}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-blue-600 transition-colors">
                        {dept.name}
                      </h3>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] font-bold uppercase">ACTIVE CASES</span>
                      <div className="text-base font-black text-slate-900 mt-0.5 font-mono">{dept.activeCases}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-rose-700 text-[10px] font-bold uppercase">CRITICAL P1</span>
                      <div className="text-base font-black text-rose-700 mt-0.5 font-mono">{dept.criticalCases}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] font-bold uppercase">AVG RESOLUTION</span>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">{dept.avgResolutionHours}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-700 text-[10px] font-bold uppercase">SLA COMPLIANCE</span>
                      <div className="text-xs font-black text-emerald-700 mt-0.5 font-mono">{dept.slaCompliance}%</div>
                    </div>
                  </div>

                  {/* AI Recommended Action Pill */}
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-800 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>AI Dispatch Strategy:</span>
                    </div>
                    <p className="text-slate-700 line-clamp-2 leading-relaxed font-medium">
                      {dept.aiAction}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px] font-medium">{dept.rapidSquads}</span>
                  <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                    <span>{isSelected ? 'Active Filter' : 'Filter Cases'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTIVE CASES FOR SELECTED DEPARTMENT */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-blue-700 font-bold">Department Case Queue</span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                {currentDeptData.name} ({departmentCases.length} Cases)
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono font-medium">Lead: {currentDeptData.lead}</span>
              <button
                onClick={() => setBroadcastNotif(`Automatic priority dispatch order broadcasted to all ${currentDeptData.shortName} squads.`)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Broadcast Squad Alert
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentCases.map((item) => {
              const severity = getSeverityInfo(item.priority, item.isEscalated);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectCase(item.id)}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-400 transition-all cursor-pointer space-y-3 flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-600 font-bold">{item.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${severity.pillClass}`}>
                        {severity.label} ({severity.code})
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">{item.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Location:</span>
                      <span className="text-slate-800 font-medium truncate max-w-[170px]">{item.location.address}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>SLA Window:</span>
                      <span className={`font-mono font-bold ${item.slaHoursRemaining <= 2 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {item.slaHoursRemaining <= 0 ? 'Due immediately' : `${item.slaHoursRemaining}h remaining`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-mono font-medium">{item.location.ward}</span>
                    <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Inspect <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
