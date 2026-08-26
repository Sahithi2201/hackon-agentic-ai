import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Building2, 
  ArrowRight,
  Send,
  Camera,
  Layers,
  Activity,
  FileCheck2,
  User,
  DollarSign,
  Check,
  ExternalLink,
  X,
  RefreshCw,
  Calendar,
  BadgeCheck,
  FileText,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { CivicCase, AppView, OfficerWorkUpdate, TimelineEvent } from '../types';
import { getIncidentOperationalSummary, getSeverityInfo } from '../utils/operationsFormatters';
import { getCivicImageUrl, resolveCivicImageKey } from '../utils/imageAssets';
import { getCurrentUser } from '../services/authService';
import { 
  getComplaintByIdInDb, 
  subscribeToOfficerWorkUpdates 
} from '../services/complaintsService';

interface TrackCasePageProps {
  cases: CivicCase[];
  onNavigate?: (view: AppView) => void;
  onSelectCase?: (caseId: string) => void;
  onNavigateToCase?: (caseId: string) => void;
  onNavigateToReport?: () => void;
}

export const TrackCasePage: React.FC<TrackCasePageProps> = ({
  cases,
  onNavigate,
  onSelectCase,
  onNavigateToCase,
  onNavigateToReport
}) => {
  const currentUser = getCurrentUser();
  const isCitizen = currentUser?.role === 'CITIZEN';
  const userCitizenId = currentUser?.citizen_id || currentUser?.id || '';
  const userEmail = (currentUser?.email || '').toLowerCase();
  const userUsername = (currentUser?.username || '').toLowerCase();

  // If citizen, scope recent chips strictly to their own complaints
  const visibleRecentCases = isCitizen && currentUser
    ? cases.filter(c => {
        const cCitizenId = (c.citizenId || '').trim();
        if (cCitizenId && (cCitizenId === userCitizenId || cCitizenId === currentUser.id)) return true;
        const cEmail = (c.citizenEmail || '').trim().toLowerCase();
        if (cEmail && userEmail && cEmail === userEmail) return true;
        const cName = (c.citizenName || '').trim().toLowerCase();
        if (cName && (cName === (currentUser.full_name || '').toLowerCase() || (userUsername && cName.includes(userUsername)))) return true;
        return false;
      })
    : cases;

  const [searchId, setSearchId] = useState(visibleRecentCases.length > 0 ? visibleRecentCases[0].id : '');
  const [activeCase, setActiveCase] = useState<CivicCase | null>(
    visibleRecentCases.length > 0 ? visibleRecentCases[0] : (cases.length > 0 ? cases[0] : null)
  );
  const [searchedQuery, setSearchedQuery] = useState<string>(searchId);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  // Real-time officer work updates for this complaint
  const [allOfficerUpdates, setAllOfficerUpdates] = useState<OfficerWorkUpdate[]>([]);

  // Subscribe to real-time officer work updates from Firestore
  useEffect(() => {
    const unsub = subscribeToOfficerWorkUpdates((updates) => {
      setAllOfficerUpdates(updates);
    });
    return () => unsub();
  }, []);

  // Sync activeCase when cases prop updates in real-time
  useEffect(() => {
    if (activeCase) {
      const updated = cases.find(c => c.id.toUpperCase() === activeCase.id.toUpperCase());
      if (updated) {
        setActiveCase(updated);
      }
    }
  }, [cases]);

  // Handle Search Submission
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchId.trim().toUpperCase();
    if (!query) return;

    setSearchedQuery(query);
    setIsSearching(true);

    // 1. Search in local state memory
    const found = cases.find(c => c.id.toUpperCase() === query || c.id.toUpperCase().includes(query));
    if (found) {
      setActiveCase(found);
      setRatingSubmitted(false);
      setIsSearching(false);
      return;
    }

    // 2. Query Firestore database directly
    try {
      const dbCase = await getComplaintByIdInDb(query);
      if (dbCase) {
        setActiveCase(dbCase);
        setRatingSubmitted(false);
      } else {
        setActiveCase(null);
      }
    } catch (err) {
      console.warn('Database search error in Track by ID:', err);
      setActiveCase(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRatingSubmit = () => {
    setRatingSubmitted(true);
  };

  const handleSelectRecentCase = (c: CivicCase) => {
    setSearchId(c.id);
    setSearchedQuery(c.id);
    setActiveCase(c);
    setRatingSubmitted(false);
  };

  const handleNavigateDetails = (caseId: string) => {
    if (onSelectCase) onSelectCase(caseId);
    else if (onNavigateToCase) onNavigateToCase(caseId);
    else if (onNavigate) onNavigate('citizen-case-details');
  };

  const ops = activeCase ? getIncidentOperationalSummary(activeCase) : null;
  const severity = activeCase ? getSeverityInfo(activeCase.priority, activeCase.isEscalated, activeCase.finalGovernmentRisk) : null;

  // Filter officer & government updates specifically for this active complaint
  const complaintOfficerUpdates = activeCase 
    ? allOfficerUpdates.filter(u => u.complaint_id === activeCase.id || u.complaint_id?.toUpperCase() === activeCase.id.toUpperCase())
    : [];

  const hasGovOrOfficerUpdates = complaintOfficerUpdates.length > 0 || 
    Boolean(activeCase?.officerUpdateNote) || 
    Boolean(activeCase?.resolutionReport) || 
    Boolean(activeCase?.currentAction && activeCase.currentAction !== 'Initial triage');

  return (
    <div className="min-h-full text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 uppercase">
            <ShieldCheck className="w-3.5 h-3.5" /> Citizen Public Tracking Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Track Your Civic Complaint
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Live database verification, Government risk assessment, department assignment, and field squad activity.
          </p>
        </div>

        {/* SEARCH BOX & ACTIVE RECENT CHIPS */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Complaint ID (e.g. CL-2026-000123)"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-semibold"
              />
              <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchId.trim()}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <span>TRACK</span>
              )}
            </button>
          </form>

          {/* Quick Real Chips */}
          {visibleRecentCases.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 font-bold">Recent Complaints:</span>
              {visibleRecentCases.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectRecentCase(c)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                    activeCase?.id === c.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {c.id}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CASE TRACKING CONTENT */}
        {activeCase && ops && severity ? (
          <div className="space-y-6">
            
            {/* Urgent Action banner if Government requested additional information */}
            {((activeCase.informationRequests || []).some(r => r.status === 'PENDING_CITIZEN_RESPONSE') || 
              (activeCase.currentAction || '').toLowerCase().includes('awaiting citizen')) && (
              <div className="p-4 rounded-2xl bg-amber-400 text-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-amber-500 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-slate-950 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider block text-amber-950">Urgent Citizen Action Required</span>
                    <p className="text-xs font-bold text-slate-950">Government requested additional details / photo evidence for this complaint.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigateDetails(activeCase.id)}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Provide Information Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 1. HEADER TICKET BANNER */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                      {activeCase.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {activeCase.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                      activeCase.priority === 'P1' ? 'bg-rose-600 text-white' :
                      activeCase.priority === 'P2' ? 'bg-amber-500 text-slate-950 font-bold' :
                      'bg-blue-600 text-white'
                    }`}>
                      Priority {activeCase.priority}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      activeCase.finalGovernmentRisk === 'CRITICAL' ? 'bg-rose-600 text-white' :
                      activeCase.finalGovernmentRisk === 'HIGH' ? 'bg-amber-500 text-slate-950 font-bold' :
                      activeCase.finalGovernmentRisk === 'MEDIUM' ? 'bg-blue-600 text-white' :
                      activeCase.finalGovernmentRisk === 'LOW' ? 'bg-slate-600 text-white' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      Gov Risk: {activeCase.finalGovernmentRisk || 'ASSESSED'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">{activeCase.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span>Submitted: {activeCase.createdDate || activeCase.submittedAt || 'Recently'}</span>
                    {activeCase.updatedDate && (
                      <span>• Last Sync: {activeCase.updatedDate}</span>
                    )}
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                  <span className={`text-sm font-black uppercase px-3 py-1 rounded-xl inline-block mt-0.5 ${
                    activeCase.status === 'RESOLVED' || activeCase.status === 'SOLVED' || activeCase.status === 'CLOSED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : activeCase.status === 'AWAITING GOVERNMENT VERIFICATION' || activeCase.status === 'AWAITING_VERIFICATION'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : activeCase.status === 'IN_PROGRESS' || activeCase.status === 'ACTION_IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : activeCase.status === 'BLOCKED' || activeCase.status === 'BLOCKED / DELAYED'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {activeCase.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Resolution Progress</span>
                  <span className="font-mono text-blue-600">{activeCase.progress ?? ops.progressPercent}% Completed</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      (activeCase.progress ?? ops.progressPercent) >= 100 ? 'bg-emerald-500' :
                      (activeCase.progress ?? ops.progressPercent) >= 60 ? 'bg-blue-600' :
                      'bg-amber-500'
                    }`}
                    style={{ width: `${Math.max(5, activeCase.progress ?? ops.progressPercent)}%` }}
                  />
                </div>
              </div>

              {/* Operations Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Department</span>
                  <span className="font-bold text-blue-700 block text-xs">{activeCase.assignedDepartment}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Officer / Squad</span>
                  <span className="font-bold text-slate-900 block text-xs">{activeCase.assignedOfficerName || 'Pending Allocation'}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Problem Duration</span>
                  <span className="font-black text-slate-900 block font-mono text-xs">{activeCase.problemDuration || 'Today'}</span>
                </div>
              </div>

              {/* Current Action / What Happens Next */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">What Action Is Being Taken:</span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {activeCase.currentAction || ops.currentAction}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">What Happens Next:</span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {activeCase.nextAction || ops.nextAction}
                  </p>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* 2. GOVERNMENT & OFFICER WORK UPDATES (THE MOST IMPORTANT PART) */}
            {/* ============================================================ */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Official Government & Officer Updates
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  Live Sync
                </span>
              </div>

              {complaintOfficerUpdates.length > 0 ? (
                <div className="space-y-4">
                  {complaintOfficerUpdates.map((update, idx) => {
                    const isCompleted = update.work_status === 'WORK_COMPLETED';
                    const isBlocked = update.work_status === 'BLOCKED';
                    const isApproved = update.government_review_status === 'APPROVED';

                    return (
                      <div 
                        key={update.update_id || idx}
                        className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                          isCompleted ? 'bg-emerald-50/70 border-emerald-300' :
                          isBlocked ? 'bg-rose-50/70 border-rose-300' :
                          'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {/* Update Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-blue-900 font-mono">
                              GOVERNMENT UPDATE
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isCompleted ? 'bg-emerald-600 text-white' :
                              isBlocked ? 'bg-rose-600 text-white' :
                              'bg-blue-600 text-white'
                            }`}>
                              {isCompleted ? 'Resolved ✓' : isBlocked ? 'Blocked / Delayed' : 'Work In Progress'}
                            </span>
                            {isApproved && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3 text-emerald-700" />
                                Verified by Government
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-mono font-semibold text-slate-500">
                            {update.submitted_at ? new Date(update.submitted_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            }) : 'Recently Updated'}
                          </span>
                        </div>

                        {/* Update Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Officer</span>
                            <span className="font-bold text-slate-900">{update.officer_name || activeCase.assignedOfficerName || 'Assigned Officer'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Work Status</span>
                            <span className="font-bold text-slate-900">
                              {isCompleted ? 'Completed' : isBlocked ? 'Blocked' : 'Ongoing'}
                            </span>
                          </div>

                          {/* Money Spent / Materials / Cost */}
                          {(update.actual_cost || update.estimated_cost || update.materials_used) && (
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">Money / Materials</span>
                              <span className="font-bold text-emerald-700 font-mono">
                                {update.actual_cost ? `₹${update.actual_cost}` :
                                 update.estimated_cost ? `₹${update.estimated_cost}` :
                                 update.materials_used || 'Standard'}
                              </span>
                            </div>
                          )}

                          {update.progress_percentage !== undefined && (
                            <div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase block">Progress</span>
                              <span className="font-bold text-blue-700 font-mono">{update.progress_percentage}%</span>
                            </div>
                          )}
                        </div>

                        {/* Situation / Work Description */}
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                            Situation & Work Carried Out:
                          </span>
                          <p className="text-xs sm:text-sm font-medium text-slate-800 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                            "{update.work_description || update.solution_description || 'Work ongoing at location.'}"
                          </p>
                        </div>

                        {/* Next Action if specified */}
                        {update.next_action && !isCompleted && (
                          <div className="text-xs text-slate-600">
                            <strong className="text-slate-900">Next Action:</strong> {update.next_action}
                          </div>
                        )}

                        {/* Blocker reason if blocked */}
                        {isBlocked && update.issues_encountered && (
                          <div className="p-3 rounded-xl bg-rose-100/80 border border-rose-300 text-xs text-rose-900">
                            <strong>Reason for Delay:</strong> {update.issues_encountered}
                          </div>
                        )}

                        {/* Completed Work Photo if available */}
                        {(update.proof_image_url || (update.after_photos && update.after_photos.length > 0)) && (
                          <div className="pt-1 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setSelectedPhotoModal(update.proof_image_url || update.after_photos?.[0] || null)}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>[ View Completed Work Photo ]</span>
                            </button>
                            <span className="text-[11px] text-slate-500 italic">Official photographic field proof</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : hasGovOrOfficerUpdates ? (
                /* Fallback if update is on activeCase record */
                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-200/70 pb-2">
                    <span className="text-xs font-black uppercase text-blue-900 font-mono">
                      GOVERNMENT UPDATE
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {activeCase.officerLastUpdate ? new Date(activeCase.officerLastUpdate).toLocaleString() : 'Recent'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Officer</span>
                      <span className="font-bold text-slate-900">{activeCase.assignedOfficerName || 'Departmental Squad'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Work Status</span>
                      <span className="font-bold text-slate-900">{activeCase.status}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Progress</span>
                      <span className="font-bold text-blue-700 font-mono">{activeCase.progress ?? 50}%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Situation:</span>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 bg-white p-3 rounded-xl border border-blue-200 leading-relaxed">
                      "{activeCase.officerUpdateNote || activeCase.currentAction || 'Departmental squad dispatched to inspect and execute corrective action.'}"
                    </p>
                  </div>

                  {activeCase.resolvedImageUrl && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoModal(activeCase.resolvedImageUrl || null)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>[ View Completed Work Photo ]</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* No Updates Yet State */
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 mx-auto" />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-900 uppercase">Complaint found.</h4>
                    <p className="text-xs text-slate-600 font-medium">Government has not provided any new update yet.</p>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed pt-1">
                    Your complaint is registered and queued for departmental officer assignment. All subsequent field updates, work reports, and resolution milestones will appear here in real time.
                  </p>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* 3. INCIDENT DETAILS & CITIZEN EVIDENCE PHOTO                 */}
            {/* ============================================================ */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">Incident Details & Evidence</h3>
                <span className="text-xs text-slate-500 font-medium">Original Submission</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-full sm:w-64 h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative group">
                  <img
                    src={activeCase.imageUrl || getCivicImageUrl(resolveCivicImageKey(activeCase.category))}
                    alt={activeCase.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setSelectedPhotoModal(activeCase.imageUrl || getCivicImageUrl(resolveCivicImageKey(activeCase.category)))}
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg pointer-events-none">
                    Click to enlarge
                  </div>
                </div>

                <div className="space-y-3 flex-1 text-xs text-slate-600 leading-relaxed">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Description</span>
                    <p className="font-medium text-slate-800 mt-0.5">{activeCase.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-start gap-1.5 text-slate-700">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">{activeCase.location.address}</span>
                        {(activeCase.location.colony || activeCase.location.area || activeCase.location.city) && (
                          <span className="text-[11px] text-slate-500">
                            {activeCase.location.colony || activeCase.location.area}, {activeCase.location.city || ''} (Ward: {activeCase.location.ward || 'General'})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* 4. OFFICIAL STAGE-BY-STAGE CHRONOLOGICAL TIMELINE            */}
            {/* ============================================================ */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Official Municipal Activity Timeline</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Chronological record of government and departmental workflow events.</p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {activeCase.progress ?? ops.progressPercent}% Processed
                </span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(activeCase.timeline || []).map((event, idx) => {
                  const isDone = event.status === 'completed';
                  const isCurrent = event.status === 'current';

                  return (
                    <div key={event.id || idx} className="relative">
                      <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isDone ? 'bg-emerald-600 border-white shadow-xs' :
                        isCurrent ? 'bg-blue-600 border-white shadow-xs animate-pulse' :
                        'bg-slate-200 border-white'
                      }`}>
                        {isDone && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>

                      <div className={`p-4 rounded-2xl text-xs space-y-1 transition-all ${
                        isCurrent ? 'bg-blue-50 border border-blue-200 shadow-xs' : 'bg-slate-50 border border-slate-200'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{event.title}</h4>
                          <span className="text-[11px] font-mono font-bold text-blue-700">{event.timestamp}</span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed font-medium">{event.description}</p>
                        {event.actor && (
                          <div className="text-[10px] text-slate-400 font-mono pt-1">
                            Responsible Authority: <span className="text-slate-700 font-bold">{event.actor}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ============================================================ */}
            {/* 5. RESOLUTION REPORT & SATISFACTION FEEDBACK IF RESOLVED     */}
            {/* ============================================================ */}
            {(activeCase.status === 'RESOLVED' || activeCase.status === 'Resolved' || activeCase.status === 'CLOSED' || activeCase.status === 'SOLVED') && (
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base font-black text-emerald-950">This complaint has been verified and resolved!</h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto mt-0.5">
                    Municipal officers have concluded field repairs and official Government verification is complete.
                  </p>
                </div>

                {/* Resolution Summary Card if available */}
                {activeCase.resolutionReport && (
                  <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-left max-w-xl mx-auto space-y-2 text-xs">
                    <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold block">
                      Resolution Summary:
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {activeCase.resolutionReport.summary || activeCase.resolutionReport.actionTaken}
                    </p>
                    {activeCase.resolutionReport.afterPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoModal(activeCase.resolutionReport?.afterPhotoUrl || null)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-bold underline flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>View Completion Proof Photo</span>
                      </button>
                    )}
                  </div>
                )}

                {!ratingSubmitted ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-slate-700">How satisfied are you with the municipal response?</p>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleRatingSubmit}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Submit Citizen Feedback
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-emerald-700 bg-white/80 py-2 px-4 rounded-xl border border-emerald-200 inline-block">
                    ✓ Thank you! Your rating has been recorded for the department performance index.
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          /* ============================================================ */
          /* INVALID COMPLAINT ID / NOT FOUND STATE                       */
          /* ============================================================ */
          <div className="p-10 sm:p-12 rounded-3xl bg-white border-2 border-dashed border-slate-300 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
              <FileCheck2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 uppercase">
                Complaint ID not found.
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {searchedQuery 
                  ? `We could not find any complaint matching "${searchedQuery}". Please check your Complaint ID and try again.`
                  : 'Please enter a valid Complaint ID in the search box above to track status.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onNavigateToReport && (
                <button
                  type="button"
                  onClick={onNavigateToReport}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>+ File a New Complaint</span>
                </button>
              )}
              {visibleRecentCases.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleSelectRecentCase(visibleRecentCases[0])}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 cursor-pointer"
                >
                  <span>View Recent Complaint ({visibleRecentCases[0].id})</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* FULL PHOTO EVIDENCE / COMPLETION PROOF MODAL                 */}
      {/* ============================================================ */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-3xl w-full overflow-hidden shadow-2xl space-y-3 p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-mono">
                <Camera className="w-4 h-4 text-blue-400" />
                <span>Field Evidence / Work Photo Proof</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full max-h-[70vh] flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden">
              <img
                src={selectedPhotoModal}
                alt="Enlarged work photo evidence"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setSelectedPhotoModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
