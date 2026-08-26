import React from 'react';
import { CivicCase } from '../types';
import { 
  X, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Share2, 
  ExternalLink, 
  ArrowRight, 
  User, 
  FileText, 
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface CaseDetailsModalProps {
  caseItem: CivicCase | null;
  onClose: () => void;
  onNavigateToCaseIntelligence: (caseId: string) => void;
  onEscalateCase: (caseId: string) => void;
  onResolveCase: (caseId: string) => void;
}

export const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  caseItem,
  onClose,
  onNavigateToCaseIntelligence,
  onEscalateCase,
  onResolveCase
}) => {
  if (!caseItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0B1C33] light:bg-white rounded-3xl border border-slate-700/80 light:border-slate-300 shadow-2xl p-6 sm:p-8 text-slate-100 light:text-slate-900">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-800 light:border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs sm:text-sm font-extrabold px-3 py-1 rounded-lg bg-[#146CFF]/20 text-[#21D4FD] border border-[#146CFF]/40">
                {caseItem.id}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                caseItem.priority === 'P1'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : caseItem.priority === 'P2'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {caseItem.priority} PRIORITY
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                caseItem.status === 'Resolved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}>
                {caseItem.status}
              </span>
              {caseItem.isEscalated && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-red-600 text-white animate-pulse">
                  ESCALATED TO COMMISSIONER
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white light:text-slate-950">
              {caseItem.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400 light:text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#21D4FD]" />
                {caseItem.location.address} ({caseItem.location.ward})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Reported: {caseItem.createdDate}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 light:bg-slate-100 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
          
          {/* Left Column: Complaint Details & Evidence */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description */}
            <div className="p-4 rounded-2xl bg-slate-900/70 light:bg-slate-50 border border-slate-800 light:border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 light:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#21D4FD]" /> Citizen Incident Description
              </h3>
              <p className="text-sm leading-relaxed text-slate-200 light:text-slate-700">
                {caseItem.description}
              </p>
            </div>

            {/* Evidence Photos */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 light:text-slate-500 uppercase tracking-wider mb-3">
                Photographic & GIS Evidence
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 aspect-video group">
                  {caseItem.imageUrl ? (
                    <img
                      src={caseItem.imageUrl}
                      alt="Incident Evidence"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                      No Photo Available
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-amber-300">
                    Citizen Photo
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-slate-950/80 backdrop-blur-md text-[10px] text-slate-300 truncate">
                    GPS: {caseItem.location.lat.toFixed(4)}, {caseItem.location.lng.toFixed(4)}
                  </div>
                </div>

                {/* Resolution photo or Map snippet */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 aspect-video flex flex-col items-center justify-center p-4 text-center">
                  {caseItem.status === 'Resolved' && caseItem.resolvedImageUrl ? (
                    <>
                      <img
                        src={caseItem.resolvedImageUrl}
                        alt="Resolution Verification"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-300">
                        AI Verified After-Repair
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <ShieldCheck className="w-8 h-8 text-[#21D4FD] mx-auto opacity-70" />
                      <div className="text-xs font-bold text-white">Automated AI Vision Audit</div>
                      <p className="text-[11px] text-slate-400">
                        Post-repair photo validation will trigger automatically upon field officer submission.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Decision Rationale Box */}
            <div className="p-4 rounded-2xl bg-[#071A2D] border border-[#146CFF]/40">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#21D4FD]" />
                <h4 className="text-xs font-extrabold text-[#21D4FD] uppercase tracking-wider">
                  AI Decision & Risk Rationale
                </h4>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {caseItem.aiExplanation.summary}
              </p>
              <div className="mt-3 space-y-1.5">
                {caseItem.aiExplanation.riskFactors.map((rf, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span>{rf}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Case Telemetry & Actions */}
          <div className="space-y-4">
            
            {/* Quick Metrics Card */}
            <div className="p-4 rounded-2xl bg-slate-900/70 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">AI Confidence:</span>
                <span className="font-bold text-[#21D4FD]">{caseItem.aiConfidence}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Public Impact Score:</span>
                <span className="font-bold text-white">{caseItem.impactScore} / 10</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Duplicate Reports:</span>
                <span className="font-bold text-amber-400">{caseItem.duplicateCount} similar</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Assigned Department:</span>
                <span className="font-bold text-white text-right line-clamp-1">{caseItem.assignedDepartment}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 light:border-slate-200">
                <span className="text-slate-400">SLA Remaining:</span>
                <span className="font-bold text-rose-400">{caseItem.slaHoursRemaining}h of {caseItem.slaTotalHours}h</span>
              </div>
            </div>

            {/* Related Duplicate Cases Cluster */}
            {caseItem.relatedCases && caseItem.relatedCases.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/70 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 light:text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#21D4FD]" /> Consolidated Cluster
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold">{caseItem.relatedCases.length} linked</span>
                </div>
                <div className="space-y-2 mt-2">
                  {caseItem.relatedCases.slice(0, 2).map((rc) => (
                    <div key={rc.id} className="p-2 rounded-xl bg-slate-950/60 light:bg-slate-100 text-xs border border-slate-800/80">
                      <div className="flex items-center justify-between font-mono text-[10px] text-[#21D4FD]">
                        <span>{rc.id}</span>
                        <span className="text-emerald-400 font-bold">{rc.similarityScore}% Similar</span>
                      </div>
                      <div className="text-[11px] text-slate-300 light:text-slate-700 font-medium truncate mt-0.5">{rc.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{rc.distanceMeters}m away • {rc.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onNavigateToCaseIntelligence(caseItem.id);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#146CFF] to-[#21D4FD] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#146CFF]/20 hover:opacity-95 transition-all cursor-pointer"
              >
                <span>Open Full Case Intelligence</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              {caseItem.status !== 'Resolved' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onEscalateCase(caseItem.id)}
                    className="py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Escalate Case
                  </button>
                  <button
                    onClick={() => onResolveCase(caseItem.id)}
                    className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 light:border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <span>Smart City Resolution ID: <strong className="text-slate-200">{caseItem.id}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-800 hover:text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
