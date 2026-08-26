import React, { useState } from 'react';
import { CivicCase } from '../types';
import { getSeverityInfo } from '../utils/operationsFormatters';
import { AlertTriangle, ShieldAlert, X, CheckCircle2, ArrowUpRight, Flame, Clock } from 'lucide-react';

interface EscalateConfirmationModalProps {
  caseItem: CivicCase | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmEscalate: (caseId: string, reason: string, notes: string) => void;
}

export const EscalateConfirmationModal: React.FC<EscalateConfirmationModalProps> = ({
  caseItem,
  isOpen,
  onClose,
  onConfirmEscalate
}) => {
  const [reason, setReason] = useState<string>('SLA Threat & Public Safety Hazard');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !caseItem) return null;

  const severity = getSeverityInfo(caseItem.priority, caseItem.isEscalated);

  const escalationReasons = [
    'SLA Threat & Public Safety Hazard',
    'Repeated Citizen Escalation / Multi-Ward Surge',
    'Critical Infrastructure / Pipeline Structural Failure',
    'School / Hospital Transit Zone Emergency',
    'Contractor Delay / Immediate Squad Intervention Required'
  ];

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmEscalate(caseItem.id, reason, additionalNotes);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl border border-rose-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="escalate-modal-title"
      >
        
        {/* Header */}
        <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono text-rose-700 uppercase tracking-wider">
                  MUNICIPAL ESCALATION PROTOCOL
                </span>
              </div>
              <h2 id="escalate-modal-title" className="text-base font-black text-slate-900 tracking-tight">
                Escalate Incident to Commissioner
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          
          {/* Incident Snapshot Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-900">{caseItem.id}</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${severity.pillClass}`}>
                  Current: {severity.label} ({severity.code})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                  Target: CRITICAL (P1)
                </span>
              </div>
            </div>
            <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{caseItem.title}</h3>
            <p className="text-[11px] text-slate-500 font-medium">{caseItem.location.address} • {caseItem.location.ward}</p>
          </div>

          {/* Reason Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block text-xs">
              Primary Escalation Reason <span className="text-rose-600">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 font-medium focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            >
              {escalationReasons.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Operational Notes */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block text-xs">
              Special Directive / Rapid Squad Instructions
            </label>
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Deploy heavy excavator unit immediately. Traffic diversion squad required at northern junction."
              className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none font-medium"
            />
          </div>

          {/* Escalation Effect Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Automated Operations Consequence:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 pl-1">
              <li>Bumps SLA urgency to Immediate Emergency (1 Hour).</li>
              <li>Sends priority SMS broadcast to Chief Municipal Officer & Ward Squad.</li>
              <li>Logs verifiable audit entry in the public civic blockchain ledger.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Dispatching...</span>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                <span>Confirm & Issue P1 Dispatch</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
