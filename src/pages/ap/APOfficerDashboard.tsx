import React from 'react';
import { 
  UserCheck, 
  Building2, 
  MapPin, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  IndianRupee, 
  FileEdit, 
  Eye, 
  AlertCircle, 
  Layers, 
  Mail, 
  Phone, 
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { APOfficer, APProject, APProjectStatus } from '../../types/apProjectTypes';

interface APOfficerDashboardProps {
  officer: APOfficer;
  projects: APProject[];
  onOpenUpdateModal: (project: APProject) => void;
  onSelectProject: (project: APProject) => void;
  onSwitchOfficer: () => void;
}

export const APOfficerDashboard: React.FC<APOfficerDashboardProps> = ({
  officer,
  projects,
  onOpenUpdateModal,
  onSelectProject,
  onSwitchOfficer
}) => {
  // Filter projects strictly assigned to this officer
  const assignedProjects = projects.filter(
    (p) => p.officerId === officer.officerId || p.officerName === officer.name
  );

  const ongoingCount = assignedProjects.filter((p) => p.status === 'Ongoing').length;
  const completedCount = assignedProjects.filter((p) => p.status === 'Completed').length;
  const pendingCount = assignedProjects.filter((p) => p.status === 'Pending' || p.status === 'Assigned').length;
  const delayedCount = assignedProjects.filter((p) => p.status === 'Delayed').length;

  // Projects with government corrections requested
  const correctionNeededProjects = assignedProjects.filter(
    (p) => p.latestReviewStatus === 'Correction Requested'
  );

  const getStatusBadge = (status: APProjectStatus) => {
    switch (status) {
      case 'Completed':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'Ongoing':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Ongoing</span>;
      case 'Delayed':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Delayed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6 pb-16">
      {/* 1. OFFICER PROFILE HEADER */}
      <div className="bg-gradient-to-r from-[#003366] via-[#0A4D8C] to-[#003366] rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-amber-400/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/30">
            <UserCheck className="w-4 h-4" />
            <span>OFFICER DASHBOARD • OFFICIAL WORKSPACE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>{officer.name}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-200 font-medium">
            <span className="flex items-center gap-1 text-amber-300 font-bold">
              <Building2 className="w-3.5 h-3.5" />
              {officer.designation}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-300" />
              {officer.city} District
            </span>
            <span>•</span>
            <span>Department: <strong>{officer.department}</strong></span>
            <span>•</span>
            <span className="font-mono font-bold text-slate-300">ID: {officer.officerId}</span>
          </div>
        </div>

        {/* Switch Officer Account Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSwitchOfficer}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors cursor-pointer"
          >
            Switch Officer Account
          </button>
        </div>
      </div>

      {/* 2. GOVERNMENT CORRECTION ALERTS (If Any) */}
      {correctionNeededProjects.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-700" />
            <h3 className="font-black text-sm text-rose-900">
              Government Directorate Correction Notice ({correctionNeededProjects.length} Project Requires Attention)
            </h3>
          </div>
          <p className="text-xs text-rose-800">
            The State Monitoring Cell has requested specific corrections or missing proof for the following project updates. Please click <strong>Update Project</strong> to review the remarks and re-submit.
          </p>

          <div className="space-y-2">
            {correctionNeededProjects.map((p) => (
              <div key={p.projectId} className="p-3.5 bg-white rounded-2xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{p.projectName}</span>
                  <p className="text-rose-700 font-medium mt-0.5">
                    <strong>Directorate Remarks:</strong> {p.latestCorrectionRemark || 'Please submit updated progress photos.'}
                  </p>
                </div>
                <button
                  onClick={() => onOpenUpdateModal(p)}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shrink-0"
                >
                  Submit Correction
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. OFFICER SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Assigned */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase block">Assigned Projects</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{assignedProjects.length}</div>
          <span className="text-[11px] text-blue-700 font-bold">In {officer.city}</span>
        </div>

        {/* Ongoing */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-blue-700 uppercase block">Ongoing Projects</span>
          <div className="text-3xl font-black text-blue-700 mt-1">{ongoingCount}</div>
          <span className="text-[11px] text-blue-600 font-medium">Active on site</span>
        </div>

        {/* Completed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 uppercase block">Completed Projects</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">{completedCount}</div>
          <span className="text-[11px] text-emerald-700 font-bold">Photo verified</span>
        </div>

        {/* Pending */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-amber-700 uppercase block">Pending / Delayed</span>
          <div className="text-3xl font-black text-amber-600 mt-1">{pendingCount + delayedCount}</div>
          <span className="text-[11px] text-amber-700 font-medium">Under monitoring</span>
        </div>
      </div>

      {/* 4. ASSIGNED PROJECTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-900" />
              My Assigned Projects
            </h3>
            <p className="text-xs text-slate-500">
              Only projects assigned to Officer ID: <strong className="text-slate-800 font-mono">{officer.officerId}</strong> are listed here for status and expenditure updates.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
            {assignedProjects.length} Projects Total
          </span>
        </div>

        {assignedProjects.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">No Projects Assigned Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any active projects assigned under {officer.city} - {officer.department}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Project ID</th>
                  <th className="py-3 px-4 min-w-[220px]">Project Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Budget (₹ Cr)</th>
                  <th className="py-3 px-4 text-right">Amount Spent</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Progress %</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {assignedProjects.map((project) => (
                  <tr key={project.projectId} className="hover:bg-blue-50/40 transition-colors">
                    {/* Project ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {project.projectId}
                    </td>

                    {/* Project Name */}
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 block line-clamp-1">
                        {project.projectName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal truncate block">
                        {project.city} • {project.department}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <span className="truncate block max-w-xs" title={project.location}>
                        {project.location}
                      </span>
                    </td>

                    {/* Budget */}
                    <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      ₹{project.budget.toFixed(2)} Cr
                    </td>

                    {/* Amount Spent */}
                    <td className="py-3 px-4 text-right font-black text-emerald-700 whitespace-nowrap">
                      ₹{project.amountSpent.toFixed(2)} Cr
                    </td>

                    {/* Current Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(project.status)}
                    </td>

                    {/* Completion % */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className={`h-full ${project.completionPercentage >= 100 ? 'bg-emerald-600' : 'bg-blue-600'}`}
                            style={{ width: `${project.completionPercentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-slate-800">{project.completionPercentage}%</span>
                      </div>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {project.lastUpdated}
                    </td>

                    {/* Action: UPDATE PROJECT BUTTON */}
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => onSelectProject(project)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-[11px] font-bold cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenUpdateModal(project)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#003366] to-[#0A4D8C] hover:from-[#002244] hover:to-[#083D6F] text-white text-[11px] font-black cursor-pointer shadow-xs inline-flex items-center gap-1.5 hover:scale-102 transition-transform"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-amber-300" />
                        <span>Update Project</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
