import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  IndianRupee, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Layers, 
  Calendar, 
  UserCheck, 
  Image as ImageIcon,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Download,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  APProject, 
  APCity, 
  APDepartment, 
  APProjectStatus, 
  APReviewStatus, 
  APProjectUpdate 
} from '../../types/apProjectTypes';
import { 
  AP_CITIES, 
  AP_DEPARTMENTS, 
  GENERATED_OFFICERS 
} from '../../data/apProjectData';
import { 
  calculateAPDashboardStats, 
  approveProjectUpdate, 
  requestCorrectionProjectUpdate 
} from '../../services/apProjectService';

interface APGovernmentDashboardProps {
  projects: APProject[];
  onSelectProject: (project: APProject) => void;
  onOpenUpdateModal?: (project: APProject) => void;
}

export const APGovernmentDashboard: React.FC<APGovernmentDashboardProps> = ({
  projects,
  onSelectProject,
  onOpenUpdateModal
}) => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'analytics' | 'reviews'>('monitoring');

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedOfficer, setSelectedOfficer] = useState<string>('ALL');

  // Review Dialog State
  const [reviewingProject, setReviewingProject] = useState<APProject | null>(null);
  const [reviewingUpdate, setReviewingUpdate] = useState<APProjectUpdate | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'correction' | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState<string>('');
  const [isProcessingReview, setIsProcessingReview] = useState<boolean>(false);
  const [reviewFeedback, setReviewFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const stats = calculateAPDashboardStats(projects);

  // Projects filtered by user criteria
  const filteredProjects = projects.filter((p) => {
    if (selectedCity !== 'ALL' && p.city !== selectedCity) return false;
    if (selectedDept !== 'ALL' && p.department !== selectedDept) return false;
    if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
    if (selectedOfficer !== 'ALL' && p.officerId !== selectedOfficer) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.projectName.toLowerCase().includes(q);
      const matchId = p.projectId.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      const matchDept = p.department.toLowerCase().includes(q);
      const matchOfficer = p.officerName.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchCity && !matchDept && !matchOfficer) return false;
    }
    return true;
  });

  // Projects pending government review
  const pendingReviewProjects = projects.filter(
    (p) => p.latestReviewStatus === 'Submitted for Government Review' || (p.updates && p.updates.some(u => u.reviewStatus === 'Submitted for Government Review'))
  );

  const handleReviewSubmit = async () => {
    if (!reviewingProject || !reviewingUpdate) return;
    setIsProcessingReview(true);
    setReviewFeedback(null);

    try {
      if (reviewAction === 'approve') {
        await approveProjectUpdate(
          reviewingProject.projectId,
          reviewingUpdate.updateId,
          reviewRemarks || 'Update verified and approved by State Directorate.'
        );
        setReviewFeedback({ msg: 'Update approved successfully.', type: 'success' });
      } else {
        if (!reviewRemarks.trim()) {
          setReviewFeedback({ msg: 'Please provide correction remarks explaining what needs to be changed.', type: 'error' });
          setIsProcessingReview(false);
          return;
        }
        await requestCorrectionProjectUpdate(
          reviewingProject.projectId,
          reviewingUpdate.updateId,
          reviewRemarks.trim()
        );
        setReviewFeedback({ msg: 'Correction request sent to officer.', type: 'success' });
      }

      setTimeout(() => {
        setReviewingProject(null);
        setReviewingUpdate(null);
        setReviewAction(null);
        setReviewRemarks('');
        setReviewFeedback(null);
      }, 1000);
    } catch (e: any) {
      setReviewFeedback({ msg: e.message || 'Review failed', type: 'error' });
    } finally {
      setIsProcessingReview(false);
    }
  };

  const getStatusBadge = (status: APProjectStatus) => {
    switch (status) {
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'Ongoing':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Ongoing</span>;
      case 'Delayed':
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Delayed</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-black inline-flex items-center gap-1">Assigned</span>;
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* Government Dashboard Header */}
      <div className="bg-gradient-to-r from-[#003366] via-[#0A4D8C] to-[#003366] rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-amber-400/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30">
            <ShieldCheck className="w-4 h-4" />
            <span>STATE EXECUTIVE SECRETARIAT • AMARAVATI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Andhra Pradesh Government Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl leading-relaxed">
            Centralized Project Monitoring & Executive Verification Control. Overseeing capital works across all 10 cities and 9 key municipal departments.
          </p>
        </div>

        {/* Pending Reviews Pill Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-xl border border-amber-400/30">
            {stats.pendingReviewsCount}
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-300">
              Pending Reviews
            </div>
            <div className="text-xs text-white font-medium">
              Updates submitted by Officers
            </div>
            <button
              onClick={() => setActiveTab('reviews')}
              className="text-[11px] font-bold text-amber-200 hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
            >
              <span>Review Now</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. STATEWIDE SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Projects */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Projects</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.totalProjects}</div>
          <span className="text-[10px] text-blue-700 font-bold">10 Andhra Districts</span>
        </div>

        {/* Ongoing Projects */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-blue-700 uppercase block">Ongoing</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">{stats.ongoingProjects}</div>
          <span className="text-[10px] text-blue-600 font-medium">In execution phase</span>
        </div>

        {/* Completed Projects */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase block">Completed</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{stats.completedProjects}</div>
          <span className="text-[10px] text-emerald-700 font-bold">100% Dedicated</span>
        </div>

        {/* Pending Projects */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-700 uppercase block">Pending / Delayed</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats.pendingProjects + stats.delayedProjects}</div>
          <span className="text-[10px] text-amber-700 font-medium">{stats.delayedProjects} with delays</span>
        </div>

        {/* Total Budget */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Budget</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">₹{stats.totalBudget.toFixed(1)} <span className="text-sm font-bold text-slate-500">Cr</span></div>
          <span className="text-[10px] text-slate-500">Total Sanctioned</span>
        </div>

        {/* Amount Spent */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase block">Amount Spent</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">₹{stats.amountSpent.toFixed(1)} <span className="text-sm font-bold text-emerald-600">Cr</span></div>
          <span className="text-[10px] text-emerald-700 font-bold">{Math.round((stats.amountSpent / stats.totalBudget) * 100)}% Utilized</span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'monitoring'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Project Monitoring Table ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 relative ${
            activeTab === 'reviews'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Submitted for Government Review</span>
          {stats.pendingReviewsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
              {stats.pendingReviewsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard Visualizations & Analytics</span>
        </button>
      </div>

      {/* TAB 1: PROJECT MONITORING TABLE */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Filter & Global Search Bar */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Global Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Global Search by Project ID, Project Name, City, Department, or Officer..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium border border-slate-300 rounded-2xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('ALL');
                  setSelectedDept('ALL');
                  setSelectedStatus('ALL');
                  setSelectedOfficer('ALL');
                }}
                className="px-3.5 py-2.5 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* Dropdown Filters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* City Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">City Filter</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-blue-900"
                >
                  <option value="ALL">All Cities (10)</option>
                  {AP_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Department Filter</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-blue-900"
                >
                  <option value="ALL">All Departments (9)</option>
                  {AP_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Project Status Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Status Filter</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-blue-900"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                </select>
              </div>

              {/* Officer Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Assigned Officer</label>
                <select
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-blue-900"
                >
                  <option value="ALL">All Officers (450)</option>
                  {GENERATED_OFFICERS.slice(0, 30).map((o) => (
                    <option key={o.officerId} value={o.officerId}>
                      {o.name} ({o.city} • {o.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PROJECT MONITORING TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">Project Register</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                  {filteredProjects.length} Projects Shown
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Click on any project row to view full situation report & update history
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Project ID</th>
                    <th className="py-3 px-4 min-w-[240px]">Project Name</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Assigned Officer</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">Exp. Completion</th>
                    <th className="py-3 px-4 text-right">Budget (₹ Cr)</th>
                    <th className="py-3 px-4 text-right">Spent (₹ Cr)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-center">Completion Photo</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredProjects.map((project) => (
                    <tr 
                      key={project.projectId}
                      onClick={() => onSelectProject(project)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      {/* Project ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {project.projectId}
                      </td>

                      {/* Project Name */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-1 block">
                          {project.projectName}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block max-w-xs font-normal">
                          {project.location}
                        </span>
                      </td>

                      {/* City */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{project.city}</span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {project.department}
                        </span>
                      </td>

                      {/* Assigned Officer */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{project.officerName}</span>
                        <span className="text-[10px] text-slate-500 block">{project.officerDesignation}</span>
                      </td>

                      {/* Start Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        {project.startDate}
                      </td>

                      {/* Expected Completion Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-blue-900 font-mono font-bold text-[11px]">
                        {project.expectedCompletionDate}
                      </td>

                      {/* Budget */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{project.budget.toFixed(2)}
                      </td>

                      {/* Amount Spent */}
                      <td className="py-3 px-4 text-right font-black text-emerald-700 whitespace-nowrap">
                        ₹{project.amountSpent.toFixed(2)}
                      </td>

                      {/* Status & Progress */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getStatusBadge(project.status)}
                          <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div 
                              className={`h-full ${project.completionPercentage >= 100 ? 'bg-emerald-600' : 'bg-blue-600'}`}
                              style={{ width: `${project.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-500 font-mono">
                        {project.lastUpdated}
                      </td>

                      {/* Completion Photo Column */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {project.completionPhoto ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Photo Verified</span>
                          </div>
                        ) : project.status === 'Completed' ? (
                          <span className="text-[10px] text-rose-600 font-bold">Photo Pending</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">In Progress</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(project);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs font-medium">
                No government projects found matching your active filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUBMITTED FOR GOVERNMENT REVIEW */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-200 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-sm text-amber-950">
                Officer Progress Updates Awaiting Government Verification
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                When field officers submit progress reports, budget expenditures, or completed work photos, they are staged here. Government Directorate members can inspect the situation report, verify uploaded photos, and either <strong>Approve Update</strong> or <strong>Request Correction</strong> with official instructions.
              </p>
            </div>
          </div>

          {pendingReviewProjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-base font-extrabold text-slate-800">
                All Officer Updates Have Been Reviewed
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                There are no pending progress updates in the verification queue. New officer submissions will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviewProjects.map((project) => {
                const pendingUpdates = project.updates?.filter((u) => u.reviewStatus === 'Submitted for Government Review') || [];
                return (
                  <div 
                    key={project.projectId}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
                  >
                    {/* Project Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">{project.projectId}</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-black uppercase">
                            {project.city} • {project.department}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 mt-1">
                          {project.projectName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Assigned Officer: <strong className="text-slate-800">{project.officerName}</strong> ({project.officerDesignation})
                        </p>
                      </div>

                      <button
                        onClick={() => onSelectProject(project)}
                        className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Full Project</span>
                      </button>
                    </div>

                    {/* Pending Updates List */}
                    <div className="space-y-3">
                      {pendingUpdates.map((update) => (
                        <div key={update.updateId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-slate-900">
                              Update #{update.updateId} • {update.submittedAt}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                              Awaiting Directorate Action
                            </span>
                          </div>

                          {/* Diffs */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Status Proposed</span>
                              <span className="font-bold text-slate-900">{update.previousStatus} → <strong className="text-blue-900">{update.newStatus}</strong></span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Completion %</span>
                              <span className="font-bold text-slate-900">{update.previousCompletionPercentage}% → <strong className="text-emerald-700">{update.newCompletionPercentage}%</strong></span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Amount Spent</span>
                              <span className="font-bold text-slate-900">₹{update.amountSpent} Cr</span>
                            </div>
                          </div>

                          {/* Situation Report */}
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                            <span className="font-bold text-slate-900 block mb-1">Field Situation Report:</span>
                            {update.situationReport}
                          </div>

                          {/* Photos Evidence */}
                          {update.completionPhoto && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-slate-700 block">
                                Attached Photo Evidence:
                              </span>
                              <img 
                                src={update.completionPhoto} 
                                alt="Update evidence" 
                                className="w-32 h-20 rounded-xl object-cover border border-slate-300"
                              />
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-2 flex items-center justify-end gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                setReviewingProject(project);
                                setReviewingUpdate(update);
                                setReviewAction('correction');
                                setReviewRemarks('');
                              }}
                              className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                            >
                              Request Correction
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setReviewingProject(project);
                                setReviewingUpdate(update);
                                setReviewAction('approve');
                                setReviewRemarks('Update verified and approved by State Monitoring Directorate.');
                              }}
                              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-md"
                            >
                              Approve Update
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VISUALIZATIONS & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Projects by City Distribution */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-900" />
                Infrastructure Projects by City
              </h3>

              <div className="space-y-3">
                {AP_CITIES.map((city) => {
                  const cityProjects = projects.filter((p) => p.city === city);
                  const completed = cityProjects.filter((p) => p.status === 'Completed').length;
                  const total = cityProjects.length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div key={city} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">{city}</span>
                        <span className="text-slate-500 font-normal">
                          <strong className="text-slate-900">{total}</strong> projects ({completed} completed)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                        <div 
                          className="bg-emerald-500 h-full"
                          style={{ width: `${pct}%` }}
                        />
                        <div 
                          className="bg-blue-600 h-full"
                          style={{ width: `${100 - pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Projects by Department Breakdown */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-900" />
                Projects by Government Department
              </h3>

              <div className="space-y-3">
                {AP_DEPARTMENTS.map((dept) => {
                  const deptProjects = projects.filter((p) => p.department === dept);
                  const totalBudget = deptProjects.reduce((acc, p) => acc + p.budget, 0);
                  const totalSpent = deptProjects.reduce((acc, p) => acc + p.amountSpent, 0);

                  return (
                    <div key={dept} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900">{dept}</span>
                        <span className="text-blue-900 font-black">{deptProjects.length} Projects</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Sanctioned: ₹{totalBudget.toFixed(1)} Cr</span>
                        <span className="text-emerald-700 font-bold">Spent: ₹{totalSpent.toFixed(1)} Cr</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Budget Allocated vs Spent Macro Gauge */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#003366] to-[#0A4D8C] text-white space-y-4">
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-amber-300" />
              Statewide Capital Outlay vs Disbursed Expenditure
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <span className="text-xs text-slate-200 block">Total Sanctioned Budget</span>
                <div className="text-2xl font-black text-white mt-1">₹{stats.totalBudget.toFixed(2)} Cr</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <span className="text-xs text-emerald-300 block">Total Amount Spent</span>
                <div className="text-2xl font-black text-emerald-300 mt-1">₹{stats.amountSpent.toFixed(2)} Cr</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <span className="text-xs text-amber-300 block">Remaining Approved Balance</span>
                <div className="text-2xl font-black text-amber-300 mt-1">₹{stats.remainingBudget.toFixed(2)} Cr</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW ACTION MODAL */}
      {reviewingProject && reviewingUpdate && reviewAction && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="font-black text-base text-slate-900">
              {reviewAction === 'approve' ? 'Approve Project Update' : 'Request Officer Correction'}
            </h3>

            {reviewFeedback && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                reviewFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {reviewFeedback.msg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Government Directorate Remarks *
              </label>
              <textarea
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                rows={3}
                placeholder={reviewAction === 'approve' ? 'e.g. Update verified. Quality standards approved.' : 'e.g. Please attach high-resolution completed work photo and re-submit...'}
                className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setReviewingProject(null);
                  setReviewingUpdate(null);
                  setReviewAction(null);
                }}
                disabled={isProcessingReview}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={isProcessingReview}
                className={`px-5 py-2 rounded-xl text-white text-xs font-black cursor-pointer shadow-md ${
                  reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isProcessingReview ? 'Processing...' : (reviewAction === 'approve' ? 'Confirm Approval' : 'Send Correction Notice')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
