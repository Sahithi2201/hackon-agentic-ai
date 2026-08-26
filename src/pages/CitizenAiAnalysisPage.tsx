import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Layers, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  Cpu, 
  AlertCircle,
  FileCheck2,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { CivicCategory, CivicCase, DepartmentName, AppView } from '../types';
import { CivicImageKey, getCivicImageUrl, CIVIC_IMAGE_REGISTRY } from '../utils/imageAssets';
import citizenPortalBg from '../assets/images/citizen_grievance_desk_1787490850787.jpg';
import { EvidencePanel } from '../components/EvidencePanel';

interface CitizenAiAnalysisPageProps {
  initialCase?: CivicCase | null;
  draftData?: {
    title: string;
    description: string;
    category: CivicCategory;
    address: string;
    ward: string;
    landmark: string;
    imageKey: CivicImageKey;
    imageUrl: string;
  };
  onCreateComplaint?: (newCase: CivicCase) => void;
  onViewDetails?: (caseId: string) => void;
  onNavigate: (view: AppView) => void;
}

export const CitizenAiAnalysisPage: React.FC<CitizenAiAnalysisPageProps> = ({
  initialCase,
  draftData: propDraftData,
  onCreateComplaint,
  onViewDetails,
  onNavigate
}) => {
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);

  // Normalize draft data from either propDraftData or initialCase
  const draftData = propDraftData || {
    title: initialCase?.title || 'Severe Crater Pothole & Road Collapse near School Gate',
    description: initialCase?.description || 'Deep potholes causing risk to school pedestrians and two-wheelers.',
    category: initialCase?.category || 'Road Damage',
    address: initialCase?.location?.address || 'MG Road near St. Mary Primary School',
    ward: initialCase?.location?.ward || 'Ward 12',
    landmark: initialCase?.location?.landmark || 'St. Mary School Gate',
    imageKey: (initialCase?.imageKey || 'pothole') as CivicImageKey,
    imageUrl: initialCase?.imageUrl || initialCase?.evidenceImages?.[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  };

  const stepsList = [
    'Understanding complaint context & citizen intent',
    'Analyzing photographic defect dimensions with Computer Vision',
    'Identifying root civic category (ISO 37120 taxonomy)',
    'Searching spatial database in 500m radius for nearby reports',
    'Detecting duplicate tickets & consolidating master thread',
    'Evaluating public impact score & school/hospital proximity',
    'Identifying responsible municipal ward squad & routing SLA',
    'Calculating final calibrated priority level (P1 HIGH)'
  ];

  useEffect(() => {
    // Run automated step-by-step progress
    const timer = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < stepsList.length) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setIsCompleted(true);
          return prev;
        }
      });
    }, 380);

    return () => clearInterval(timer);
  }, []);

  const handleCreateTicket = () => {
    const generatedId = initialCase?.id || 'CL-2026-0847';
    setCreatedCaseId(generatedId);

    const newCase: CivicCase = initialCase || {
      id: generatedId,
      complaint_number: generatedId,
      title: draftData.title || 'Severe Crater Pothole & Road Collapse near School Gate',
      description: draftData.description,
      category: draftData.category,
      priority: 'P1',
      status: 'Inspection Scheduled',
      location: {
        address: draftData.address,
        ward: draftData.ward,
        landmark: draftData.landmark,
        lat: 18.5204,
        lng: 73.8567
      },
      coordinates: {
        lat: 18.5204,
        lng: 73.8567
      },
      imageKey: draftData.imageKey,
      evidenceImage: draftData.imageUrl,
      backgroundImage: draftData.imageUrl,
      imageUrl: draftData.imageUrl,
      aiConfidence: 96,
      impactScore: 8.7,
      duplicateCount: 3,
      assignedDepartment: 'Roads & Infrastructure Department',
      slaHoursRemaining: 12,
      slaTotalHours: 12,
      createdDate: 'Just now',
      updatedDate: 'Just now',
      citizenName: 'Rahul Sharma',
      citizenPhone: '+91 98230 •••••',
      aiExplanation: {
        summary: 'Prioritized as P1 Critical due to proximity to school zone (<50m), high pedestrian child traffic, multiple duplicate reports within 2 hours, and accident risk on arterial road.',
        riskFactors: [
          'Located near a primary school (<50m pedestrian crossing)',
          'High traffic density with two-wheeler accident risk',
          '3 nearby corroborating citizen complaints clustered',
          'Potential road sub-base collapse from water pooling'
        ],
        recommendedAction: 'Immediate field inspection within 2 hours and rapid cold-mix paving before evening school dispersal.'
      },
      timeline: [
        {
          id: 't-new-1',
          title: 'Complaint Submitted & AI Analyzed',
          timestamp: 'Just now',
          description: 'Submitted with photo evidence and geocoded location. Prioritized as P1 High.',
          status: 'completed',
          actor: 'CivicMind AI'
        },
        {
          id: 't-new-2',
          title: 'Duplicate Reports Merged',
          timestamp: 'Just now',
          description: '3 duplicate reports clustered into master ticket thread.',
          status: 'completed',
          actor: 'Duplicate Agent'
        },
        {
          id: 't-new-3',
          title: 'Department Assigned',
          timestamp: 'Just now',
          description: 'Dispatched to Roads & Infrastructure Department (Ward 12 Squad #4).',
          status: 'completed',
          actor: 'Routing Agent'
        },
        {
          id: 't-new-4',
          title: 'Inspection Scheduled',
          timestamp: 'Within 2 Hours',
          description: 'Junior Engineer assigned for rapid on-site assessment.',
          status: 'current',
          actor: 'Eng. V. Kulkarni'
        }
      ]
    };

    if (onCreateComplaint) {
      onCreateComplaint(newCase);
    } else if (onViewDetails) {
      onViewDetails(newCase.id);
    } else {
      onNavigate('citizen-case-details');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative select-none">
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('citizen-dashboard')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>← Back to My Complaints</span>
          </button>
        </div>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-md">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 animate-spin" />
              <span>Civic Intelligence Neural Triage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              CivicMind Autonomous AI Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Evaluating evidence, municipal GIS layers, duplicate clusters, and priority matrix.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-500 font-bold">Category Asset:</span>
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
              {draftData.imageKey}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: EVIDENCE & COMPLAINT CONTEXT */}
          <div className="lg:col-span-5 space-y-5">
            <EvidencePanel
              imageKeyOrCategory={draftData.imageKey}
              customImageUrl={draftData.imageUrl}
              locationAddress={draftData.address}
              ward={draftData.ward}
              aiConfidence={96}
              severityLevel="P1 High"
              anomalyDetected="School Zone proximity detected (<50m). Elevated pedestrian child risk."
            />

            {/* Complaint Text Context */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs space-y-2.5">
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-blue-700">
                Citizen Input Payload
              </h4>
              <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                "{draftData.description}"
              </p>
              <div className="flex justify-between text-slate-500 pt-1 text-[11px]">
                <span>Landmark: <strong className="text-slate-800">{draftData.landmark || 'MG Road'}</strong></span>
                <span>Ward: <strong className="text-slate-800">{draftData.ward}</strong></span>
              </div>
            </div>
          </div>

          {/* RIGHT: AI ANALYSIS CHECKMARKS & REVEALED RESULTS */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* AGENT PROGRESS CHECKLIST */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  Agentic Triage Sequence
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {analysisStep} / {stepsList.length} Steps Complete
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                {stepsList.map((step, idx) => {
                  const isDone = idx < analysisStep;
                  const isCurrent = idx === analysisStep;
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center gap-3 p-2.5 rounded-xl text-xs transition-all duration-300 ${
                        isDone ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium' :
                        isCurrent ? 'bg-blue-50 text-blue-800 border border-blue-300 font-bold animate-pulse' :
                        'text-slate-400 bg-slate-50 border border-slate-100'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 flex items-center justify-center text-[9px] font-mono">
                          {idx + 1}
                        </div>
                      )}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI DECISION RESULT */}
            {isCompleted && (
              <div className="p-6 rounded-3xl bg-white border-2 border-blue-500 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-blue-600 font-bold">Analysis Verdict</span>
                    <h3 className="text-lg font-black text-slate-900">Civic Intelligence Assessment</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-300 font-black text-xs font-mono">
                    P1 — HIGH PRIORITY
                  </span>
                </div>

                {/* 6 Key Outputs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">ISSUE DETECTED</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">{draftData.category}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">SEVERITY LEVEL</span>
                    <div className="text-sm font-bold text-rose-600 mt-0.5">High (P1)</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">ESTIMATED IMPACT</span>
                    <div className="text-sm font-bold text-amber-600 mt-0.5">8.7 / 10</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">DUPLICATE REPORTS</span>
                    <div className="text-sm font-bold text-blue-700 mt-0.5">3 nearby complaints</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-2">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">RESPONSIBLE DEPARTMENT</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">Roads & Infrastructure</div>
                  </div>
                </div>

                {/* EXPLAINABLE AI SECTION */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    WHY WAS THIS PRIORITIZED? (EXPLAINABLE AI)
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>Located near primary school zone (&lt;50m crossing zone)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>High morning vehicular and pedestrian traffic density</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>3 related duplicate complaints clustered within 200m radius</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>Active hazard of two-wheeler skidding and severe injury</span>
                    </li>
                  </ul>
                </div>

                {/* CREATE COMPLAINT ACTION */}
                <div className="pt-1">
                  <button
                    id="create-complaint-btn"
                    onClick={handleCreateTicket}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileCheck2 className="w-5 h-5" />
                    <span>VIEW OFFICIAL COMPLAINT DETAILS</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                  <p className="text-center text-[11px] text-slate-500 mt-2 font-medium">
                    Ticket ID <strong className="text-blue-700 font-mono">{initialCase?.id || 'CL-2026-0847'}</strong> with real-time tracking.
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
