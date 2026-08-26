import React, { useState, useEffect, useMemo } from 'react';
import { 
  HardHat, 
  LogOut, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Send, 
  Calendar, 
  Building2, 
  Phone, 
  User, 
  Layers, 
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Eye,
  Camera,
  Upload,
  AlertCircle,
  Check
} from 'lucide-react';
import { 
  AppView, 
  CivicCase, 
  DepartmentOfficer, 
  OfficerWorkUpdate 
} from '../types';
import { 
  subscribeToComplaints, 
  submitOfficerWorkUpdateInDb, 
  OfficerWorkUpdateInput,
  confirmAndAssignOfficerInDb,
  subscribeToOfficerWorkUpdates
} from '../services/complaintsService';
import { getActiveOfficer, clearActiveOfficer } from '../services/authService';
import handComplaintStampBg from '../assets/images/hand_wooden_complaint_stamp_1787390509621.jpg';

interface OfficerWorkspacePageProps {
  onNavigate: (view: AppView) => void;
  activeOfficer?: DepartmentOfficer | null;
}

export const OfficerWorkspacePage: React.FC<OfficerWorkspacePageProps> = ({
  onNavigate,
  activeOfficer: propOfficer
}) => {
  const [officer, setOfficer] = useState<DepartmentOfficer | null>(() => {
    return propOfficer || getActiveOfficer();
  });

  const [allCases, setAllCases] = useState<CivicCase[]>([]);
  const [allWorkUpdates, setAllWorkUpdates] = useState<OfficerWorkUpdate[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'WAITING_VERIFY' | 'SOLVED'>('ALL');

  // Multi-Step Form State (Step 1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Form Fields
  const [workStatus, setWorkStatus] = useState<'IN_PROGRESS' | 'BLOCKED' | 'WORK_COMPLETED'>('IN_PROGRESS');
  const [progressPercentage, setProgressPercentage] = useState<number>(50);
  const [workDescription, setWorkDescription] = useState<string>('');
  const [nextAction, setNextAction] = useState<string>('');
  const [issuesEncountered, setIssuesEncountered] = useState<string>('');
  const [estimatedCompletion, setEstimatedCompletion] = useState<string>('24 Hours');
  const [materialsUsed, setMaterialsUsed] = useState<string>('');
  const [proofImageUrl, setProofImageUrl] = useState<string>('');
  
  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState<string | null>(null);
  const [submissionErrorMsg, setSubmissionErrorMsg] = useState<string | null>(null);

  // Subscribe to complaints & work updates
  useEffect(() => {
    const unsubCases = subscribeToComplaints((cases) => {
      setAllCases(cases);
    });

    const unsubUpdates = subscribeToOfficerWorkUpdates((updates) => {
      setAllWorkUpdates(updates);
    });

    return () => {
      unsubCases();
      unsubUpdates();
    };
  }, []);

  // Filter complaints assigned ONLY to this officer
  const assignedCases = useMemo(() => {
    if (!officer) return [];
    return allCases.filter(c => {
      const matchId = c.assignedOfficerId === officer.id;
      const matchName = c.assignedOfficerName && c.assignedOfficerName.toLowerCase() === officer.name.toLowerCase();
      return matchId || matchName;
    });
  }, [allCases, officer]);

  // Filtered by sub-tab
  const filteredAssignedCases = useMemo(() => {
    return assignedCases.filter(c => {
      if (statusFilter === 'PENDING') {
        return c.status === 'IN_PROGRESS' || c.status === 'OFFICER ASSIGNED' || c.status === 'BLOCKED / DELAYED';
      }
      if (statusFilter === 'WAITING_VERIFY') {
        return c.status === 'AWAITING GOVERNMENT VERIFICATION' || c.status === 'AWAITING_VERIFICATION';
      }
      if (statusFilter === 'SOLVED') {
        return c.status === 'SOLVED';
      }
      return true;
    });
  }, [assignedCases, statusFilter]);

  // Set initial selected case
  useEffect(() => {
    if (assignedCases.length > 0) {
      if (!selectedCaseId || !assignedCases.find(c => c.id === selectedCaseId)) {
        setSelectedCaseId(assignedCases[0].id);
      }
    } else {
      setSelectedCaseId(null);
    }
  }, [assignedCases, selectedCaseId]);

  // Currently active selected case
  const activeCase = useMemo(() => {
    return assignedCases.find(c => c.id === selectedCaseId) || null;
  }, [assignedCases, selectedCaseId]);

  // Updates for active case
  const caseUpdates = useMemo(() => {
    if (!activeCase) return [];
    return allWorkUpdates.filter(u => u.complaint_id === activeCase.id);
  }, [allWorkUpdates, activeCase]);

  // Pre-fill form when selecting a case
  useEffect(() => {
    if (activeCase) {
      setProgressPercentage(activeCase.progress || 50);
      setWorkDescription(activeCase.officerUpdateNote || activeCase.currentAction || 'Squad arrived on location. Initial site assessment completed.');
      setNextAction(activeCase.nextAction || 'Deploying repair equipment and leveling terrain.');
      setIssuesEncountered(activeCase.blockedReason || '');
      setEstimatedCompletion(activeCase.expectedCompletionDate || 'Tomorrow 5:00 PM');
      setMaterialsUsed('');
      setProofImageUrl(activeCase.resolvedImageUrl || '');

      if (activeCase.status === 'BLOCKED / DELAYED') {
        setWorkStatus('BLOCKED');
      } else if (activeCase.status === 'AWAITING GOVERNMENT VERIFICATION' || activeCase.status === 'AWAITING_VERIFICATION') {
        setWorkStatus('WORK_COMPLETED');
      } else {
        setWorkStatus('IN_PROGRESS');
      }

      setCurrentStep(1);
      setFieldErrors({});
      setSubmissionSuccessMsg(null);
      setSubmissionErrorMsg(null);
    }
  }, [activeCase?.id]);

  const handleLogout = () => {
    clearActiveOfficer();
    onNavigate('officer-login');
  };

  // Helper to assign a sample complaint if officer has none
  const handleAssignSampleComplaint = async () => {
    if (!officer) return;
    const unassigned = allCases.find(c => !c.assignedOfficerId || c.status === 'NEW COMPLAINT' || c.status === 'UNDER REVIEW');
    const caseToAssign = unassigned || allCases[0];
    if (caseToAssign) {
      await confirmAndAssignOfficerInDb({
        complaintId: caseToAssign.id,
        riskLevel: caseToAssign.finalGovernmentRisk || 'HIGH',
        riskReason: 'Assigned directly for field inspection',
        departmentKey: officer.departmentKey,
        departmentName: officer.departmentName,
        officerId: officer.id,
        officerName: officer.name,
        assignedBy: 'Government Admin (Direct Assignment)'
      });
      setSelectedCaseId(caseToAssign.id);
    }
  };

  // Step Navigation Validation
  const handleNextStep = () => {
    const errors: { [key: string]: string } = {};

    // Validate ONLY current step fields
    if (currentStep === 1) {
      if (!workStatus) {
        errors.workStatus = 'Please select a current work status.';
      }
      if (progressPercentage < 0 || progressPercentage > 100) {
        errors.progressPercentage = 'Progress must be between 0% and 100%.';
      }
    } else if (currentStep === 2) {
      if (!workDescription.trim()) {
        errors.workDescription = 'Please describe the work done or current field action.';
      }
      if (workStatus === 'BLOCKED' && !issuesEncountered.trim()) {
        errors.issuesEncountered = 'Please specify the bottleneck / delay reason.';
      }
    } else if (currentStep === 3) {
      // Step 3 fields are optional/validatable
      if (!estimatedCompletion.trim()) {
        errors.estimatedCompletion = 'Please provide an estimated completion timeline.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Clear errors and advance
    setFieldErrors({});
    setSubmissionErrorMsg(null);
    setCurrentStep(prev => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    setFieldErrors({});
    setSubmissionErrorMsg(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // Submit Final Work Update (Step 4)
  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !officer) return;

    if (!workDescription.trim()) {
      setFieldErrors({ workDescription: 'Work description is required.' });
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    setSubmissionErrorMsg(null);
    setSubmissionSuccessMsg(null);

    try {
      const input: OfficerWorkUpdateInput = {
        complaintId: activeCase.id,
        officerId: officer.id,
        officerName: officer.name,
        departmentName: officer.departmentName,
        progressPercentage: workStatus === 'WORK_COMPLETED' ? 95 : progressPercentage,
        workStatus: workStatus,
        workDescription: workDescription.trim(),
        nextAction: nextAction.trim() || 'Awaiting municipal verification',
        issuesEncountered: workStatus === 'BLOCKED' ? issuesEncountered.trim() : '',
        estimatedCompletion: estimatedCompletion.trim(),
        materialsUsed: materialsUsed.trim(),
        proofImageUrl: proofImageUrl.trim()
      };

      await submitOfficerWorkUpdateInDb(input);

      setIsSubmitting(false);
      setSubmissionSuccessMsg(
        workStatus === 'WORK_COMPLETED'
          ? 'Work update submitted successfully! Sent to Government Admin for final verification & citizen resolution.'
          : 'Work progress updated successfully and synced with Municipal registry.'
      );
    } catch (err: any) {
      console.error('Error submitting officer update:', err);
      setIsSubmitting(false);
      setSubmissionErrorMsg('Failed to submit work update. Please check network connection.');
    }
  };

  if (!officer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Officer Session Not Found</h2>
          <p className="text-xs text-slate-600">
            Please log in with your authorized department officer badge to access your private field workspace.
          </p>
          <button
            onClick={() => onNavigate('officer-login')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            Go to Officer Login
          </button>
        </div>
      </div>
    );
  }

  const stepsConfig = [
    { num: 1, title: 'Status & Progress', desc: 'Work state & %' },
    { num: 2, title: 'Field Actions', desc: 'Work done & notes' },
    { num: 3, title: 'Resources & Time', desc: 'Materials & ETA' },
    { num: 4, title: 'Proof & Submit', desc: 'Photo & verification' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between select-none relative">
      
      {/* Background Layer */}
      <div 
        className="fixed inset-0 pointer-events-none -z-20 overflow-hidden"
        style={{
          backgroundImage: `url(${handComplaintStampBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
        }}
      />

      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          {/* Left: Officer Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-tight">{officer.name}</span>
                <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/20">
                  {officer.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {officer.designation || 'Field Officer'} • <span className="text-cyan-300">{officer.departmentName}</span>
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Assigned Tasks: <strong>{assignedCases.length}</strong></span>
            </div>

            <button
              onClick={() => onNavigate('gov-dashboard')}
              className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all border border-slate-700 cursor-pointer hidden md:flex items-center gap-1.5"
            >
              <span>Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleLogout}
              className="text-xs font-bold text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900 px-3 py-1.5 rounded-xl transition-all border border-rose-800/50 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        
        {/* KPI DASHBOARD STATS RIBBON */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          
          {/* 1. Total Assigned */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Projects</p>
              <p className="text-xl font-black text-slate-900 leading-tight">{assignedCases.length}</p>
            </div>
          </div>

          {/* 2. Ongoing */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ongoing</p>
              <p className="text-xl font-black text-amber-700 leading-tight">
                {assignedCases.filter(c => c.status === 'IN_PROGRESS' || c.status === 'WORK_ACCEPTED' || c.status === 'BLOCKED / DELAYED').length}
              </p>
            </div>
          </div>

          {/* 3. Pending */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Action</p>
              <p className="text-xl font-black text-indigo-700 leading-tight">
                {assignedCases.filter(c => c.status === 'OFFICER ASSIGNED' || c.status === 'OFFICER_ASSIGNED' || !c.progress || c.progress === 0).length}
              </p>
            </div>
          </div>

          {/* 4. Awaiting Gov Verification */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Processed / Review</p>
              <p className="text-xl font-black text-purple-700 leading-tight">
                {assignedCases.filter(c => c.status === 'AWAITING GOVERNMENT VERIFICATION' || c.status === 'AWAITING_VERIFICATION' || c.status === 'UNDER_REVIEW').length}
              </p>
            </div>
          </div>

          {/* 5. Solved */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Solved Projects</p>
              <p className="text-xl font-black text-emerald-700 leading-tight">
                {assignedCases.filter(c => c.status === 'SOLVED').length}
              </p>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: ASSIGNED COMPLAINTS LIST (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Header & Filter Tabs */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    My Assigned Tasks ({assignedCases.length})
                  </h2>
                </div>

                {assignedCases.length === 0 && (
                  <button
                    onClick={handleAssignSampleComplaint}
                    className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                  >
                    + Assign Sample
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-slate-600">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  All ({assignedCases.length})
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'PENDING' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Active ({assignedCases.filter(c => c.status !== 'SOLVED' && c.status !== 'AWAITING GOVERNMENT VERIFICATION').length})
                </button>
                <button
                  onClick={() => setStatusFilter('SOLVED')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'SOLVED' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Solved ({assignedCases.filter(c => c.status === 'SOLVED').length})
                </button>
              </div>
            </div>

            {/* List of Cases */}
            <div className="space-y-2.5 max-h-[72vh] overflow-y-auto pr-1">
              {filteredAssignedCases.length > 0 ? (
                filteredAssignedCases.map((c) => {
                  const isSelected = c.id === selectedCaseId;
                  const isDone = c.status === 'SOLVED';
                  const isWaitingVerify = c.status === 'AWAITING GOVERNMENT VERIFICATION' || c.status === 'AWAITING_VERIFICATION';

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-200'
                          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-black text-blue-700">{c.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isDone 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : isWaitingVerify
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isDone ? '✓ Solved' : isWaitingVerify ? 'Waiting Verification' : `${c.progress || 50}%`}
                        </span>
                      </div>

                      <h3 className="font-bold text-xs text-slate-900 line-clamp-1 leading-snug">
                        {c.title}
                      </h3>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span className="truncate max-w-[140px]">{c.location?.address || 'City Ward'}</span>
                        </span>
                        <span className="font-mono text-slate-400">{c.createdDate?.slice(0, 10) || 'Recent'}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No complaints matching filter</p>
                  <p className="text-[11px] text-slate-400">When the Government Command Center assigns complaints to your badge, they will appear here.</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL: STEP-BY-STEP WORK UPDATE FORM (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeCase ? (
              <>
                {/* 1. Active Case Summary Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
                  
                  {/* Top Bar: Case ID + Citizen Status info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {activeCase.id}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {activeCase.category}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                        {activeCase.title}
                      </h2>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Tracking Status</span>
                      <div className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-lg mt-0.5">
                        {activeCase.status === 'SOLVED' ? '✅ Resolved' : activeCase.status === 'AWAITING GOVERNMENT VERIFICATION' ? '⏳ Under Review (Gov Verification)' : '🔄 Processing'}
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Contact</span>
                      <p className="font-bold text-slate-800 mt-0.5">{activeCase.citizenName || 'Rahul Sharma'}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{activeCase.citizenPhone || '+91 98230 44120'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Incident Location</span>
                      <p className="font-bold text-slate-800 mt-0.5">{activeCase.location?.colony || activeCase.location?.ward || 'Sector 4'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{activeCase.location?.address || 'Main Road Junction'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Government SLA & Risk</span>
                      <p className="font-bold text-slate-800 mt-0.5">
                        Risk: <span className="text-red-700 font-extrabold">{activeCase.finalGovernmentRisk || activeCase.riskLevel || 'High'}</span>
                      </p>
                      <p className="text-[11px] text-blue-700 font-bold">
                        Target: {activeCase.expectedCompletionDate || 'Within 48h'}
                      </p>
                    </div>
                  </div>

                  {/* Description & Citizen Image */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                    <div className="sm:col-span-3 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Incident Report</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white p-3 rounded-xl border border-slate-200">
                        {activeCase.description || 'Citizen reported civic issue requiring immediate municipal attention.'}
                      </p>
                    </div>

                    <div className="sm:col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Photo</span>
                      <div className="h-20 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                        <img
                          src={activeCase.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=400&q=80'}
                          alt="Citizen evidence"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. MULTI-STEP WORK UPDATE FORM WIZARD */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                  
                  {/* Stepper Header */}
                  <div className="space-y-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900">Officer Work Update Stepper</h3>
                          <p className="text-[11px] text-slate-500">Step {currentStep} of 4 • Complete each step to update progress</p>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        Case #{activeCase.id}
                      </span>
                    </div>

                    {/* Stepper Visual Bar: ✓ Step 1 → ✓ Step 2 → ● Step 3 → Step 4 */}
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {stepsConfig.map((s) => {
                        const isDone = currentStep > s.num;
                        const isCurrent = currentStep === s.num;

                        return (
                          <button
                            key={s.num}
                            type="button"
                            onClick={() => {
                              // Allow jumping back to previous completed steps
                              if (s.num < currentStep) {
                                setCurrentStep(s.num);
                                setFieldErrors({});
                              }
                            }}
                            disabled={s.num > currentStep}
                            className={`p-2.5 rounded-2xl border text-left transition-all ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 cursor-pointer hover:bg-emerald-100'
                                : isCurrent
                                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200 text-blue-950 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}>
                                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                              </span>
                              <span className="text-[11px] font-black truncate">{s.title}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate hidden sm:block">{s.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* General Notification Messages */}
                  {submissionErrorMsg && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold">Validation Alert</p>
                        <p className="text-rose-700 font-medium mt-0.5">{submissionErrorMsg}</p>
                      </div>
                    </div>
                  )}

                  {submissionSuccessMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-start gap-2.5 animate-in fade-in">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black text-emerald-950 text-sm">Update Saved Successfully</p>
                        <p className="text-emerald-800 font-medium mt-1">{submissionSuccessMsg}</p>
                      </div>
                    </div>
                  )}

                  {/* Form Container */}
                  <form onSubmit={handleSubmitUpdate} className="space-y-6">

                    {/* ================= STEP 1: STATUS & PROGRESS ================= */}
                    {currentStep === 1 && (
                      <div className="space-y-5 animate-in fade-in duration-200">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                            <span>1. Current Field Work Status <span className="text-red-500">*</span></span>
                            <span className="text-[10px] text-slate-400 font-normal">Select status to reflect current squad stage</span>
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            
                            {/* In Progress */}
                            <button
                              type="button"
                              onClick={() => {
                                setWorkStatus('IN_PROGRESS');
                                if (progressPercentage >= 100) setProgressPercentage(75);
                                if (fieldErrors.workStatus) setFieldErrors(prev => ({ ...prev, workStatus: '' }));
                              }}
                              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                                workStatus === 'IN_PROGRESS'
                                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300 shadow-xs text-blue-900'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                workStatus === 'IN_PROGRESS' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                              }`}>
                                <Clock className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-xs">In Progress</div>
                                <div className="text-[10px] text-slate-500">Squad actively working</div>
                              </div>
                            </button>

                            {/* Blocked / Delayed */}
                            <button
                              type="button"
                              onClick={() => {
                                setWorkStatus('BLOCKED');
                                if (fieldErrors.workStatus) setFieldErrors(prev => ({ ...prev, workStatus: '' }));
                              }}
                              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                                workStatus === 'BLOCKED'
                                  ? 'bg-red-50 border-red-500 ring-2 ring-red-300 shadow-xs text-red-900'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                workStatus === 'BLOCKED' ? 'bg-red-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                              }`}>
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-xs">Blocked / Delayed</div>
                                <div className="text-[10px] text-slate-500">Resource / weather hurdle</div>
                              </div>
                            </button>

                            {/* Work Completed */}
                            <button
                              type="button"
                              onClick={() => {
                                setWorkStatus('WORK_COMPLETED');
                                setProgressPercentage(100);
                                if (fieldErrors.workStatus) setFieldErrors(prev => ({ ...prev, workStatus: '' }));
                              }}
                              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                                workStatus === 'WORK_COMPLETED'
                                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 shadow-xs text-emerald-900'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                workStatus === 'WORK_COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                              }`}>
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-xs">Work Completed</div>
                                <div className="text-[10px] text-slate-500">Ready for Gov Approval</div>
                              </div>
                            </button>

                          </div>

                          {fieldErrors.workStatus && (
                            <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.workStatus}</p>
                          )}
                        </div>

                        {/* Progress Slider */}
                        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <div className="flex justify-between items-center text-xs">
                            <label className="font-bold text-slate-800">
                              2. Progress Percentage: <span className="font-mono text-blue-700 font-extrabold text-sm">{progressPercentage}%</span>
                            </label>
                            <span className="text-[11px] font-bold text-slate-500">
                              {progressPercentage === 100 ? '100% (Repairs Concluded)' : `${progressPercentage}% Completed`}
                            </span>
                          </div>

                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={progressPercentage}
                            onChange={(e) => {
                              setProgressPercentage(parseInt(e.target.value));
                              if (fieldErrors.progressPercentage) setFieldErrors(prev => ({ ...prev, progressPercentage: '' }));
                            }}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />

                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>0% (Dispatched)</span>
                            <span>25%</span>
                            <span>50% (On-Site)</span>
                            <span>75%</span>
                            <span>100% (Finished)</span>
                          </div>

                          {fieldErrors.progressPercentage && (
                            <p className="text-[11px] text-rose-600 font-bold mt-1">{fieldErrors.progressPercentage}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ================= STEP 2: FIELD ACTIONS ================= */}
                    {currentStep === 2 && (
                      <div className="space-y-5 animate-in fade-in duration-200">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                            <span>3. Work Done / Current Action <span className="text-red-500">*</span></span>
                            <span className="text-[10px] text-slate-400 font-normal">Required field inspection details</span>
                          </label>
                          <textarea
                            rows={4}
                            value={workDescription}
                            onChange={(e) => {
                              setWorkDescription(e.target.value);
                              if (fieldErrors.workDescription) {
                                setFieldErrors(prev => ({ ...prev, workDescription: '' }));
                              }
                            }}
                            placeholder="Detail the actions taken by your squad on site..."
                            className={`w-full p-3.5 bg-white rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden transition-all ${
                              fieldErrors.workDescription
                                ? 'border-2 border-rose-500 ring-2 ring-rose-100'
                                : 'border border-slate-200 focus:ring-2 focus:ring-blue-600'
                            }`}
                          />
                          {fieldErrors.workDescription && (
                            <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {fieldErrors.workDescription}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800">
                            4. Next Action Planned
                          </label>
                          <textarea
                            rows={3}
                            value={nextAction}
                            onChange={(e) => setNextAction(e.target.value)}
                            placeholder="What is the next scheduled step or squad check?"
                            className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                          />
                        </div>

                        {/* If Blocked: Bottleneck Reason Input */}
                        {workStatus === 'BLOCKED' && (
                          <div className="space-y-1.5 bg-rose-50 p-4 rounded-2xl border border-rose-200 animate-in fade-in duration-200">
                            <label className="text-xs font-bold text-rose-900 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                                <span>Bottleneck / Delay Reason <span className="text-red-500">*</span></span>
                              </span>
                              <span className="text-[10px] text-rose-700">Required because status is Blocked</span>
                            </label>
                            <input
                              type="text"
                              value={issuesEncountered}
                              onChange={(e) => {
                                setIssuesEncountered(e.target.value);
                                if (fieldErrors.issuesEncountered) {
                                  setFieldErrors(prev => ({ ...prev, issuesEncountered: '' }));
                                }
                              }}
                              placeholder="Specify delay reason (e.g., Heavy rainfall, awaiting road roller, traffic diversion approval)..."
                              className={`w-full p-3 bg-white rounded-xl text-xs text-rose-950 placeholder-rose-400 focus:outline-hidden font-medium ${
                                fieldErrors.issuesEncountered
                                  ? 'border-2 border-rose-500 ring-2 ring-rose-200'
                                  : 'border border-rose-300 focus:ring-2 focus:ring-rose-500'
                              }`}
                            />
                            {fieldErrors.issuesEncountered && (
                              <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {fieldErrors.issuesEncountered}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ================= STEP 3: RESOURCES & SCHEDULE ================= */}
                    {currentStep === 3 && (
                      <div className="space-y-5 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800">
                              5. Equipment & Materials Used
                            </label>
                            <input
                              type="text"
                              value={materialsUsed}
                              onChange={(e) => setMaterialsUsed(e.target.value)}
                              placeholder="e.g. 2 tons asphalt mix, JCB excavator #3, replacement pipe valve"
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                            />
                            <p className="text-[10px] text-slate-400">List materials deployed to the site</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800">
                              6. Estimated Completion Time <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={estimatedCompletion}
                              onChange={(e) => {
                                setEstimatedCompletion(e.target.value);
                                if (fieldErrors.estimatedCompletion) {
                                  setFieldErrors(prev => ({ ...prev, estimatedCompletion: '' }));
                                }
                              }}
                              placeholder="e.g. Tomorrow 4:00 PM, 24 Hours, Within SLA"
                              className={`w-full p-3 bg-white rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden ${
                                fieldErrors.estimatedCompletion
                                  ? 'border-2 border-rose-500 ring-2 ring-rose-100'
                                  : 'border border-slate-200 focus:ring-2 focus:ring-blue-600'
                              }`}
                            />
                            {fieldErrors.estimatedCompletion && (
                              <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {fieldErrors.estimatedCompletion}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Summary of what has been filled so far */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Summary of Entered Information (Saved)
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-500">Status:</span> <strong>{workStatus}</strong> ({progressPercentage}%)
                            </div>
                            <div>
                              <span className="text-slate-500">ETA:</span> <strong>{estimatedCompletion || 'Not set'}</strong>
                            </div>
                            <div className="col-span-2 text-slate-700">
                              <span className="text-slate-500">Action:</span> {workDescription}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ================= STEP 4: PROOF & FINAL SUBMISSION ================= */}
                    {currentStep === 4 && (
                      <div className="space-y-5 animate-in fade-in duration-200">
                        {/* Proof Photo Upload / URL */}
                        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Camera className="w-4 h-4 text-blue-600" />
                              <span>7. Work Proof / After Photo URL</span>
                            </label>
                            <span className="text-[11px] text-slate-400">For Government resolution verification</span>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="url"
                              value={proofImageUrl}
                              onChange={(e) => setProofImageUrl(e.target.value)}
                              placeholder="Paste repair photo image URL or upload photo below..."
                              className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                            />
                            
                            <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0">
                              <Upload className="w-4 h-4" />
                              <span>Take / Upload Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target?.result) {
                                        setProofImageUrl(event.target.result as string);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {/* Quick Preset Photo Selector for Fast Demo */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[10px] font-bold text-slate-400">Preset Demo Proofs:</span>
                            <button
                              type="button"
                              onClick={() => setProofImageUrl('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80')}
                              className="text-[10px] font-bold text-blue-700 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer"
                            >
                              Repaired Road
                            </button>
                            <button
                              type="button"
                              onClick={() => setProofImageUrl('https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80')}
                              className="text-[10px] font-bold text-blue-700 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer"
                            >
                              Cleaned Street
                            </button>
                            <button
                              type="button"
                              onClick={() => setProofImageUrl('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80')}
                              className="text-[10px] font-bold text-blue-700 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer"
                            >
                              Repaired Pipeline
                            </button>
                          </div>

                          {proofImageUrl && (
                            <div className="mt-2 h-32 w-48 rounded-xl overflow-hidden border border-slate-300 relative shadow-sm">
                              <img 
                                src={proofImageUrl} 
                                alt="Proof preview" 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover" 
                              />
                              <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                                Proof Ready
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Summary Card Before Submission */}
                        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-blue-950 uppercase tracking-wider text-[11px]">
                              Final Update Review
                            </span>
                            <span className="font-mono text-[10px] font-bold text-blue-700">Case #{activeCase.id}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div><span className="text-slate-500">Status:</span> <strong>{workStatus}</strong></div>
                            <div><span className="text-slate-500">Progress:</span> <strong>{progressPercentage}%</strong></div>
                            <div><span className="text-slate-500">ETA:</span> <strong>{estimatedCompletion}</strong></div>
                            <div><span className="text-slate-500">Materials:</span> <strong>{materialsUsed || 'Standard Squad Kit'}</strong></div>
                            <div className="col-span-2"><span className="text-slate-500">Action:</span> <span className="font-medium text-slate-800">{workDescription}</span></div>
                          </div>
                        </div>

                        {/* MANDATORY GOVERNMENT APPROVAL WORKFLOW BANNER */}
                        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                          <div className="flex items-center gap-2 font-black text-amber-900">
                            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>OFFICIAL GOVERNMENT VERIFICATION RULE</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-amber-800">
                            Submitting this form sends your work update and proof to the <strong>Government Admin Command Center</strong>. The citizen tracking status will only change to <strong>RESOLVED</strong> after official Government review and approval.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Stepper Navigation Buttons (Next / Back / Submit) */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                      
                      {/* Back Button */}
                      {currentStep > 1 ? (
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          disabled={isSubmitting}
                          className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>← Back to Step {currentStep - 1}</span>
                        </button>
                      ) : (
                        <div />
                      )}

                      {/* Next or Final Submit Button */}
                      {currentStep < 4 ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer ml-auto"
                        >
                          <span>Next: {stepsConfig[currentStep].title} →</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ml-auto"
                        >
                          {isSubmitting ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Submitting Update to Government System...
                            </span>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>SUBMIT WORK UPDATE FOR GOVERNMENT REVIEW</span>
                            </>
                          )}
                        </button>
                      )}

                    </div>

                  </form>

                </div>

                {/* 3. History of Submitted Updates for this Case */}
                {caseUpdates.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Previous Work Updates for Case #{activeCase.id}</span>
                    </h3>

                    <div className="space-y-3">
                      {caseUpdates.map((upd) => (
                        <div key={upd.update_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{upd.work_description}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              upd.government_review_status === 'APPROVED' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : upd.government_review_status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              Gov Status: {upd.government_review_status}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center justify-between font-mono">
                            <span>Progress: {upd.progress_percentage}% • {upd.work_status}</span>
                            <span>{new Date(upd.submitted_at).toLocaleString()}</span>
                          </div>

                          {upd.government_feedback && (
                            <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                              <strong>Government Feedback:</strong> {upd.government_feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center space-y-4">
                <HardHat className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-800">No Assigned Complaint Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Please select an assigned complaint from the left panel to load the work update form.
                </p>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-200 mt-8">
        CivicMind Officer Field Interface • Connected to Municipal Central Registry
      </footer>

    </div>
  );
};
