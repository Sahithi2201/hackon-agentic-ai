import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  AlertCircle, 
  CheckCircle2, 
  IndianRupee, 
  FileText, 
  Layers, 
  Clock, 
  Building2, 
  MapPin, 
  TrendingUp, 
  Image as ImageIcon,
  Trash2,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  APProject, 
  APProjectStatus, 
  APOfficer 
} from '../../types/apProjectTypes';
import { submitOfficerProjectUpdate } from '../../services/apProjectService';

interface APProjectUpdateModalProps {
  isOpen: boolean;
  project: APProject | null;
  officer: APOfficer;
  onClose: () => void;
  onSuccess: (updatedProject: APProject) => void;
}

export const APProjectUpdateModal: React.FC<APProjectUpdateModalProps> = ({
  isOpen,
  project,
  officer,
  onClose,
  onSuccess
}) => {
  if (!isOpen || !project) return null;

  // Form State
  const [status, setStatus] = useState<APProjectStatus>(project.status);
  const [completionPercentage, setCompletionPercentage] = useState<number>(project.completionPercentage);
  const [amountSpent, setAmountSpent] = useState<number>(project.amountSpent);
  const [situationReport, setSituationReport] = useState<string>(project.latestSituation || '');
  
  // Photos State
  const [completionPhoto, setCompletionPhoto] = useState<string | null>(project.completionPhoto || null);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>(project.progressPhotos || []);
  
  // UI & Processing States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const completionFileInputRef = useRef<HTMLInputElement | null>(null);
  const additionalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state whenever modal opens with a project
  useEffect(() => {
    if (project) {
      setStatus(project.status);
      setCompletionPercentage(project.completionPercentage);
      setAmountSpent(project.amountSpent);
      setSituationReport(project.latestSituation || '');
      setCompletionPhoto(project.completionPhoto || null);
      setAdditionalPhotos(project.progressPhotos || []);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [project]);

  // Handle status changes (e.g. auto set 100% on Completed)
  const handleStatusChange = (newStatus: APProjectStatus) => {
    setStatus(newStatus);
    if (newStatus === 'Completed') {
      setCompletionPercentage(100);
      setAmountSpent(project.budget);
    }
  };

  // Calculations
  const approvedBudget = project.budget || 0;
  const remainingAmount = Math.max(0, Math.round((approvedBudget - amountSpent) * 100) / 100);
  const budgetSpentPercentage = approvedBudget > 0 
    ? Math.min(100, Math.round((amountSpent / approvedBudget) * 100))
    : 0;

  // File Upload Handlers
  const handleCompletionPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCompletionPhoto(event.target.result as string);
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
    if (completionFileInputRef.current) completionFileInputRef.current.value = '';
  };

  const handleAdditionalPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAdditionalPhotos((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    if (additionalFileInputRef.current) additionalFileInputRef.current.value = '';
  };

  const removeAdditionalPhoto = (index: number) => {
    setAdditionalPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanSituation = situationReport.trim();
    if (!cleanSituation) {
      setErrorMessage('Please describe the Current Situation / Project Progress.');
      return;
    }

    if (amountSpent < 0) {
      setErrorMessage('Amount spent cannot be negative.');
      return;
    }

    if (amountSpent > approvedBudget * 1.5) {
      setErrorMessage(`Amount spent (₹${amountSpent} Cr) exceeds permissible limit for approved budget (₹${approvedBudget} Cr).`);
      return;
    }

    // Completed status check
    if (status === 'Completed') {
      if (!completionPhoto) {
        setErrorMessage('Completed Work Photo is required as proof before marking project as Completed.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const updated = await submitOfficerProjectUpdate({
        projectId: project.projectId,
        officerId: officer.officerId,
        officerName: officer.name,
        officerDesignation: officer.designation,
        status,
        completionPercentage: status === 'Completed' ? 100 : completionPercentage,
        amountSpent,
        situationReport: cleanSituation,
        completionPhoto: completionPhoto || undefined,
        additionalPhotos
      });

      setSuccessMessage('Project update submitted successfully to the Government Dashboard.');
      setTimeout(() => {
        onSuccess(updated);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Project update error:', err);
      setErrorMessage(err?.message || 'Failed to submit update to Government Dashboard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full border border-slate-200 shadow-2xl my-auto animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003366] via-[#0A4D8C] to-[#003366] text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black border border-amber-400/30">
              OFFICER PROGRESS UPDATE
            </span>
            <span className="text-slate-300 text-xs font-mono">
              {project.projectId}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug pr-8">
            {project.projectName}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200 mt-2 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              {project.city} ({project.department})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              {officer.name} ({officer.designation})
            </span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Notification Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">Validation Notice</p>
                <p className="font-medium text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-emerald-800">Submission Confirmed</p>
                <p className="font-semibold text-emerald-700 mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {/* 1. PROJECT INFORMATION (Read-only Summary) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-700" />
                Project Information (Read-Only)
              </h3>
              <span className="text-[10px] font-bold text-slate-600 font-mono">
                Assigned: {project.startDate}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-600 block text-[11px]">Project ID</span>
                <span className="font-bold text-slate-800 font-mono">{project.projectId}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[11px]">City & Department</span>
                <span className="font-bold text-slate-800">{project.city} • {project.department}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[11px]">Exact Location</span>
                <span className="font-bold text-slate-800 truncate block" title={project.location}>{project.location}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[11px]">Assigned Officer</span>
                <span className="font-bold text-slate-800">{officer.name}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[11px]">Designation</span>
                <span className="font-bold text-slate-800">{officer.designation}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[11px]">Target Completion</span>
                <span className="font-bold text-blue-800">{project.expectedCompletionDate}</span>
              </div>
            </div>
          </div>

          {/* 2. CURRENT SITUATION / PROJECT PROGRESS (Large Text Area) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                Current Situation / Project Progress *
              </label>
              <span className="text-[11px] text-slate-600 font-medium">
                Detailed Field Assessment
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              Describe: (1) Work completed so far, (2) Current site activities, (3) Obstacles or bottlenecks, (4) Delays if any, and (5) Public feedback.
            </p>

            <textarea
              value={situationReport}
              onChange={(e) => setSituationReport(e.target.value)}
              rows={4}
              placeholder="e.g. Foundation concrete casting completed for pillars 1-12. 65 workers currently laying high-grade asphalt overlay on northern corridor. Soil moisture test passed. Power cable rerouting requested from SPDCL..."
              required
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-2xl p-3.5 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-800 bg-white placeholder:text-slate-400 leading-relaxed shadow-2xs"
            />
          </div>

          {/* 3. FINANCIAL INFORMATION */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 via-slate-50 to-emerald-50/40 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
                Financial Information & Expenditure Tracking
              </h3>
              <span className="text-[11px] font-bold text-slate-600">
                Values in ₹ Crores (INR)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Approved Budget */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-600 block">
                  Total Approved Budget
                </span>
                <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  ₹ {approvedBudget.toFixed(2)} Cr
                </div>
                <span className="text-[10px] text-slate-600 font-medium">Sanctioned Amount</span>
              </div>

              {/* Amount Spent (Editable) */}
              <div className="p-3.5 rounded-xl bg-white border-2 border-blue-500 shadow-2xs">
                <label className="text-[11px] font-black text-blue-900 block">
                  Amount Spent So Far (₹ Cr) *
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={approvedBudget * 1.5}
                    value={amountSpent}
                    onChange={(e) => setAmountSpent(parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-8 py-1.5 text-sm sm:text-base font-black text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-blue-50/30"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[11px]">
                    Cr
                  </span>
                </div>
                <span className="text-[10px] text-blue-700 font-bold mt-1 block">
                  {budgetSpentPercentage}% of budget spent
                </span>
              </div>

              {/* Remaining Amount (Auto-calculated) */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-600 block">
                  Remaining Amount
                </span>
                <div className="text-base sm:text-lg font-black text-emerald-800 mt-1">
                  ₹ {remainingAmount.toFixed(2)} Cr
                </div>
                <span className="text-[10px] text-slate-600 font-medium">
                  Auto-calculated (Budget - Spent)
                </span>
              </div>
            </div>

            {/* Budget Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-600">Budget Utilization Gauge</span>
                <span className={budgetSpentPercentage > 90 ? 'text-amber-600' : 'text-emerald-700'}>
                  {budgetSpentPercentage}% Utilized
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    budgetSpentPercentage >= 100 
                      ? 'bg-emerald-600' 
                      : (budgetSpentPercentage > 85 ? 'bg-amber-500' : 'bg-blue-600')
                  }`}
                  style={{ width: `${Math.min(100, budgetSpentPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 4. PROJECT STATUS & 5. COMPLETION PERCENTAGE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Dropdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                Project Status *
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as APProjectStatus)}
                className="w-full text-xs sm:text-sm font-bold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-2xs"
              >
                <option value="Ongoing">Ongoing (Active Construction / Execution)</option>
                <option value="Completed">Completed (100% Delivered & Handed Over)</option>
                <option value="Delayed">Delayed (Obstacles / Pending Clearances)</option>
                <option value="Pending">Pending (Pre-construction / Mobilization)</option>
              </select>
              <p className="text-[10px] text-slate-600">
                {status === 'Completed' && '⚠️ Marking Completed will require 100% progress and Completed Work Photo proof.'}
                {status === 'Ongoing' && 'Active construction underway on site.'}
                {status === 'Delayed' && 'Bottlenecks or supplier issues slowing timeline.'}
                {status === 'Pending' && 'Initial survey or approvals pending.'}
              </p>
            </div>

            {/* Completion Percentage Slider & Meter */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Completion Percentage *
                </label>
                <span className="text-base font-black text-blue-900">
                  {status === 'Completed' ? 100 : completionPercentage}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                disabled={status === 'Completed'}
                value={status === 'Completed' ? 100 : completionPercentage}
                onChange={(e) => setCompletionPercentage(parseInt(e.target.value, 10) || 0)}
                className="w-full accent-blue-700 cursor-pointer disabled:cursor-not-allowed"
              />

              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden p-0.5 border border-slate-300">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-200"
                  style={{ width: `${status === 'Completed' ? 100 : completionPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                <span>0% (Mobilization)</span>
                <span>50% (Halfway)</span>
                <span>100% (Completed)</span>
              </div>
            </div>
          </div>

          {/* 6. PHOTO UPLOADS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                  Project Photo Documentation
                </h3>
                <p className="text-[11px] text-slate-600">
                  Upload high-resolution progress photos showing site condition.
                </p>
              </div>
            </div>

            {/* MANDATORY / PROMINENT COMPLETION PHOTO (When Completed or Primary Photo) */}
            <div className={`p-4 rounded-2xl border-2 transition-all ${
              status === 'Completed'
                ? 'bg-amber-50/50 border-amber-400'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>{status === 'Completed' ? 'Completed Work Photo (Required Proof) *' : 'Primary Project / Progress Photo'}</span>
                  {status === 'Completed' && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                      Mandatory
                    </span>
                  )}
                </label>

                {completionPhoto && (
                  <button
                    type="button"
                    onClick={() => setCompletionPhoto(null)}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              {completionPhoto ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm bg-black shrink-0">
                    <img 
                      src={completionPhoto} 
                      alt="Project completion evidence" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Attached
                    </div>
                  </div>

                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-900">
                      Photo Evidence Attached
                    </p>
                    <p className="text-[11px] text-slate-500">
                      This photo will be prominently displayed in the Government Dashboard project verification record.
                    </p>
                    <button
                      type="button"
                      onClick={() => completionFileInputRef.current?.click()}
                      className="text-xs font-bold text-blue-700 hover:underline cursor-pointer pt-1 inline-block"
                    >
                      Replace with Another Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                  <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">
                    {status === 'Completed' ? 'Upload Proof of Completed Work' : 'Upload Current Progress Photo'}
                  </p>
                  <p className="text-[10px] text-slate-500 mb-3">
                    Accepts JPG, JPEG, PNG, WEBP formats
                  </p>
                  <button
                    type="button"
                    onClick={() => completionFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer shadow-2xs"
                  >
                    Choose Photo / Upload Photo
                  </button>
                </div>
              )}

              <input
                ref={completionFileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleCompletionPhotoUpload}
                className="hidden"
              />
            </div>

            {/* ADDITIONAL PHOTOS (Optional) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Additional Progress Photos (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => additionalFileInputRef.current?.click()}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Add More Photos</span>
                </button>
              </div>

              {additionalPhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {additionalPhotos.map((photoUrl, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group bg-black">
                      <img src={photoUrl} alt={`Additional photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalPhoto(idx)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white cursor-pointer opacity-80 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={additionalFileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAdditionalPhotosUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 text-center sm:text-left">
              Submission will be logged in the project audit history under Officer ID: <span className="font-bold text-slate-700 font-mono">{officer.officerId}</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#003366] to-[#0A4D8C] hover:from-[#002244] hover:to-[#083D6F] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting to Government...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-amber-300" />
                    <span>Submit Update to Government</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
