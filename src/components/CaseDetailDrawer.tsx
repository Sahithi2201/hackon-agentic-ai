import React, { useState, useEffect } from 'react';
import { 
  CivicCase, 
  RiskLevel, 
  PriorityLevel, 
  CaseStatus, 
  CivicDepartmentInfo,
  DepartmentOfficer 
} from '../types';
import { 
  CIVIC_DEPARTMENTS_CONFIG, 
  getDepartmentSuggestionByCategory,
  confirmAndAssignOfficerInDb,
  acceptComplaintInDb, 
  rejectComplaintInDb, 
  requestMoreInfoInDb, 
  addGovernmentNoteInDb,
  officerAcceptAssignmentInDb,
  officerUpdateProgressInDb,
  officerSubmitResolutionReportInDb,
  governmentVerifyAndSolveInDb,
  executeAiAutonomousTriage
} from '../services/complaintsService';
import { CivicMindAICaseAnalysisCard } from './CivicMindAICaseAnalysisCard';
import { getCurrentUser } from '../services/authService';
import { 
  X, 
  MapPin, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  User, 
  FileText, 
  Check, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Activity, 
  Send, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight,
  UserCheck,
  Calendar,
  Layers,
  Camera,
  CheckCheck,
  RotateCcw,
  Zap,
  Info,
  ExternalLink
} from 'lucide-react';

interface CaseDetailDrawerProps {
  caseItem: CivicCase | null;
  allCases?: CivicCase[];
  isOpen: boolean;
  onClose: () => void;
  onOpenFullCase?: (caseId: string) => void;
  onEscalate?: (caseItem: CivicCase) => void;
  onResolve?: (caseId: string) => void;
}

export const CaseDetailDrawer: React.FC<CaseDetailDrawerProps> = ({
  caseItem,
  allCases = [],
  isOpen,
  onClose,
  onOpenFullCase,
  onEscalate,
  onResolve
}) => {
  const currentUser = getCurrentUser();

  // Drawer top tabs
  const [activeTab, setActiveTab] = useState<'assignment' | 'overview' | 'officer_progress' | 'timeline' | 'notes'>('assignment');
  
  // Step indicator in Assignment tab (1 to 6)
  const [workflowStep, setWorkflowStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [previewPhotoModal, setPreviewPhotoModal] = useState<string | null>(null);

  // Workflow Form State
  const [decision, setDecision] = useState<'ACCEPT' | 'REJECT' | 'REQUEST_INFO' | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [queryInput, setQueryInput] = useState<string>('');

  // Step 2: Risk
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>('HIGH');
  const [riskReason, setRiskReason] = useState<string>('');

  // Step 3: Department
  const [selectedDeptInfo, setSelectedDeptInfo] = useState<CivicDepartmentInfo>(CIVIC_DEPARTMENTS_CONFIG[0]);

  // Step 4: Officer
  const [selectedOfficer, setSelectedOfficer] = useState<DepartmentOfficer | null>(null);

  // Officer Progress simulation inside drawer
  const [officerProgressVal, setOfficerProgressVal] = useState<number>(0);
  const [officerCurrentAction, setOfficerCurrentAction] = useState<string>('');
  const [officerNextAction, setOfficerNextAction] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [blockedReasonInput, setBlockedReasonInput] = useState<string>('');
  
  // Resolution report state
  const [resolutionSummary, setResolutionSummary] = useState<string>('Repairs completed and site cleaned.');
  const [resolutionAction, setResolutionAction] = useState<string>('Debris cleared, new asphalt laid and sealed.');
  const [govVerificationNotes, setGovVerificationNotes] = useState<string>('Inspected on-site photo. Resolution satisfactory.');

  // Note text
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [noteVisibility, setNoteVisibility] = useState<'INTERNAL' | 'PUBLIC'>('INTERNAL');

  // Initialize values when caseItem changes
  useEffect(() => {
    if (caseItem) {
      // Suggest department based on category & title
      const suggestedDept = getDepartmentSuggestionByCategory(
        caseItem.category, 
        caseItem.title, 
        caseItem.description
      );
      
      const foundDept = CIVIC_DEPARTMENTS_CONFIG.find(d => 
        d.name.toLowerCase() === (caseItem.assignedDepartment || '').toLowerCase() ||
        d.key === (caseItem.assignedDepartmentKey || '')
      ) || suggestedDept;

      setSelectedDeptInfo(foundDept);

      // Find officer if assigned
      if (caseItem.assignedOfficerId) {
        const foundOff = foundDept.officers.find(o => o.id === caseItem.assignedOfficerId) || foundDept.officers[0];
        setSelectedOfficer(foundOff || null);
      } else {
        setSelectedOfficer(foundDept.officers[0] || null);
      }

      // Risk
      const initialRisk = caseItem.finalGovernmentRisk && caseItem.finalGovernmentRisk !== 'NOT YET ASSESSED'
        ? caseItem.finalGovernmentRisk
        : (caseItem.systemRecommendedRisk || 'HIGH');
      setSelectedRisk(initialRisk);
      setRiskReason(caseItem.riskReason || caseItem.systemRecommendedReason || 'Problem duration and public area proximity require expedited attention.');

      // Decision & Step
      if (caseItem.status === 'SUBMITTED' || caseItem.status === 'UNDER_REVIEW') {
        setDecision(null);
        setWorkflowStep(1);
      } else if (caseItem.status === 'ACCEPTED' || caseItem.status === 'RISK_ASSESSED') {
        setDecision('ACCEPT');
        setWorkflowStep(3);
      } else if (caseItem.status === 'DEPARTMENT_ASSIGNED' || caseItem.status === 'OFFICER_ASSIGNED') {
        setDecision('ACCEPT');
        setWorkflowStep(5);
      } else {
        setDecision('ACCEPT');
        setWorkflowStep(6);
      }

      setOfficerProgressVal(caseItem.progress || 0);
      setOfficerCurrentAction(caseItem.currentAction || '');
      setOfficerNextAction(caseItem.nextAction || '');
      setIsBlocked(Boolean(caseItem.isBlocked));
      setBlockedReasonInput(caseItem.blockedReason || '');
    }
  }, [caseItem]);

  // When selected department changes, pick its default officer
  const handleDepartmentChange = (dept: CivicDepartmentInfo) => {
    setSelectedDeptInfo(dept);
    setSelectedOfficer(dept.officers[0] || null);
  };

  if (!isOpen || !caseItem) return null;

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // 1. Accept Complaint & move to step 2
  const handleAcceptAndProceed = async () => {
    setIsProcessing(true);
    try {
      await acceptComplaintInDb(caseItem.id, currentUser.full_name, 'Accepted for municipal departmental assignment.');
      setDecision('ACCEPT');
      setWorkflowStep(2);
      showFeedback('Complaint accepted. Please assess Risk Level.');
    } catch (e: any) {
      showFeedback(e.message || 'Failed to accept complaint', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Reject Complaint
  const handleRejectComplaint = async () => {
    const cleanReason = rejectReason.trim();
    if (!cleanReason) {
      setRejectError('Please enter a rejection reason.');
      showFeedback('Please enter a rejection reason.', 'error');
      return;
    }

    setIsProcessing(true);
    setRejectError(null);

    try {
      await rejectComplaintInDb(caseItem.id, cleanReason, currentUser.full_name || 'Municipal Officer');
      setShowRejectModal(false);
      setRejectReason('');
      setRejectError(null);
      setDecision('REJECT');
      showFeedback('Complaint successfully rejected and closed in database.', 'success');
      // Smoothly close the drawer after brief feedback
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (e: any) {
      console.error('Failed to reject complaint:', e);
      const errMsg = e?.message || 'Failed to reject complaint. Please try again.';
      setRejectError(errMsg);
      showFeedback(errMsg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setRejectError(null);
  };

  // 3. Request More Info
  const handleRequestInfo = async () => {
    if (!queryInput.trim()) {
      showFeedback('Please specify what details are needed from the citizen.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      await requestMoreInfoInDb(caseItem.id, queryInput.trim(), currentUser.full_name);
      setQueryInput('');
      showFeedback('Clarification request dispatched to citizen via SMS/Portal.');
    } catch (e: any) {
      showFeedback(e.message || 'Failed to send request', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. CONFIRM & ASSIGN OFFICER (Final Step 6)
  const handleConfirmAndAssignOfficer = async () => {
    if (!selectedOfficer) {
      showFeedback('Please select an officer from the department.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const updated = await confirmAndAssignOfficerInDb({
        complaintId: caseItem.id,
        riskLevel: selectedRisk,
        riskReason: riskReason,
        departmentName: selectedDeptInfo.name,
        departmentKey: selectedDeptInfo.key,
        officerId: selectedOfficer.id,
        officerName: selectedOfficer.name,
        officerPhone: selectedOfficer.phone,
        assignedBy: currentUser.full_name || 'Government Admin'
      });
      showFeedback(`Successfully assigned ${caseItem.id} to ${selectedOfficer.name} (${selectedDeptInfo.name})!`);
      setWorkflowStep(6);
    } catch (e: any) {
      showFeedback(e.message || 'Failed to assign officer', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Officer Acceptance
  const handleOfficerAccept = async () => {
    if (!selectedOfficer) return;
    setIsProcessing(true);
    try {
      await officerAcceptAssignmentInDb(caseItem.id, selectedOfficer.name);
      showFeedback(`${selectedOfficer.name} accepted the assignment! Work moved to In-Progress.`);
    } catch (e: any) {
      showFeedback(e.message || 'Failed to accept assignment', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Officer Progress Update
  const handleOfficerUpdateProgress = async () => {
    if (!selectedOfficer) return;
    setIsProcessing(true);
    try {
      await officerUpdateProgressInDb({
        complaintId: caseItem.id,
        progress: officerProgressVal,
        currentAction: officerCurrentAction || `Work execution at ${officerProgressVal}%`,
        nextAction: officerNextAction || 'Continue field repairs',
        isBlocked,
        blockedReason: blockedReasonInput,
        officerName: selectedOfficer.name
      });
      showFeedback('Field progress saved to database successfully.');
    } catch (e: any) {
      showFeedback(e.message || 'Failed to update progress', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Officer Submit Resolution Report
  const handleOfficerSubmitReport = async () => {
    if (!selectedOfficer) return;
    setIsProcessing(true);
    try {
      await officerSubmitResolutionReportInDb({
        complaintId: caseItem.id,
        summary: resolutionSummary,
        actionTaken: resolutionAction,
        officerName: selectedOfficer.name
      });
      showFeedback('Resolution report submitted! Awaiting Government Verification.');
    } catch (e: any) {
      showFeedback(e.message || 'Failed to submit report', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Government Verify & Mark Solved
  const handleGovVerifyAndSolve = async () => {
    setIsProcessing(true);
    try {
      await governmentVerifyAndSolveInDb({
        complaintId: caseItem.id,
        verificationNotes: govVerificationNotes,
        verifierName: currentUser.full_name || 'Municipal Officer'
      });
      showFeedback('Case verified and officially marked SOLVED! Citizen SMS sent.');
    } catch (e: any) {
      showFeedback(e.message || 'Failed to mark solved', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // AI Autonomous Auto-Pilot: Execute entire workflow automatically
  const handleExecuteAiAutoPilot = async () => {
    setIsProcessing(true);
    try {
      const updated = await executeAiAutonomousTriage(caseItem.id, allCases);
      showFeedback(`🤖 AI Auto-Pilot completed! Case validated, risk-assessed, and assigned to Officer ${updated.assignedOfficerName} (${updated.assignedDepartment}).`);
      setWorkflowStep(6);
      setDecision('ACCEPT');
    } catch (e: any) {
      showFeedback(e.message || 'Failed to run AI Auto-Pilot', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add Note
  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    setIsProcessing(true);
    try {
      await addGovernmentNoteInDb(caseItem.id, newNoteText.trim(), currentUser.full_name, noteVisibility);
      setNewNoteText('');
      showFeedback('Note recorded in official case audit trail.');
    } catch (e: any) {
      showFeedback(e.message || 'Failed to add note', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Review' },
    { num: 2, label: 'Decision' },
    { num: 3, label: 'Risk Level' },
    { num: 4, label: 'Department' },
    { num: 5, label: 'Officer' },
    { num: 6, label: 'Confirm' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-slate-900">Reject Citizen Complaint</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Please enter the official reason for rejecting complaint <span className="font-bold text-slate-900">{caseItem.id}</span>. This reason will be recorded in the audit log.
            </p>

            {rejectError && (
              <div className="p-3 mb-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rejectError}</span>
              </div>
            )}

            <textarea
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (rejectError) setRejectError(null);
              }}
              placeholder="e.g. Private property boundary, duplicate submission, or outside municipal jurisdiction..."
              rows={3}
              className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-red-500 mb-4 text-slate-800"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelReject}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectComplaint}
                disabled={isProcessing || !rejectReason.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl cursor-pointer flex items-center gap-2"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Drawer Container */}
      <div className="w-full max-w-3xl lg:max-w-4xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
        
        {/* TOP HEADER */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-cyan-300">{caseItem.id}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  caseItem.status === 'SOLVED' || caseItem.status === 'RESOLVED' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : caseItem.status === 'AWAITING GOVERNMENT VERIFICATION' || caseItem.status === 'AWAITING_VERIFICATION'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : caseItem.status === 'OFFICER_ASSIGNED' || caseItem.status === 'WORK_ACCEPTED' || caseItem.status === 'IN_PROGRESS'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {caseItem.status.replace(/_/g, ' ')}
                </span>
                {caseItem.problemDuration && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    ⏱️ {caseItem.problemDuration}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white truncate max-w-lg mt-0.5">{caseItem.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {feedbackMsg && (
          <div className={`p-3 text-xs font-semibold flex items-center justify-between shrink-0 ${
            feedbackMsg.type === 'error' ? 'bg-red-50 text-red-700 border-b border-red-200' : 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* NAVIGATION SUB-TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-5 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('assignment')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'assignment'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Assignment Workflow</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-800">
              Step {workflowStep}/6
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Incident & Citizen Details</span>
          </button>

          <button
            onClick={() => setActiveTab('officer_progress')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'officer_progress'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Officer Execution & Verification</span>
            {caseItem.status === 'AWAITING GOVERNMENT VERIFICATION' && (
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit Trail ({caseItem.timeline?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Government Notes ({caseItem.notes?.length || 0})</span>
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ============================================================ */}
          {/* TAB 1: ASSIGNMENT WORKFLOW (PRIMARY 6-STEP GOVERNMENT ENGINE) */}
          {/* ============================================================ */}
          {activeTab === 'assignment' && (
            <div className="space-y-6">

              {/* AI CONFLICT ALERT (IF DETECTED) */}
              {caseItem.aiConflictDetected && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-900 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>AI Discrepancy & Conflict Detected</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    {caseItem.aiConflictReason || 'Officer submitted work update inconsistent with complaint parameters or missing required evidence.'}
                  </p>
                  <div className="text-[11px] font-bold text-amber-700 bg-amber-100/70 p-2 rounded-xl border border-amber-300 inline-block">
                    Status: Administrative Audit Required Before Resolution
                  </div>
                </div>
              )}

              {/* AI AUTO-PILOT ONE-CLICK BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-300">CivicMind AI Auto-Pilot</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                      Autonomous
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-lg">
                    Execute complaint validation, risk scoring, department matching, and officer auto-dispatch in 1-click without manual multi-step clicking.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteAiAutoPilot}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 active:scale-98"
                >
                  <Zap className="w-4 h-4" />
                  <span>Run AI Auto-Pilot</span>
                </button>
              </div>

              {/* STEP PROGRESS INDICATOR */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Government Complaint Assignment Workflow
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {stepsList.map((step) => {
                    const isCompleted = workflowStep > step.num;
                    const isCurrent = workflowStep === step.num;
                    return (
                      <button
                        key={step.num}
                        onClick={() => setWorkflowStep(step.num)}
                        className={`text-left p-2 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : isCompleted
                            ? 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[10px]">STEP {step.num}</span>
                          {isCompleted && <Check className="w-3.5 h-3.5 text-blue-700" />}
                        </div>
                        <div className="font-semibold truncate text-[11px]">
                          {step.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 1: REVIEW & INITIAL DECISION */}
              {workflowStep === 1 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 1 of 6</span>
                      <h3 className="text-lg font-extrabold text-slate-900">Review Citizen Complaint & Decision</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Submitted:</span>
                      <p className="text-xs font-semibold text-slate-800">
                        {caseItem.submittedAt ? new Date(caseItem.submittedAt).toLocaleString() : caseItem.createdDate}
                      </p>
                    </div>
                  </div>

                  {/* CIVICMIND AI INTELLIGENCE ASSISTANT */}
                  <CivicMindAICaseAnalysisCard
                    caseItem={caseItem}
                    allCases={allCases}
                    onAdoptDepartment={(dept) => {
                      setSelectedDeptInfo(dept);
                      setFeedbackMsg({ text: `AI Department "${dept.name}" adopted.`, type: 'success' });
                    }}
                    onAdoptOfficer={(off) => {
                      setSelectedOfficer(off);
                      setFeedbackMsg({ text: `AI Officer "${off.name}" selected.`, type: 'success' });
                    }}
                    onAdoptPriority={(risk, reason) => {
                      setSelectedRisk(risk);
                      setRiskReason(reason);
                      setFeedbackMsg({ text: `AI Priority "${risk}" adopted.`, type: 'success' });
                    }}
                    onApplyAllRecommendations={(dept, off, risk, reason) => {
                      setSelectedDeptInfo(dept);
                      setSelectedOfficer(off);
                      setSelectedRisk(risk);
                      setRiskReason(reason);
                      setDecision('ACCEPT');
                      setFeedbackMsg({ text: `All AI recommendations applied (${dept.name}, ${off.name}, ${risk}). Ready for officer review.`, type: 'success' });
                    }}
                  />

                  {/* Citizen & Location Snapshot */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-600" /> Citizen Details
                      </div>
                      <p className="text-sm font-bold text-slate-900">{caseItem.citizenName || 'Anonymous Citizen'}</p>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {caseItem.citizenPhone || '+91 98765 00000'}
                      </p>
                      {caseItem.citizenEmail && (
                        <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" /> {caseItem.citizenEmail}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">ID: {caseItem.citizenId || 'CIT-GUEST-01'}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-600" /> Incident Location
                      </div>
                      <p className="text-sm font-bold text-slate-900">{caseItem.location.colony || caseItem.location.area || 'Ward Location'}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{caseItem.location.address || `${caseItem.location.area}, ${caseItem.location.city}`}</p>
                      <p className="text-xs text-slate-500 mt-1">{caseItem.location.ward} • {caseItem.location.city || 'Hyderabad'}</p>
                      {caseItem.location.landmark && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 rounded-md px-2 py-0.5 mt-1.5 inline-block border border-amber-200/60">
                          Landmark: {caseItem.location.landmark}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Problem Description & Duration */}
                  <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint Content</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        Problem Duration: {caseItem.problemDuration || '1–3 Days'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{caseItem.title}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{caseItem.description}</p>
                  </div>

                  {/* CITIZEN INFORMATION REQUEST & RESPONSE HISTORY */}
                  {caseItem.informationRequests && caseItem.informationRequests.length > 0 && (
                    <div className="space-y-3">
                      {caseItem.informationRequests.map((req, idx) => {
                        const hasResponse = req.status === 'RESPONSE_SUBMITTED' && req.citizenResponse;
                        return (
                          <div 
                            key={req.id || idx}
                            className={`p-4 rounded-xl border space-y-2.5 ${
                              hasResponse ? 'bg-emerald-50/80 border-emerald-300' : 'bg-amber-50/80 border-amber-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                                hasResponse ? 'bg-emerald-200 text-emerald-950' : 'bg-amber-200 text-amber-950'
                              }`}>
                                {hasResponse ? '✓ Citizen Response Received' : '⚠ Clarification Awaiting Citizen'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : ''}
                              </span>
                            </div>

                            <div className="text-xs text-slate-700">
                              <span className="font-bold text-slate-900 block mb-0.5">Government Request ({req.requestedBy}):</span>
                              <p className="italic bg-white/90 p-2.5 rounded-lg border border-slate-200 text-slate-800">"{req.requestQuery}"</p>
                            </div>

                            {hasResponse && (
                              <div className="p-3.5 rounded-lg bg-white border border-emerald-200 space-y-2 text-xs">
                                <span className="font-black text-emerald-900 block text-[11px] uppercase tracking-wider">
                                  Citizen Submitted Response:
                                </span>
                                <p className="text-slate-900 font-semibold leading-relaxed">
                                  "{req.citizenResponse?.responseText}"
                                </p>
                                {req.citizenResponse?.photoUrl && (
                                  <div className="pt-1 flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                                      <img 
                                        src={req.citizenResponse.photoUrl} 
                                        alt="Citizen evidence" 
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => setPreviewPhotoModal(req.citizenResponse!.photoUrl!)}
                                      />
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[11px] font-bold text-slate-700 block">Citizen Attached Photo Evidence</span>
                                      <button
                                        type="button"
                                        onClick={() => setPreviewPhotoModal(req.citizenResponse!.photoUrl!)}
                                        className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <span>View Attached Photo</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-100 flex items-center justify-between">
                                  <span>Submitted by: <strong>{req.citizenResponse?.submittedBy || caseItem.citizenName}</strong></span>
                                  <span>{req.citizenResponse?.submittedAt ? new Date(req.citizenResponse.submittedAt).toLocaleString() : ''}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* DECISION ACTION BUTTONS */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Initial Action:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* ACCEPT */}
                      <button
                        type="button"
                        onClick={handleAcceptAndProceed}
                        disabled={isProcessing}
                        className="p-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-2 shadow-sm transition-transform active:scale-98"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>ACCEPT COMPLAINT</span>
                        <span className="text-[10px] font-normal text-emerald-100">Proceed to Risk & Dept</span>
                      </button>

                      {/* REJECT */}
                      <button
                        type="button"
                        onClick={() => setShowRejectModal(true)}
                        disabled={isProcessing}
                        className="p-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-colors"
                      >
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span>REJECT COMPLAINT</span>
                        <span className="text-[10px] font-normal text-red-600/80">Close with official reason</span>
                      </button>

                      {/* REQUEST INFO */}
                      <button
                        type="button"
                        onClick={() => setDecision('REQUEST_INFO')}
                        className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-colors"
                      >
                        <Info className="w-5 h-5 text-blue-600" />
                        <span>REQUEST MORE INFO</span>
                        <span className="text-[10px] font-normal text-blue-600/80">Query citizen for clarity</span>
                      </button>
                    </div>

                    {/* Query input if requesting info */}
                    {decision === 'REQUEST_INFO' && (
                      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 mt-4">
                        <label className="text-xs font-bold text-blue-900 block">
                          Question / Details required from citizen:
                        </label>
                        <textarea
                          value={queryInput}
                          onChange={(e) => setQueryInput(e.target.value)}
                          placeholder="e.g. Please provide exact house number or upload clear photos of the leaking main pipe..."
                          rows={2}
                          className="w-full text-xs bg-white border border-blue-300 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleRequestInfo}
                            disabled={isProcessing || !queryInput.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                          >
                            Send Clarification Query
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: ASSESS & CONFIRM RISK LEVEL */}
              {workflowStep === 2 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 2 of 6</span>
                      <h3 className="text-lg font-extrabold text-slate-900">Assess & Assign Final Risk Level</h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      ✓ Complaint Accepted
                    </span>
                  </div>

                  {/* AI & System Recommendation Box */}
                  <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" /> SYSTEM RISK RECOMMENDATION
                      </span>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                        {caseItem.systemRecommendedRisk || 'HIGH'}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-950 leading-relaxed font-medium">
                      {caseItem.systemRecommendedReason || 'Problem duration (>2 weeks) in high-density residential zone increases public impact.'}
                    </p>
                    {caseItem.riskFactors && caseItem.riskFactors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {caseItem.riskFactors.map((f, i) => (
                          <span key={i} className="text-[10px] bg-white text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-200">
                            • {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Risk Level Cards */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                      Select Government Risk Evaluation:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      
                      {/* CRITICAL */}
                      <button
                        type="button"
                        onClick={() => setSelectedRisk('CRITICAL')}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          selectedRisk === 'CRITICAL'
                            ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-400'
                            : 'bg-white hover:bg-red-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            selectedRisk === 'CRITICAL' ? 'bg-red-800 text-white' : 'bg-red-100 text-red-700'
                          }`}>
                            P1 SLA: 12h
                          </span>
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div className="font-extrabold text-sm">CRITICAL</div>
                        <div className={`text-[10px] mt-1 ${selectedRisk === 'CRITICAL' ? 'text-red-100' : 'text-slate-500'}`}>
                          Immediate safety or public hazard
                        </div>
                      </button>

                      {/* HIGH */}
                      <button
                        type="button"
                        onClick={() => setSelectedRisk('HIGH')}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          selectedRisk === 'HIGH'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400'
                            : 'bg-white hover:bg-amber-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            selectedRisk === 'HIGH' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-700'
                          }`}>
                            P2 SLA: 24h
                          </span>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="font-extrabold text-sm">HIGH</div>
                        <div className={`text-[10px] mt-1 ${selectedRisk === 'HIGH' ? 'text-amber-100' : 'text-slate-500'}`}>
                          Heavy public disruption
                        </div>
                      </button>

                      {/* MEDIUM */}
                      <button
                        type="button"
                        onClick={() => setSelectedRisk('MEDIUM')}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          selectedRisk === 'MEDIUM'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400'
                            : 'bg-white hover:bg-blue-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            selectedRisk === 'MEDIUM' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-700'
                          }`}>
                            P3 SLA: 48h
                          </span>
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="font-extrabold text-sm">MEDIUM</div>
                        <div className={`text-[10px] mt-1 ${selectedRisk === 'MEDIUM' ? 'text-blue-100' : 'text-slate-500'}`}>
                          Standard neighborhood repair
                        </div>
                      </button>

                      {/* LOW */}
                      <button
                        type="button"
                        onClick={() => setSelectedRisk('LOW')}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          selectedRisk === 'LOW'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400'
                            : 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            selectedRisk === 'LOW' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            P4 SLA: 72h
                          </span>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="font-extrabold text-sm">LOW</div>
                        <div className={`text-[10px] mt-1 ${selectedRisk === 'LOW' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Minor cosmetic or non-urgent
                        </div>
                      </button>

                    </div>
                  </div>

                  {/* Assessment Justification */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Official Risk Assessment Note:</label>
                    <textarea
                      value={riskReason}
                      onChange={(e) => setRiskReason(e.target.value)}
                      placeholder="Specify rationale for risk level..."
                      rows={2}
                      className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Navigation to Step 3 */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setWorkflowStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                    >
                      ← Back to Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkflowStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Proceed to Department Selection</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SELECT RESPONSIBLE DEPARTMENT */}
              {workflowStep === 3 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 3 of 6</span>
                      <h3 className="text-lg font-extrabold text-slate-900">Select Responsible Department</h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      Risk: {selectedRisk}
                    </span>
                  </div>

                  {/* System Department Suggestion */}
                  {(() => {
                    const suggestion = getDepartmentSuggestionByCategory(caseItem.category, caseItem.title, caseItem.description);
                    return (
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                              AI Suggested Department
                            </span>
                            <h4 className="text-sm font-bold text-emerald-950">{suggestion.name}</h4>
                            <p className="text-xs text-emerald-700">{suggestion.description}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDepartmentChange(suggestion)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shrink-0"
                        >
                          Confirm Suggested
                        </button>
                      </div>
                    );
                  })()}

                  {/* Official CivicMind Department List */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Choose From CivicMind Departments:
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {CIVIC_DEPARTMENTS_CONFIG.map((dept) => {
                        const isSelected = selectedDeptInfo.key === dept.key;
                        return (
                          <button
                            key={dept.key}
                            type="button"
                            onClick={() => handleDepartmentChange(dept)}
                            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-2 ring-blue-400'
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-extrabold text-slate-900">{dept.name}</h4>
                                <p className="text-xs text-slate-600 mt-0.5">{dept.description}</p>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {dept.coverage.map((c, i) => (
                                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0 pl-3">
                              <span className="text-[11px] font-bold text-slate-600 block">
                                {dept.officers.length} Active Officers
                              </span>
                              {isSelected ? (
                                <span className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-1">
                                  <CheckCircle2 className="w-4 h-4" /> Selected
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">Click to Select</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation to Step 4 */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setWorkflowStep(2)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                    >
                      ← Back to Risk
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkflowStep(4)}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Proceed to Officer Selection ({selectedDeptInfo.name})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SELECT DEPARTMENT OFFICER */}
              {workflowStep === 4 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 4 of 6</span>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Select Officer from {selectedDeptInfo.name}
                      </h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {selectedDeptInfo.officers.length} Available Officers
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Select a municipal officer to assign direct ownership of this complaint ticket.
                  </p>

                  {/* Dynamic Officer List from Selected Department */}
                  <div className="grid grid-cols-1 gap-3">
                    {selectedDeptInfo.officers.map((officer) => {
                      const isSelected = selectedOfficer?.id === officer.id;
                      return (
                        <button
                          key={officer.id}
                          type="button"
                          onClick={() => setSelectedOfficer(officer)}
                          className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-600 shadow-sm ring-2 ring-blue-400'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {officer.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-extrabold text-slate-900">{officer.name}</h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  {officer.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">{officer.designation || 'Field Officer'} • ID: {officer.id}</p>
                              {officer.phone && (
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" /> {officer.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-3">
                            <div className="text-xs font-bold text-slate-800">
                              Active Load: <span className="text-blue-700">{officer.currentAssignments} cases</span>
                            </div>
                            {isSelected ? (
                              <span className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-1 justify-end">
                                <CheckCircle2 className="w-4 h-4" /> Selected
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 mt-1 block">Click to Select</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation to Step 5 */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setWorkflowStep(3)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                    >
                      ← Back to Department
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkflowStep(5)}
                      disabled={!selectedOfficer}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <span>Proceed to Summary & Confirm</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5 & 6: SUMMARY & ATOMIC CONFIRMATION */}
              {(workflowStep === 5 || workflowStep === 6) && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        {workflowStep === 5 ? 'Step 5 of 6: Review Summary' : 'Step 6: Assignment Confirmed'}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        {workflowStep === 5 ? 'Confirm Government Officer Assignment' : 'Official Officer Assignment Active'}
                      </h3>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                      caseItem.status === 'OFFICER_ASSIGNED' || caseItem.status === 'WORK_ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {caseItem.status === 'OFFICER_ASSIGNED' ? 'OFFICER ASSIGNED' : 'PENDING CONFIRMATION'}
                    </span>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Assignment Verification Summary
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="p-3.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-[11px] text-slate-400 font-bold uppercase">Complaint Record</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{caseItem.id}</p>
                        <p className="text-xs text-slate-600 truncate">{caseItem.title}</p>
                      </div>

                      <div className="p-3.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 font-bold uppercase">Assigned Risk Level</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedRisk}</p>
                          <p className="text-[11px] text-slate-500">SLA: {selectedRisk === 'CRITICAL' ? '12h' : selectedRisk === 'HIGH' ? '24h' : '48h'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWorkflowStep(2)}
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Change
                        </button>
                      </div>

                      <div className="p-3.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 font-bold uppercase">Assigned Department</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedDeptInfo.name}</p>
                          <p className="text-[11px] text-slate-500">{selectedDeptInfo.key}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWorkflowStep(3)}
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Change
                        </button>
                      </div>

                      <div className="p-3.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 font-bold uppercase">Assigned Officer</span>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedOfficer?.name || 'Ravi Kumar'}</p>
                          <p className="text-[11px] text-slate-500">{selectedOfficer?.designation || 'Field Lead'} • {selectedOfficer?.id}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWorkflowStep(4)}
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Change
                        </button>
                      </div>

                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-blue-950">Initial Case Status: </span>
                        <span className="font-extrabold text-blue-700">OFFICER ASSIGNED</span>
                      </div>
                      <div>
                        <span className="font-bold text-blue-950">Initial Progress: </span>
                        <span className="font-extrabold text-blue-700">0%</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  {workflowStep === 5 && (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={handleConfirmAndAssignOfficer}
                        disabled={isProcessing || !selectedOfficer}
                        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 disabled:opacity-50"
                      >
                        <UserCheck className="w-5 h-5" />
                        <span>{isProcessing ? 'CONFIRMING ASSIGNMENT IN DATABASE...' : 'CONFIRM & ASSIGN OFFICER'}</span>
                      </button>
                      <p className="text-center text-[11px] text-slate-500">
                        Updates database atomically, creates timeline entry, and notifies {selectedOfficer?.name}.
                      </p>
                    </div>
                  )}

                  {workflowStep === 6 && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Assignment Active in Database</span>
                      </div>
                      <p className="text-xs text-emerald-900">
                        Case is assigned to <span className="font-bold">{selectedOfficer?.name}</span>. You can now track field progress in the Officer Execution tab or wait for the resolution report.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('officer_progress')}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg"
                        >
                          View Officer Execution Tab
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 bg-white text-slate-700 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50"
                        >
                          Close Panel
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: OVERVIEW & EVIDENCE */}
          {/* ============================================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Evidence Photo */}
              {caseItem.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-72 flex items-center justify-center">
                  <img
                    src={caseItem.imageUrl}
                    alt={caseItem.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover max-h-72"
                  />
                </div>
              )}

              {/* Comprehensive Details Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-base text-slate-900">Complaint Details</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                    Category: {caseItem.category}
                  </span>
                </div>

                {/* AI Problem Verification Status */}
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>AI Autonomous Verification & Integrity Check</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      caseItem.aiValidationStatus === 'VALID'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {caseItem.aiValidationStatus || 'VALID'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {caseItem.aiProblemVerification || caseItem.aiValidationReason || 'AI confirmed textual and photographic indicators match genuine municipal service defect.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase">Complaint ID</span>
                    <p className="text-sm font-bold text-slate-900">{caseItem.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase">Problem Duration</span>
                    <p className="text-sm font-bold text-amber-700">{caseItem.problemDuration || 'Not Specified'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase">Citizen Name</span>
                    <p className="font-bold text-slate-900">{caseItem.citizenName || 'Citizen'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase">Citizen Phone</span>
                    <p className="font-bold text-slate-900">{caseItem.citizenPhone || '+91 98765 00000'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400 font-bold uppercase">Full Address</span>
                    <p className="font-medium text-slate-800">{caseItem.location.address || `${caseItem.location.area}, ${caseItem.location.city}`}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400 font-bold uppercase">Problem Description</span>
                    <p className="text-slate-700 leading-relaxed mt-1">{caseItem.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: OFFICER FIELD EXECUTION & GOVERNMENT VERIFICATION */}
          {/* ============================================================ */}
          {activeTab === 'officer_progress' && (
            <div className="space-y-6">
              
              {/* Assigned Officer Status Banner */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Assigned Department Officer</span>
                    <h3 className="text-base font-extrabold text-white">{caseItem.assignedOfficerName || selectedOfficer?.name || 'Ravi Kumar'}</h3>
                    <p className="text-xs text-slate-300">{caseItem.assignedDepartment || selectedDeptInfo.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Progress</span>
                  <span className="text-2xl font-black text-cyan-400">{caseItem.progress ?? 0}%</span>
                </div>
              </div>

              {/* Progress Slider & Simulation Controls */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Field Execution Progress & Status</span>
                </h4>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Work Progress: {officerProgressVal}%</span>
                    <span>Status: {isBlocked ? 'BLOCKED / DELAYED' : (officerProgressVal >= 100 ? 'AWAITING VERIFICATION' : 'IN PROGRESS')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={officerProgressVal}
                    onChange={(e) => setOfficerProgressVal(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0% Assigned</span>
                    <span>25% Dispatched</span>
                    <span>50% On-Site</span>
                    <span>75% Repairing</span>
                    <span>100% Concluded</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Current Action Note:</label>
                    <input
                      type="text"
                      value={officerCurrentAction}
                      onChange={(e) => setOfficerCurrentAction(e.target.value)}
                      placeholder="e.g. Squad on site clearing blockage..."
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Next Action Note:</label>
                    <input
                      type="text"
                      value={officerNextAction}
                      onChange={(e) => setOfficerNextAction(e.target.value)}
                      placeholder="e.g. Laying fresh concrete..."
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 mt-1"
                    />
                  </div>
                </div>

                {/* Block / Delay Toggle */}
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-amber-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBlocked}
                      onChange={(e) => setIsBlocked(e.target.checked)}
                      className="rounded accent-amber-600"
                    />
                    <span>Report Issue Blocked or Delayed</span>
                  </label>
                  {isBlocked && (
                    <input
                      type="text"
                      value={blockedReasonInput}
                      onChange={(e) => setBlockedReasonInput(e.target.value)}
                      placeholder="Specify reason for delay (e.g. Heavy rainfall, awaiting asphalt supply)..."
                      className="w-full text-xs border border-amber-300 rounded-lg p-2 bg-white"
                    />
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  {caseItem.status === 'OFFICER_ASSIGNED' && (
                    <button
                      type="button"
                      onClick={handleOfficerAccept}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                    >
                      Officer Accept Assignment
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOfficerUpdateProgress}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                  >
                    Save Field Progress
                  </button>
                </div>
              </div>

              {/* OFFICER RESOLUTION REPORT & GOVERNMENT VERIFICATION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-purple-600" />
                    <span>Resolution Report & Final Government Verification</span>
                  </h4>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    caseItem.status === 'SOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {caseItem.status === 'SOLVED' ? '✅ CASE SOLVED' : 'AWAITING VERIFICATION'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Resolution Summary:</label>
                    <input
                      type="text"
                      value={resolutionSummary}
                      onChange={(e) => setResolutionSummary(e.target.value)}
                      placeholder="e.g. Road crater filled and smoothed."
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Actions Taken by Squad:</label>
                    <input
                      type="text"
                      value={resolutionAction}
                      onChange={(e) => setResolutionAction(e.target.value)}
                      placeholder="e.g. 2 tons bitumen applied & rolled."
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={handleOfficerSubmitReport}
                    disabled={isProcessing}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Officer Submit Resolution Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGovVerifyAndSolve}
                    disabled={isProcessing}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Government Verify & Mark SOLVED</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: AUDIT TRAIL / TIMELINE */}
          {/* ============================================================ */}
          {activeTab === 'timeline' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Complete Real-Time Case Audit Trail</span>
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-8">
                {caseItem.timeline?.map((event, idx) => (
                  <div key={event.id || idx} className="relative">
                    <div className="absolute -left-8 top-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-white">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{event.title}</span>
                        <span className="text-[10px] text-slate-400">{event.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>
                      {event.actor && (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                          Actor: {event.actor}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: GOVERNMENT NOTES */}
          {/* ============================================================ */}
          {activeTab === 'notes' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Internal & Public Government Notes</span>
              </h3>

              <div className="space-y-2">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record an official operational observation, inspection finding, or citizen communication..."
                  rows={3}
                  className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="radio"
                        checked={noteVisibility === 'INTERNAL'}
                        onChange={() => setNoteVisibility('INTERNAL')}
                        className="accent-blue-600"
                      />
                      <span>Internal Municipal Only</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="radio"
                        checked={noteVisibility === 'PUBLIC'}
                        onChange={() => setNoteVisibility('PUBLIC')}
                        className="accent-blue-600"
                      />
                      <span>Visible to Citizen</span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNote}
                    disabled={isProcessing || !newNoteText.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Note</span>
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                {caseItem.notes && caseItem.notes.length > 0 ? (
                  caseItem.notes.map((note) => (
                    <div key={note.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-bold text-slate-800">{note.created_by}</span>
                        <span>{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-800">{note.note}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-2 inline-block ${
                        note.visibility === 'PUBLIC' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {note.visibility}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No notes added yet.</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM DRAWER FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Firestore Realtime Sync Active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
          >
            Close Panel
          </button>
        </div>

        {/* Photo Preview Modal */}
        {previewPhotoModal && (
          <div 
            className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setPreviewPhotoModal(null)}
          >
            <div 
              className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewPhotoModal(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={previewPhotoModal}
                alt="Citizen Evidence Preview"
                className="w-full max-h-[75vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
