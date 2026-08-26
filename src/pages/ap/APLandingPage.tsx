import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Search, 
  MapPin, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle,
  IndianRupee, 
  ChevronRight, 
  Layers, 
  Eye, 
  ArrowRight,
  Filter,
  Sparkles,
  BarChart3,
  Award,
  Globe
} from 'lucide-react';
import { 
  APProject, 
  APCity, 
  APDepartment, 
  APProjectStatus 
} from '../../types/apProjectTypes';
import { 
  AP_CITIES, 
  AP_DEPARTMENTS 
} from '../../data/apProjectData';
import { calculateAPDashboardStats } from '../../services/apProjectService';

interface APLandingPageProps {
  projects: APProject[];
  onOpenPortalPicker: () => void;
  onSelectProject: (project: APProject) => void;
  onNavigateToGov: () => void;
  onNavigateToOfficer: () => void;
}

export const APLandingPage: React.FC<APLandingPageProps> = ({
  projects,
  onOpenPortalPicker,
  onSelectProject,
  onNavigateToGov,
  onNavigateToOfficer
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const stats = calculateAPDashboardStats(projects);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    if (selectedCity !== 'ALL' && p.city !== selectedCity) return false;
    if (selectedDept !== 'ALL' && p.department !== selectedDept) return false;
    if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.projectName.toLowerCase().includes(q);
      const matchId = p.projectId.toLowerCase().includes(q);
      const matchLoc = p.location.toLowerCase().includes(q);
      const matchOfficer = p.officerName.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchLoc && !matchOfficer) return false;
    }
    return true;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#002244] via-[#003366] to-[#0A4D8C] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-amber-400/30">
        {/* Background Decorative Patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          {/* Official Emblem & State Seal */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-black tracking-wide uppercase shadow-lg">
            <span className="text-base">🏛️</span>
            <span>Government of Andhra Pradesh • Official Monitoring Directorate</span>
          </div>

          {/* EXACT TITLE & SUBTITLE */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Andhra Pradesh Government<br className="hidden sm:inline" /> Project Monitoring Portal
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-amber-300 tracking-wide uppercase">
              Transparent • Accountable • Digital
            </p>
          </div>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            Real-time public infrastructure monitoring across all 10 municipal corporation districts of Andhra Pradesh. Tracking capital expenditure, physical milestones, site condition photographs, and multi-tier department execution.
          </p>

          {/* PROMINENT "GOVERNMENT PORTAL" BUTTON */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenPortalPicker}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-base sm:text-lg flex items-center gap-3 shadow-xl shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer border-2 border-amber-200"
            >
              <ShieldCheck className="w-6 h-6 text-slate-900" />
              <span>Government Portal</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Dual Entry Direct Cards */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <button
              onClick={onNavigateToGov}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all group cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/30 text-amber-300 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-amber-300 uppercase">State Overview</div>
                <div className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                  Option 1: Government Dashboard
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onNavigateToOfficer}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all group cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-emerald-300 uppercase">Field Officers</div>
                <div className="text-sm font-bold text-white group-hover:text-emerald-200 transition-colors">
                  Option 2: Officer Portal
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATEWIDE SUMMARY CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Projects</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalProjects}</div>
            <span className="text-[10px] text-blue-700 font-bold">Across 10 Cities</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Ongoing</span>
            <div className="text-2xl font-black text-blue-700 mt-1">{stats.ongoingProjects}</div>
            <span className="text-[10px] text-blue-600 font-medium">Active site work</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Completed</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.completedProjects}</div>
            <span className="text-[10px] text-emerald-600 font-bold">100% Delivered</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Pending / Delayed</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.pendingProjects + stats.delayedProjects}</div>
            <span className="text-[10px] text-rose-600 font-medium">Under monitoring</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Budget</span>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{stats.totalBudget.toFixed(1)} Cr</div>
            <span className="text-[10px] text-slate-500">Sanctioned Outlay</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Amount Spent</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{stats.amountSpent.toFixed(1)} Cr</div>
            <span className="text-[10px] text-emerald-700 font-bold">Disbursed Funds</span>
          </div>
        </div>
      </section>

      {/* 3. 10 CITIES OF ANDHRA PRADESH QUICK DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-900" />
              Andhra Pradesh Municipal Districts & City Centers
            </h2>
            <p className="text-xs text-slate-500">
              Select any city to instantly view active civic infrastructure projects.
            </p>
          </div>
          <span className="hidden sm:inline text-xs font-bold text-slate-500">
            10 Key District Hubs
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCity('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCity === 'ALL'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Andhra Pradesh ({projects.length})
          </button>
          {AP_CITIES.map((city) => {
            const cityCount = projects.filter((p) => p.city === city).length;
            return (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCity === city
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{city}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  selectedCity === city ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {cityCount}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. PUBLIC PROJECT MONITORING & SEARCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-900" />
                Public Transparency Project Monitor
              </h3>
              <p className="text-xs text-slate-500">
                Verified real-time development projects across Roads, Water, Sanitation, Health, Education and Housing.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search project, ID, location, or officer..."
                className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-blue-900" />
              <span>Filters:</span>
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-blue-900"
            >
              <option value="ALL">All Departments (9)</option>
              {AP_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-blue-900"
            >
              <option value="ALL">All Statuses</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
              <option value="Pending">Pending</option>
            </select>

            <span className="text-slate-400 text-xs ml-auto">
              Showing <strong className="text-slate-900">{filteredProjects.length}</strong> of {projects.length} Projects
            </span>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.projectId}
                onClick={() => onSelectProject(project)}
                className="rounded-2xl border border-slate-200 hover:border-blue-700 bg-white hover:bg-blue-50/20 transition-all shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between overflow-hidden group"
              >
                {/* Project Photo / Thumbnail */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={project.completionPhoto || (project.progressPhotos && project.progressPhotos[0]) || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80'}
                    alt={project.projectName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-black uppercase">
                      {project.city}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-900/90 text-amber-300 text-[10px] font-black uppercase">
                      {project.department}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    {project.status === 'Completed' ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : project.status === 'Ongoing' ? (
                      <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase">
                        {project.completionPercentage}% Ongoing
                      </span>
                    ) : project.status === 'Delayed' ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase">
                        Delayed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase">
                        Pending
                      </span>
                    )}
                  </div>

                  {project.status === 'Completed' && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-emerald-300 text-[9px] font-black">
                      ✓ Completed Work Photo Verified
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {project.projectId}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-blue-900 transition-colors line-clamp-2">
                      {project.projectName}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{project.location}</span>
                    </p>
                  </div>

                  {/* Progress & Financials */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">Sanctioned Budget:</span>
                      <span className="text-slate-900">₹{project.budget.toFixed(1)} Cr</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                        <span>Milestone Progress</span>
                        <span>{project.completionPercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            project.completionPercentage >= 100 ? 'bg-emerald-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${project.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Officer: <strong className="text-slate-700">{project.officerName}</strong></span>
                      <span className="text-blue-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Details <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No projects found matching the filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('ALL');
                  setSelectedDept('ALL');
                  setSelectedStatus('ALL');
                }}
                className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. 9 DEPARTMENTS ACCREDITATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Monitored Government Departments of Andhra Pradesh
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {AP_DEPARTMENTS.map((dept) => {
            const count = projects.filter((p) => p.department === dept).length;
            return (
              <div key={dept} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-extrabold text-slate-800 block truncate" title={dept}>
                  {dept}
                </span>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>5 Officers/City</span>
                  <span className="font-bold text-blue-900">{count} Projects</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
