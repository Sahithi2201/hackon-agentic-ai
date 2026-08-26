import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  FileCheck2, 
  Camera, 
  Image as ImageIcon, 
  Lock, 
  X, 
  ExternalLink,
  Sparkles,
  Building2,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Layers,
  Star,
  RefreshCw,
  Copy,
  Check,
  Send,
  Upload,
  Plus
} from 'lucide-react';
import { CivicCase, AppView, CaseStatus, TimelineEvent } from '../types';
import { resolveCivicImageKey } from '../utils/imageAssets';
import { getIncidentOperationalSummary, getSeverityInfo } from '../utils/operationsFormatters';
import { getCurrentUser } from '../services/authService';
import { getComplaintByIdInDb, submitCitizenInfoResponseInDb } from '../services/complaintsService';
import citizenPortalBg from '../assets/images/citizen_grievance_desk_1787490850787.jpg';

interface CitizenCaseDetailsPageProps {
  caseId?: string | null;
  caseItem?: CivicCase | null;
  cases?: CivicCase[];
  onNavigate: (view: AppView) => void;
  onBack?: () => void;
  onOpenAIAnalysis?: () => void;
}

export const CitizenCaseDetailsPage: React.FC<CitizenCaseDetailsPageProps> = ({
  caseId: propCaseId,
  caseItem: propCaseItem,
  cases = [],
  onNavigate,
  onBack
}) => {
  const currentUser = getCurrentUser();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Citizen "Provide More Information" response state
  const [citizenResponseText, setCitizenResponseText] = useState<string>('');
  const [citizenResponsePhoto, setCitizenResponsePhoto] = useState<string | null>(null);
  const [isSubmittingInfo, setIsSubmittingInfo] = useState<boolean>(false);
  const [infoSubmitSuccess, setInfoSubmitSuccess] = useState<boolean>(false);
  const [infoSubmitError, setInfoSubmitError] = useState<string | null>(null);

  // Loaded case state
  const [loadedCase, setLoadedCase] = useState<CivicCase | null>(() => {
    if (propCaseItem) return propCaseItem;
    if (propCaseId && cases.length > 0) {
      const match = cases.find(
        c => c.id.toUpperCase() === propCaseId.toUpperCase() || c.id === propCaseId
      );
      if (match) return match;
    }
    // Check localStorage cache for last viewed case id
    try {
      const cachedId = localStorage.getItem('civicmind_selected_case_id');
      if (cachedId && cases.length > 0) {
        const match = cases.find(c => c.id.toUpperCase() === cachedId.toUpperCase() || c.id === cachedId);
        if (match) return match;
      }
    } catch (e) {}
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(!loadedCase);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Sync / Fetch Complaint
  useEffect(() => {
    let isMounted = true;

    async function resolveCase() {
      // 1. If propCaseItem is directly provided
      if (propCaseItem) {
        setLoadedCase(propCaseItem);
        setIsLoading(false);
        try {
          localStorage.setItem('civicmind_selected_case_id', propCaseItem.id);
        } catch (e) {}
        return;
      }

      // 2. Resolve ID from props or localStorage
      let targetId = propCaseId;
      if (!targetId) {
        try {
          targetId = localStorage.getItem('civicmind_selected_case_id');
        } catch (e) {}
      }

      // If still no ID and cases exist, use the first available citizen case or first case
      if (!targetId && cases.length > 0) {
        targetId = cases[0].id;
      }

      if (!targetId) {
        if (isMounted) {
          setIsLoading(false);
          setLoadError('No complaint ID was provided to load details.');
        }
        return;
      }

      // Try finding in cases array first
      const foundInProps = cases.find(
        c => c.id.toUpperCase() === targetId!.toUpperCase() || c.id === targetId
      );

      if (foundInProps) {
        if (isMounted) {
          setLoadedCase(foundInProps);
          setIsLoading(false);
          setLoadError(null);
        }
        try {
          localStorage.setItem('civicmind_selected_case_id', foundInProps.id);
        } catch (e) {}
        return;
      }

      // Otherwise fetch from database / cache
      if (isMounted) setIsLoading(true);
      try {
        const fetched = await getComplaintByIdInDb(targetId);
        if (isMounted) {
          if (fetched) {
            setLoadedCase(fetched);
            setLoadError(null);
            try {
              localStorage.setItem('civicmind_selected_case_id', fetched.id);
            } catch (e) {}
          } else {
            setLoadError(`Complaint with ID "${targetId}" could not be found.`);
          }
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error loading complaint details:', err);
          setLoadError('Unable to load complaint details. Please check your network connection.');
          setIsLoading(false);
        }
      }
    }

    resolveCase();

    return () => {
      isMounted = false;
    };
  }, [propCaseId, propCaseItem, cases]);

  const handleCopyId = (id: string) => {
    try {
      navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (e) {}
  };

  const handleBackToComplaints = () => {
    if (onBack) {
      onBack();
    } else {
      onNavigate('citizen-dashboard');
    }
  };

  // Handle Photo selection for clarification response
  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCitizenResponsePhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit citizen additional info response
  const handleSubmitCitizenResponse = async () => {
    if (!citizenResponseText.trim() || !loadedCase) return;
    setIsSubmittingInfo(true);
    setInfoSubmitError(null);

    const citizenName = currentUser?.full_name || loadedCase.citizenName || 'Citizen';
    const pendingReq = (loadedCase.informationRequests || []).slice().reverse().find(r => r.status === 'PENDING_CITIZEN_RESPONSE');

    try {
      await submitCitizenInfoResponseInDb(
        loadedCase.id,
        pendingReq?.id,
        citizenResponseText.trim(),
        citizenResponsePhoto || undefined,
        citizenName
      );

      setInfoSubmitSuccess(true);
      
      const now = new Date();
      const formattedNow = now.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const updatedRequests = (loadedCase.informationRequests || []).map(r => {
        if (!pendingReq || r.id === pendingReq.id) {
          return {
            ...r,
            status: 'RESPONSE_SUBMITTED' as const,
            citizenResponse: {
              responseText: citizenResponseText.trim(),
              submittedAt: now.toISOString(),
              submittedBy: citizenName,
              photoUrl: citizenResponsePhoto || undefined
            }
          };
        }
        return r;
      });

      if (updatedRequests.length === 0) {
        updatedRequests.push({
          id: `req-${Date.now()}`,
          requestedBy: 'Municipal Operations',
          requestedAt: now.toISOString(),
          requestQuery: 'Additional Information Requested',
          status: 'RESPONSE_SUBMITTED',
          citizenResponse: {
            responseText: citizenResponseText.trim(),
            submittedAt: now.toISOString(),
            submittedBy: citizenName,
            photoUrl: citizenResponsePhoto || undefined
          }
        });
      }

      const newTimelineEvent: TimelineEvent = {
        id: `t-resp-${Date.now()}`,
        title: 'Additional Information Submitted',
        timestamp: formattedNow,
        description: `Citizen response provided: "${citizenResponseText.trim()}". Awaiting Government review.`,
        status: 'completed',
        actor: citizenName,
        public_visible: true
      };

      const updatedEvidence = citizenResponsePhoto 
        ? [...(loadedCase.evidenceImages || []), citizenResponsePhoto]
        : (loadedCase.evidenceImages || []);

      setLoadedCase(prev => prev ? {
        ...prev,
        currentAction: 'Citizen Response Received — Awaiting Government Review',
        nextAction: 'Government officer to review newly submitted information.',
        informationRequests: updatedRequests,
        timeline: [newTimelineEvent, ...(prev.timeline || []).map(t => ({ ...t, status: t.status === 'current' ? ('completed' as const) : t.status }))],
        evidenceImages: updatedEvidence
      } : null);

      setCitizenResponseText('');
      setCitizenResponsePhoto(null);
    } catch (err: any) {
      console.error('Failed to submit additional information:', err);
      setInfoSubmitError(err?.message || 'Failed to submit information. Please try again.');
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm animate-pulse">
          <RefreshCw className="w-7 h-7 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-black text-slate-900">Loading Complaint Details...</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Retrieving verified ticket records, AI analysis, and field squad status from the Municipal Registry.
          </p>
        </div>
      </div>
    );
  }

  // ERROR / NOT FOUND STATE
  if (loadError || !loadedCase) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mx-auto">
            <FileCheck2 className="w-8 h-8 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-900">Complaint Details Not Found</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {loadError || 'The requested complaint details could not be found or have been moved in the registry.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={handleBackToComplaints}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              ← Back to My Complaints
            </button>
            <button
              onClick={() => onNavigate('citizen-track')}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Track By Complaint ID
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AUTHORIZATION CHECK (Graceful for Citizen Profile)
  const isCitizen = currentUser?.role === 'CITIZEN';
  const userCitizenId = (currentUser?.citizen_id || currentUser?.id || '').trim().toLowerCase();
  const userEmail = (currentUser?.email || '').trim().toLowerCase();
  const userUsername = (currentUser?.username || '').trim().toLowerCase();
  const userFullName = (currentUser?.full_name || '').trim().toLowerCase();

  const caseCitizenId = (loadedCase.citizenId || '').trim().toLowerCase();
  const caseCitizenEmail = (loadedCase.citizenEmail || '').trim().toLowerCase();
  const caseCitizenName = (loadedCase.citizenName || '').trim().toLowerCase();

  const isOwner = !isCitizen || (
    (userCitizenId && caseCitizenId && userCitizenId === caseCitizenId) ||
    (userEmail && caseCitizenEmail && userEmail === caseCitizenEmail) ||
    (userFullName && caseCitizenName && userFullName === caseCitizenName) ||
    (userUsername && caseCitizenName && caseCitizenName.includes(userUsername)) ||
    !caseCitizenId // Public demo case
  );

  if (!isOwner) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-rose-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complaint <strong className="font-mono text-slate-900">{loadedCase.id}</strong> is registered under a different citizen account.
            </p>
          </div>
          <button
            onClick={handleBackToComplaints}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            ← Return to My Complaints
          </button>
        </div>
      </div>
    );
  }

  const ops = getIncidentOperationalSummary(loadedCase);
  const severity = getSeverityInfo(loadedCase.priority, loadedCase.isEscalated, loadedCase.finalGovernmentRisk);

  const isResolved = 
    loadedCase.status === 'RESOLVED' || 
    loadedCase.status === 'Resolved' || 
    loadedCase.status === 'CLOSED' || 
    loadedCase.status === 'SOLVED';

  const isProcessing = 
    loadedCase.status === 'ACTION_IN_PROGRESS' || 
    loadedCase.status === 'IN_PROGRESS' || 
    loadedCase.status === 'PROCESSING' || 
    loadedCase.status === 'DEPARTMENT_ASSIGNED';

  const formattedDate = new Date(loadedCase.createdDate || loadedCase.submittedAt || Date.now()).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const updatedDate = loadedCase.updatedDate ? new Date(loadedCase.updatedDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }) : formattedDate;

  const photosList: string[] = Array.isArray(loadedCase.evidenceImages) && loadedCase.evidenceImages.length > 0
    ? loadedCase.evidenceImages
    : (loadedCase.imageUrl && !loadedCase.imageUrl.includes('unsplash.com') ? [loadedCase.imageUrl] : []);

  // Information Request state checks
  const infoRequests = loadedCase.informationRequests || [];
  const pendingRequest = infoRequests.slice().reverse().find(r => r.status === 'PENDING_CITIZEN_RESPONSE');
  const hasTimelineRequest = (loadedCase.timeline || []).some(t => t.title.toLowerCase().includes('additional information requested'));
  const hasPendingAction = (loadedCase.currentAction || '').toLowerCase().includes('awaiting citizen') || (loadedCase.currentAction || '').toLowerCase().includes('clarification');
  const hasPendingClarification = Boolean(pendingRequest) || ((hasTimelineRequest || hasPendingAction) && !infoSubmitSuccess && !infoRequests.some(r => r.status === 'RESPONSE_SUBMITTED'));
  
  const latestRequestMessage = pendingRequest?.requestQuery 
    || (loadedCase.timeline || []).find(t => t.title.toLowerCase().includes('additional information requested'))?.description 
    || 'Please provide more info.';

  const cleanRequestMessage = latestRequestMessage.includes('clarification: "')
    ? latestRequestMessage.split('clarification: "')[1]?.split('"')[0]
    : latestRequestMessage.includes('clarifications: "')
    ? latestRequestMessage.split('clarifications: "')[1]?.split('"')[0]
    : latestRequestMessage;

  const submittedInfoRequests = infoRequests.filter(r => r.status === 'RESPONSE_SUBMITTED');

  return (
    <div className="min-h-full py-6 px-4 sm:px-6 lg:px-8 text-[#0F172A] relative select-none">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Photo Lightbox Modal */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedPhoto(null)}
          >
            <div 
              className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 p-2.5"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2.5 bg-black/70 hover:bg-black/90 text-white rounded-full z-10 cursor-pointer shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <img 
                src={selectedPhoto} 
                alt="Complaint Evidence Full View" 
                className="w-full max-h-[82vh] object-contain rounded-2xl" 
              />
            </div>
          </div>
        )}

        {/* TOP BREADCRUMB & BACK NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <button
            onClick={handleBackToComplaints}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>← Back to My Complaints</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold">
              <span>Complaint ID: {loadedCase.id}</span>
              <button
                onClick={() => handleCopyId(loadedCase.id)}
                className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors cursor-pointer"
                title="Copy Complaint ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={() => onNavigate('citizen-track')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Track By ID</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MAIN 2-COLUMN DETAILED COMPLAINT VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1: BASIC INFORMATION, CITIZEN DETAILS & AI ANALYSIS (4 COLS) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* 1. Complaint Basic Info Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              
              {/* Header Title & Status */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-blue-600 font-extrabold uppercase tracking-wider">
                    {loadedCase.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    isResolved 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                      : isProcessing 
                      ? 'bg-amber-100 text-amber-800 border-amber-300' 
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    {isResolved ? 'RESOLVED ✓' : loadedCase.status}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
                  {loadedCase.title}
                </h2>
              </div>

              {/* Badges & Key Metadata */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Government Risk:</span>
                  <span className={`px-2.5 py-0.5 rounded-lg font-mono font-extrabold text-[11px] ${
                    loadedCase.finalGovernmentRisk === 'CRITICAL' ? 'bg-rose-600 text-white' :
                    loadedCase.finalGovernmentRisk === 'HIGH' ? 'bg-amber-500 text-slate-950 font-bold' :
                    loadedCase.finalGovernmentRisk === 'MEDIUM' ? 'bg-blue-600 text-white' :
                    loadedCase.finalGovernmentRisk === 'LOW' ? 'bg-slate-600 text-white' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {loadedCase.finalGovernmentRisk || 'ASSESSED'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Priority Level:</span>
                  <span className="font-bold text-slate-800 font-mono">{loadedCase.priority || 'P2'}</span>
                </div>

                {loadedCase.subcategory && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Subcategory:</span>
                    <span className="font-bold text-slate-800">{loadedCase.subcategory}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Submitted Date:</span>
                  <span className="font-mono text-slate-700">{formattedDate}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Last Updated:</span>
                  <span className="font-mono text-slate-700">{updatedDate}</span>
                </div>
              </div>

              {/* Reported Problem Duration */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Reported Duration:</span>
                </div>
                <div className="font-black text-blue-800 text-sm font-mono">
                  {loadedCase.problemDuration || 'Today'}
                </div>
                {loadedCase.problemStartedDate && (
                  <div className="text-[11px] text-blue-700">
                    First observed: {loadedCase.problemStartedDate}
                  </div>
                )}
              </div>

              {/* Description Body */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Citizen Incident Description
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 font-normal">
                  {loadedCase.description || 'No detailed text description provided.'}
                </p>
              </div>

              {/* Location Details */}
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    📍 Incident Location
                  </span>
                  {loadedCase.location.lat && loadedCase.location.lng ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${loadedCase.location.lat},${loadedCase.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>VIEW ON GOOGLE MAPS</span>
                    </a>
                  ) : null}
                </div>
                
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{loadedCase.location.address || 'Street Address'}</span>
                  </div>
                  {loadedCase.location.landmark && (
                    <div className="text-slate-500 text-[11px] pl-5">
                      Landmark: <span className="font-medium text-slate-700">{loadedCase.location.landmark}</span>
                    </div>
                  )}
                  <div className="text-slate-500 text-[11px] pl-5">
                    Ward/Zone: <span className="font-medium text-slate-700">{loadedCase.location.ward || 'Ward 12'}</span>
                  </div>
                </div>

                <div className="pt-1.5">
                  <div className="text-slate-500 text-[11px]">Assigned Department:</div>
                  <div className="font-bold text-blue-700 text-xs mt-0.5">
                    {loadedCase.assignedDepartment || 'Municipal Operations Division'}
                  </div>
                </div>

                {loadedCase.assignedOfficerName && (
                  <div>
                    <div className="text-slate-500 text-[11px]">Assigned Officer / Squad:</div>
                    <div className="font-bold text-slate-800 text-xs mt-0.5">
                      {loadedCase.assignedOfficerName} {loadedCase.assignedOfficerId ? `(${loadedCase.assignedOfficerId})` : ''}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* 2. Registered Citizen Information Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  Citizen Profile Information
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Citizen Name</span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {loadedCase.citizenName || currentUser?.full_name || currentUser?.username || 'Citizen'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Citizen ID / Reference</span>
                  <div className="font-mono font-bold text-blue-700 mt-0.5">
                    {loadedCase.citizenId || currentUser?.citizen_id || currentUser?.id || '—'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Phone</span>
                  <div className="font-mono text-slate-700 mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{loadedCase.citizenPhone || currentUser?.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Address</span>
                  <div className="text-slate-700 mt-0.5 flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{loadedCase.citizenEmail || currentUser?.email || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. AI Analysis & Triage Intelligence Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                    AI Resolution Intelligence
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-400/30">
                  {loadedCase.aiConfidence || 95}% Confidence
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">AI Calibrated Priority</span>
                  <div className="font-bold text-white mt-0.5">
                    {loadedCase.priority || 'P1'} Priority • Risk Rating: <span className="text-amber-300">{loadedCase.finalGovernmentRisk || 'HIGH'}</span>
                  </div>
                </div>

                {loadedCase.aiExplanation?.summary && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">AI Diagnostic Summary</span>
                    <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/10">
                      {loadedCase.aiExplanation.summary}
                    </p>
                  </div>
                )}

                {loadedCase.aiExplanation?.recommendedAction && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">AI Recommended Field Protocol</span>
                    <p className="text-[11px] text-cyan-200 mt-0.5 leading-relaxed">
                      {loadedCase.aiExplanation.recommendedAction}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-[9px] text-slate-400 uppercase block">Impact Score</span>
                    <span className="text-white font-bold">{loadedCase.impactScore || 8.4} / 10</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-[9px] text-slate-400 uppercase block">SLA Target</span>
                    <span className="text-white font-bold">{loadedCase.slaHoursRemaining || 24}h Remaining</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMN 2: EVIDENCE PHOTOS, CURRENT OPERATIONS & TIMELINE (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ============================================================ */}
            {/* NEW FEATURE: ADDITIONAL INFORMATION REQUESTED BY GOVERNMENT */}
            {/* ============================================================ */}
            {(hasPendingClarification || infoSubmitSuccess) && (
              <div className="p-6 rounded-3xl bg-amber-50/90 border-2 border-amber-300 shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-3 border-b border-amber-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
                      <AlertTriangle className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-amber-900 font-extrabold uppercase tracking-wider block">
                        ACTION REQUIRED FROM CITIZEN
                      </span>
                      <h3 className="text-base font-black text-amber-950">
                        ⚠ Additional Information Requested
                      </h3>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    infoSubmitSuccess 
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                      : 'bg-amber-200 text-amber-950 border-amber-400/80'
                  }`}>
                    {infoSubmitSuccess ? 'Response Sent ✓' : 'Awaiting Your Response'}
                  </span>
                </div>

                {/* Government's Query Message */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200/90 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Government requested:
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed italic">
                    "{cleanRequestMessage}"
                  </p>
                  {pendingRequest?.requestedBy && (
                    <div className="text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-100 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-600" />
                      <span>Requested by: <strong>{pendingRequest.requestedBy}</strong></span>
                    </div>
                  )}
                </div>

                {/* Post-submission confirmation */}
                {infoSubmitSuccess ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Information submitted successfully.</span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Awaiting Government review. Your response and any attached evidence have been recorded into the official municipal audit trail.
                    </p>
                  </div>
                ) : (
                  /* Interactive Response Form */
                  <div className="space-y-3 pt-1">
                    <label className="text-xs font-bold text-amber-950 block">
                      Please provide the requested information below:
                    </label>
                    <textarea
                      rows={3}
                      value={citizenResponseText}
                      onChange={(e) => {
                        setCitizenResponseText(e.target.value);
                        if (infoSubmitError) setInfoSubmitError(null);
                      }}
                      placeholder="Write your additional information here (e.g. The drainage is overflowing near the main road. The issue is happening every evening. The problem has been present for the last 3 days)..."
                      className="w-full text-xs sm:text-sm bg-white border border-amber-300 rounded-2xl p-3.5 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 placeholder:text-slate-400 shadow-inner"
                    />

                    {/* Optional Photo / Evidence Section */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Attach Photo / Evidence (Optional)
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Optional</span>
                      </div>

                      {citizenResponsePhoto ? (
                        <div className="relative inline-block rounded-2xl overflow-hidden border-2 border-amber-300 max-w-xs shadow-sm bg-slate-100">
                          <img
                            src={citizenResponsePhoto}
                            alt="Attached Response Evidence"
                            className="w-full h-32 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setCitizenResponsePhoto(null)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/75 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-md"
                            title="Remove Photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id="citizen-info-photo-input"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoSelected}
                          />
                          <label
                            htmlFor="citizen-info-photo-input"
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                          >
                            <Camera className="w-4 h-4 text-amber-700" />
                            <span>+ Add Photo</span>
                          </label>
                        </div>
                      )}
                    </div>

                    {infoSubmitError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{infoSubmitError}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={isSubmittingInfo || !citizenResponseText.trim()}
                        onClick={handleSubmitCitizenResponse}
                        className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmittingInfo ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>SENDING INFORMATION TO GOVERNMENT...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>SEND INFORMATION TO GOVERNMENT</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PREVIOUSLY SUBMITTED INFORMATION RESPONSES HISTORY */}
            {submittedInfoRequests.length > 0 && !hasPendingClarification && !infoSubmitSuccess && (
              <div className="p-5 rounded-3xl bg-blue-50/80 border border-blue-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider">
                      Additional Information Provided
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                    Awaiting Government Review
                  </span>
                </div>

                <div className="space-y-3">
                  {submittedInfoRequests.map((req, idx) => (
                    <div key={req.id || idx} className="p-3.5 rounded-2xl bg-white border border-blue-100 space-y-2 text-xs">
                      {req.requestQuery && (
                        <div className="text-[11px] text-slate-500">
                          <span className="font-bold text-slate-700">Government query:</span> "{req.requestQuery}"
                        </div>
                      )}
                      {req.citizenResponse?.responseText && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                          <span className="font-bold text-[11px] text-slate-500 block mb-0.5">Your Response:</span>
                          <p className="font-medium text-xs leading-relaxed">{req.citizenResponse.responseText}</p>
                        </div>
                      )}
                      {req.citizenResponse?.photoUrl && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setSelectedPhoto(req.citizenResponse!.photoUrl!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>View Attached Photo</span>
                          </button>
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono">
                        Submitted: {req.citizenResponse?.submittedAt ? new Date(req.citizenResponse.submittedAt).toLocaleString() : 'Recently'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1. Current Operations Status Banner */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono text-blue-600 font-black uppercase tracking-wider">
                  CURRENT FIELD SQUAD & ACTION STATUS
                </span>
                <span className="text-xs font-mono font-bold text-blue-700">
                  {ops.progressPercent}% Concluded
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isResolved ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${ops.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* 2 Operations Callout Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider block">
                    What Action Is Being Taken:
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {ops.currentAction}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                    What Happens Next:
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {ops.nextAction}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Photo Evidence Gallery */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Complaint Photographic Evidence
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-bold">
                  {photosList.length > 0 ? `${photosList.length} Uploaded` : 'No evidence photo uploaded'}
                </span>
              </div>

              {photosList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {photosList.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedPhoto(img)}
                      className="group relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video cursor-pointer hover:shadow-md transition-all"
                    >
                      <img 
                        src={img} 
                        alt={`Evidence ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition-opacity flex items-center gap-1 shadow-md">
                          <ExternalLink className="w-3 h-3" /> View Photo
                        </span>
                      </div>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-xs text-white text-[9px] font-mono rounded font-bold">
                        Photo {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1.5">
                  <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No evidence photo uploaded</p>
                  <p className="text-[11px] text-slate-400">Citizen submitted this complaint without attaching photographic evidence.</p>
                </div>
              )}

              {/* Verified Government Resolution Photo (After photo) */}
              {loadedCase.resolvedImageUrl && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Government Resolution Photo (Repairs Completed)</span>
                  </span>
                  <div 
                    onClick={() => setSelectedPhoto(loadedCase.resolvedImageUrl!)}
                    className="relative max-w-sm rounded-2xl overflow-hidden bg-emerald-50 border-2 border-emerald-300 aspect-video cursor-pointer hover:shadow-lg transition-all"
                  >
                    <img 
                      src={loadedCase.resolvedImageUrl} 
                      alt="Verified Resolution Proof" 
                      className="w-full h-full object-cover" 
                    />
                    <span className="absolute top-2 right-2 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-md shadow-xs">
                      Official Proof Verified ✓
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Stage-by-Stage Timeline History */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-blue-600 font-black uppercase tracking-wider">
                    OFFICIAL PROGRESS LOG
                  </span>
                  <h3 className="text-base font-black text-slate-900">Stage-by-Stage Workflow Timeline</h3>
                </div>
                <div className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {loadedCase.timeline?.length || 1} Stages Recorded
                </div>
              </div>

              {/* Timeline list */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(loadedCase.timeline && loadedCase.timeline.length > 0 ? loadedCase.timeline : [
                  {
                    id: 't-init',
                    title: 'Complaint Registered',
                    timestamp: formattedDate,
                    description: 'Complaint entered into the Municipal Central Registry.',
                    status: 'completed',
                    actor: 'CivicMind System'
                  }
                ]).map((event, idx) => {
                  const isDone = event.status === 'completed';
                  const isCurrent = event.status === 'current';

                  return (
                    <div key={event.id || idx} className="relative">
                      <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isDone 
                          ? 'bg-emerald-600 border-emerald-700 text-white' 
                          : isCurrent 
                          ? 'bg-blue-600 border-blue-700 text-white animate-pulse' 
                          : 'bg-slate-200 border-slate-300 text-slate-400'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      <div className={`p-4 rounded-2xl text-xs transition-all ${
                        isCurrent 
                          ? 'bg-blue-50/90 border border-blue-300 ring-2 ring-blue-100 shadow-xs' 
                          : 'bg-slate-50 border border-slate-200'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h4 className="font-extrabold text-slate-900 text-xs">{event.title}</h4>
                          <span className="text-[10px] font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {event.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1.5 text-xs leading-relaxed font-normal">
                          {event.description}
                        </p>
                        {event.actor && (
                          <div className="text-[10px] text-slate-400 mt-2 font-mono flex items-center gap-1 border-t border-slate-200/60 pt-1.5">
                            <ShieldCheck className="w-3 h-3 text-slate-400" />
                            <span>Action recorded by: <strong>{event.actor}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Citizen Satisfaction Feedback (If Resolved) */}
            {isResolved && (
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-3 text-center">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-emerald-950">This complaint has been verified and solved!</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Please rate your satisfaction with the field squad response time and quality of work.
                </p>
                {!ratingSubmitted ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setRatingSubmitted(true)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Submit Citizen Feedback
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-emerald-800 bg-white/80 p-2.5 rounded-xl border border-emerald-200 inline-block">
                    Thank you! Your feedback has been recorded for the departmental performance index.
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
