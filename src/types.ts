import { CivicImageKey } from './utils/imageAssets';

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';

export type RiskLevel = 
  | 'CRITICAL' 
  | 'HIGH' 
  | 'MEDIUM' 
  | 'LOW' 
  | 'NOT YET ASSESSED';

export type ProblemDuration =
  | 'Today'
  | '1–3 Days'
  | '4–7 Days'
  | '1–2 Weeks'
  | '2–4 Weeks'
  | '1–3 Months'
  | '3–6 Months'
  | 'More Than 6 Months'
  | 'More Than 1 Year';

export type CaseStatus = 
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'RISK_ASSESSED'
  | 'DEPARTMENT_ASSIGNED'
  | 'OFFICER_ASSIGNED'
  | 'WAITING_FOR_OFFICER_ACCEPTANCE'
  | 'WORK_ACCEPTED'
  | 'ACTION_IN_PROGRESS'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'BLOCKED / DELAYED'
  | 'AWAITING_VERIFICATION'
  | 'AWAITING GOVERNMENT VERIFICATION'
  | 'SOLVED'
  | 'RESOLVED'
  | 'CLOSED'
  // Legacy aliases for backwards UI compatibility
  | 'Open'
  | 'In Progress'
  | 'Inspection Scheduled'
  | 'Escalated';

export type CivicDepartmentKey = 
  | 'sanitation'
  | 'water'
  | 'roads'
  | 'electrical'
  | 'safety';

export interface DepartmentOfficer {
  id: string;
  officer_id?: string;
  entry_id?: string;
  username?: string;
  name: string;
  full_name?: string;
  email?: string;
  departmentKey: CivicDepartmentKey;
  departmentName: string;
  department_id?: string;
  city?: string;
  area?: string;
  currentAssignments: number;
  activeCases?: number;
  ongoingProjects?: number;
  pendingProjects?: number;
  solvedProjects?: number;
  processedProjects?: number;
  status: 'Available' | 'Busy' | 'Heavy Workload' | 'On Field';
  phone?: string;
  designation?: string;
  role?: 'DEPARTMENT_OFFICER';
  is_active?: boolean;
  pin?: string;
  password?: string;
}

export interface CivicDepartmentInfo {
  key: CivicDepartmentKey;
  name: string;
  description: string;
  coverage: string[];
  officers: DepartmentOfficer[];
}

export type CivicCategory = 
  | 'Garbage / Sanitation'
  | 'Water Supply'
  | 'Road Damage'
  | 'Streetlights'
  | 'Drainage'
  | 'Electricity'
  | 'Public Safety'
  | 'Public Property Damage'
  | 'Environmental Issue'
  | 'Health / Sanitation Hazard'
  | 'Other'
  // Legacy aliases
  | 'Roads & Infrastructure'
  | 'Water Supply & Pipelines'
  | 'Drainage & Sewage'
  | 'Waste & Sanitation'
  | 'Streetlights & Electrical'
  | 'Public Facilities';

export type DepartmentName = 
  | 'Solid Waste Management'
  | 'Water Supply & Sewerage Board'
  | 'Roads & Infrastructure Department'
  | 'Drainage & Stormwater Division'
  | 'Electrical & Street Lighting Bureau'
  | 'Public Works & Urban Facilities'
  | 'Public Health & Sanitation Division'
  | 'General Municipal Administration';

export type UserRole = 'CITIZEN' | 'GOVERNMENT_ADMIN' | 'DEPARTMENT_OFFICER' | 'SYSTEM_ADMIN' | 'OWNER' | 'GUEST';

export interface UserProfile {
  id: string;
  username?: string;
  full_name: string;
  phone: string;
  email: string;
  role: UserRole;
  citizen_id?: string;
  department?: DepartmentName;
  profile_photo?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  created_at?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  actor?: string;
  public_visible?: boolean;
}

export interface CitizenInfoResponse {
  responseText: string;
  submittedAt: string;
  submittedBy?: string;
  photoUrl?: string;
}

export interface InformationRequest {
  id: string;
  requestedBy: string;
  requestedAt: string;
  requestQuery: string;
  status: 'PENDING_CITIZEN_RESPONSE' | 'RESPONSE_SUBMITTED';
  citizenResponse?: CitizenInfoResponse;
}

export interface GovernmentNote {
  id: string;
  note: string;
  created_by: string;
  created_at: string;
  visibility: 'INTERNAL' | 'PUBLIC';
}

export interface RelatedCase {
  id: string;
  title: string;
  similarityScore: number;
  distanceMeters: number;
  status: CaseStatus;
  reportedDate: string;
}

export interface CivicCase {
  id: string;
  complaint_number?: string;
  title: string;
  description: string;
  category: CivicCategory;
  subcategory?: string;
  priority: PriorityLevel;
  status: CaseStatus;
  location: {
    city?: string;
    area?: string;
    colony?: string;
    address: string;
    ward: string;
    landmark?: string;
    postal_code?: string;
    lat: number;
    lng: number;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  imageKey?: CivicImageKey;
  evidenceImage?: string;
  evidenceImages?: string[];
  backgroundImage?: string;
  imageUrl?: string;
  resolvedImageUrl?: string;
  resolutionNotes?: string;
  affectedPopulation?: string;
  aiConfidence: number; // 0 - 100
  impactScore: number; // 0 - 10
  duplicateCount: number;
  assignedDepartment: DepartmentName | string;
  assignedOfficerName?: string;
  assignedOfficerId?: string;
  slaHoursRemaining: number;
  slaTotalHours: number;
  createdDate: string;
  updatedDate: string;
  userId?: string;
  citizenId?: string;
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  locationValidationStatus?: 'LOCATION_VALID' | 'LOCATION_MISMATCH' | 'LOCATION_CONFLICT';
  locationConflictReason?: string;
  
  // Assignment & Officer Tracking
  progress?: number; // 0 - 100%
  assignedDepartmentKey?: CivicDepartmentKey | string;
  assignedDepartmentId?: string;
  assignedBy?: string;
  assignmentTimestamp?: string;
  officerAcceptanceStatus?: 'WAITING_FOR_OFFICER_ACCEPTANCE' | 'ACCEPTED' | 'REJECTED';
  officerUpdateNote?: string;
  officerLastUpdate?: string;
  expectedCompletionDate?: string;
  isBlocked?: boolean;
  blockedReason?: string;
  resolutionReport?: {
    summary: string;
    actionTaken: string;
    completedAt: string;
    afterPhotoUrl?: string;
    verifiedByGovernment?: boolean;
    verificationNotes?: string;
  };
  
  // Real Database Fields
  problemDuration?: ProblemDuration | string;
  problemStartedDate?: string;
  systemRecommendedRisk?: RiskLevel;
  systemRecommendedReason?: string;
  finalGovernmentRisk?: RiskLevel;
  riskReason?: string;
  riskFactors?: string[];
  riskAssessedBy?: string;
  riskAssessedAt?: string;
  currentAction?: string;
  nextAction?: string;
  
  submittedAt?: string;
  acceptedAt?: string;
  resolvedAt?: string;
  closedAt?: string;

  // AI Autonomous Governance Fields
  aiValidationStatus?: 'VALID' | 'NEEDS_MORE_INFO' | 'AI_REVIEW_REQUIRED' | 'REJECTED_INVALID' | 'DUPLICATE_REVIEW';
  aiValidationReason?: string;
  aiProblemVerification?: string;
  aiConflictDetected?: boolean;
  aiConflictReason?: string;
  citizenNotificationText?: string;

  aiExplanation: {
    summary: string;
    riskFactors: string[];
    recommendedAction: string;
    detectedAnomalies?: string[];
  };
  timeline: TimelineEvent[];
  informationRequests?: InformationRequest[];
  notes?: GovernmentNote[];
  relatedCases: RelatedCase[];
  isEscalated?: boolean;
}

export interface CityHotspot {
  id: string;
  name: string;
  ward: string;
  category: CivicCategory;
  priority: PriorityLevel;
  complaintCount: number;
  trendPercentage: number;
  lat: number;
  lng: number;
  aiPattern: string;
  possibleCorrelation: string;
  recommendedAction: string;
  activeCasesCount: number;
  imageKey?: CivicImageKey;
}

export interface AIAgentDefinition {
  id: string;
  name: string;
  role: string;
  iconName: string;
  description: string;
  defaultConfidence: number;
  sampleDecision: string;
  inputs: string[];
  outputs: string[];
  model: string;
  accuracyRate: string;
  latencyTarget: string;
}

export interface AIInsightItem {
  id: string;
  type: 'urgent' | 'pattern' | 'sla_risk' | 'anomaly';
  title: string;
  description: string;
  confidence: number;
  ward: string;
  category: CivicCategory;
  recommendedAction: string;
  timestamp: string;
  connectedCasesCount: number;
  imageKey?: CivicImageKey;
}

export interface CausalNode {
  step: number;
  title: string;
  description: string;
  department: string;
  complaintSurge: string;
}

export interface OfficerWorkUpdate {
  id?: string;
  update_id: string;
  complaint_id: string;
  officer_id: string;
  officer_name: string;
  department_name: string;
  department_key?: string;
  
  // Section A: Problem Solving
  problem_type?: string;
  custom_problem?: string;
  
  // Section B: Difficulty Level
  difficulty_level?: 'Easy' | 'Moderate' | 'Difficult' | 'Critical' | string;
  difficulty_details?: string;
  
  // Section C: Employees
  employee_count?: number;
  team_details?: string;
  
  // Section D: Time Required
  time_required_value?: number;
  time_required_unit?: 'Hours' | 'Days' | 'Weeks' | 'Months' | 'Years' | string;
  estimated_time?: string;
  actual_time?: string;
  estimated_completion?: string;
  estimated_completion_date?: string;
  
  // Section E: Cost
  cost_not_available?: boolean;
  estimated_cost?: number | string;
  actual_cost?: number | string;
  cost_description?: string;
  currency?: string;
  
  // Section F: Current Result
  result?: 'PROCESSING' | 'SOLVED';
  work_status: 'IN_PROGRESS' | 'BLOCKED' | 'WORK_COMPLETED';
  progress_percentage: number;
  
  // Processing blockers
  blocker_reason?: string;
  custom_blocker?: string;
  next_step?: string;
  expected_additional_time?: string;
  
  // Solved details
  solution_description?: string;
  employees_used?: number | string;
  completion_date?: string;
  before_photos?: string[];
  after_photos?: string[];
  proof_image_url?: string;
  work_documents?: string[];
  
  // Legacy / General Notes
  work_description?: string;
  next_action?: string;
  issues_encountered?: string;
  materials_used?: string;
  
  // Review Status
  submitted_at: string;
  review_status?: 'PENDING_GOVERNMENT_REVIEW' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  government_review_status?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  reviewed_by?: string;
  reviewed_at?: string;
  government_reviewed_by?: string;
  government_reviewed_at?: string;
  government_feedback?: string;
}

export interface AssignmentHistory {
  id: string;
  complaint_id: string;
  officer_id: string;
  officer_name: string;
  department_id?: string;
  department_name: string;
  assigned_by: string;
  assigned_at: string;
  previous_status?: string;
  new_status: string;
  notes?: string;
}

export type AppView = 
  | 'landing'
  | 'home'
  | 'citizen-login'
  | 'citizen-dashboard'
  | 'citizen-report'
  | 'report'
  | 'citizen-ai-analysis'
  | 'citizen-analysis'
  | 'citizen-case-details'
  | 'citizen-case-detail'
  | 'citizen-track'
  | 'track'
  | 'track-case'
  | 'gov-login'
  | 'gov-dashboard'
  | 'command-center'
  | 'gov-live-cases'
  | 'city-intelligence'
  | 'gov-city-intelligence'
  | 'ai-resolution-engine'
  | 'ai-engine'
  | 'gov-ai-engine'
  | 'case-intelligence'
  | 'gov-case-intelligence'
  | 'departments'
  | 'gov-departments'
  | 'analytics'
  | 'gov-analytics'
  | 'officer-login'
  | 'officer-workspace'
  | 'ap-projects'
  | 'gov-projects'
  | 'ap-gov-dashboard'
  | 'ap-officer-dashboard'
  | 'ap-officer-login'
  | 'ap-gov-login';
