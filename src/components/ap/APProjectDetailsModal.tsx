import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Image as ImageIcon, 
  History, 
  ChevronRight, 
  AlertCircle,
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { APProject, APProjectUpdate } from '../../types/apProjectTypes';
import { approveProjectUpdate, requestCorrectionProjectUpdate } from '../../services/apProjectService';

interface APProjectDetailsModalProps {
  isOpen: boolean;
  project: APProject | null;
  onClose: () => void;
  isGovernmentUser?: boolean;
  onOpenUpdateModal?: (project: APProject) => void;
}

export const APProjectDetailsModal: React.FC<APProjectDetailsModalProps> = ({
  isOpen,
  project,
  onClose,
  isGovernmentUser = false,
  onOpenUpdateModal
}) => {
  if (!isOpen || !project) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'photos'>('overview');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Government Verification Actions State
  const [selectedUpdateForReview, setSelectedUpdateForReview] = useState<APProjectUpdate | null>(null);
  const [reviewActionType, setReviewActionType] = useState<'approve' | 'correction' | null>(null);
  const [governmentRemarksInput, setGovernmentRemarksInput] = useState<string>('');
  const [isProcessingReview, setIsProcessingReview] = useState<boolean>(false);
  const [reviewFeedback, setReviewFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const budget = project.budget || 0;
  const spent = project.amountSpent || 0;
  const remaining = project.remainingAmount !== undefined ? project.remainingAmount : Math.max(0, budget - spent);
  const spentPct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  const allPhotos = [
    ...(project.completionPhoto ? [project.completionPhoto] : []),
    ...(project.progressPhotos || [])
  ].filter((v, i, a) => a.indexOf(v) === i); // unique

  const handleReviewActionSubmit = async () => {
    if (!selectedUpdateForReview) return;
    setIsProcessingReview(true);
    setReviewFeedback(null);

    try {
      if (reviewActionType === 'approve') {
        await approveProjectUpdate(
          project.projectId,
          selectedUpdateForReview.updateId,
          governmentRemarksInput || 'Update verified and approved by State Monitoring Cell.'
        );
        setReviewFeedback({ msg: 'Update approved successfully.', type: 'success' });
      } else {
        if (!governmentRemarksInput.trim()) {
          setReviewFeedback({ msg: 'Please provide correction remarks explaining what needs to be changed.', type: 'error' });
          setIsProcessingReview(false);
          return;
        }
        await requestCorrectionProjectUpdate(
          project.projectId,
          selectedUpdateForReview.updateId,
          governmentRemarksInput.trim()
        );
        setReviewFeedback({ msg: 'Correction request sent to officer.', type: 'success' });
      }

      setTimeout(() => {
        setSelectedUpdateForReview(null);
        setReviewActionType(null);
        setGovernmentRemarksInput('');
      }, 1000);
    } catch (err: any) {
      setReviewFeedback({ msg: err.message || 'Action failed', type: 'error' });
    } finally {
      setIsProcessingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'Ongoing':
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Ongoing</span>;
      case 'Delayed':
        return <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Delayed</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full border border-slate-200 shadow-2xl my-auto animate-in fade-in zoom-in duration-200 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003366] via-[#0A4D8C] to-[#003366] text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black border border-amber-400/30 font-mono">
              {project.projectId}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-bold">
              {project.department}
            </span>
            {getStatusBadge(project.status)}
            {project.latestReviewStatus === 'Submitted for Government Review' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                Review Pending
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug pr-8">
            {project.projectName}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200 mt-2.5 font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-300" />
              {project.location} ({project.city})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-300" />
              {project.officerName} ({project.officerDesignation})
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Project Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Update History ({project.updates?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photo Evidence ({allPhotos.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial Metrics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Budget</span>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    ₹ {budget.toFixed(2)} Cr
                  </div>
                  <span className="text-[10px] text-slate-500">Sanctioned</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200">
                  <span className="text-[10px] font-bold uppercase text-blue-700 block">Amount Spent</span>
                  <div className="text-lg font-black text-blue-900 mt-0.5">
                    ₹ {spent.toFixed(2)} Cr
                  </div>
                  <span className="text-[10px] text-blue-700 font-bold">{spentPct}% utilized</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">Remaining Funds</span>
                  <div className="text-lg font-black text-emerald-900 mt-0.5">
                    ₹ {remaining.toFixed(2)} Cr
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">Available balance</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 text-white">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Physical Progress</span>
                  <div className="text-lg font-black text-amber-300 mt-0.5">
                    {project.completionPercentage}%
                  </div>
                  <span className="text-[10px] text-slate-400">Verified status</span>
                </div>
              </div>

              {/* Progress Bar Visualization */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-700">Physical Milestone Completion</span>
                  <span className="text-blue-900 font-black">{project.completionPercentage}% Complete</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      project.completionPercentage >= 100 
                        ? 'bg-emerald-600' 
                        : (project.status === 'Delayed' ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-600 to-emerald-500')
                    }`}
                    style={{ width: `${project.completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* PROMINENT COMPLETED WORK PHOTO SHOWCASE (If Completed) */}
              {project.status === 'Completed' && project.completionPhoto && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                        Official Completed Work Proof (Verified Photo)
                      </h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase">
                      100% Completed
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden aspect-video max-h-72 border border-emerald-300 bg-black cursor-pointer group" onClick={() => setSelectedPhoto(project.completionPhoto!)}>
                    <img 
                      src={project.completionPhoto} 
                      alt="Completed work evidence" 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-end p-3 text-white text-xs font-bold">
                      <span>Click to view high-resolution photo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Latest Situation Report */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-700" />
                    Latest Situation & Progress Assessment
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Last Updated: {project.lastUpdated}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {project.latestSituation || 'No field report submitted yet.'}
                </p>

                {project.latestCorrectionRemark && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Government Correction Instruction: </span>
                      <span>{project.latestCorrectionRemark}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline & Officer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-700" />
                    Project Timeline
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sanction / Start Date:</span>
                      <span className="font-bold text-slate-800">{project.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expected Completion:</span>
                      <span className="font-bold text-blue-900">{project.expectedCompletionDate}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-700" />
                    Assigned Execution Officer
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Officer Name:</span>
                      <span className="font-bold text-slate-800">{project.officerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Designation:</span>
                      <span className="font-bold text-slate-800">{project.officerDesignation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Officer ID:</span>
                      <span className="font-bold font-mono text-slate-800">{project.officerId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPDATE HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-900" />
                  Chronological Project Updates & Audit Trail
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  {project.updates?.length || 0} Records Logged
                </span>
              </div>

              {(!project.updates || project.updates.length === 0) ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No historical updates recorded for this project yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {project.updates.map((update, idx) => (
                    <div 
                      key={update.updateId || idx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3"
                    >
                      {/* Update Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span className="font-black text-xs text-slate-900 font-mono">
                            {update.updateId}
                          </span>
                          <span className="text-xs text-slate-500">• {update.submittedAt}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            update.reviewStatus === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : (update.reviewStatus === 'Correction Requested' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800 animate-pulse')
                          }`}>
                            {update.reviewStatus}
                          </span>
                        </div>
                      </div>

                      {/* Diff & Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Status Progression</span>
                          <span className="font-bold text-slate-800">
                            {update.previousStatus} → <span className="text-blue-900">{update.newStatus}</span>
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Completion %</span>
                          <span className="font-bold text-slate-800">
                            {update.previousCompletionPercentage}% → <span className="text-emerald-700">{update.newCompletionPercentage}%</span>
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Amount Spent</span>
                          <span className="font-bold text-slate-800">
                            ₹ {update.amountSpent} Cr
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Submitting Officer</span>
                          <span className="font-bold text-slate-800 truncate block">
                            {update.officerName}
                          </span>
                        </div>
                      </div>

                      {/* Situation Report */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-900 block mb-1">Field Situation Report:</span>
                        {update.situationReport}
                      </div>

                      {/* Uploaded Photos thumbnail in history */}
                      {(update.completionPhoto || (update.additionalPhotos && update.additionalPhotos.length > 0)) && (
                        <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                          {update.completionPhoto && (
                            <img
                              src={update.completionPhoto}
                              alt="Update photo"
                              onClick={() => setSelectedPhoto(update.completionPhoto!)}
                              className="w-14 h-14 rounded-lg object-cover border border-slate-300 cursor-pointer hover:opacity-80"
                            />
                          )}
                          {update.additionalPhotos?.map((ph, pi) => (
                            <img
                              key={pi}
                              src={ph}
                              alt={`Update extra photo ${pi}`}
                              onClick={() => setSelectedPhoto(ph)}
                              className="w-14 h-14 rounded-lg object-cover border border-slate-300 cursor-pointer hover:opacity-80"
                            />
                          ))}
                        </div>
                      )}

                      {/* Government Remarks / Actions */}
                      {update.governmentRemarks && (
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                              Government Directorate Remarks
                            </span>
                            {update.reviewedAt && (
                              <span className="text-[10px] text-blue-700">{update.reviewedAt}</span>
                            )}
                          </div>
                          <p className="text-blue-800 font-medium">{update.governmentRemarks}</p>
                        </div>
                      )}

                      {/* Government Verification Action Triggers (If Government user and update is pending review) */}
                      {isGovernmentUser && update.reviewStatus === 'Submitted for Government Review' && (
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUpdateForReview(update);
                              setReviewActionType('correction');
                              setGovernmentRemarksInput('');
                            }}
                            className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                          >
                            Request Correction
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUpdateForReview(update);
                              setReviewActionType('approve');
                              setGovernmentRemarksInput('Update verified and approved by State Monitoring Cell.');
                            }}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-2xs"
                          >
                            Approve Update
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PHOTOS */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-900" />
                  Visual Evidence & High-Resolution Progress Photos
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  {allPhotos.length} Photos on Record
                </span>
              </div>

              {allPhotos.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No photos uploaded for this project yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {allPhotos.map((photoUrl, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedPhoto(photoUrl)}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-black cursor-pointer shadow-2xs hover:shadow-md transition-all"
                    >
                      <img 
                        src={photoUrl} 
                        alt={`Project photo ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white text-xs font-bold">
                        <span>Photo #{idx + 1} (Click to Enlarge)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Official Record ID: <span className="font-mono font-bold text-slate-700">{project.projectId}</span>
          </div>

          <div className="flex items-center gap-2">
            {!isGovernmentUser && onOpenUpdateModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUpdateModal(project);
                }}
                className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-black cursor-pointer shadow-md"
              >
                Update This Project
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* PHOTO LIGHTBOX MODAL */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
            <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-10 right-0 text-white font-bold text-sm bg-white/20 p-2 rounded-full hover:bg-white/30 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={selectedPhoto} alt="Full resolution evidence" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            </div>
          </div>
        )}

        {/* GOVERNMENT REVIEW DIALOG */}
        {selectedUpdateForReview && reviewActionType && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900">
                  {reviewActionType === 'approve' ? 'Approve Project Update' : 'Request Officer Correction'}
                </h3>
                <button
                  onClick={() => {
                    setSelectedUpdateForReview(null);
                    setReviewActionType(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reviewFeedback && (
                <div className={`p-2.5 rounded-xl text-xs font-bold ${
                  reviewFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}>
                  {reviewFeedback.msg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Government Directorate Remarks / Instructions *
                </label>
                <textarea
                  value={governmentRemarksInput}
                  onChange={(e) => setGovernmentRemarksInput(e.target.value)}
                  rows={3}
                  placeholder={reviewActionType === 'approve' ? 'e.g. Update verified. Quality standards approved.' : 'e.g. Please attach clear high-resolution completion photo and clarify concrete curing period...'}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUpdateForReview(null);
                    setReviewActionType(null);
                  }}
                  disabled={isProcessingReview}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleReviewActionSubmit}
                  disabled={isProcessingReview}
                  className={`px-4 py-1.5 rounded-xl text-white text-xs font-bold cursor-pointer ${
                    reviewActionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isProcessingReview ? 'Processing...' : (reviewActionType === 'approve' ? 'Confirm Approval' : 'Send Correction Notice')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
