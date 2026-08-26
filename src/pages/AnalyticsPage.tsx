import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  Filter, 
  Calendar, 
  Award, 
  Building2, 
  Zap, 
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  DEPARTMENT_SLA_DATA, 
  CATEGORY_BREAKDOWN, 
  MONTHLY_COMPLAINT_TRENDS, 
  MUNICIPAL_METRICS 
} from '../data/mockData';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Department,SLA Target (Hours),Avg Response Time (Hours),Compliance (%)\n"
      + DEPARTMENT_SLA_DATA.map(d => `${d.department},${d.targetSla},${d.avgResponseHours},${d.complianceRate}%`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "CivicLens_City_Analytics_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                MUNICIPAL BENCHMARKS & CAUSAL PREDICTORS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              City Pattern Analytics & SLA Performance
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
              Comprehensive analytics, department accountability index, and root cause discovery.
            </p>
          </div>

          {/* Time range & Export */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-xs">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    timeRange === range
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* 4 SUMMARY STAT TILES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-bold uppercase">Total Inflow This Quarter</div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">4,812 Tickets</div>
            <div className="text-[11px] text-blue-600 mt-1 font-bold">+8.4% YoY Intake Growth</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
            <div className="text-xs text-emerald-700 font-bold uppercase">Citywide SLA Compliance</div>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">91.4%</div>
            <div className="text-[11px] text-emerald-700/80 mt-1 font-medium">Target: &gt;90.0% Standard</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
            <div className="text-xs text-amber-700 font-bold uppercase">Duplicate Detection Rate</div>
            <div className="text-2xl font-black text-amber-600 mt-1 font-mono">21.8%</div>
            <div className="text-[11px] text-amber-700/80 mt-1 font-medium">1,048 redundant tickets saved</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-bold uppercase">Avg Mean Resolution Time</div>
            <div className="text-2xl font-black text-blue-700 mt-1 font-mono">6.2 Hours</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">Down from 18.5h before AI</div>
          </div>
        </div>

        {/* CHARTS GRID: SLA BY DEPARTMENT & CATEGORY VOLUME */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Department SLA Bar Chart (8 cols) */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" /> Department Response Time vs SLA Target
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Comparison between mandatory SLA hours vs actual median closure turnaround time
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                Benchmarked
              </span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEPARTMENT_SLA_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="department" stroke="#64748B" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                  <Bar dataKey="avgResponseHours" name="Actual Avg Hours" fill="#1D4ED8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="targetSla" name="Mandated SLA Target (Hours)" fill="#93C5FD" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Share & Deduplication Efficiency (4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-blue-600" /> Category Share
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Distribution of citizen grievances across municipal utilities
              </p>

              <div className="h-48 w-full flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CATEGORY_BREAKDOWN}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {CATEGORY_BREAKDOWN.map((entry, index) => (
                        <Cell key={`cell-a-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5">
                {CATEGORY_BREAKDOWN.slice(0, 4).map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="truncate font-medium">{cat.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-center font-medium">
              Top grievance source: <strong className="text-slate-900">Roads & Drainage (60% combined)</strong>
            </div>
          </div>

        </div>

        {/* SECTION: AI CAUSAL INSIGHTS & PATTERN DISCOVERY */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-black text-slate-900">AI Discovered Urban Causal Patterns</h2>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700">Machine Learning Correlated</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
              <div className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-rose-600" /> Ward 12 Water Surge
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Water complaints increased by <strong className="text-slate-900">34% in Ward 12</strong> following pressure regulation adjustments at the Central Pump Station.
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-rose-200">
                Confidence: <strong className="text-emerald-700 font-bold">96.8%</strong> • Causation verified
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" /> Drainage & Construction
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Drainage blockage in Sector 4 is strongly correlated (<strong className="text-slate-900">r=0.88</strong>) with uncollected private construction debris 60m upstream.
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-amber-200">
                Action: Issue notice to builder
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
              <div className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-600" /> Rainfall & Pothole Spikes
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Pothole complaints spike <strong className="text-slate-900">3.4x within 48 hours</strong> following rainfall events &gt;25mm due to hydrostatic bitumen debonding.
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-blue-200">
                Action: Pre-deploy cold-mix trucks
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
              <div className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-600" /> Deduplication Velocity
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                <strong className="text-slate-900">82% of duplicate complaints</strong> are lodged within 3 hours of the initial incident report during daylight commuter hours.
              </p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-purple-200">
                Action: Instant citizen broadcast SMS
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
