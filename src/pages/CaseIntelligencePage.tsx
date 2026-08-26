import React, { useState } from 'react';
import { CivicCase } from '../types';
import { getIncidentOperationalSummary } from '../utils/operationsFormatters';
import { EscalateConfirmationModal } from '../components/EscalateConfirmationModal';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ExternalLink, 
  Send, 
  FileText, 
  User, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Download, 
  Flame, 
  Radio, 
  Printer,
  Check,
  Activity,
  Compass
} from 'lucide-react';

interface CaseIntelligencePageProps {
  caseItem: CivicCase;
  onBack: () => void;
  onSelectCaseById: (caseId: string) => void;
  onEscalateCase: (caseId: string, reason?: string, notes?: string) => void;
  onResolveCase: (caseId: string) => void;
}

export const CaseIntelligencePage: React.FC<CaseIntelligencePageProps> = ({
  caseItem,
  onBack,
  onSelectCaseById,
  onEscalateCase,
  onResolveCase
}) => {
  const [isDecisionExpanded, setIsDecisionExpanded] = useState(true);
  const [newLogNote, setNewLogNote] = useState('');
  const [timelineEvents, setTimelineEvents] = useState(caseItem.timeline);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);

  const ops = getIncidentOperationalSummary(caseItem);
  const { severity, plainStatus, progressPercent, currentStageName, currentAction, nextAction, slaFormatted, slaIsUrgent, lifecycleStages } = ops;

  const handleAddTimelineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;

    const newEvent = {
      id: `t-${Date.now()}`,
      title: 'Municipal Field Log Entry',
      timestamp: 'Just now',
      description: newLogNote,
      status: 'completed' as const,
      actor: 'Duty Operations Officer'
    };

    setTimelineEvents([newEvent, ...timelineEvents]);
    setNewLogNote('');
  };

  const handleConfirmEscalation = (caseId: string, reason: string, notes: string) => {
    onEscalateCase(caseId, reason, notes);
    setIsEscalateModalOpen(false);
  };

  return (
    <div className="min-h-full bg-[#F8FAFC] text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP BAR: Back Navigation + Case Title + Badges + Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          
          <div className="space-y-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Municipal Operations
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Human-Readable Severity Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide ${severity.pillClass}`}>
                <span className={`w-2 h-2 rounded-full ${severity.dotColor} ${severity.level === 'CRITICAL' ? 'animate-pulse' : ''}`} />
                <span>{severity.label}</span>
                <span className="text-[10px] opacity-75 font-mono ml-0.5">({severity.code})</span>
              </span>

              <span className="font-mono text-xs sm:text-sm font-black px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                CASE: {caseItem.id}
              </span>

              <span className={`text-xs font-bold px-3 py-1 rounded-xl ${
                caseItem.status === 'Resolved'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                STATUS: {plainStatus}
              </span>

              {caseItem.isEscalated && (
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-rose-600 text-white animate-pulse">
                  ESCALATED TO COMMISSIONER
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {caseItem.title}
            </h1>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
            </button>

            {caseItem.status !== 'Resolved' && (
              <>
                <button
                  onClick={() => setIsEscalateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  <span>Escalate Case</span>
                </button>
                <button
                  onClick={() => onResolveCase(caseItem.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify & Resolve Case</span>
                </button>
              </>
            )}
          </div>

        </div>

        {/* OPERATIONS PIPELINE BANNER */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Incident Processing Lifecycle
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Progress: {progressPercent}%
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Current Stage: <strong className="text-slate-900">{currentStageName}</strong>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                caseItem.status === 'Resolved' ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
            {lifecycleStages.map((stg, i) => (
              <div key={i} className={`p-2 rounded-xl text-center border text-xs ${
                stg.status === 'completed' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold' 
                  : stg.status === 'current'
                  ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold ring-1 ring-blue-300'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="text-[10px] font-mono">{i + 1}. {stg.name}</div>
                <div className="text-[9px] mt-0.5 opacity-80">{stg.status === 'completed' ? '✓ Done' : stg.status === 'current' ? '● Active' : '○ Pending'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* THREE-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMN 1 (4 cols): ORIGINAL REPORT & EVIDENCE */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Original Citizen Report Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" /> ORIGINAL CITIZEN REPORT
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Mobile App</span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                "{caseItem.description}"
              </p>

              {/* Metadata Fields */}
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">{caseItem.location.address}</div>
                    <div className="text-[11px] text-slate-500">{caseItem.location.ward}</div>
                    {caseItem.location.landmark && (
                      <div className="text-[11px] text-blue-700 font-medium">Near {caseItem.location.landmark}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-500">Created: <strong className="text-slate-800">{caseItem.createdDate}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-slate-500">Assigned: <strong className="text-slate-900 font-bold">{caseItem.assignedDepartment}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-500">Citizen: <strong className="text-slate-800">{caseItem.citizenName || 'Verified Resident'}</strong></span>
                </div>
              </div>
            </div>

            {/* Photographic Evidence Viewer */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Photographic Evidence
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Geo-Tagged
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video group">
                <img
                  src={caseItem.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'}
                  alt="Case Evidence"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-white/90 backdrop-blur-md text-[10px] text-slate-800 font-mono font-bold border border-slate-200">
                  EXIF: GPS Validated
                </div>
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] text-white truncate">
                  Coordinates: {caseItem.location.lat.toFixed(4)}, {caseItem.location.lng.toFixed(4)}
                </div>
              </div>

              {/* Resolved Photo if Available */}
              {caseItem.status === 'Resolved' && caseItem.resolvedImageUrl && (
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-emerald-300 aspect-video mt-3">
                  <img
                    src={caseItem.resolvedImageUrl}
                    alt="Resolved Evidence"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-emerald-100 backdrop-blur-md text-[10px] text-emerald-800 font-bold">
                    Resolved & AI Verified
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* COLUMN 2 (4 cols): OPERATIONAL ACTIONS & TIMELINE */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Operational Directives Highlight */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" /> Operational Directives
              </span>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Current Action</span>
                  <p className="font-bold text-slate-900 mt-0.5">{currentAction}</p>
                </div>
                <div className="pt-2 border-t border-blue-200/60">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">Next Required Action</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{nextAction}</p>
                </div>
              </div>
            </div>

            {/* Case Timeline */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" /> CASE TIMELINE
                </span>
                <span className={`text-[11px] font-mono font-bold ${slaIsUrgent ? 'text-rose-600' : 'text-slate-600'}`}>
                  SLA: {slaFormatted}
                </span>
              </div>

              {/* Vertical Stepper Timeline */}
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {timelineEvents.map((evt) => {
                  const isDone = evt.status === 'completed';
                  const isCurrent = evt.status === 'current';
                  return (
                    <div key={evt.id} className="relative group">
                      {/* Node Dot */}
                      <div
                        className={`absolute -left-[27px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-700 text-white'
                            : isCurrent
                            ? 'bg-blue-600 border-blue-700 animate-pulse'
                            : 'bg-slate-200 border-slate-300'
                        }`}
                      >
                        {isDone && <span className="text-[8px]">✓</span>}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-bold ${isCurrent ? 'text-blue-700' : 'text-slate-900'}`}>
                            {evt.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                          {evt.description}
                        </p>
                        {evt.actor && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            By: {evt.actor}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Field Officer Note Form */}
              <form onSubmit={handleAddTimelineNote} className="pt-4 border-t border-slate-100 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">
                  Append Municipal Field Log Note
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLogNote}
                    onChange={(e) => setNewLogNote(e.target.value)}
                    placeholder="e.g. Squad on site, bitumen paving in progress..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

            </div>

          </div>

          {/* COLUMN 3 (4 cols): AI TRANSPARENCY & RELATED DUPLICATES */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* AI Decision Panel */}
            <div className="p-5 rounded-3xl bg-white border border-blue-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" /> AI CLASSIFICATION & REASONING
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Confidence: {caseItem.aiConfidence}%
                </span>
              </div>

              {/* Metric Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Severity Level</div>
                  <div className="font-bold text-slate-900 mt-0.5 truncate">{severity.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1 font-bold">Code: {severity.code}</div>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                  <div className="text-[10px] text-rose-700 uppercase font-bold">Impact Rating</div>
                  <div className="font-bold text-rose-700 mt-0.5">{caseItem.impactScore} / 10</div>
                  <div className="text-[10px] text-rose-600 mt-1 font-medium">Auto-scored</div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] text-amber-800 uppercase font-bold">Duplicate Tickets</div>
                  <div className="font-bold text-amber-700 mt-0.5">{caseItem.duplicateCount} merged</div>
                  <div className="text-[10px] text-amber-700 mt-1 font-medium">Cluster Radius: 150m</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">SLA Target Window</div>
                  <div className={`font-bold mt-0.5 ${slaIsUrgent ? 'text-rose-600' : 'text-slate-800'}`}>{slaFormatted}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">Auto-escalate enabled</div>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Recommended Protocol Action</div>
                <div className="text-xs font-bold text-emerald-700 mt-1">
                  {caseItem.aiExplanation.recommendedAction}
                </div>
              </div>

              {/* Expandable Decision Rationale */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                <button
                  onClick={() => setIsDecisionExpanded(!isDecisionExpanded)}
                  className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <span className="text-blue-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Why did AI classify as {severity.label}?
                  </span>
                  {isDecisionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isDecisionExpanded && (
                  <div className="p-3 pt-0 text-xs text-slate-700 space-y-2 border-t border-slate-200">
                    <p className="text-[11px] leading-relaxed font-medium">
                      {caseItem.aiExplanation.summary}
                    </p>
                    <div className="space-y-1 pt-1">
                      {caseItem.aiExplanation.riskFactors.map((rf, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{rf}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RELATED CASES (SIMILAR INCIDENTS) */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" /> CLUSTER DUPLICATES & SIMILAR CASES
                </span>
                <span className="text-[10px] text-amber-700 font-bold">
                  {caseItem.relatedCases?.length || 0} Cases
                </span>
              </div>

              <div className="space-y-2">
                {caseItem.relatedCases && caseItem.relatedCases.length > 0 ? (
                  caseItem.relatedCases.map((rc) => (
                    <div
                      key={rc.id}
                      onClick={() => onSelectCaseById(rc.id)}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer space-y-1 group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-blue-700 group-hover:underline">
                          {rc.id}
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                          {rc.similarityScore}% Similar
                        </span>
                      </div>
                      <div className="text-xs text-slate-900 font-bold truncate">
                        {rc.title}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>{rc.distanceMeters} meters away</span>
                        <span className="text-amber-700 font-bold">{rc.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-4 text-center">
                    No related duplicate incidents in 500m radius
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Escalate Confirmation Modal */}
      <EscalateConfirmationModal
        caseItem={isEscalateModalOpen ? caseItem : null}
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        onConfirmEscalate={handleConfirmEscalation}
      />

    </div>
  );
};
