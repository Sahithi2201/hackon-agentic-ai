import { CivicCase, PriorityLevel, CaseStatus, RiskLevel } from '../types';

export interface SeverityInfo {
  level: RiskLevel | 'INFO';
  label: string;
  code: PriorityLevel;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  cardBorderHover: string;
  pillClass: string;
  bannerBg: string;
}

export interface LifecycleStage {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
  actor?: string;
  description?: string;
}

export interface IncidentOperationalSummary {
  severity: SeverityInfo;
  plainStatus: string;
  progressPercent: number;
  currentStageName: string;
  currentAction: string;
  nextAction: string;
  slaFormatted: string;
  slaIsUrgent: boolean;
  lifecycleStages: LifecycleStage[];
  aiSummaryBrief: string;
  aiClassificationReason: string;
}

/**
 * Returns human-readable risk and severity details
 */
export function getSeverityInfo(
  priorityOrRisk?: PriorityLevel | RiskLevel | string, 
  isEscalated?: boolean,
  governmentRisk?: RiskLevel
): SeverityInfo {
  if (isEscalated) {
    return {
      level: 'CRITICAL',
      label: 'CRITICAL',
      code: 'P1',
      badgeBg: 'bg-rose-600',
      badgeText: 'text-white',
      badgeBorder: 'border-rose-700',
      dotColor: 'bg-rose-500',
      cardBorderHover: 'hover:border-rose-500',
      pillClass: 'bg-rose-100 text-rose-800 border-rose-200',
      bannerBg: 'bg-gradient-to-r from-rose-600 to-red-700 text-white'
    };
  }

  const effectiveRisk = governmentRisk || priorityOrRisk;

  if (effectiveRisk === 'CRITICAL' || effectiveRisk === 'P1') {
    return {
      level: 'CRITICAL',
      label: 'CRITICAL',
      code: 'P1',
      badgeBg: 'bg-rose-600',
      badgeText: 'text-white',
      badgeBorder: 'border-rose-700',
      dotColor: 'bg-rose-500',
      cardBorderHover: 'hover:border-rose-400',
      pillClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      bannerBg: 'bg-rose-600 text-white'
    };
  }

  if (effectiveRisk === 'HIGH' || effectiveRisk === 'P2') {
    return {
      level: 'HIGH',
      label: 'HIGH',
      code: 'P2',
      badgeBg: 'bg-amber-500',
      badgeText: 'text-slate-950',
      badgeBorder: 'border-amber-600',
      dotColor: 'bg-amber-500',
      cardBorderHover: 'hover:border-amber-400',
      pillClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      bannerBg: 'bg-amber-500 text-slate-950'
    };
  }

  if (effectiveRisk === 'MEDIUM' || effectiveRisk === 'P3') {
    return {
      level: 'MEDIUM',
      label: 'MEDIUM',
      code: 'P3',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white',
      badgeBorder: 'border-blue-700',
      dotColor: 'bg-blue-500',
      cardBorderHover: 'hover:border-blue-400',
      pillClass: 'bg-blue-100 text-blue-800 border-blue-200 font-bold',
      bannerBg: 'bg-blue-600 text-white'
    };
  }

  if (effectiveRisk === 'LOW' || effectiveRisk === 'P4') {
    return {
      level: 'LOW',
      label: 'LOW',
      code: 'P4',
      badgeBg: 'bg-slate-600',
      badgeText: 'text-white',
      badgeBorder: 'border-slate-700',
      dotColor: 'bg-slate-400',
      cardBorderHover: 'hover:border-slate-400',
      pillClass: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
      bannerBg: 'bg-slate-700 text-white'
    };
  }

  // Not yet assessed default
  return {
    level: 'NOT YET ASSESSED',
    label: 'NOT YET ASSESSED',
    code: 'P3',
    badgeBg: 'bg-slate-400',
    badgeText: 'text-white',
    badgeBorder: 'border-slate-500',
    dotColor: 'bg-slate-400',
    cardBorderHover: 'hover:border-slate-400',
    pillClass: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
    bannerBg: 'bg-slate-600 text-white'
  };
}

/**
 * Derives clear operations progress and human-readable next actions
 */
export function getIncidentOperationalSummary(caseItem: CivicCase): IncidentOperationalSummary {
  const severity = getSeverityInfo(caseItem.priority, caseItem.isEscalated, caseItem.finalGovernmentRisk);

  let plainStatus = 'Submitted';
  let progressPercent = 15;
  let currentStageName = 'Submitted';
  let currentAction = caseItem.currentAction || 'Complaint submitted to municipal queue.';
  let nextAction = caseItem.nextAction || 'Verification and initial triage review by Government Officer.';

  const st = (caseItem.status || '').toUpperCase();

  // 7-step standard lifecycle
  const stages: LifecycleStage[] = [
    { id: 's1', name: 'Submitted', status: 'completed', timestamp: caseItem.createdDate || caseItem.submittedAt, actor: caseItem.citizenName || 'Citizen' },
    { id: 's2', name: 'Under Review', status: 'pending', actor: 'Municipal Desk' },
    { id: 's3', name: 'Accepted', status: 'pending', actor: 'Government Officer' },
    { id: 's4', name: 'Risk Assessed', status: 'pending', actor: 'Triage Desk' },
    { id: 's5', name: 'Assigned', status: 'pending', actor: caseItem.assignedDepartment || 'Department' },
    { id: 's6', name: 'Action In Progress', status: 'pending', actor: caseItem.assignedOfficerName || 'Field Squad' },
    { id: 's7', name: 'Resolved', status: 'pending', actor: 'Audit Desk' }
  ];

  if (st === 'SUBMITTED') {
    plainStatus = 'Submitted — Awaiting Review';
    progressPercent = 15;
    currentStageName = 'Submitted';
    stages[0].status = 'completed';
    stages[1].status = 'current';
  } else if (st === 'UNDER_REVIEW') {
    plainStatus = 'Under Government Review';
    progressPercent = 30;
    currentStageName = 'Under Review';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'current';
  } else if (st === 'ACCEPTED') {
    plainStatus = 'Accepted by Government';
    progressPercent = 45;
    currentStageName = 'Accepted';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'current';
  } else if (st === 'RISK_ASSESSED') {
    plainStatus = `Risk Assessed: ${caseItem.finalGovernmentRisk || 'Confirmed'}`;
    progressPercent = 60;
    currentStageName = 'Risk Assessed';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'completed';
    stages[4].status = 'current';
  } else if (st === 'DEPARTMENT_ASSIGNED') {
    plainStatus = `Assigned to ${caseItem.assignedDepartment}`;
    progressPercent = 75;
    currentStageName = 'Department Assigned';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'completed';
    stages[4].status = 'completed';
    stages[5].status = 'current';
  } else if (st === 'ACTION_IN_PROGRESS' || st === 'IN PROGRESS' || st === 'IN_PROGRESS' || st === 'OPEN') {
    plainStatus = 'Action In Progress — Squad Active';
    progressPercent = 85;
    currentStageName = 'Action In Progress';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'completed';
    stages[4].status = 'completed';
    stages[5].status = 'current';
  } else if (st === 'RESOLVED') {
    plainStatus = 'Resolved & Verified';
    progressPercent = 100;
    currentStageName = 'Resolved';
    stages.forEach(s => s.status = 'completed');
  } else if (st === 'CLOSED') {
    plainStatus = 'Closed';
    progressPercent = 100;
    currentStageName = 'Closed';
    stages.forEach(s => s.status = 'completed');
  } else if (st === 'REJECTED') {
    plainStatus = 'Rejected / Ineligible';
    progressPercent = 100;
    currentStageName = 'Closed';
  }

  // SLA details
  const isCompletedCase = (caseItem.status as string) === 'RESOLVED' || (caseItem.status as string) === 'Resolved' || (caseItem.status as string) === 'CLOSED';
  let slaFormatted = `${caseItem.slaHoursRemaining ?? 48}h remaining`;
  let slaIsUrgent = (caseItem.slaHoursRemaining ?? 48) <= 2 && !isCompletedCase;
  if (isCompletedCase) {
    slaFormatted = 'Completed within SLA';
    slaIsUrgent = false;
  } else if ((caseItem.slaHoursRemaining ?? 48) < 1) {
    const mins = Math.round((caseItem.slaHoursRemaining ?? 0) * 60);
    slaFormatted = `${Math.max(0, mins)} mins remaining`;
    slaIsUrgent = true;
  }

  const aiSummaryBrief = caseItem.systemRecommendedReason || caseItem.aiExplanation?.summary || `${severity.label} priority recommendation.`;
  const aiClassificationReason = caseItem.riskReason || caseItem.riskFactors?.[0] || caseItem.aiExplanation?.riskFactors?.[0] || 'Evaluated against municipal public safety criteria.';

  return {
    severity,
    plainStatus,
    progressPercent,
    currentStageName,
    currentAction,
    nextAction,
    slaFormatted,
    slaIsUrgent,
    lifecycleStages: stages,
    aiSummaryBrief,
    aiClassificationReason
  };
}
