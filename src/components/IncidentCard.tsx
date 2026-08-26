import React from 'react';
import { CivicCase } from '../types';
import { getIncidentOperationalSummary } from '../utils/operationsFormatters';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle,
  Eye,
  Flame,
  Layers,
  Compass
} from 'lucide-react';

interface IncidentCardProps {
  caseItem: CivicCase;
  onViewDetails: (caseItem: CivicCase) => void;
  onEscalate: (caseItem: CivicCase) => void;
  isSelected?: boolean;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  caseItem,
  onViewDetails,
  onEscalate,
  isSelected = false
}) => {
  const ops = getIncidentOperationalSummary(caseItem);
  const { severity, plainStatus, progressPercent, currentStageName, currentAction, nextAction, slaFormatted, slaIsUrgent } = ops;

  return (
    <div 
      className={`relative bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
        isSelected 
          ? 'border-blue-600 ring-2 ring-blue-600/20' 
          : caseItem.isEscalated
          ? 'border-rose-300 ring-1 ring-rose-500/20'
          : severity.cardBorderHover + ' border-slate-200'
      }`}
    >
      
      {/* Top Severity Ribbon / Header */}
      <div className="p-4 pb-3 space-y-3">
        
        {/* 1. SEVERITY + CODE + CATEGORY + ID */}
        <div className="flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2">
            {/* Primary Human-Readable Severity Badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black tracking-wide uppercase ${severity.pillClass}`}>
              <span className={`w-2 h-2 rounded-full ${severity.dotColor} ${severity.level === 'CRITICAL' ? 'animate-pulse' : ''}`} />
              <span>{severity.label}</span>
              <span className="text-[10px] opacity-75 font-mono ml-0.5">({severity.code})</span>
            </span>

            {caseItem.isEscalated && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-600 text-white uppercase tracking-wider animate-pulse">
                Escalated
              </span>
            )}
          </div>

          {/* Case Identifier */}
          <span className="font-mono text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            {caseItem.id}
          </span>
        </div>

        {/* 2. TITLE & LOCATION */}
        <div>
          <h3 
            onClick={() => onViewDetails(caseItem)}
            className="text-base font-black text-slate-900 leading-snug hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
            title={caseItem.title}
          >
            {caseItem.title}
          </h3>
          
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
            <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{caseItem.location.ward} · {caseItem.location.address}</span>
          </div>
        </div>

        {/* 3. STATUS & PROGRESS PIPELINE */}
        <div className="pt-2 pb-1 space-y-1.5 border-t border-slate-100">
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Status:</span>
              <span className={caseItem.status === 'Resolved' ? 'text-emerald-600' : 'text-blue-700'}>
                {plainStatus}
              </span>
            </div>
            
            <span className="font-mono text-xs font-bold text-slate-700">
              {progressPercent}%
            </span>
          </div>

          {/* Clean Horizontal Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                caseItem.status === 'Resolved'
                  ? 'bg-emerald-500'
                  : caseItem.isEscalated
                  ? 'bg-rose-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>Stage: <strong className="text-slate-800 font-medium">{currentStageName}</strong></span>
            {caseItem.duplicateCount > 0 && (
              <span className="text-amber-700 font-semibold text-[10px]">
                {caseItem.duplicateCount} duplicates merged
              </span>
            )}
          </div>

        </div>

        {/* 4. CURRENT ACTION & NEXT ACTION (Operational Focus) */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Current Action
            </span>
            <p className="text-slate-800 font-medium line-clamp-1 leading-tight">
              {currentAction}
            </p>
          </div>

          <div className="pt-1.5 border-t border-slate-200/60">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
              Next Action
            </span>
            <p className="text-slate-900 font-semibold line-clamp-1 leading-tight">
              {nextAction}
            </p>
          </div>
        </div>

        {/* 5. SLA & AI CONFIDENCE (Distinct separation!) */}
        <div className="flex items-center justify-between text-xs pt-1 text-slate-600">
          
          {/* SLA remaining */}
          <div className="flex items-center gap-1">
            <Clock className={`w-3.5 h-3.5 ${slaIsUrgent ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
            <span className={`text-[11px] font-bold ${slaIsUrgent ? 'text-rose-600' : 'text-slate-700'}`}>
              SLA: {slaFormatted}
            </span>
          </div>

          {/* AI Confidence (Separated from severity) */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500" title="Machine classification certainty">
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>AI Conf: <strong className="text-slate-800 font-bold">{caseItem.aiConfidence}%</strong></span>
          </div>

        </div>

      </div>

      {/* Bottom Action Footer */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(caseItem)}
          className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 text-slate-800 hover:text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>View Details</span>
        </button>

        {caseItem.status !== 'Resolved' && (
          <button
            type="button"
            onClick={() => onEscalate(caseItem)}
            className="py-2 px-3 rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
            title="Escalate incident to Commissioner"
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Escalate</span>
          </button>
        )}
      </div>

    </div>
  );
};
