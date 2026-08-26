import React, { useState } from 'react';
import { 
  CivicCase, 
  CityHotspot, 
  CivicCategory, 
  PriorityLevel 
} from '../types';
import { InteractiveCityMap } from '../components/InteractiveCityMap';
import { 
  Compass, 
  Filter, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Eye, 
  ShieldAlert,
  FileCheck,
  Zap,
  Building2
} from 'lucide-react';

interface CityIntelligencePageProps {
  cases: CivicCase[];
  hotspots: CityHotspot[];
  onSelectCase: (caseItem: CivicCase) => void;
  onNavigateToCase: (caseId: string) => void;
}

export const CityIntelligencePage: React.FC<CityIntelligencePageProps> = ({
  cases,
  hotspots,
  onSelectCase,
  onNavigateToCase
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [selectedHotspot, setSelectedHotspot] = useState<CityHotspot>(hotspots[0]);
  const [jointActionIssued, setJointActionIssued] = useState(false);

  // Filter cases according to active criteria
  const filteredCases = cases.filter((c) => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && c.priority !== selectedPriority) return false;
    if (selectedWard !== 'All' && !c.location.ward.includes(selectedWard)) return false;
    return true;
  });

  const handleIssueJointWorkOrder = () => {
    setJointActionIssued(true);
    setTimeout(() => {
      setJointActionIssued(false);
    }, 4000);
  };

  return (
    <div className="min-h-full text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-blue-700 uppercase">
                SPATIAL GIS & HOTSPOT ANALYTICS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              City Intelligence & Spatial Hotspots
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
              Live GIS heatmap, spatial cluster clustering, and cross-department causal intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>Active Hotspots: <strong className="text-slate-900 font-bold">{hotspots.length} Clusters</strong></span>
            </div>
          </div>
        </div>

        {/* 3-Column Spatial Layout: Left Filter Sidebar | Center Interactive Map | Right Hotspot Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT FILTER PANEL (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-blue-600" /> GIS FILTERS
                </span>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedPriority('All');
                    setSelectedWard('All');
                  }}
                  className="text-[10px] text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">Civic Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="All">All Categories</option>
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Water Supply & Pipelines">Water Supply</option>
                  <option value="Drainage & Sewage">Drainage & Sewage</option>
                  <option value="Waste & Sanitation">Waste & Sanitation</option>
                  <option value="Streetlights & Electrical">Streetlights</option>
                  <option value="Public Facilities">Public Facilities</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">Severity Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="All">All Priorities</option>
                  <option value="P1">P1 — Critical Immediate</option>
                  <option value="P2">P2 — High Urgency</option>
                  <option value="P3">P3 — Moderate</option>
                </select>
              </div>

              {/* Ward Filter */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">Municipal Ward</label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="All">All Wards</option>
                  <option value="Ward 12">Ward 12 (Central Zone)</option>
                  <option value="Ward 5">Ward 5 (North Ward)</option>
                  <option value="Ward 7">Ward 7 (Railway / Tech)</option>
                </select>
              </div>

              {/* Hotspots Quick Switcher */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">
                  Identified AI Hotspots
                </label>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {hotspots.map((hs) => (
                    <button
                      key={hs.id}
                      onClick={() => setSelectedHotspot(hs)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition-all border cursor-pointer ${
                        selectedHotspot.id === hs.id
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate">{hs.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          hs.priority === 'P1' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          +{hs.trendPercentage}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">{hs.ward}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* CENTER INTERACTIVE MAP (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-1 rounded-3xl bg-white border border-slate-200 shadow-md">
              <InteractiveCityMap
                cases={filteredCases}
                hotspots={hotspots}
                heightClass="h-[560px]"
                onSelectHotspot={(hs) => setSelectedHotspot(hs)}
                onSelectCase={(c) => onSelectCase(c)}
              />
            </div>
          </div>

          {/* RIGHT HOTSPOT INTELLIGENCE PANEL (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            
            {selectedHotspot ? (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-5">
                
                {/* Hotspot Header */}
                <div className="pb-3 border-b border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> AI SPATIAL HOTSPOT
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-600">
                      ↑ {selectedHotspot.trendPercentage}% (30 Days)
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {selectedHotspot.name}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    {selectedHotspot.ward} • {selectedHotspot.category}
                  </div>
                </div>

                {/* Hotspot Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Total Complaints</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">
                      {selectedHotspot.complaintCount} Cases
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 font-medium">Last 30 Days</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                    <div className="text-[10px] text-rose-700 uppercase font-bold">Active In-Flight</div>
                    <div className="text-xl font-black text-rose-700 mt-0.5 font-mono">
                      {selectedHotspot.activeCasesCount} Active
                    </div>
                    <div className="text-[10px] text-rose-600 mt-1 font-medium">Requiring Closure</div>
                  </div>
                </div>

                {/* AI Pattern Detected */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                  <div className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI PATTERN DETECTED
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {selectedHotspot.aiPattern}
                  </p>
                </div>

                {/* Possible Causal Correlation */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" /> CAUSAL CORRELATION
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {selectedHotspot.possibleCorrelation}
                  </p>
                </div>

                {/* Recommended Action */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    RECOMMENDED MUNICIPAL ACTION
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    {selectedHotspot.recommendedAction}
                  </p>
                </div>

                {/* Joint Action Button */}
                <div className="pt-1">
                  {jointActionIssued ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Joint Work Order Dispatched to Roads & Drainage Divisions!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleIssueJointWorkOrder}
                      className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Issue Cross-Department Joint Work Order</span>
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
                Select a hotspot cluster from the map to view deep intelligence
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
