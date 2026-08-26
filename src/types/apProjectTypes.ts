export type APCity = 
  | 'Visakhapatnam'
  | 'Vijayawada'
  | 'Guntur'
  | 'Tirupati'
  | 'Kurnool'
  | 'Nellore'
  | 'Rajahmundry'
  | 'Kakinada'
  | 'Kadapa'
  | 'Anantapur';

export type APDepartment = 
  | 'Roads & Infrastructure'
  | 'Water Supply'
  | 'Sanitation'
  | 'Health'
  | 'Education'
  | 'Electricity'
  | 'Municipal Development'
  | 'Housing'
  | 'Public Works';

export type APProjectStatus = 
  | 'Assigned'
  | 'Ongoing'
  | 'Completed'
  | 'Delayed'
  | 'Pending';

export type APReviewStatus = 
  | 'Approved'
  | 'Submitted for Government Review'
  | 'Correction Requested';

export interface APOfficer {
  officerId: string;
  name: string;
  department: APDepartment;
  city: APCity;
  designation: string;
  email: string;
  phone: string;
  assignedProjects: number;
  ongoingProjects: number;
  completedProjects: number;
  pendingProjects: number;
  delayedProjects: number;
}

export interface APProjectUpdate {
  updateId: string;
  projectId: string;
  officerId: string;
  officerName: string;
  officerDesignation: string;
  previousStatus: APProjectStatus;
  newStatus: APProjectStatus;
  previousCompletionPercentage: number;
  newCompletionPercentage: number;
  previousAmountSpent: number;
  amountSpent: number;
  situationReport: string;
  completionPhoto?: string;
  additionalPhotos?: string[];
  submittedAt: string;
  reviewStatus: APReviewStatus;
  governmentRemarks?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface APProject {
  projectId: string;
  projectName: string;
  state: 'Andhra Pradesh';
  city: APCity;
  department: APDepartment;
  location: string;
  officerId: string;
  officerName: string;
  officerDesignation: string;
  budget: number; // in INR Crores or Lakhs
  amountSpent: number;
  remainingAmount: number;
  completionPercentage: number; // 0 - 100
  status: APProjectStatus;
  startDate: string;
  expectedCompletionDate: string;
  latestSituation: string;
  lastUpdated: string;
  completionPhoto?: string;
  progressPhotos: string[];
  updates: APProjectUpdate[];
  latestReviewStatus?: APReviewStatus;
  latestCorrectionRemark?: string;
  priority?: 'High' | 'Medium' | 'Critical';
}

export interface APPortalUser {
  id: string;
  name: string;
  role: 'government' | 'officer' | 'citizen';
  email: string;
  department?: APDepartment;
  city?: APCity;
  designation?: string;
  officerId?: string;
}
