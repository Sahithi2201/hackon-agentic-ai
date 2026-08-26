import { 
  APCity, 
  APDepartment, 
  APOfficer, 
  APProject, 
  APProjectStatus, 
  APProjectUpdate, 
  APReviewStatus 
} from '../types/apProjectTypes';
import { 
  INITIAL_AP_PROJECTS, 
  GENERATED_OFFICERS, 
  AP_CITIES, 
  AP_DEPARTMENTS 
} from '../data/apProjectData';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';

const AP_PROJECTS_COLLECTION = 'ap_government_projects';
const AP_OFFICERS_COLLECTION = 'ap_government_officers';
const LOCAL_PROJECTS_KEY = 'ap_gov_projects_cache_v2';
const ACTIVE_OFFICER_KEY = 'ap_active_officer_session';
const ACTIVE_GOV_KEY = 'ap_active_gov_session';

// In-memory active listeners
const projectListeners = new Set<(projects: APProject[]) => void>();

export function notifyAPProjectListeners(projects: APProject[]): void {
  projectListeners.forEach((listener) => {
    try {
      listener(projects);
    } catch (e) {
      console.warn('[APProjectService] Error notifying listener:', e);
    }
  });
}

// Local storage caching helpers
export function getCachedAPProjects(): APProject[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[APProjectService] Local cache read error:', e);
  }
  return INITIAL_AP_PROJECTS;
}

export function saveCachedAPProjects(projects: APProject[]): void {
  try {
    localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('[APProjectService] Local cache write error:', e);
  }
}

// Subscribe to live projects
export function subscribeToAPProjects(
  onUpdate: (projects: APProject[]) => void,
  onError?: (err: Error) => void
): () => void {
  projectListeners.add(onUpdate);

  // Immediately feed cached data
  const cached = getCachedAPProjects();
  onUpdate(cached);

  try {
    const colRef = collection(db, AP_PROJECTS_COLLECTION);
    const unsubscribeFirestore = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: APProject[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as APProject);
          });
          // Sort by lastUpdated newest first
          list.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
          saveCachedAPProjects(list);
          notifyAPProjectListeners(list);
        } else {
          // Initialize/seed Firestore if empty
          seedAPProjectsIfEmpty();
        }
      },
      (err) => {
        console.warn('[Firestore APProjects] Snapshot error:', err);
        if (onError) onError(err);
      }
    );

    return () => {
      projectListeners.delete(onUpdate);
      unsubscribeFirestore();
    };
  } catch (err) {
    console.warn('[Firestore] Realtime subscription in offline mode:', err);
    return () => {
      projectListeners.delete(onUpdate);
    };
  }
}

// Seed initial projects to Firestore
export async function seedAPProjectsIfEmpty(): Promise<void> {
  try {
    const colRef = collection(db, AP_PROJECTS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      console.log('[APProjectService] Seeding initial Andhra Pradesh projects to Firestore...');
      for (const prj of INITIAL_AP_PROJECTS) {
        await setDoc(doc(db, AP_PROJECTS_COLLECTION, prj.projectId), prj);
      }
    }
  } catch (e) {
    console.warn('[APProjectService] Seed warning (running offline mode):', e);
  }
}

// Officer Auth Session Helpers
export function getActiveAPOfficer(): APOfficer | null {
  try {
    const raw = localStorage.getItem(ACTIVE_OFFICER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Default to first Visakhapatnam Roads officer for instant demo experience
  return GENERATED_OFFICERS[0];
}

export function setActiveAPOfficer(officer: APOfficer | null): void {
  try {
    if (officer) {
      localStorage.setItem(ACTIVE_OFFICER_KEY, JSON.stringify(officer));
    } else {
      localStorage.removeItem(ACTIVE_OFFICER_KEY);
    }
  } catch (e) {}
}

export function isGovernmentLoggedIn(): boolean {
  try {
    return localStorage.getItem(ACTIVE_GOV_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function setGovernmentLoggedIn(status: boolean): void {
  try {
    if (status) {
      localStorage.setItem(ACTIVE_GOV_KEY, 'true');
    } else {
      localStorage.removeItem(ACTIVE_GOV_KEY);
    }
  } catch (e) {}
}

// Officer lookup
export function getAllOfficers(): APOfficer[] {
  return GENERATED_OFFICERS;
}

export function getOfficerById(officerId: string): APOfficer | undefined {
  return GENERATED_OFFICERS.find((o) => o.officerId === officerId);
}

// Get single project
export function getAPProjectById(projectId: string): APProject | undefined {
  const all = getCachedAPProjects();
  return all.find((p) => p.projectId === projectId);
}

// Submit Officer Project Update
export interface SubmitProjectUpdatePayload {
  projectId: string;
  officerId: string;
  officerName: string;
  officerDesignation: string;
  status: APProjectStatus;
  completionPercentage: number;
  amountSpent: number;
  situationReport: string;
  completionPhoto?: string;
  additionalPhotos?: string[];
}

export async function submitOfficerProjectUpdate(
  payload: SubmitProjectUpdatePayload
): Promise<APProject> {
  const cleanSituation = payload.situationReport.trim();
  if (!cleanSituation) {
    throw new Error('Please enter the Current Situation / Project Progress description.');
  }

  if (payload.status === 'Completed') {
    if (payload.completionPercentage < 100) {
      payload.completionPercentage = 100;
    }
    if (!payload.completionPhoto) {
      throw new Error('A Completed Work Photo is strictly required as proof of project completion.');
    }
  }

  const all = getCachedAPProjects();
  const existing = all.find((p) => p.projectId === payload.projectId);
  if (!existing) {
    throw new Error(`Project ${payload.projectId} not found.`);
  }

  if (payload.amountSpent > existing.budget * 1.5) {
    throw new Error(`Amount spent (₹${payload.amountSpent} Cr) exceeds permissible variance of approved budget (₹${existing.budget} Cr).`);
  }

  const now = new Date();
  const formattedTime = now.toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const remainingAmount = Math.max(0, Math.round((existing.budget - payload.amountSpent) * 100) / 100);

  const newUpdate: APProjectUpdate = {
    updateId: `UPD-${payload.projectId}-${Date.now()}`,
    projectId: payload.projectId,
    officerId: payload.officerId,
    officerName: payload.officerName,
    officerDesignation: payload.officerDesignation,
    previousStatus: existing.status,
    newStatus: payload.status,
    previousCompletionPercentage: existing.completionPercentage,
    newCompletionPercentage: payload.completionPercentage,
    previousAmountSpent: existing.amountSpent,
    amountSpent: payload.amountSpent,
    situationReport: cleanSituation,
    completionPhoto: payload.completionPhoto,
    additionalPhotos: payload.additionalPhotos || [],
    submittedAt: formattedTime,
    reviewStatus: 'Submitted for Government Review'
  };

  // Combine photos
  const updatedProgressPhotos = [...(existing.progressPhotos || [])];
  if (payload.completionPhoto && !updatedProgressPhotos.includes(payload.completionPhoto)) {
    updatedProgressPhotos.unshift(payload.completionPhoto);
  }
  if (payload.additionalPhotos) {
    payload.additionalPhotos.forEach((ph) => {
      if (ph && !updatedProgressPhotos.includes(ph)) {
        updatedProgressPhotos.unshift(ph);
      }
    });
  }

  const updatedProject: APProject = {
    ...existing,
    status: payload.status,
    completionPercentage: payload.completionPercentage,
    amountSpent: payload.amountSpent,
    remainingAmount,
    latestSituation: cleanSituation,
    lastUpdated: formattedTime,
    completionPhoto: payload.completionPhoto || existing.completionPhoto,
    progressPhotos: updatedProgressPhotos,
    latestReviewStatus: 'Submitted for Government Review',
    latestCorrectionRemark: undefined,
    updates: [newUpdate, ...(existing.updates || [])]
  };

  // Update in Firestore
  try {
    const docRef = doc(db, AP_PROJECTS_COLLECTION, payload.projectId);
    await setDoc(docRef, updatedProject, { merge: true });
  } catch (err) {
    console.warn('[APProjectService] Firestore update saved locally:', err);
  }

  // Update local memory and cache
  const updatedList = all.map((p) => (p.projectId === payload.projectId ? updatedProject : p));
  saveCachedAPProjects(updatedList);
  notifyAPProjectListeners(updatedList);

  return updatedProject;
}

// Government Verification: Approve Update
export async function approveProjectUpdate(
  projectId: string,
  updateId: string,
  remarks: string = 'Update verified and approved by State Monitoring Cell.',
  reviewerName: string = 'AP Secretariat Directorate'
): Promise<APProject> {
  const all = getCachedAPProjects();
  const existing = all.find((p) => p.projectId === projectId);
  if (!existing) throw new Error('Project not found');

  const now = new Date();
  const formattedTime = now.toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const updatedHistory = (existing.updates || []).map((u) => {
    if (u.updateId === updateId) {
      return {
        ...u,
        reviewStatus: 'Approved' as APReviewStatus,
        governmentRemarks: remarks.trim() || 'Approved',
        reviewedAt: formattedTime,
        reviewedBy: reviewerName
      };
    }
    return u;
  });

  const updatedProject: APProject = {
    ...existing,
    latestReviewStatus: 'Approved',
    latestCorrectionRemark: undefined,
    updates: updatedHistory
  };

  try {
    const docRef = doc(db, AP_PROJECTS_COLLECTION, projectId);
    await setDoc(docRef, updatedProject, { merge: true });
  } catch (err) {
    console.warn('[APProjectService] Firestore update saved locally:', err);
  }

  const updatedList = all.map((p) => (p.projectId === projectId ? updatedProject : p));
  saveCachedAPProjects(updatedList);
  notifyAPProjectListeners(updatedList);

  return updatedProject;
}

// Government Verification: Request Correction
export async function requestCorrectionProjectUpdate(
  projectId: string,
  updateId: string,
  remarks: string,
  reviewerName: string = 'AP Secretariat Directorate'
): Promise<APProject> {
  const cleanRemarks = (remarks || '').trim();
  if (!cleanRemarks) {
    throw new Error('Please specify the exact correction instructions or missing information.');
  }

  const all = getCachedAPProjects();
  const existing = all.find((p) => p.projectId === projectId);
  if (!existing) throw new Error('Project not found');

  const now = new Date();
  const formattedTime = now.toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const updatedHistory = (existing.updates || []).map((u) => {
    if (u.updateId === updateId) {
      return {
        ...u,
        reviewStatus: 'Correction Requested' as APReviewStatus,
        governmentRemarks: cleanRemarks,
        reviewedAt: formattedTime,
        reviewedBy: reviewerName
      };
    }
    return u;
  });

  const updatedProject: APProject = {
    ...existing,
    latestReviewStatus: 'Correction Requested',
    latestCorrectionRemark: cleanRemarks,
    updates: updatedHistory
  };

  try {
    const docRef = doc(db, AP_PROJECTS_COLLECTION, projectId);
    await setDoc(docRef, updatedProject, { merge: true });
  } catch (err) {
    console.warn('[APProjectService] Firestore update saved locally:', err);
  }

  const updatedList = all.map((p) => (p.projectId === projectId ? updatedProject : p));
  saveCachedAPProjects(updatedList);
  notifyAPProjectListeners(updatedList);

  return updatedProject;
}

// Summary Statistics Calculator
export interface APDashboardStats {
  totalProjects: number;
  ongoingProjects: number;
  completedProjects: number;
  pendingProjects: number;
  delayedProjects: number;
  totalBudget: number; // in Crores
  amountSpent: number;
  remainingBudget: number;
  overallCompletionPct: number;
  pendingReviewsCount: number;
}

export function calculateAPDashboardStats(projects: APProject[]): APDashboardStats {
  let totalBudget = 0;
  let amountSpent = 0;
  let ongoing = 0;
  let completed = 0;
  let pending = 0;
  let delayed = 0;
  let totalCompPct = 0;
  let pendingReviewsCount = 0;

  projects.forEach((p) => {
    totalBudget += p.budget || 0;
    amountSpent += p.amountSpent || 0;
    totalCompPct += p.completionPercentage || 0;

    if (p.status === 'Completed') completed++;
    else if (p.status === 'Ongoing') ongoing++;
    else if (p.status === 'Delayed') delayed++;
    else pending++;

    if (p.latestReviewStatus === 'Submitted for Government Review') {
      pendingReviewsCount++;
    }
  });

  const total = projects.length || 1;
  return {
    totalProjects: projects.length,
    ongoingProjects: ongoing,
    completedProjects: completed,
    pendingProjects: pending,
    delayedProjects: delayed,
    totalBudget: Math.round(totalBudget * 100) / 100,
    amountSpent: Math.round(amountSpent * 100) / 100,
    remainingBudget: Math.max(0, Math.round((totalBudget - amountSpent) * 100) / 100),
    overallCompletionPct: Math.round(totalCompPct / total),
    pendingReviewsCount
  };
}
