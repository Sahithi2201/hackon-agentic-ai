import React, { useState, useEffect } from 'react';
import { 
  CivicCase, 
  CivicDepartmentInfo, 
  DepartmentOfficer, 
  PriorityLevel, 
  RiskLevel 
} from '../types';
import { 
  AICaseAnalysis, 
  analyzeCaseWithAI, 
  generateDeterministicAIAnalysis 
} from '../services/civicAiService';
import { CIVIC_DEPARTMENTS_CONFIG, getAllOfficersList } from '../services/complaintsService';
import { 
  Sparkles, 
  Bot, 
  AlertTriangle, 
  CheckCircle2, 
  Repeat, 
  Clock, 
  ShieldAlert, 
  Camera, 
  Users, 
  Building2, 
  RefreshCw, 
  Check, 
  Zap, 
  Layers, 
  ListChecks, 
  FileText, 
  ChevronRight,
  ShieldCheck,
  Info
} from 'lucide-react';

interface CivicMindAICaseAnalysisCardProps {
  caseItem: CivicCase;
  allCases?: CivicCase[];
  onAdoptDepartment?: (dept: CivicDepartmentInfo) => void;
  onAdoptOfficer?: (officer: DepartmentOfficer) => void;
  onAdoptPriority?: (risk: RiskLevel, reason: string) => void;
  onApplyAllRecommendations?: (dept: CivicDepartmentInfo, officer: DepartmentOfficer, risk: RiskLevel, reason: string) => void;
}

export const CivicMindAICaseAnalysisCard: React.FC<CivicMindAICaseAnalysisCardProps> = ({
  caseItem,
  allCases = [],
  onAdoptDepartment,
  onAdoptOfficer,
  onAdoptPriority,
  onApplyAllRecommendations
}) => {
  const [analysis, setAnalysis] = useState<AICaseAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adoptedDept, setAdoptedDept] = useState<boolean>(false);
  const [adoptedOff, setAdoptedOff] = useState<boolean>(false);
  const [adoptedRisk, setAdoptedRisk] = useState<boolean>(false);
  const [appliedAll, setAppliedAll] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setAdoptedDept(false);
    setAdoptedOff(false);
    setAdoptedRisk(false);
    setAppliedAll(false);

    // Initial instant heuristic
    const instant = generateDeterministicAIAnalysis(caseItem, allCases);
    setAnalysis(instant);

    // Then attempt live Gemini model call
    analyzeCaseWithAI(caseItem, allCases)
      .then((res) => {
        if (isMounted) {
          setAnalysis(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('AI analysis fallback used:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [caseItem.id, allCases.length]);

  if (!analysis) return null;

  // Resolve matching Department and Officer objects
  const matchedDept = CIVIC_DEPARTMENTS_CONFIG.find(d => d.key === analysis.recommendedDepartmentKey) || CIVIC_DEPARTMENTS_CONFIG[0];
  const allOfficers = getAllOfficersList();
  const matchedOfficer = allOfficers.find(o => o.id === analysis.recommendedOfficerId || o.name.toLowerCase() === (analysis.recommendedOfficerName || '').toLowerCase()) || matchedDept.officers[0];

  const mapPriorityToRisk = (priority: string): RiskLevel => {
    if (priority === 'P1') return 'CRITICAL';
    if (priority === 'P2') return 'HIGH';
    if (priority === 'P3') return 'MEDIUM';
    return 'LOW';
  };

  const recommendedRisk = mapPriorityToRisk(analysis.recommendedPriority);

  const handleAdoptDept = () => {
    onAdoptDepartment?.(matchedDept);
    setAdoptedDept(true);
  };

  const handleAdoptOff = () => {
    if (matchedOfficer) {
      onAdoptOfficer?.(matchedOfficer);
      setAdoptedOff(true);
    }
  };

  const handleAdoptPrio = () => {
    onAdoptPriority?.(recommendedRisk, analysis.priorityReason);
    setAdoptedRisk(true);
  };

  const handleApplyAll = () => {
    if (matchedOfficer) {
      onApplyAllRecommendations?.(matchedDept, matchedOfficer, recommendedRisk, analysis.priorityReason);
      setAdoptedDept(true);
      setAdoptedOff(true);
      setAdoptedRisk(true);
      setAppliedAll(true);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 text-white p-5 space-y-5 shadow-lg relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-wider">
                CIVICMIND AI INTELLIGENCE
              </span>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {analysis.modelUsed || 'AI Engine Active'}
              </span>
            </div>
            <h3 className="text-sm font-black text-white">
              AI Complaint Triage & Decision Recommendations
            </h3>
          </div>
        </div>

        {/* Action button: Apply All Recommendations */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApplyAll}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              appliedAll
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950'
            }`}
          >
            {appliedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950 font-black" />
                <span>AI Recommendations Applied</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-slate-950 font-black" />
                <span>Accept All AI Recommendations</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. PROBLEM, IMPACT & URGENCY BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        
        {/* Problem */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/20 space-y-1">
          <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold block">
            🤖 Problem Diagnosis:
          </span>
          <p className="text-slate-200 font-medium leading-relaxed">
            {analysis.problem}
          </p>
        </div>

        {/* Impact */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/20 space-y-1">
          <span className="text-[10px] font-mono text-amber-300 uppercase font-bold block">
            ⚠ Public & Health Impact:
          </span>
          <p className="text-slate-200 font-medium leading-relaxed">
            {analysis.impact}
          </p>
        </div>

        {/* Urgency & SLA */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/20 space-y-1">
          <span className="text-[10px] font-mono text-rose-300 uppercase font-bold block">
            ⏱ Urgency & SLA Pacing:
          </span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              analysis.urgency === 'CRITICAL' ? 'bg-rose-500 text-white' :
              analysis.urgency === 'HIGH' ? 'bg-amber-500 text-slate-950' :
              'bg-blue-500 text-white'
            }`}>
              {analysis.urgency} Urgency
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {analysis.slaPrediction.estimatedHoursRemaining}h remaining
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mt-1">
            {analysis.slaPrediction.delayRiskReason}
          </p>
        </div>

      </div>

      {/* 2. THREE CORE RECOMMENDATIONS (PRIORITY, DEPARTMENT, OFFICER) WITH HUMAN CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* A. PRIORITY RECOMMENDATION */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> Recommended Priority
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                analysis.recommendedPriority === 'P1' ? 'bg-rose-500 text-white' :
                analysis.recommendedPriority === 'P2' ? 'bg-amber-400 text-slate-950' :
                'bg-blue-500 text-white'
              }`}>
                {analysis.recommendedPriority} — {recommendedRisk}
              </span>
            </div>

            <div className="text-xs text-slate-300 font-medium leading-relaxed">
              <strong className="text-white">Why:</strong> "{analysis.priorityReason}"
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdoptPrio}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              adoptedRisk
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 hover:bg-indigo-600 text-white border border-slate-700'
            }`}
          >
            {adoptedRisk ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Zap className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{adoptedRisk ? 'Priority Selected ✓' : 'Accept Priority'}</span>
          </button>
        </div>

        {/* B. DEPARTMENT RECOMMENDATION */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Recommended Department
              </span>
            </div>

            <h4 className="text-xs font-black text-white">
              {analysis.recommendedDepartmentName}
            </h4>

            <div className="text-xs text-slate-300 font-medium leading-relaxed">
              <strong className="text-white">Match Reason:</strong> "{analysis.departmentReason}"
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdoptDept}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              adoptedDept
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 hover:bg-indigo-600 text-white border border-slate-700'
            }`}
          >
            {adoptedDept ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Zap className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{adoptedDept ? 'Department Selected ✓' : 'Accept Department'}</span>
          </button>
        </div>

        {/* C. OFFICER RECOMMENDATION */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Recommended Officer
              </span>
            </div>

            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>{analysis.recommendedOfficerName}</span>
              <span className="text-[10px] text-slate-400 font-normal">({analysis.recommendedDepartmentName})</span>
            </h4>

            <div className="text-xs text-slate-300 font-medium leading-relaxed">
              <strong className="text-white">Suitability:</strong> "{analysis.officerReason}"
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdoptOff}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              adoptedOff
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 hover:bg-indigo-600 text-white border border-slate-700'
            }`}
          >
            {adoptedOff ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Zap className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{adoptedOff ? 'Officer Selected ✓' : 'Accept Officer'}</span>
          </button>
        </div>

      </div>

      {/* 3. DUPLICATE COMPLAINT DETECTION */}
      {analysis.possibleDuplicates && analysis.possibleDuplicates.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Repeat className="w-4 h-4 text-amber-400" />
              Possible Duplicate Complaint Detected ({analysis.possibleDuplicates.length})
            </span>
            <span className="text-[10px] font-mono text-amber-200">
              Similarity Comparison
            </span>
          </div>

          <div className="space-y-2">
            {analysis.possibleDuplicates.map((dup, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900/90 border border-amber-500/20 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300">
                    Similar to Case #{dup.caseId}: "{dup.title}"
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-black text-[10px]">
                    {dup.similarity}% Similarity
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  📍 {dup.locationMatch} • <span className="italic text-amber-200">{dup.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. VISUAL / PHOTO EVIDENCE ANALYSIS */}
      {analysis.visualAnalysis && analysis.visualAnalysis.hasVisual && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-cyan-400" />
              AI Visual Evidence Analysis
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {analysis.visualAnalysis.confidence}
            </span>
          </div>
          <p className="text-xs text-slate-200 italic leading-relaxed">
            "{analysis.visualAnalysis.description}"
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-mono">Detected visual symptoms:</span>
            {analysis.visualAnalysis.detectedElements.map((el, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-800">
                {el}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 5. RECOMMENDED NEXT ACTIONS CHECKLIST & EXECUTIVE SUMMARY */}
      <div className="space-y-2 pt-1 border-t border-indigo-500/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-indigo-400" />
            AI Recommended Next Actions (Standard Protocol)
          </span>

          <button
            type="button"
            onClick={() => setShowSummary(!showSummary)}
            className="text-xs text-cyan-300 hover:text-cyan-200 font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showSummary ? 'Hide Summary' : 'AI SUMMARIZE'}</span>
          </button>
        </div>

        {showSummary && (
          <div className="p-3.5 rounded-xl bg-indigo-950/80 border border-cyan-500/30 text-xs text-slate-200 space-y-1 animate-in fade-in duration-150">
            <span className="font-mono text-[10px] font-bold text-cyan-300 uppercase block">
              AI Executive Summary:
            </span>
            <p className="leading-relaxed font-medium">{analysis.summary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
          {analysis.recommendedActions.map((act, i) => (
            <div key={i} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-medium leading-tight">
              {act}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
