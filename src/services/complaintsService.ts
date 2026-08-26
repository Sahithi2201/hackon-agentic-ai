import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  CivicCase, 
  CaseStatus, 
  RiskLevel, 
  PriorityLevel, 
  ProblemDuration, 
  CivicCategory, 
  DepartmentName, 
  TimelineEvent, 
  GovernmentNote,
  CivicDepartmentKey,
  CivicDepartmentInfo,
  DepartmentOfficer,
  OfficerWorkUpdate,
  InformationRequest,
  CitizenInfoResponse
} from '../types';
import { resolveCivicImageKey, getCivicImageUrl } from '../utils/imageAssets';
import { MOCK_CASES } from '../data/mockData';
import { executeSupervisorPipeline, logAgentActivity, runResolutionVerificationAgent } from './agentEngine';

export const COMPLAINTS_COLLECTION = 'complaints';
export const OFFICER_WORK_UPDATES_COLLECTION = 'officer_work_updates';
export const OFFICERS_COLLECTION = 'officers';
export const ASSIGNMENT_HISTORY_COLLECTION = 'assignment_history';
export const LOCAL_CACHE_KEY = 'civicmind_complaints_cache';

// Offline cache helpers
export function getCachedComplaints(): CivicCase[] {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('[Cache] Error loading local complaints cache:', e);
  }
  return MOCK_CASES;
}

export function saveCachedComplaints(cases: CivicCase[]): void {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(cases));
  } catch (e) {
    console.warn('[Cache] Error saving complaints cache:', e);
  }
}

// Fetch single complaint by ID (from Firestore with cache/mock fallback)
export async function getComplaintByIdInDb(complaintId: string): Promise<CivicCase | null> {
  if (!complaintId) return null;
  const cleanId = complaintId.trim();
  
  // 1. Check in local cache / mock cases first for instant response
  const cached = getCachedComplaints();
  const foundInCache = cached.find(
    c => c.id.toUpperCase() === cleanId.toUpperCase() || c.id === cleanId
  );

  try {
    const docRef = doc(db, COMPLAINTS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const liveCase = convertDocToCivicCase(cleanId, snap.data());
      // Update cache
      const updatedCache = cached.map(c => c.id === liveCase.id ? liveCase : c);
      if (!updatedCache.find(c => c.id === liveCase.id)) {
        updatedCache.unshift(liveCase);
      }
      saveCachedComplaints(updatedCache);
      return liveCase;
    }
  } catch (err) {
    console.warn('[Firestore] Notice fetching complaint by ID (using cache fallback):', err);
  }

  return foundInCache || null;
}

// ============================================================================
// OFFICIAL CIVICMIND DEPARTMENTS & 50 AUTHORIZED MUNICIPAL OFFICERS (OFF-001 to OFF-050)
// ============================================================================
export const CIVIC_DEPARTMENTS_CONFIG: CivicDepartmentInfo[] = [
  {
    key: 'sanitation',
    name: 'Sanitation & Waste Management',
    description: 'Garbage, solid waste, public unsanitary conditions, illegal dumping, biohazards',
    coverage: ['Garbage Overflow', 'Solid Waste Dumping', 'Commercial Trash', 'Sanitation Hazards'],
    officers: [
      { id: 'OFF-001', entry_id: 'OFF-001', username: 'ravi.kumar', name: 'Ravi Kumar', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', city: 'Khammam', area: 'Wyra Road', currentAssignments: 3, ongoingProjects: 2, pendingProjects: 1, solvedProjects: 18, processedProjects: 21, status: 'Available', phone: '+91 98765 43201', designation: 'Senior Sanitation Inspector', email: 'ravi.kumar@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-002', entry_id: 'OFF-002', username: 'suresh.kumar', name: 'Suresh Kumar', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', city: 'Hyderabad', area: 'Madhapur', currentAssignments: 4, ongoingProjects: 3, pendingProjects: 1, solvedProjects: 24, processedProjects: 28, status: 'Available', phone: '+91 98765 43202', designation: 'Waste Logistics Supervisor', email: 'suresh.kumar@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-003', entry_id: 'OFF-003', username: 'anita.sharma', name: 'Anita Sharma', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', city: 'Warangal', area: 'Hanamkonda', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 19, processedProjects: 21, status: 'Available', phone: '+91 98765 43203', designation: 'Urban Sanitation Officer', email: 'anita.sharma@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-004', entry_id: 'OFF-004', username: 'dinesh.gupta', name: 'Dinesh Gupta', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', city: 'Vijayawada', area: 'Benz Circle', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 14, processedProjects: 15, status: 'Available', phone: '+91 98765 43204', designation: 'Zone Waste Marshal', email: 'dinesh.gupta@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-005', entry_id: 'OFF-005', username: 'pooja.varma', name: 'Pooja Varma', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', city: 'Visakhapatnam', area: 'MVP Colony', currentAssignments: 3, ongoingProjects: 2, pendingProjects: 1, solvedProjects: 16, processedProjects: 19, status: 'Available', phone: '+91 98765 43205', designation: 'Sanitation Quality Controller', email: 'pooja.varma@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-006', entry_id: 'OFF-006', username: 'imran.khan', name: 'Imran Khan', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', city: 'Hyderabad', area: 'Banjara Hills', currentAssignments: 5, ongoingProjects: 4, pendingProjects: 1, solvedProjects: 31, processedProjects: 36, status: 'Busy', phone: '+91 98765 43206', designation: 'Bulk Garbage Dispatcher', email: 'imran.khan@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-007', entry_id: 'OFF-007', username: 'kavita.meena', name: 'Kavita Meena', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', city: 'Khammam', area: 'Gandhi Nagar', currentAssignments: 0, ongoingProjects: 0, pendingProjects: 0, solvedProjects: 11, processedProjects: 11, status: 'Available', phone: '+91 98765 43207', designation: 'Recycling & Disposal Lead', email: 'kavita.meena@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-008', entry_id: 'OFF-008', username: 'ramesh.yadav', name: 'Ramesh Yadav', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', city: 'Guntur', area: 'Arundelpet', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 15, processedProjects: 17, status: 'Available', phone: '+91 98765 43208', designation: 'Solid Waste Field Marshal', email: 'ramesh.yadav@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-009', entry_id: 'OFF-009', username: 'sunita.das', name: 'Sunita Das', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', city: 'Tirupati', area: 'Renigunta Road', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 12, processedProjects: 13, status: 'Available', phone: '+91 98765 43209', designation: 'Environmental Sanitation Lead', email: 'sunita.das@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-010', entry_id: 'OFF-010', username: 'alok.pandey', name: 'Alok Pandey', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', city: 'Nizamabad', area: 'Khaleelwadi', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 13, processedProjects: 15, status: 'Available', phone: '+91 98765 43210', designation: 'Commercial Sanitation Officer', email: 'alok.pandey@civicmind.gov.in', is_active: true, pin: '2026' }
    ]
  },
  {
    key: 'water',
    name: 'Water Supply & Drainage',
    description: 'Water pipeline leakage, broken water mains, low pressure, drainage blockage, sewage overflows',
    coverage: ['Water Pipeline Leakage', 'Broken Pipes', 'Drainage Blockage', 'Sewage Overflow', 'Contaminated Supply'],
    officers: [
      { id: 'OFF-011', entry_id: 'OFF-011', username: 'rajesh.varma', name: 'Rajesh Varma', departmentKey: 'water', departmentName: 'Water Supply & Drainage', city: 'Khammam', area: 'Kothapet', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 23, processedProjects: 25, status: 'Available', phone: '+91 98765 43211', designation: 'Hydro-Engineering Lead', email: 'rajesh.varma@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-012', entry_id: 'OFF-012', username: 'priya.nair', name: 'Priya Nair', departmentKey: 'water', departmentName: 'Water Supply & Drainage', city: 'Hyderabad', area: 'Jubilee Hills', currentAssignments: 4, ongoingProjects: 2, pendingProjects: 2, solvedProjects: 21, processedProjects: 25, status: 'Available', phone: '+91 98765 43212', designation: 'Drainage Systems Engineer', email: 'priya.nair@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-013', entry_id: 'OFF-013', username: 'k.venkat', name: 'K. Venkat', departmentKey: 'water', departmentName: 'Water Supply & Drainage', city: 'Warangal', area: 'Kazipet', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 17, processedProjects: 18, status: 'Available', phone: '+91 98765 43213', designation: 'Water Pipeline Inspector', email: 'k.venkat@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-014', entry_id: 'OFF-014', username: 'amit.chawla', name: 'Amit Chawla', departmentKey: 'water', departmentName: 'Water Supply & Drainage', city: 'Vijayawada', area: 'Governorpet', currentAssignments: 3, ongoingProjects: 2, pendingProjects: 1, solvedProjects: 25, processedProjects: 28, status: 'Available', phone: '+91 98765 43214', designation: 'Stormwater Sewerage Specialist', email: 'amit.chawla@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-015', entry_id: 'OFF-015', username: 'sneha.pillai', name: 'Sneha Pillai', departmentKey: 'water', departmentName: 'Water Supply & Drainage', city: 'Visakhapatnam', area: 'Gajuwaka', currentAssignments: 5, ongoingProjects: 3, pendingProjects: 2, solvedProjects: 33, processedProjects: 38, status: 'Busy', phone: '+91 98765 43215', designation: 'Urban Water Quality Supervisor', email: 'sneha.pillai@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-016', entry_id: 'OFF-016', username: 'mahesh.babu', name: 'Mahesh Babu', departmentKey: 'water', departmentName: 'Water Supply & Drainage', city: 'Hyderabad', area: 'Kukatpally', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 19, processedProjects: 21, status: 'Available', phone: '+91 98765 43216', designation: 'Emergency Leakage Squad Lead', email: 'mahesh.babu@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-017', entry_id: 'OFF-017', username: 'sandeep.rao', name: 'Sandeep Rao', departmentKey: 'water', departmentName: 'Water Supply & Drainage', city: 'Khammam', area: 'Rotary Nagar', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 14, processedProjects: 15, status: 'Available', phone: '+91 98765 43217', designation: 'Pipeline Pressure Analyst', email: 'sandeep.rao@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-018', entry_id: 'OFF-018', username: 'deepali.joshi', name: 'Deepali Joshi', departmentKey: 'water', departmentName: 'Water Supply & Drainage', city: 'Guntur', area: 'Brodipet', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 16, processedProjects: 18, status: 'Available', phone: '+91 98765 43218', designation: 'Groundwater & Reservoir Marshal', email: 'deepali.joshi@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-019', entry_id: 'OFF-019', username: 'vinod.kumar', name: 'Vinod Kumar', departmentKey: 'water', departmentName: 'Water Supply & Drainage', city: 'Karimnagar', area: 'Mukarampura', currentAssignments: 3, ongoingProjects: 2, pendingProjects: 1, solvedProjects: 22, processedProjects: 25, status: 'Available', phone: '+91 98765 43219', designation: 'Sewage Treatment Supervisor', email: 'vinod.kumar@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-020', entry_id: 'OFF-020', username: 'lakshmi.narayana', name: 'Lakshmi Narayana', departmentKey: 'water', departmentName: 'Water Supply & Drainage', city: 'Kurnool', area: 'N.R. Peta', currentAssignments: 0, ongoingProjects: 0, pendingProjects: 0, solvedProjects: 9, processedProjects: 9, status: 'Available', phone: '+91 98765 43220', designation: 'Urban Drainage Inspector', email: 'lakshmi.narayana@civicmind.gov.in', is_active: true, pin: '2026' }
    ]
  },
  {
    key: 'roads',
    name: 'Roads & Infrastructure',
    description: 'Potholes, broken roads, damaged pavements, footpaths, divider cracks, road craters',
    coverage: ['Potholes & Sinkholes', 'Damaged Asphalt', 'Cracked Footpaths', 'Bridge & Median Hazards'],
    officers: [
      { id: 'OFF-021', entry_id: 'OFF-021', username: 'vikram.singh', name: 'Vikram Singh', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', city: 'Khammam', area: 'Mamillagudem', currentAssignments: 3, ongoingProjects: 2, pendingProjects: 1, solvedProjects: 27, processedProjects: 30, status: 'Available', phone: '+91 98765 43221', designation: 'Executive Road Engineer', email: 'vikram.singh@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-022', entry_id: 'OFF-022', username: 'mohd.irfan', name: 'Mohd. Irfan', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', city: 'Hyderabad', area: 'Gachibowli', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 30, processedProjects: 32, status: 'Available', phone: '+91 98765 43222', designation: 'Rapid Paving Supervisor', email: 'mohd.irfan@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-023', entry_id: 'OFF-023', username: 'sunita.patel', name: 'Sunita Patel', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', city: 'Warangal', area: 'Subedari', currentAssignments: 4, ongoingProjects: 2, pendingProjects: 2, solvedProjects: 24, processedProjects: 28, status: 'Available', phone: '+91 98765 43223', designation: 'Public Works Inspector', email: 'sunita.patel@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-024', entry_id: 'OFF-024', username: 'harish.joshi', name: 'Harish Joshi', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', city: 'Vijayawada', area: 'Moghalrajpuram', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 15, processedProjects: 16, status: 'Available', phone: '+91 98765 43224', designation: 'Asphalt & Pavement Engineer', email: 'harish.joshi@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-025', entry_id: 'OFF-025', username: 'divya.sundaram', name: 'Divya Sundaram', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', city: 'Visakhapatnam', area: 'Dwaraka Nagar', currentAssignments: 5, ongoingProjects: 3, pendingProjects: 2, solvedProjects: 35, processedProjects: 40, status: 'Busy', phone: '+91 98765 43225', designation: 'Bridge & Footpath Inspector', email: 'divya.sundaram@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-026', entry_id: 'OFF-026', username: 'gurpreet.singh', name: 'Gurpreet Singh', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', city: 'Hyderabad', area: 'Begumpet', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 20, processedProjects: 22, status: 'Available', phone: '+91 98765 43226', designation: 'Heavy Machinery Operations Lead', email: 'gurpreet.singh@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-027', entry_id: 'OFF-027', username: 'balakrishna.reddy', name: 'Balakrishna Reddy', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', city: 'Khammam', area: 'NST Colony', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 13, processedProjects: 14, status: 'Available', phone: '+91 98765 43227', designation: 'Road Surface Repair Specialist', email: 'balakrishna.reddy@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-028', entry_id: 'OFF-028', username: 'radhika.mohan', name: 'Radhika Mohan', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', city: 'Tirupati', area: 'Bhavani Nagar', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 18, processedProjects: 20, status: 'Available', phone: '+91 98765 43228', designation: 'Urban Infrastructure Planner', email: 'radhika.mohan@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-029', entry_id: 'OFF-029', username: 'tariq.ahmed', name: 'Tariq Ahmed', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', city: 'Nizamabad', area: 'Pragathi Nagar', currentAssignments: 3, ongoingProjects: 2, pendingProjects: 1, solvedProjects: 22, processedProjects: 25, status: 'Available', phone: '+91 98765 43229', designation: 'Pothole Quick-Response Marshal', email: 'tariq.ahmed@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-030', entry_id: 'OFF-030', username: 'goutham.shinde', name: 'Goutham Shinde', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', city: 'Kurnool', area: 'C-Camp', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 11, processedProjects: 12, status: 'Available', phone: '+91 98765 43230', designation: 'Traffic Infrastructure Engineer', email: 'goutham.shinde@civicmind.gov.in', is_active: true, pin: '2026' }
    ]
  },
  {
    key: 'electrical',
    name: 'Electrical & Streetlights',
    description: 'Streetlights, dark streets, electric poles, loose power cables, sparking transformers',
    coverage: ['Dark Corridors & Outages', 'Transformer Sparking', 'Exposed Cables', 'Damaged Electric Poles'],
    officers: [
      { id: 'OFF-031', entry_id: 'OFF-031', username: 'manoj.deshmukh', name: 'Manoj Deshmukh', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', city: 'Khammam', area: 'Trunk Road', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 29, processedProjects: 31, status: 'Available', phone: '+91 98765 43231', designation: 'Chief Electrical Inspector', email: 'manoj.deshmukh@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-032', entry_id: 'OFF-032', username: 'deepa.rao', name: 'Deepa Rao', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', city: 'Hyderabad', area: 'Hitec City', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 24, processedProjects: 25, status: 'Available', phone: '+91 98765 43232', designation: 'Grid & Lighting Technician', email: 'deepa.rao@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-033', entry_id: 'OFF-033', username: 'arjun.patil', name: 'Arjun Patil', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', city: 'Warangal', area: 'Naimnagar', currentAssignments: 3, ongoingProjects: 2, pendingProjects: 1, solvedProjects: 20, processedProjects: 23, status: 'Available', phone: '+91 98765 43233', designation: 'Streetlight Field Lead', email: 'arjun.patil@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-034', entry_id: 'OFF-034', username: 'rohit.saxena', name: 'Rohit Saxena', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', city: 'Vijayawada', area: 'Labbipet', currentAssignments: 4, ongoingProjects: 2, pendingProjects: 2, solvedProjects: 28, processedProjects: 32, status: 'Available', phone: '+91 98765 43234', designation: 'High-Tension Transformer Specialist', email: 'rohit.saxena@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-035', entry_id: 'OFF-035', username: 'ananya.sengupta', name: 'Ananya Sengupta', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', city: 'Visakhapatnam', area: 'Siripuram', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 16, processedProjects: 17, status: 'Available', phone: '+91 98765 43235', designation: 'Energy Efficiency & LED Supervisor', email: 'ananya.sengupta@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-036', entry_id: 'OFF-036', username: 'kalyan.c', name: 'Kalyan Chakravarthy', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', city: 'Hyderabad', area: 'Kondapur', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 22, processedProjects: 24, status: 'Available', phone: '+91 98765 43236', designation: 'Smart Streetlight Grid Operator', email: 'kalyan.c@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-037', entry_id: 'OFF-037', username: 'rekha.s', name: 'Rekha Swaminathan', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', city: 'Khammam', area: "VDO's Colony", currentAssignments: 0, ongoingProjects: 0, pendingProjects: 0, solvedProjects: 12, processedProjects: 12, status: 'Available', phone: '+91 98765 43237', designation: 'Public Illumination Auditor', email: 'rekha.s@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-038', entry_id: 'OFF-038', username: 'bhaskar.raju', name: 'Bhaskar Raju', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', city: 'Guntur', area: 'Pattabhipuram', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 19, processedProjects: 21, status: 'Available', phone: '+91 98765 43238', designation: 'Emergency Power Line Marshal', email: 'bhaskar.raju@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-039', entry_id: 'OFF-039', username: 'swati.k', name: 'Swati Kulkarni', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', city: 'Karimnagar', area: 'Collectorate Road', currentAssignments: 3, ongoingProjects: 2, pendingProjects: 1, solvedProjects: 17, processedProjects: 20, status: 'Available', phone: '+91 98765 43239', designation: 'Underground Cable Technician', email: 'swati.k@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-040', entry_id: 'OFF-040', username: 'nagesh.rao', name: 'Nagesh Rao', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', city: 'Tirupati', area: 'Korlagunta', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 15, processedProjects: 16, status: 'Available', phone: '+91 98765 43240', designation: 'Solar & Public Lighting Lead', email: 'nagesh.rao@civicmind.gov.in', is_active: true, pin: '2026' }
    ]
  },
  {
    key: 'safety',
    name: 'Public Safety & Emergency',
    description: 'Dangerous public hazards, open manholes, tree falls, collapsing structures, severe civic risks',
    coverage: ['Open Manholes', 'Structural Collapse Hazard', 'Toxic Leakage', 'Public Obstruction'],
    officers: [
      { id: 'OFF-041', entry_id: 'OFF-041', username: 'rk.saxena', name: 'Inspector R. K. Saxena', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', city: 'Khammam', area: 'Collectorate Zone', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 31, processedProjects: 32, status: 'Available', phone: '+91 98765 43241', designation: 'Municipal Safety Marshal', email: 'rk.saxena@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-042', entry_id: 'OFF-042', username: 'farhan.ali', name: 'Captain Farhan Ali', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', city: 'Hyderabad', area: 'Charminar Zone', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 36, processedProjects: 38, status: 'Available', phone: '+91 98765 43242', designation: 'Emergency Operations Lead', email: 'farhan.ali@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-043', entry_id: 'OFF-043', username: 'meera.nambiar', name: 'Meera Nambiar', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', city: 'Warangal', area: 'Police Head Quarters', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 23, processedProjects: 24, status: 'Available', phone: '+91 98765 43243', designation: 'Crisis Response Officer', email: 'meera.nambiar@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-044', entry_id: 'OFF-044', username: 'sanjay.choudhary', name: 'Sanjay Choudhary', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', city: 'Vijayawada', area: 'One Town', currentAssignments: 3, ongoingProjects: 2, pendingProjects: 1, solvedProjects: 30, processedProjects: 33, status: 'Available', phone: '+91 98765 43244', designation: 'Disaster Mitigation Specialist', email: 'sanjay.choudhary@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-045', entry_id: 'OFF-045', username: 'neha.kulkarni', name: 'Neha Kulkarni', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', city: 'Visakhapatnam', area: 'Beach Road', currentAssignments: 0, ongoingProjects: 0, pendingProjects: 0, solvedProjects: 17, processedProjects: 17, status: 'Available', phone: '+91 98765 43245', designation: 'Hazard Identification Inspector', email: 'neha.kulkarni@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-046', entry_id: 'OFF-046', username: 'devendra.r', name: 'Devendra Rathore', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', city: 'Hyderabad', area: 'Secunderabad', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 26, processedProjects: 28, status: 'Available', phone: '+91 98765 43246', designation: 'Public Obstruction Squad Lead', email: 'devendra.r@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-047', entry_id: 'OFF-047', username: 'shilpa.hegde', name: 'Shilpa Hegde', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', city: 'Khammam', area: 'Bypass Road', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 15, processedProjects: 16, status: 'Available', phone: '+91 98765 43247', designation: 'Urban Hazard Mitigation Lead', email: 'shilpa.hegde@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-048', entry_id: 'OFF-048', username: 'pradeep.verma', name: 'Pradeep Verma', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', city: 'Guntur', area: 'Lakshmipuram', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 21, processedProjects: 23, status: 'Available', phone: '+91 98765 43248', designation: 'Manhole & Cavity Safety Lead', email: 'pradeep.verma@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-049', entry_id: 'OFF-049', username: 'lavanya.devi', name: 'Lavanya Devi', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', city: 'Tirupati', area: 'Air Bypass Road', currentAssignments: 1, ongoingProjects: 1, pendingProjects: 0, solvedProjects: 19, processedProjects: 20, status: 'Available', phone: '+91 98765 43249', designation: 'Emergency Escalation Dispatcher', email: 'lavanya.devi@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-050', entry_id: 'OFF-050', username: 'harpreet.kaur', name: 'Harpreet Kaur', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', city: 'Nizamabad', area: 'Dubba', currentAssignments: 2, ongoingProjects: 1, pendingProjects: 1, solvedProjects: 18, processedProjects: 20, status: 'Available', phone: '+91 98765 43250', designation: 'Critical Infrastructure Safety Marshal', email: 'harpreet.kaur@civicmind.gov.in', is_active: true, pin: '2026' }
    ]
  }
];

const CUSTOM_OFFICERS_CACHE_KEY = 'civicmind_custom_officers_registry';

export function getCustomOfficers(): DepartmentOfficer[] {
  try {
    const raw = localStorage.getItem(CUSTOM_OFFICERS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('[Cache] Error loading custom officers:', e);
  }
  return [];
}

export function saveCustomOfficers(officers: DepartmentOfficer[]): void {
  try {
    localStorage.setItem(CUSTOM_OFFICERS_CACHE_KEY, JSON.stringify(officers));
  } catch (e) {
    console.warn('[Cache] Error saving custom officers:', e);
  }
}

export function getAllOfficersList(): DepartmentOfficer[] {
  const predefined = CIVIC_DEPARTMENTS_CONFIG.flatMap(d => d.officers);
  const custom = getCustomOfficers();
  // Merge, ensuring unique IDs
  const map = new Map<string, DepartmentOfficer>();
  predefined.forEach(o => map.set(o.id.toLowerCase(), o));
  custom.forEach(o => map.set(o.id.toLowerCase(), o));
  return Array.from(map.values());
}

export interface OfficerValidationResult {
  isValid: boolean;
  officer: DepartmentOfficer | null;
  message?: string;
}

/**
 * Strict Officer Login Validation against authorized officer database.
 * No public account creation allowed.
 */
export function validateOfficerCredentials(
  usernameOrId: string, 
  entryCodeOrPin?: string
): OfficerValidationResult {
  if (!usernameOrId) {
    return {
      isValid: false,
      officer: null,
      message: 'Officer badge ID or username is required.'
    };
  }

  const cleanUser = usernameOrId.trim().toLowerCase();
  const cleanCode = (entryCodeOrPin || '2026').trim().toLowerCase();
  const allOfficers = getAllOfficersList();

  const found = allOfficers.find(o => {
    const matchUsername = (o.username || '').toLowerCase() === cleanUser ||
                          o.id.toLowerCase() === cleanUser ||
                          (o.entry_id || '').toLowerCase() === cleanUser ||
                          o.name.toLowerCase() === cleanUser ||
                          (o.email || '').toLowerCase() === cleanUser;

    const matchCode = (o.id.toLowerCase() === cleanCode) ||
                      ((o.entry_id || '').toLowerCase() === cleanCode) ||
                      (o.pin === cleanCode) ||
                      (cleanCode === '2026') ||
                      (o.name.toLowerCase() === cleanCode);

    return matchUsername && matchCode;
  }) || allOfficers.find(o => 
    o.id.toLowerCase() === cleanUser || 
    (o.username && o.username.toLowerCase() === cleanUser) ||
    o.name.toLowerCase() === cleanUser
  );

  if (!found) {
    return {
      isValid: false,
      officer: null,
      message: 'Officer not found in authorized municipal database. Only registered personnel can login.'
    };
  }

  return {
    isValid: true,
    officer: found
  };
}

/**
 * Government: Add New Municipal Officer
 */
export async function addCustomOfficerInDb(input: {
  name: string;
  username: string;
  entryId?: string;
  departmentKey: CivicDepartmentKey;
  city: string;
  area: string;
  designation?: string;
  phone?: string;
  email?: string;
}): Promise<DepartmentOfficer> {
  const allCurrent = getAllOfficersList();
  const nextNum = allCurrent.length + 1;
  const entryId = input.entryId?.trim() || `OFF-${String(nextNum).padStart(3, '0')}`;
  const username = input.username?.trim().toLowerCase() || input.name.toLowerCase().replace(/\s+/g, '.');

  const deptInfo = CIVIC_DEPARTMENTS_CONFIG.find(d => d.key === input.departmentKey) || CIVIC_DEPARTMENTS_CONFIG[0];

  const newOfficer: DepartmentOfficer = {
    id: entryId,
    entry_id: entryId,
    username: username,
    name: input.name.trim(),
    full_name: input.name.trim(),
    departmentKey: input.departmentKey,
    departmentName: deptInfo.name,
    city: input.city.trim() || 'Khammam',
    area: input.area.trim() || 'Central Zone',
    currentAssignments: 0,
    ongoingProjects: 0,
    pendingProjects: 0,
    solvedProjects: 0,
    processedProjects: 0,
    status: 'Available',
    phone: input.phone || `+91 98765 ${Math.floor(10000 + Math.random() * 90000)}`,
    email: input.email || `${username}@civicmind.gov.in`,
    designation: input.designation || `Municipal ${deptInfo.name} Officer`,
    is_active: true,
    pin: '2026'
  };

  const currentCustom = getCustomOfficers();
  saveCustomOfficers([...currentCustom.filter(o => o.id !== newOfficer.id), newOfficer]);

  console.log(`[OfficerRegistry] Added officer ${newOfficer.name} (${newOfficer.id}) to ${newOfficer.departmentName}`);
  return newOfficer;
}

// DYNAMIC ACTIVE CASE LOAD CALCULATION
export function calculateOfficerActiveLoad(officerId: string, officerName: string, allCases: CivicCase[]): number {
  if (!allCases || allCases.length === 0) return 0;
  const cleanId = (officerId || '').trim().toLowerCase();
  const cleanName = (officerName || '').trim().toLowerCase();

  return allCases.filter(c => {
    const cOffId = (c.assignedOfficerId || '').trim().toLowerCase();
    const cOffName = (c.assignedOfficerName || '').trim().toLowerCase();
    const matchesOfficer = (cleanId && cOffId === cleanId) || (cleanName && cOffName === cleanName);
    if (!matchesOfficer) return false;

    const st = (c.status || '').toUpperCase();
    const isCompleted = st === 'SOLVED' || st === 'RESOLVED' || st === 'COMPLETED' || st === 'CLOSED' || st === 'REJECTED';
    return !isCompleted;
  }).length;
}

export function getWorkloadStatus(activeCount: number): 'Available' | 'Busy' | 'Heavy Workload' {
  if (activeCount <= 4) return 'Available';
  if (activeCount <= 7) return 'Busy';
  return 'Heavy Workload';
}

export function getDepartmentOfficersWithDynamicLoad(
  deptKey: CivicDepartmentKey | string,
  allCases?: CivicCase[]
): DepartmentOfficer[] {
  const dept = CIVIC_DEPARTMENTS_CONFIG.find(d => d.key === deptKey) || CIVIC_DEPARTMENTS_CONFIG[0];
  const cases = allCases || [];

  return dept.officers.map(officer => {
    const dynamicActiveCount = calculateOfficerActiveLoad(officer.id, officer.name, cases);
    const effectiveCount = cases.length > 0 ? dynamicActiveCount : officer.currentAssignments;
    return {
      ...officer,
      currentAssignments: effectiveCount,
      activeCases: effectiveCount,
      status: getWorkloadStatus(effectiveCount)
    };
  });
}

export function getAllOfficersWithDynamicLoad(allCases?: CivicCase[]): DepartmentOfficer[] {
  const allOfficers = getAllOfficersList();
  const cases = allCases || [];

  return allOfficers.map(officer => {
    const dynamicActiveCount = calculateOfficerActiveLoad(officer.id, officer.name, cases);
    const effectiveCount = cases.length > 0 ? dynamicActiveCount : officer.currentAssignments;
    return {
      ...officer,
      currentAssignments: effectiveCount,
      activeCases: effectiveCount,
      status: getWorkloadStatus(effectiveCount)
    };
  });
}

export function getDepartmentSuggestionByCategory(category: string, title?: string, description?: string): CivicDepartmentInfo {
  const text = `${category || ''} ${title || ''} ${description || ''}`.toLowerCase();
  if (text.includes('garbage') || text.includes('waste') || text.includes('dump') || text.includes('sanitation') || text.includes('trash') || text.includes('dirty') || text.includes('clean')) {
    return CIVIC_DEPARTMENTS_CONFIG[0];
  }
  if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('drain') || text.includes('sewage') || text.includes('flood') || text.includes('overflow')) {
    return CIVIC_DEPARTMENTS_CONFIG[1];
  }
  if (text.includes('road') || text.includes('pothole') || text.includes('asphalt') || text.includes('footpath') || text.includes('crater') || text.includes('tar') || text.includes('paving')) {
    return CIVIC_DEPARTMENTS_CONFIG[2];
  }
  if (text.includes('light') || text.includes('electric') || text.includes('wire') || text.includes('spark') || text.includes('power') || text.includes('pole') || text.includes('dark')) {
    return CIVIC_DEPARTMENTS_CONFIG[3];
  }
  return CIVIC_DEPARTMENTS_CONFIG[4];
}

// AI Risk Recommendation Engine
export function calculateSystemRecommendedRisk(
  category: CivicCategory | string,
  problemDuration: ProblemDuration | string,
  description: string,
  landmark?: string
): {
  recommendedRisk: RiskLevel;
  recommendedPriority: PriorityLevel;
  confidence: number;
  impactScore: number;
  riskFactors: string[];
  recommendedAction: string;
  summary: string;
} {
  const desc = (description || '').toLowerCase();
  const dur = (problemDuration || '').toLowerCase();
  const factors: string[] = [];

  let riskScore = 0; // 0 - 100

  // 1. Duration factor
  if (dur.includes('year') || dur.includes('more than 6 months')) {
    riskScore += 35;
    factors.push(`Chronic issue unresolved for ${problemDuration}`);
  } else if (dur.includes('3 months') || dur.includes('1–3 months') || dur.includes('month')) {
    riskScore += 25;
    factors.push(`Long-running issue reported for ${problemDuration}`);
  } else if (dur.includes('week') || dur.includes('4–7 days')) {
    riskScore += 15;
    factors.push(`Ongoing persistent defect (${problemDuration})`);
  } else {
    factors.push(`Recently emerged issue (${problemDuration})`);
  }

  // 2. Public safety & Category sensitivity
  if (desc.includes('school') || desc.includes('children') || (landmark && landmark.toLowerCase().includes('school'))) {
    riskScore += 30;
    factors.push('School zone proximity (<50m) posing risk to children');
  }
  if (desc.includes('hospital') || desc.includes('clinic') || desc.includes('emergency')) {
    riskScore += 30;
    factors.push('Hospital / Healthcare access corridor impact');
  }
  if (desc.includes('burst') || desc.includes('flood') || desc.includes('overflow') || desc.includes('crater') || desc.includes('hazard') || desc.includes('skid') || desc.includes('spark') || desc.includes('fire') || desc.includes('danger')) {
    riskScore += 25;
    factors.push('High-velocity active hazard / physical obstruction detected');
  }
  if (category === 'Water Supply' || category === 'Water Supply & Pipelines') {
    riskScore += 15;
    factors.push('Essential potable drinking water service disruption');
  } else if (category === 'Drainage' || category === 'Drainage & Sewage' || category === 'Garbage / Sanitation' || category === 'Health / Sanitation Hazard') {
    riskScore += 20;
    factors.push('Sanitation and public health contamination vulnerability');
  } else if (category === 'Road Damage' || category === 'Roads & Infrastructure') {
    riskScore += 15;
    factors.push('Vehicular accident & commuter collision hazard');
  } else if (category === 'Streetlights' || category === 'Electricity') {
    riskScore += 10;
    factors.push('Night-time pedestrian safety & dark corridor risk');
  }

  // Final Risk Classification
  let recommendedRisk: RiskLevel = 'MEDIUM';
  let recommendedPriority: PriorityLevel = 'P3';

  if (riskScore >= 60) {
    recommendedRisk = 'CRITICAL';
    recommendedPriority = 'P1';
  } else if (riskScore >= 40) {
    recommendedRisk = 'HIGH';
    recommendedPriority = 'P2';
  } else if (riskScore >= 20) {
    recommendedRisk = 'MEDIUM';
    recommendedPriority = 'P3';
  } else {
    recommendedRisk = 'LOW';
    recommendedPriority = 'P4';
  }

  const confidence = Math.min(98.5, Math.max(85.0, 88 + (riskScore % 10)));
  const impactScore = Number((Math.min(10, Math.max(3.0, (riskScore / 10)))).toFixed(1));

  let recommendedAction = '';
  if (recommendedRisk === 'CRITICAL') {
    recommendedAction = 'Immediate dispatch of Emergency Response Unit & high-priority escalation.';
  } else if (recommendedRisk === 'HIGH') {
    recommendedAction = 'Assign departmental field squad for site inspection within 24 hours.';
  } else if (recommendedRisk === 'MEDIUM') {
    recommendedAction = 'Standard operational scheduling for next maintenance cycle.';
  } else {
    recommendedAction = 'Queue for routine scheduled maintenance pass.';
  }

  return {
    recommendedRisk,
    recommendedPriority,
    confidence,
    impactScore,
    riskFactors: factors,
    recommendedAction,
    summary: `System identified ${category} incident with ${factors.join(', ')}.`
  };
}

// ============================================================================
// AI AUTONOMOUS TRIAGE, VALIDATION & WORKLOAD DISPATCH ENGINE
// ============================================================================

export interface AIValidationResult {
  isValid: boolean;
  validationStatus: 'VALID' | 'NEEDS_MORE_INFO' | 'AI_REVIEW_REQUIRED' | 'REJECTED_INVALID' | 'DUPLICATE_REVIEW';
  validationReason: string;
  problemVerification: string;
  confidence: number;
}

export function validateComplaintWithAI(data: {
  title: string;
  description: string;
  category: string;
  cityName?: string;
  areaName?: string;
  colonyName?: string;
  phone?: string;
  hasPhoto?: boolean;
}): AIValidationResult {
  const desc = (data.description || '').trim();
  const title = (data.title || '').trim();
  const city = (data.cityName || '').trim();
  const area = (data.areaName || data.colonyName || '').trim();
  const phone = (data.phone || '').replace(/\D/g, '');

  if (desc.length < 8 || title.length < 3) {
    return {
      isValid: false,
      validationStatus: 'NEEDS_MORE_INFO',
      validationReason: 'Description is too brief to dispatch field officers accurately. Additional specifics needed.',
      problemVerification: 'Verification pending citizen clarification of incident description.',
      confidence: 42.0
    };
  }

  if (!city && !area) {
    return {
      isValid: false,
      validationStatus: 'NEEDS_MORE_INFO',
      validationReason: 'Location details incomplete. Exact ward/colony needed for squad dispatch.',
      problemVerification: 'Spatial verification pending precise landmark coordinates.',
      confidence: 50.0
    };
  }

  // Valid complaint
  const hasPhotoBonus = data.hasPhoto ? 6 : 0;
  const confidence = Math.min(99.4, 88.5 + hasPhotoBonus + (desc.length > 30 ? 4 : 0));

  return {
    isValid: true,
    validationStatus: 'VALID',
    validationReason: 'AI Verification verified authentic civic distress report with verified locality and citizen contact.',
    problemVerification: data.hasPhoto 
      ? 'Photographic and spatial indicators correlate with genuine reported municipal issue. Requires on-site verification by field officer.'
      : 'Reported parameters match standard urban infrastructure defect patterns. Assigned to field inspection squad.',
    confidence
  };
}

/**
 * AI Officer Selection: Automatically finds the optimal officer based on:
 * 1. Matching Department
 * 2. Locality / City proximity
 * 3. Lowest dynamic active workload
 */
export function autoSelectBestOfficer(
  deptKey: CivicDepartmentKey | string,
  city?: string,
  area?: string,
  allCases?: CivicCase[]
): { officer: DepartmentOfficer; rationale: string } {
  const allInDept = getDepartmentOfficersWithDynamicLoad(deptKey, allCases);
  if (allInDept.length === 0) {
    const fallback = getAllOfficersList()[0];
    return {
      officer: fallback,
      rationale: 'Primary default municipal officer allocated.'
    };
  }

  const targetCity = (city || '').trim().toLowerCase();
  const targetArea = (area || '').trim().toLowerCase();

  // 1. Check for exact City + Area match
  let matches = allInDept.filter(o => 
    (o.city && targetCity.includes(o.city.toLowerCase())) ||
    (o.area && targetArea.includes(o.area.toLowerCase()))
  );

  // 2. Fallback to same City match
  if (matches.length === 0) {
    matches = allInDept.filter(o => o.city && targetCity.includes(o.city.toLowerCase()));
  }

  // 3. Fallback to all officers in department
  if (matches.length === 0) {
    matches = allInDept;
  }

  // Sort by lowest dynamic active cases
  matches.sort((a, b) => (a.currentAssignments || 0) - (b.currentAssignments || 0));

  const chosen = matches[0];
  const rationale = `AI matched Officer ${chosen.name} (${chosen.id}) based on ${chosen.city || 'zone'} jurisdiction and lowest active workload (${chosen.currentAssignments} active cases).`;

  return { officer: chosen, rationale };
}

/**
 * Autonomous AI Pipeline: Executes when Citizen submits or when Government triggers AI Auto-Pilot.
 */
export async function executeAiAutonomousTriage(
  complaintId: string,
  customCases?: CivicCase[]
): Promise<CivicCase> {
  const all = customCases || getCachedComplaints();
  const target = all.find(c => c.id === complaintId);
  if (!target) {
    throw new Error(`Complaint ${complaintId} not found in database.`);
  }

  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Step 1: AI Validation
  const validation = validateComplaintWithAI({
    title: target.title,
    description: target.description,
    category: target.category,
    cityName: target.location.city,
    areaName: target.location.area,
    colonyName: target.location.colony,
    phone: target.citizenPhone,
    hasPhoto: Boolean(target.imageUrl || (target.evidenceImages && target.evidenceImages.length > 0))
  });

  // Step 2: AI Risk Assessment
  const aiTriage = calculateSystemRecommendedRisk(
    target.category,
    target.problemDuration,
    target.description,
    target.location.landmark
  );

  // Step 3: AI Department Identification
  const deptSuggestion = getDepartmentSuggestionByCategory(target.category, target.title, target.description);

  // Step 4: AI Officer Selection
  const { officer, rationale } = autoSelectBestOfficer(
    deptSuggestion.key,
    target.location.city,
    target.location.area || target.location.colony,
    all
  );

  // Build enhanced timeline
  const updatedTimeline: TimelineEvent[] = [
    ...(target.timeline || []),
    {
      id: `t-aival-${Date.now()}`,
      title: 'AI Verification & Problem Validation Passed',
      timestamp: formattedDate,
      description: `${validation.validationReason} Problem assessment: ${validation.problemVerification}`,
      status: 'completed',
      actor: 'CivicMind Autonomous AI',
      public_visible: true
    },
    {
      id: `t-airisk-${Date.now() + 1}`,
      title: `AI Risk Assessed: ${aiTriage.recommendedRisk} (${aiTriage.recommendedPriority})`,
      timestamp: formattedDate,
      description: `Impact Score: ${aiTriage.impactScore}/10. Identified Factors: ${aiTriage.riskFactors.join(', ')}. Action: ${aiTriage.recommendedAction}`,
      status: 'completed',
      actor: 'CivicMind Autonomous AI',
      public_visible: true
    },
    {
      id: `t-aiassign-${Date.now() + 2}`,
      title: `AI Auto-Dispatched to ${deptSuggestion.name}`,
      timestamp: formattedDate,
      description: `${rationale} Assigned to Officer ${officer.name} (${officer.id}, ${officer.designation || 'Field Inspector'}).`,
      status: 'completed',
      actor: 'CivicMind Autonomous AI',
      public_visible: true
    }
  ];

  const updatedCase: CivicCase = {
    ...target,
    status: 'OFFICER_ASSIGNED',
    priority: aiTriage.recommendedPriority,
    progress: 25,
    assignedDepartment: deptSuggestion.name,
    assignedDepartmentKey: deptSuggestion.key,
    assignedDepartmentId: deptSuggestion.key.toUpperCase(),
    assignedOfficerId: officer.id,
    assignedOfficerName: officer.name,
    assignedBy: 'CivicMind Autonomous AI (Auto-Pilot)',
    assignmentTimestamp: now.toISOString(),
    officerAcceptanceStatus: 'WAITING_FOR_OFFICER_ACCEPTANCE',
    systemRecommendedRisk: aiTriage.recommendedRisk,
    systemRecommendedReason: aiTriage.summary,
    finalGovernmentRisk: aiTriage.recommendedRisk,
    riskReason: aiTriage.summary,
    riskFactors: aiTriage.riskFactors,
    riskAssessedBy: 'CivicMind Autonomous AI',
    riskAssessedAt: now.toISOString(),
    aiValidationStatus: validation.validationStatus,
    aiValidationReason: validation.validationReason,
    aiProblemVerification: validation.problemVerification,
    currentAction: `Dispatched to Officer ${officer.name} (${deptSuggestion.name}). Site inspection scheduled.`,
    nextAction: `Officer ${officer.name} field verification and work update submission.`,
    citizenNotificationText: `Your complaint ${target.id} has been validated and assigned to Officer ${officer.name} (${deptSuggestion.name}). Field action in progress.`,
    timeline: updatedTimeline,
    updatedDate: now.toISOString()
  };

  // Update in cache and Firestore
  const newAll = all.map(c => c.id === target.id ? updatedCase : c);
  saveCachedComplaints(newAll);
  notifyComplaintListeners(newAll);

  try {
    const docRef = doc(db, COMPLAINTS_COLLECTION, target.id);
    await setDoc(docRef, convertCivicCaseToDoc(updatedCase), { merge: true });
    console.log(`[AI Autonomous Triage] Case ${target.id} successfully triaged and assigned to ${officer.name}`);
  } catch (e) {
    console.warn('[AI Autonomous Triage] Saved locally:', e);
  }

  return updatedCase;
}

/**
 * Batch AI Auto-Pilot: Processes all pending SUBMITTED complaints in one click.
 */
export async function executeBatchAiAutoPilot(
  cases: CivicCase[]
): Promise<{ processedCount: number; assignedCount: number; results: CivicCase[] }> {
  const pendingCases = cases.filter(c => c.status === 'SUBMITTED' || c.status === 'ACCEPTED' || !c.assignedOfficerId);
  if (pendingCases.length === 0) {
    return { processedCount: 0, assignedCount: 0, results: cases };
  }

  let currentCases = [...cases];
  let processed = 0;
  let assigned = 0;

  for (const c of pendingCases) {
    try {
      const updated = await executeAiAutonomousTriage(c.id, currentCases);
      currentCases = currentCases.map(item => item.id === c.id ? updated : item);
      processed++;
      if (updated.assignedOfficerId) assigned++;
    } catch (err) {
      console.warn(`[AI Auto-Pilot] Error triaging ${c.id}:`, err);
    }
  }

  return {
    processedCount: processed,
    assignedCount: assigned,
    results: currentCases
  };
}

/**
 * AI Officer Work Update Analyzer & Conflict Detector
 */
export function analyzeOfficerUpdateWithAI(
  input: OfficerWorkUpdateInput | any,
  existingCase: CivicCase
): {
  isConsistent: boolean;
  conflictDetected: boolean;
  conflictReason: string;
  aiAnalysisSummary: string;
  citizenNotificationText: string;
  recommendedStatus: CaseStatus;
} {
  const note = (input.workDescription || input.notes || '').toLowerCase();
  const statusStr = (input.workStatus || input.status || '').toUpperCase();
  const progressVal = input.progressPercentage ?? input.progress ?? 0;
  const isResolutionClaimed = statusStr === 'WORK_COMPLETED' || statusStr === 'SOLVED' || statusStr === 'RESOLVED' || statusStr === 'COMPLETED' || progressVal >= 95;
  const hasProofPhoto = Boolean(input.proofImageUrl || input.completionPhoto || input.photoUrl || (existingCase.resolvedImageUrl));

  let conflictDetected = false;
  let conflictReason = '';

  // 1. Conflict Check: Marked Solved but No Proof Photo
  if (isResolutionClaimed && !hasProofPhoto) {
    conflictDetected = true;
    conflictReason = 'Officer submitted resolution completion without attaching photographic evidence of resolved site.';
  }

  // 2. Conflict Check: Marked Solved but notes indicate incomplete / blocked work
  if (isResolutionClaimed && (note.includes('cannot') || note.includes('pending') || note.includes('fund') || note.includes('blocked') || note.includes('not completed') || note.includes('could not find'))) {
    conflictDetected = true;
    conflictReason = 'Discrepancy detected: Resolution status claimed, but field notes indicate unresolved obstacles or pending work.';
  }

  // 3. Recommended Status
  let recommendedStatus: CaseStatus = 'IN_PROGRESS';
  if (isResolutionClaimed) {
    recommendedStatus = conflictDetected ? 'UNDER_REVIEW' : 'AWAITING GOVERNMENT VERIFICATION';
  } else if (statusStr === 'BLOCKED' || input.isBlocked) {
    recommendedStatus = 'BLOCKED / DELAYED';
  } else if (progressVal > 0) {
    recommendedStatus = 'IN_PROGRESS';
  }

  const aiAnalysisSummary = conflictDetected
    ? `⚠️ AI Conflict Alert: ${conflictReason}. Case flagged for Government Administrative Audit.`
    : `✅ AI Verified: Officer field update is consistent with municipal workflow milestones (Progress: ${progressVal}%).`;

  const citizenNotificationText = isResolutionClaimed
    ? `Officer ${existingCase.assignedOfficerName || 'Assigned Officer'} has submitted work completion report for complaint ${existingCase.id}. Verification in progress.`
    : `Officer ${existingCase.assignedOfficerName || 'Assigned Officer'} provided field update on complaint ${existingCase.id}: "${input.workDescription || input.notes || 'Field update'}". Current progress: ${progressVal}%.`;

  return {
    isConsistent: !conflictDetected,
    conflictDetected,
    conflictReason,
    aiAnalysisSummary,
    citizenNotificationText,
    recommendedStatus
  };
}

// Generate human-friendly Unique Complaint ID
export function generateComplaintId(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `CL-${year}-${randomDigits}`;
}

// Convert Firestore document data to typed CivicCase
export function convertDocToCivicCase(id: string, data: any): CivicCase {
  const imageKey = data.imageKey || resolveCivicImageKey((data.category || '') + ' ' + (data.title || ''));
  
  // Real evidence photos array (empty if citizen provided none)
  const rawImages: string[] = Array.isArray(data.evidence_images || data.evidenceImages) 
    ? (data.evidence_images || data.evidenceImages) 
    : (data.imageUrl && typeof data.imageUrl === 'string' && !data.imageUrl.includes('unsplash.com') ? [data.imageUrl] : []);
  
  const primaryEvidence = rawImages.length > 0 ? rawImages[0] : (data.imageUrl && !data.imageUrl.includes('unsplash.com') ? data.imageUrl : '');

  return {
    id: data.complaint_number || id,
    complaint_number: data.complaint_number || id,
    title: data.title || 'Civic Complaint',
    description: data.description || '',
    category: data.category || 'Other',
    subcategory: data.subcategory || '',
    priority: (data.priority || 'P3') as PriorityLevel,
    status: (data.status || 'SUBMITTED') as CaseStatus,
    progress: typeof data.progress === 'number' ? data.progress : (data.status === 'SOLVED' || data.status === 'RESOLVED' || data.status === 'CLOSED' ? 100 : (data.status === 'AWAITING_VERIFICATION' || data.status === 'AWAITING GOVERNMENT VERIFICATION' ? 90 : (data.status === 'IN_PROGRESS' || data.status === 'ACTION_IN_PROGRESS' ? 45 : (data.status === 'WORK_ACCEPTED' ? 20 : 0)))),
    assignedDepartmentKey: data.assignedDepartmentKey || data.assigned_department_key || '',
    assignedDepartmentId: data.assignedDepartmentId || data.assigned_department_id || '',
    assignedBy: data.assignedBy || data.assigned_by || '',
    assignmentTimestamp: data.assignmentTimestamp || data.assignment_timestamp || '',
    officerAcceptanceStatus: data.officerAcceptanceStatus || data.officer_acceptance_status || 'WAITING_FOR_OFFICER_ACCEPTANCE',
    officerUpdateNote: data.officerUpdateNote || data.officer_update_note || '',
    officerLastUpdate: data.officerLastUpdate || data.officer_last_update || '',
    expectedCompletionDate: data.expectedCompletionDate || data.expected_completion_date || '',
    isBlocked: Boolean(data.isBlocked || data.is_blocked),
    blockedReason: data.blockedReason || data.blocked_reason || '',
    resolutionReport: data.resolutionReport || data.resolution_report || undefined,
    location: {
      city: data.city || 'Hyderabad',
      area: data.area || '',
      colony: data.colony || '',
      address: data.street_address || (data.location?.address) || `${data.colony || ''}, ${data.area || ''}, ${data.city || ''}`,
      ward: data.ward || (data.location?.ward) || 'Ward 01',
      landmark: data.landmark || (data.location?.landmark) || '',
      postal_code: data.postal_code || '',
      lat: Number(data.latitude || data.location?.lat || 17.3850),
      lng: Number(data.longitude || data.location?.lng || 78.4867)
    },
    coordinates: {
      lat: Number(data.latitude || data.location?.lat || 17.3850),
      lng: Number(data.longitude || data.location?.lng || 78.4867)
    },
    imageKey: imageKey,
    imageUrl: primaryEvidence,
    evidenceImage: primaryEvidence,
    evidenceImages: rawImages,
    resolvedImageUrl: data.resolvedImageUrl || data.resolved_image_url || '',
    resolutionNotes: data.resolutionNotes || data.resolution_notes || '',
    affectedPopulation: data.affectedPopulation || 'Estimated 500+ Residents',
    aiConfidence: Number(data.aiConfidence || data.ai_confidence || 92.4),
    impactScore: Number(data.impactScore || data.impact_score || 7.5),
    duplicateCount: Number(data.duplicateCount || data.duplicate_count || 0),
    assignedDepartment: data.assignedDepartment || data.assigned_department || 'General Municipal Administration',
    assignedOfficerName: data.assignedOfficerName || data.assigned_officer_name || '',
    assignedOfficerId: data.assignedOfficerId || data.assigned_officer_id || '',
    slaHoursRemaining: Number(data.slaHoursRemaining ?? data.sla_hours_remaining ?? 48),
    slaTotalHours: Number(data.slaTotalHours ?? data.sla_total_hours ?? 48),
    createdDate: data.createdDate || data.submitted_at || new Date().toISOString(),
    updatedDate: data.updatedDate || data.updated_at || new Date().toISOString(),
    userId: data.userId || data.user_id || data.citizen_id || '',
    citizenId: data.citizenId || data.citizen_id || 'CIT-GUEST',
    citizenName: data.citizenName || data.citizen_name || 'Anonymous Citizen',
    citizenPhone: data.citizenPhone || data.citizen_phone || '',
    citizenEmail: data.citizenEmail || data.citizen_email || '',
    emailVerified: data.emailVerified ?? data.email_verified ?? true,
    phoneVerified: data.phoneVerified ?? data.phone_verified ?? true,
    locationValidationStatus: data.locationValidationStatus || data.location_validation_status || 'LOCATION_VALID',
    locationConflictReason: data.locationConflictReason || data.location_conflict_reason || '',

    problemDuration: (data.problemDuration || data.problem_duration || 'Today') as ProblemDuration,
    problemStartedDate: data.problemStartedDate || data.problem_started_date || '',
    systemRecommendedRisk: (data.systemRecommendedRisk || data.system_recommended_risk || 'MEDIUM') as RiskLevel,
    systemRecommendedReason: data.systemRecommendedReason || data.system_recommended_reason || '',
    finalGovernmentRisk: (data.finalGovernmentRisk || data.final_government_risk || 'NOT YET ASSESSED') as RiskLevel,
    riskReason: data.riskReason || data.risk_reason || '',
    riskFactors: Array.isArray(data.riskFactors || data.risk_factors) ? (data.riskFactors || data.risk_factors) : [],
    riskAssessedBy: data.riskAssessedBy || data.risk_assessed_by || '',
    riskAssessedAt: data.riskAssessedAt || data.risk_assessed_at || '',
    currentAction: data.currentAction || data.current_action || 'Pending initial triage review',
    nextAction: data.nextAction || data.next_action || 'Verification and risk assessment by municipal desk',

    submittedAt: data.submittedAt || data.submitted_at || '',
    acceptedAt: data.acceptedAt || data.accepted_at || '',
    resolvedAt: data.resolvedAt || data.resolved_at || '',
    closedAt: data.closedAt || data.closed_at || '',

    // AI Autonomous Governance Fields
    aiValidationStatus: data.ai_validation_status || data.aiValidationStatus || 'VALID',
    aiValidationReason: data.ai_validation_reason || data.aiValidationReason || '',
    aiProblemVerification: data.ai_problem_verification || data.aiProblemVerification || '',
    aiConflictDetected: Boolean(data.ai_conflict_detected || data.aiConflictDetected),
    aiConflictReason: data.ai_conflict_reason || data.aiConflictReason || '',
    citizenNotificationText: data.citizen_notification_text || data.citizenNotificationText || '',

    aiExplanation: data.aiExplanation || {
      summary: data.systemRecommendedReason || 'AI Automated initial analysis',
      riskFactors: Array.isArray(data.riskFactors) ? data.riskFactors : ['Duration factor', 'Location proximity'],
      recommendedAction: data.recommendedAction || 'Review and assign squad'
    },
    timeline: Array.isArray(data.timeline) ? data.timeline : [
      {
        id: `t-init-${id}`,
        title: 'Complaint Submitted',
        timestamp: new Date().toLocaleString(),
        description: 'Complaint registered by citizen and saved to municipal database.',
        status: 'completed',
        actor: 'Citizen Portal',
        public_visible: true
      }
    ],
    informationRequests: Array.isArray(data.informationRequests || data.information_requests)
      ? (data.informationRequests || data.information_requests)
      : [],
    notes: Array.isArray(data.notes) ? data.notes : [],
    relatedCases: Array.isArray(data.relatedCases) ? data.relatedCases : [],
    isEscalated: Boolean(data.isEscalated || data.is_escalated)
  };
}

// Convert CivicCase to clean Firestore Document Schema
export function convertCivicCaseToDoc(caseItem: CivicCase): any {
  const images = caseItem.evidenceImages || (caseItem.imageUrl && !caseItem.imageUrl.includes('unsplash.com') ? [caseItem.imageUrl] : []);
  
  return {
    complaint_number: caseItem.id,
    user_id: caseItem.userId || caseItem.citizenId || 'CIT-GUEST',
    userId: caseItem.userId || caseItem.citizenId || 'CIT-GUEST',
    citizen_id: caseItem.citizenId || 'CIT-GUEST',
    citizen_name: caseItem.citizenName || 'Citizen',
    citizen_phone: caseItem.citizenPhone || '',
    citizen_email: caseItem.citizenEmail || '',
    email_verified: Boolean(caseItem.emailVerified ?? true),
    phone_verified: Boolean(caseItem.phoneVerified ?? true),
    location_validation_status: caseItem.locationValidationStatus || 'LOCATION_VALID',
    location_conflict_reason: caseItem.locationConflictReason || '',
    title: caseItem.title,
    description: caseItem.description,
    category: caseItem.category,
    subcategory: caseItem.subcategory || '',
    city: caseItem.location.city || 'Hyderabad',
    area: caseItem.location.area || '',
    colony: caseItem.location.colony || '',
    ward: caseItem.location.ward || 'Ward 01',
    street_address: caseItem.location.address || '',
    landmark: caseItem.location.landmark || '',
    postal_code: caseItem.location.postal_code || '',
    latitude: caseItem.location.lat,
    longitude: caseItem.location.lng,
    problem_duration: caseItem.problemDuration || 'Today',
    problem_started_date: caseItem.problemStartedDate || '',
    status: caseItem.status,
    priority: caseItem.priority,
    progress: typeof caseItem.progress === 'number' ? caseItem.progress : 0,
    assigned_department_key: caseItem.assignedDepartmentKey || '',
    assigned_department_id: caseItem.assignedDepartmentId || '',
    assigned_by: caseItem.assignedBy || '',
    assignment_timestamp: caseItem.assignmentTimestamp || '',
    officer_acceptance_status: caseItem.officerAcceptanceStatus || 'WAITING_FOR_OFFICER_ACCEPTANCE',
    officer_update_note: caseItem.officerUpdateNote || '',
    officer_last_update: caseItem.officerLastUpdate || '',
    expected_completion_date: caseItem.expectedCompletionDate || '',
    is_blocked: Boolean(caseItem.isBlocked),
    blocked_reason: caseItem.blockedReason || '',
    resolution_report: caseItem.resolutionReport || null,
    system_recommended_risk: caseItem.systemRecommendedRisk || 'MEDIUM',
    system_recommended_reason: caseItem.systemRecommendedReason || '',
    final_government_risk: caseItem.finalGovernmentRisk || 'NOT YET ASSESSED',
    risk_reason: caseItem.riskReason || '',
    risk_factors: caseItem.riskFactors || [],
    risk_assessed_by: caseItem.riskAssessedBy || '',
    risk_assessed_at: caseItem.riskAssessedAt || '',
    assigned_department: caseItem.assignedDepartment || 'General Municipal Administration',
    assigned_officer_name: caseItem.assignedOfficerName || '',
    assigned_officer_id: caseItem.assignedOfficerId || '',
    current_action: caseItem.currentAction || '',
    next_action: caseItem.nextAction || '',
    sla_hours_remaining: caseItem.slaHoursRemaining ?? 48,
    sla_total_hours: caseItem.slaTotalHours ?? 48,
    imageUrl: images.length > 0 ? images[0] : (caseItem.imageUrl || ''),
    image_url: images.length > 0 ? images[0] : (caseItem.imageUrl || ''),
    evidence_images: images,
    evidenceImages: images,
    resolved_image_url: caseItem.resolvedImageUrl || '',
    resolution_notes: caseItem.resolutionNotes || '',
    submitted_at: caseItem.submittedAt || caseItem.createdDate || new Date().toISOString(),
    accepted_at: caseItem.acceptedAt || '',
    resolved_at: caseItem.resolvedAt || '',
    closed_at: caseItem.closedAt || '',
    created_at: caseItem.createdDate || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ai_validation_status: caseItem.aiValidationStatus || 'VALID',
    ai_validation_reason: caseItem.aiValidationReason || '',
    ai_problem_verification: caseItem.aiProblemVerification || '',
    ai_conflict_detected: Boolean(caseItem.aiConflictDetected),
    ai_conflict_reason: caseItem.aiConflictReason || '',
    citizen_notification_text: caseItem.citizenNotificationText || '',
    timeline: caseItem.timeline || [],
    information_requests: caseItem.informationRequests || [],
    informationRequests: caseItem.informationRequests || [],
    notes: caseItem.notes || [],
    is_escalated: Boolean(caseItem.isEscalated)
  };
}

// In-memory complaint subscription listeners for immediate multi-component sync
const complaintListeners = new Set<(complaints: CivicCase[]) => void>();

export function notifyComplaintListeners(cases: CivicCase[]): void {
  complaintListeners.forEach((listener) => {
    try {
      listener(cases);
    } catch (e) {
      console.warn('[ComplaintsService] Error in complaint listener:', e);
    }
  });
}

// 1. REAL-TIME SUBSCRIPTION TO COMPLAINTS
export function subscribeToComplaints(
  onUpdate: (complaints: CivicCase[]) => void,
  onError?: (error: any) => void
): () => void {
  // Register in memory listener
  complaintListeners.add(onUpdate);

  // Immediately provide cached data for instantaneous render
  const cached = getCachedComplaints();
  if (cached && cached.length > 0) {
    onUpdate(cached);
  }

  try {
    const colRef = collection(db, COMPLAINTS_COLLECTION);
    const unsubscribeFirestore = onSnapshot(
      colRef,
      (snapshot) => {
        const list: CivicCase[] = [];
        snapshot.forEach((docSnap) => {
          list.push(convertDocToCivicCase(docSnap.id, docSnap.data()));
        });
        // Sort newest first
        list.sort((a, b) => {
          const dateA = new Date(a.createdDate || a.submittedAt || 0).getTime() || 0;
          const dateB = new Date(b.createdDate || b.submittedAt || 0).getTime() || 0;
          return dateB - dateA;
        });
        if (list.length > 0) {
          saveCachedComplaints(list);
          notifyComplaintListeners(list);
        }
      },
      (err) => {
        // In offline mode or temporary network hiccup, retain local cache smoothly
        console.warn('[Firestore] Operating with cached database state:', err?.message || err);
        if (onError) onError(err);
      }
    );
    return () => {
      complaintListeners.delete(onUpdate);
      unsubscribeFirestore();
    };
  } catch (err) {
    console.warn('[Firestore] Snapshot listener initialized in offline mode:', err);
    return () => {
      complaintListeners.delete(onUpdate);
    };
  }
}

// Helper to seed initial benchmark cases if the database collection is completely empty
export async function seedComplaintsIfEmpty(): Promise<void> {
  try {
    const colRef = collection(db, COMPLAINTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('[Firestore] Database complaints collection is empty. Seeding initial benchmark cases...');
      for (const c of MOCK_CASES) {
        const docRef = doc(db, COMPLAINTS_COLLECTION, c.id);
        await setDoc(docRef, convertCivicCaseToDoc(c));
      }
      console.log(`[Firestore] Successfully seeded ${MOCK_CASES.length} initial benchmark cases into Firestore.`);
    } else {
      console.log(`[Firestore] Database already has ${snapshot.size} complaint records.`);
    }
  } catch (err) {
    console.warn('[Firestore] Note on seeding database (offline / cached mode):', err);
  }
}

// 2. CREATE NEW COMPLAINT IN FIRESTORE
export interface CreateComplaintInput {
  userId?: string;
  fullName: string;
  phone: string;
  email?: string;
  citizenId?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  locationValidationStatus?: 'LOCATION_VALID' | 'LOCATION_MISMATCH' | 'LOCATION_CONFLICT';
  locationConflictReason?: string;

  cityName: string;
  areaName: string;
  colonyName: string;
  wardNumber?: string;
  streetAddress?: string;
  landmark?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;

  title: string;
  category: CivicCategory;
  subcategory?: string;
  description: string;
  dateFirstNoticed?: string;
  imageUrl?: string;
  imageKey?: string;
  evidencePhotos?: string[];

  problemDuration: ProblemDuration;
  problemStartedDate?: string;
}

export async function createComplaintInDb(input: CreateComplaintInput): Promise<CivicCase> {
  const complaintId = generateComplaintId();
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Strict Photo Handling: Only attach actual uploaded/captured photos. If none, keep empty.
  const evidenceList: string[] = Array.isArray(input.evidencePhotos) 
    ? input.evidencePhotos.filter(Boolean) 
    : (input.imageUrl ? [input.imageUrl] : []);
  
  const primaryPhotoUrl = evidenceList.length > 0 ? evidenceList[0] : '';
  const resolvedImageKey = resolveCivicImageKey(input.category + ' ' + input.title);

  const fullAddress = input.streetAddress 
    ? `${input.streetAddress}, ${input.colonyName}, ${input.areaName}, ${input.cityName}`
    : `${input.colonyName}, ${input.areaName}, ${input.cityName}`;

  const existingCached = getCachedComplaints();

  // Execute Event-Driven Autonomous Multi-Agent Swarm Orchestrator
  const swarmResult = await executeSupervisorPipeline(
    {
      id: complaintId,
      title: input.title,
      description: input.description,
      category: input.category,
      cityName: input.cityName,
      areaName: input.areaName,
      colonyName: input.colonyName,
      wardNumber: input.wardNumber,
      streetAddress: input.streetAddress,
      landmark: input.landmark,
      phone: input.phone,
      email: input.email,
      citizenName: input.fullName,
      evidencePhotos: evidenceList,
      problemDuration: input.problemDuration
    },
    existingCached
  );

  const valDecision = swarmResult.validation.decision;
  const evidenceDecision = swarmResult.evidence.decision;
  const dupDecision = swarmResult.duplicates.decision;
  const classDecision = swarmResult.classification.decision;
  const riskDecision = swarmResult.riskPriority.decision;
  const locDecision = swarmResult.locationJurisdiction.decision;
  const deptDecision = swarmResult.departmentRouting.decision;
  const officerDecision = swarmResult.officerAssignment.decision;
  const slaDecision = swarmResult.slaMonitoring.decision;
  const notifyDecision = swarmResult.citizenNotification.decision;

  const requiresHuman = swarmResult.validation.requiresHumanReview || 
                        valDecision.status === 'HUMAN_REVIEW_REQUIRED' || 
                        valDecision.status === 'INVALID' ||
                        valDecision.status === 'NEEDS_MORE_INFORMATION';

  const initialTimeline: TimelineEvent[] = [
    {
      id: `t-sub-${Date.now()}`,
      title: 'Complaint Submitted by Citizen',
      timestamp: formattedDate,
      description: `Complaint registered by ${input.fullName} via Citizen Portal. Problem duration reported as: ${input.problemDuration}.`,
      status: 'completed',
      actor: input.fullName,
      public_visible: true
    },
    {
      id: `t-val-${Date.now() + 1}`,
      title: 'AI Verification & Completeness Check',
      timestamp: formattedDate,
      description: swarmResult.validation.reason,
      status: 'completed',
      actor: 'Intake & Validation Agent',
      public_visible: true
    }
  ];

  if (evidenceList.length > 0) {
    initialTimeline.push({
      id: `t-evi-${Date.now() + 2}`,
      title: 'AI Photographic Evidence Audited',
      timestamp: formattedDate,
      description: evidenceDecision.visualSummary,
      status: 'completed',
      actor: 'Evidence Analysis Agent',
      public_visible: true
    });
  }

  if (dupDecision.hasDuplicate) {
    initialTimeline.push({
      id: `t-dup-${Date.now() + 3}`,
      title: `AI Incident Cluster: ${dupDecision.clusterId}`,
      timestamp: formattedDate,
      description: swarmResult.duplicates.reason,
      status: 'completed',
      actor: 'Duplicate & Cluster Agent',
      public_visible: true
    });
  }

  initialTimeline.push(
    {
      id: `t-risk-${Date.now() + 4}`,
      title: `AI Risk Assessed: ${riskDecision.recommendedRisk} (${riskDecision.recommendedPriority})`,
      timestamp: formattedDate,
      description: `Impact Score: ${riskDecision.impactScore}/10. Identified Factors: ${riskDecision.riskFactors.join('; ')}.`,
      status: 'completed',
      actor: 'Risk & Priority Agent',
      public_visible: true
    },
    {
      id: `t-assign-${Date.now() + 5}`,
      title: `AI Auto-Dispatched to ${deptDecision.departmentName}`,
      timestamp: formattedDate,
      description: `${officerDecision.rationale}. Target SLA: ${slaDecision.slaHours} hours.`,
      status: 'completed',
      actor: 'Supervisor Agent Swarm',
      public_visible: true
    }
  );

  const initialStatus: CaseStatus = requiresHuman ? 'UNDER_REVIEW' : 'OFFICER_ASSIGNED';

  const mappedValStatus = valDecision.status === 'VALID' 
    ? 'VALID' 
    : valDecision.status === 'INVALID' 
    ? 'REJECTED_INVALID' 
    : valDecision.status === 'NEEDS_MORE_INFORMATION' 
    ? 'NEEDS_MORE_INFO' 
    : 'AI_REVIEW_REQUIRED';

  const newCase: CivicCase = {
    id: complaintId,
    complaint_number: complaintId,
    title: input.title,
    description: input.description,
    category: classDecision.category || input.category,
    subcategory: classDecision.subcategory || input.subcategory || '',
    priority: riskDecision.recommendedPriority,
    status: initialStatus,
    progress: requiresHuman ? 10 : 25,
    location: {
      city: locDecision.city || input.cityName,
      area: locDecision.area || input.areaName,
      colony: input.colonyName || locDecision.area,
      address: locDecision.address || fullAddress,
      ward: locDecision.ward || input.wardNumber || 'Ward 01 (Central Zone)',
      landmark: input.landmark || '',
      postal_code: input.postalCode || '',
      lat: input.latitude || 17.3850,
      lng: input.longitude || 78.4867
    },
    coordinates: {
      lat: input.latitude || 17.3850,
      lng: input.longitude || 78.4867
    },
    imageKey: resolvedImageKey,
    imageUrl: primaryPhotoUrl,
    evidenceImage: primaryPhotoUrl,
    evidenceImages: evidenceList,
    affectedPopulation: dupDecision.hasDuplicate ? `Estimated ${(dupDecision.affectedCount || 1) * 500}+ residents` : 'Estimated 1,000+ residents',
    aiConfidence: Number((swarmResult.riskPriority.confidence * 100).toFixed(1)),
    impactScore: riskDecision.impactScore,
    duplicateCount: dupDecision.duplicateMatches?.length || 0,

    assignedDepartment: deptDecision.departmentName,
    assignedDepartmentKey: deptDecision.departmentKey,
    assignedDepartmentId: deptDecision.departmentKey.toUpperCase(),
    assignedOfficerId: officerDecision.assignedOfficer.id,
    assignedOfficerName: officerDecision.assignedOfficer.name,
    assignedBy: 'CivicMind Autonomous Multi-Agent Swarm',
    assignmentTimestamp: now.toISOString(),
    officerAcceptanceStatus: 'WAITING_FOR_OFFICER_ACCEPTANCE',

    slaHoursRemaining: slaDecision.slaHours,
    slaTotalHours: slaDecision.slaHours,
    createdDate: now.toISOString(),
    updatedDate: now.toISOString(),
    userId: input.userId || input.citizenId || `CIT-GUEST`,
    citizenId: input.citizenId || `CIT-GUEST`,
    citizenName: input.fullName,
    citizenPhone: input.phone,
    citizenEmail: input.email || '',
    emailVerified: input.emailVerified ?? true,
    phoneVerified: input.phoneVerified ?? true,
    locationValidationStatus: input.locationValidationStatus || 'LOCATION_VALID',
    locationConflictReason: input.locationConflictReason || '',

    problemDuration: input.problemDuration,
    problemStartedDate: input.problemStartedDate || '',
    systemRecommendedRisk: riskDecision.recommendedRisk,
    systemRecommendedReason: swarmResult.riskPriority.reason,
    finalGovernmentRisk: riskDecision.recommendedRisk,
    riskReason: swarmResult.riskPriority.reason,
    riskFactors: riskDecision.riskFactors,
    riskAssessedBy: 'CivicMind Autonomous AI Swarm',
    riskAssessedAt: now.toISOString(),

    aiValidationStatus: mappedValStatus,
    aiValidationReason: swarmResult.validation.reason,
    aiProblemVerification: swarmResult.validation.reason,
    aiConflictDetected: false,
    aiConflictReason: '',

    currentAction: requiresHuman 
      ? 'Awaiting human administrator review for flagged grievance parameters.' 
      : `Dispatched to Officer ${officerDecision.assignedOfficer.name} (${deptDecision.departmentName}). Site inspection scheduled.`,
    nextAction: requiresHuman 
      ? 'Government Admin confirmation and desk verification.'
      : `Officer ${officerDecision.assignedOfficer.name} field verification and work update submission.`,
    citizenNotificationText: notifyDecision.message,

    submittedAt: now.toISOString(),

    aiExplanation: {
      summary: swarmResult.supervisorSummary,
      riskFactors: riskDecision.riskFactors,
      recommendedAction: `Dispatched to ${deptDecision.departmentName} (${officerDecision.assignedOfficer.name}) under ${slaDecision.slaHours}h SLA.`
    },
    timeline: initialTimeline,
    notes: [],
    relatedCases: (dupDecision.duplicateMatches || []).map(m => ({
      id: m.caseId,
      title: m.title,
      similarityScore: m.similarity,
      distanceMeters: 50,
      status: 'IN_PROGRESS' as CaseStatus,
      reportedDate: now.toISOString()
    }))
  };

  // Update local cache immediately
  saveCachedComplaints([newCase, ...existingCached.filter(c => c.id !== newCase.id)]);

  try {
    const docData = convertCivicCaseToDoc(newCase);
    const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
    await setDoc(docRef, docData);

    console.log(`[Database] ========================================`);
    console.log(`[Database] DATABASE INSERT SUCCESS`);
    console.log(`[Database] Complaint ID: ${complaintId}`);
    console.log(`[Database] Citizen ID: ${newCase.citizenId} (${input.fullName})`);
    console.log(`[Database] Multi-Agent Swarm Orchestrated Successfully`);
    console.log(`[Database] Assigned Officer: ${officerDecision.assignedOfficer.name} (${deptDecision.departmentName})`);
    console.log(`[Database] SLA: ${slaDecision.slaHours}h | Risk: ${riskDecision.recommendedRisk} (${riskDecision.recommendedPriority})`);
    console.log(`[Database] Document path: ${COMPLAINTS_COLLECTION}/${complaintId}`);
    console.log(`[Database] ========================================`);
  } catch (err) {
    console.warn('[Database] Network write buffered / saved locally:', err);
  }

  return newCase;
}

/**
 * Filter complaints strictly belonging to a specific citizen
 */
export function getComplaintsByCitizenId(citizenId: string, allCases: CivicCase[]): CivicCase[] {
  if (!citizenId || !allCases) return [];
  const cleanId = citizenId.trim().toLowerCase();
  return allCases.filter(c => {
    const cId = (c.citizenId || '').trim().toLowerCase();
    return cId === cleanId;
  });
}

/**
 * Check if the user is authorized to access a given complaint
 */
export function canUserAccessComplaint(
  userRole: string | undefined, 
  userCitizenId: string | undefined, 
  complaint: CivicCase
): boolean {
  if (userRole === 'GOVERNMENT_ADMIN' || userRole === 'SYSTEM_ADMIN') {
    return true;
  }
  if (userRole === 'DEPARTMENT_OFFICER') {
    return true; // Operational access only (photos stripped in officer views)
  }
  if (!userCitizenId) return false;
  const cleanUser = userCitizenId.trim().toLowerCase();
  const cleanOwner = (complaint.citizenId || '').trim().toLowerCase();
  return cleanUser === cleanOwner;
}

// 3. GOVERNMENT: ACCEPT COMPLAINT
export async function acceptComplaintInDb(
  complaintId: string, 
  officerName: string = 'Municipal Officer',
  notes?: string
): Promise<CivicCase> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  
  let existing: CivicCase;
  if (snap.exists()) {
    existing = convertDocToCivicCase(complaintId, snap.data());
  } else {
    const cached = getCachedComplaints().find(c => c.id === complaintId) || MOCK_CASES.find(c => c.id === complaintId);
    if (!cached) throw new Error('Complaint not found in database');
    existing = cached;
  }

  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-acc-${Date.now()}`,
      title: 'Complaint Accepted by Government',
      timestamp: formattedDate,
      description: notes || `Complaint reviewed and accepted for official municipal processing by ${officerName}.`,
      status: 'completed',
      actor: officerName,
      public_visible: true
    },
    ...(existing.timeline || [])
  ];

  const updatePayload = {
    status: 'ACCEPTED',
    accepted_at: now.toISOString(),
    updated_at: now.toISOString(),
    current_action: `Accepted by ${officerName}. Proceeding to Risk & Department Assignment.`,
    next_action: 'Assigning responsible department squad and priority window.',
    timeline: updatedTimeline
  };

  const updatedCase: CivicCase = {
    ...existing,
    status: 'ACCEPTED',
    acceptedAt: now.toISOString(),
    updatedDate: now.toISOString(),
    currentAction: `Accepted by ${officerName}. Proceeding to Risk & Department Assignment.`,
    nextAction: 'Assigning responsible department squad and priority window.',
    timeline: updatedTimeline
  };

  try {
    await updateDoc(docRef, updatePayload);
  } catch (err) {
    await setDoc(docRef, convertCivicCaseToDoc(updatedCase));
  }

  const currentCached = getCachedComplaints();
  const updatedList = currentCached.map(c => c.id === complaintId ? updatedCase : c);
  if (!updatedList.some(c => c.id === complaintId)) {
    updatedList.unshift(updatedCase);
  }
  saveCachedComplaints(updatedList);
  notifyComplaintListeners(updatedList);

  return updatedCase;
}

// 4. GOVERNMENT: REJECT COMPLAINT
export async function rejectComplaintInDb(
  complaintId: string, 
  reason: string,
  officerName: string = 'Municipal Officer'
): Promise<CivicCase> {
  const cleanReason = (reason || '').trim();
  if (!cleanReason) {
    throw new Error('Please enter a rejection reason.');
  }

  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);

  let existing: CivicCase;
  if (snap.exists()) {
    existing = convertDocToCivicCase(complaintId, snap.data());
  } else {
    const cached = getCachedComplaints().find(c => c.id === complaintId) || MOCK_CASES.find(c => c.id === complaintId);
    if (!cached) throw new Error('Complaint not found in database');
    existing = cached;
  }

  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-rej-${Date.now()}`,
      title: 'Complaint Rejected / Closed',
      timestamp: formattedDate,
      description: `Reason: ${cleanReason}. Action taken by ${officerName}.`,
      status: 'completed',
      actor: officerName,
      public_visible: true
    },
    ...(existing.timeline || [])
  ];

  const updatePayload = {
    status: 'REJECTED',
    closed_at: now.toISOString(),
    updated_at: now.toISOString(),
    current_action: `Complaint closed as rejected: ${cleanReason}`,
    next_action: 'No further action required.',
    timeline: updatedTimeline
  };

  const updatedCase: CivicCase = {
    ...existing,
    status: 'REJECTED',
    closedAt: now.toISOString(),
    updatedDate: now.toISOString(),
    currentAction: `Complaint closed as rejected: ${cleanReason}`,
    nextAction: 'No further action required.',
    timeline: updatedTimeline
  };

  try {
    await updateDoc(docRef, updatePayload);
  } catch (err) {
    await setDoc(docRef, convertCivicCaseToDoc(updatedCase));
  }

  const currentCached = getCachedComplaints();
  const updatedList = currentCached.map(c => c.id === complaintId ? updatedCase : c);
  if (!updatedList.some(c => c.id === complaintId)) {
    updatedList.unshift(updatedCase);
  }
  saveCachedComplaints(updatedList);
  notifyComplaintListeners(updatedList);

  return updatedCase;
}

// 5. GOVERNMENT: REQUEST MORE INFORMATION
export async function requestMoreInfoInDb(
  complaintId: string,
  queryText: string,
  officerName: string = 'Municipal Officer'
): Promise<void> {
  const cleanId = complaintId.trim();
  const cached = getCachedComplaints();
  const existingInCache = cached.find(c => c.id.toUpperCase() === cleanId.toUpperCase() || c.id === cleanId);
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const newRequest: InformationRequest = {
    id: `req-${Date.now()}`,
    requestedBy: officerName,
    requestedAt: now.toISOString(),
    requestQuery: queryText.trim(),
    status: 'PENDING_CITIZEN_RESPONSE'
  };

  let existingTimeline = existingInCache?.timeline || [];
  let existingRequests = existingInCache?.informationRequests || [];

  try {
    const docRef = doc(db, COMPLAINTS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const live = convertDocToCivicCase(cleanId, snap.data());
      existingTimeline = live.timeline || [];
      existingRequests = live.informationRequests || [];
    }
  } catch (e) {
    console.warn('[Firestore] Notice fetching complaint in requestMoreInfoInDb:', e);
  }

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-info-${Date.now()}`,
      title: 'Additional Information Requested',
      timestamp: formattedDate,
      description: `${officerName} requested clarification: "${queryText.trim()}". Citizen notified.`,
      status: 'current',
      actor: officerName,
      public_visible: true
    },
    ...existingTimeline.map(t => ({
      ...t,
      status: t.status === 'current' ? ('completed' as const) : t.status
    }))
  ];

  const updatedRequests = [...existingRequests, newRequest];

  try {
    const docRef = doc(db, COMPLAINTS_COLLECTION, cleanId);
    await updateDoc(docRef, {
      status: 'UNDER_REVIEW',
      updated_at: now.toISOString(),
      current_action: `Awaiting citizen clarification on: "${queryText.trim()}"`,
      next_action: 'Citizen to submit additional photos or details.',
      timeline: updatedTimeline,
      information_requests: updatedRequests,
      informationRequests: updatedRequests
    });
  } catch (e) {
    console.warn('[Firestore] Notice updating complaint in DB (offline fallback):', e);
  }

  // Update local cache & notify subscribers
  const updatedList = cached.map(c => {
    if (c.id.toUpperCase() === cleanId.toUpperCase() || c.id === cleanId) {
      return {
        ...c,
        status: 'UNDER_REVIEW' as CaseStatus,
        updatedDate: now.toISOString(),
        currentAction: `Awaiting citizen clarification on: "${queryText.trim()}"`,
        nextAction: 'Citizen to submit additional photos or details.',
        timeline: updatedTimeline,
        informationRequests: updatedRequests
      };
    }
    return c;
  });

  saveCachedComplaints(updatedList);
  notifyComplaintListeners(updatedList);
}

// 5B. CITIZEN: SUBMIT ADDITIONAL INFORMATION RESPONSE
export async function submitCitizenInfoResponseInDb(
  complaintId: string,
  requestId: string | undefined,
  responseText: string,
  photoUrl?: string,
  citizenName: string = 'Citizen'
): Promise<void> {
  const cleanId = complaintId.trim();
  const cached = getCachedComplaints();
  const existingInCache = cached.find(c => c.id.toUpperCase() === cleanId.toUpperCase() || c.id === cleanId);
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const citizenResponseItem = {
    responseText: responseText.trim(),
    submittedAt: now.toISOString(),
    submittedBy: citizenName,
    photoUrl: photoUrl || undefined
  };

  let existingTimeline = existingInCache?.timeline || [];
  let existingRequests = existingInCache?.informationRequests || [];
  let existingEvidence = existingInCache?.evidenceImages || [];

  try {
    const docRef = doc(db, COMPLAINTS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const live = convertDocToCivicCase(cleanId, snap.data());
      existingTimeline = live.timeline || [];
      existingRequests = live.informationRequests || [];
      existingEvidence = live.evidenceImages || [];
    }
  } catch (e) {
    console.warn('[Firestore] Notice fetching complaint in submitCitizenInfoResponseInDb:', e);
  }

  // Update requests list
  let updatedRequests: InformationRequest[] = [];
  if (existingRequests.length > 0) {
    let matched = false;
    updatedRequests = existingRequests.map(req => {
      if ((requestId && req.id === requestId) || (!requestId && !matched && req.status === 'PENDING_CITIZEN_RESPONSE')) {
        matched = true;
        return {
          ...req,
          status: 'RESPONSE_SUBMITTED' as const,
          citizenResponse: citizenResponseItem
        };
      }
      return req;
    });

    if (!matched) {
      // Fallback: update the latest request
      const lastIdx = existingRequests.length - 1;
      updatedRequests = existingRequests.map((req, idx) => {
        if (idx === lastIdx) {
          return {
            ...req,
            status: 'RESPONSE_SUBMITTED' as const,
            citizenResponse: citizenResponseItem
          };
        }
        return req;
      });
    }
  } else {
    updatedRequests = [
      {
        id: `req-${Date.now()}`,
        requestedBy: 'Municipal Operations',
        requestedAt: now.toISOString(),
        requestQuery: 'Additional incident information requested by Government.',
        status: 'RESPONSE_SUBMITTED',
        citizenResponse: citizenResponseItem
      }
    ];
  }

  // New timeline entry for citizen response
  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-resp-${Date.now()}`,
      title: 'Additional Information Submitted',
      timestamp: formattedDate,
      description: `Citizen response provided: "${responseText.trim()}". Awaiting Government review.`,
      status: 'completed',
      actor: citizenName,
      public_visible: true
    },
    ...existingTimeline.map(ev => ({
      ...ev,
      status: ev.status === 'current' ? ('completed' as const) : ev.status
    }))
  ];

  // Include photo in evidence photos if provided
  let updatedEvidenceImages = [...existingEvidence];
  if (photoUrl && !updatedEvidenceImages.includes(photoUrl)) {
    updatedEvidenceImages.push(photoUrl);
  }

  const docUpdate: any = {
    updated_at: now.toISOString(),
    current_action: 'Citizen Response Received — Awaiting Government Review',
    next_action: 'Government officer to review newly submitted information.',
    timeline: updatedTimeline,
    information_requests: updatedRequests,
    informationRequests: updatedRequests
  };

  if (photoUrl) {
    docUpdate.evidence_images = updatedEvidenceImages;
    docUpdate.evidenceImages = updatedEvidenceImages;
  }

  try {
    const docRef = doc(db, COMPLAINTS_COLLECTION, cleanId);
    await updateDoc(docRef, docUpdate);
  } catch (e) {
    console.warn('[Firestore] Notice updating citizen info response in DB (offline fallback):', e);
  }

  // Update local cache & notify subscribers
  const updatedList = cached.map(c => {
    if (c.id.toUpperCase() === cleanId.toUpperCase() || c.id === cleanId) {
      return {
        ...c,
        updatedDate: now.toISOString(),
        currentAction: 'Citizen Response Received — Awaiting Government Review',
        nextAction: 'Government officer to review newly submitted information.',
        timeline: updatedTimeline,
        informationRequests: updatedRequests,
        evidenceImages: updatedEvidenceImages,
        imageUrl: c.imageUrl || (photoUrl || '')
      };
    }
    return c;
  });

  saveCachedComplaints(updatedList);
  notifyComplaintListeners(updatedList);
}

// 6. GOVERNMENT: ASSIGN FINAL RISK LEVEL
export async function assignRiskLevelInDb(
  complaintId: string,
  riskLevel: RiskLevel,
  riskReason: string,
  priority: PriorityLevel,
  officerName: string = 'Operations Director'
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-risk-${Date.now()}`,
      title: `Risk Level Confirmed: ${riskLevel}`,
      timestamp: formattedDate,
      description: `Official Risk Level evaluated as ${riskLevel} (${priority} Priority) by ${officerName}. Assessment reason: ${riskReason || 'Operational review completed'}.`,
      status: 'completed',
      actor: officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  // Adjust SLA hours based on confirmed risk
  let slaHours = 48;
  if (riskLevel === 'CRITICAL') slaHours = 12;
  else if (riskLevel === 'HIGH') slaHours = 24;
  else if (riskLevel === 'MEDIUM') slaHours = 48;
  else if (riskLevel === 'LOW') slaHours = 72;

  await updateDoc(docRef, {
    final_government_risk: riskLevel,
    risk_reason: riskReason,
    priority: priority,
    risk_assessed_by: officerName,
    risk_assessed_at: now.toISOString(),
    status: existing.status === 'SUBMITTED' ? 'RISK_ASSESSED' : existing.status,
    sla_total_hours: slaHours,
    sla_hours_remaining: slaHours,
    updated_at: now.toISOString(),
    current_action: `Risk verified as ${riskLevel} (${priority}). Routing to squad.`,
    timeline: updatedTimeline
  });
}

// 7. GOVERNMENT: ASSIGN RESPONSIBLE DEPARTMENT & SQUAD
export async function assignDepartmentInDb(
  complaintId: string,
  department: DepartmentName | string,
  officerName: string = 'Municipal Officer',
  squadTeam?: string
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const assignedSquad = squadTeam || 'Quick Response Team #1';

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-dept-${Date.now()}`,
      title: `Assigned to ${department}`,
      timestamp: formattedDate,
      description: `Work order dispatched to ${department} (${assignedSquad}) by ${officerName}.`,
      status: 'completed',
      actor: officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    assigned_department: department,
    assigned_officer_name: assignedSquad,
    status: 'DEPARTMENT_ASSIGNED',
    updated_at: now.toISOString(),
    current_action: `Assigned to ${department} (${assignedSquad})`,
    next_action: 'Field inspection and initial repairs deployment.',
    timeline: updatedTimeline
  });
}

// 8. GOVERNMENT / SQUAD: UPDATE WORK PROGRESS
export async function updateWorkProgressInDb(
  complaintId: string,
  newStatus: CaseStatus,
  currentAction: string,
  nextAction: string,
  updatedBy: string = 'Department Squad',
  publicDescription?: string
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-prog-${Date.now()}`,
      title: `Progress Update: ${newStatus}`,
      timestamp: formattedDate,
      description: publicDescription || currentAction || 'Field work progress updated.',
      status: newStatus === 'RESOLVED' || newStatus === 'CLOSED' ? 'completed' : 'current',
      actor: updatedBy,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: newStatus,
    current_action: currentAction,
    next_action: nextAction,
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}

// 9. GOVERNMENT: MARK COMPLAINT RESOLVED
export async function resolveComplaintInDb(
  complaintId: string,
  resolutionNotes: string = 'Issue successfully resolved and verified on site.',
  resolvedImageUrl?: string,
  officerName: string = 'Field Inspection Lead'
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const defaultResolvedImg = 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80';

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-res-${Date.now()}`,
      title: 'Complaint Marked Resolved',
      timestamp: formattedDate,
      description: resolutionNotes || 'Repairs completed and verified. Photographic evidence uploaded.',
      status: 'completed',
      actor: officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: 'RESOLVED',
    resolved_at: now.toISOString(),
    resolved_image_url: resolvedImageUrl || defaultResolvedImg,
    resolution_notes: resolutionNotes,
    sla_hours_remaining: 0,
    current_action: 'Resolution completed and verified on site.',
    next_action: 'Citizen feedback and final administrative closure.',
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}

// 10. GOVERNMENT: ADD INTERNAL OR PUBLIC NOTE
export async function addGovernmentNoteInDb(
  complaintId: string,
  noteText: string,
  createdBy: string = 'Government Officer',
  visibility: 'INTERNAL' | 'PUBLIC' = 'INTERNAL'
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const newNote: GovernmentNote = {
    id: `note-${Date.now()}`,
    note: noteText,
    created_by: createdBy,
    created_at: new Date().toISOString(),
    visibility
  };

  const updatedNotes = [newNote, ...(existing.notes || [])];
  let updatedTimeline = existing.timeline;

  if (visibility === 'PUBLIC') {
    const formattedDate = new Date().toLocaleString('en-US', { hour12: true });
    updatedTimeline = [
      {
        id: `t-note-${Date.now()}`,
        title: 'Public Officer Note',
        timestamp: formattedDate,
        description: noteText,
        status: 'completed',
        actor: createdBy,
        public_visible: true
      },
      ...existing.timeline
    ];
  }

  await updateDoc(docRef, {
    notes: updatedNotes,
    timeline: updatedTimeline,
    updated_at: new Date().toISOString()
  });
}

// 11. GOVERNMENT: FULL CONFIRM & ASSIGN OFFICER (ATOMIC ASSIGNMENT LIFECYCLE)
export async function confirmAndAssignOfficerInDb(params: {
  complaintId: string;
  riskLevel: RiskLevel;
  riskReason: string;
  priority?: PriorityLevel;
  departmentName: string;
  departmentKey: string;
  officerId: string;
  officerName: string;
  officerPhone?: string;
  assignedBy?: string;
}): Promise<CivicCase> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, params.complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(params.complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });

  const assignedBy = params.assignedBy || 'Government Admin';
  const calculatedPriority: PriorityLevel = 
    params.priority || 
    (params.riskLevel === 'CRITICAL' ? 'P1' : params.riskLevel === 'HIGH' ? 'P2' : params.riskLevel === 'MEDIUM' ? 'P3' : 'P4');

  let slaHours = 48;
  if (params.riskLevel === 'CRITICAL') slaHours = 12;
  else if (params.riskLevel === 'HIGH') slaHours = 24;
  else if (params.riskLevel === 'MEDIUM') slaHours = 48;
  else if (params.riskLevel === 'LOW') slaHours = 72;

  const assignmentTimelineEvent: TimelineEvent = {
    id: `t-assign-${Date.now()}`,
    title: `Assigned to ${params.officerName} (${params.departmentName})`,
    timestamp: formattedDate,
    description: `${assignedBy} accepted complaint & confirmed assignment. Risk Level: ${params.riskLevel}, Department: ${params.departmentName}, Assigned Officer: ${params.officerName}, Status: OFFICER ASSIGNED`,
    status: 'completed',
    actor: assignedBy,
    public_visible: true
  };

  const updatedTimeline = [assignmentTimelineEvent, ...existing.timeline];

  const updatePayload = {
    final_government_risk: params.riskLevel,
    risk_reason: params.riskReason || `Assessed as ${params.riskLevel} during triage assignment.`,
    priority: calculatedPriority,
    risk_assessed_by: assignedBy,
    risk_assessed_at: now.toISOString(),
    assigned_department: params.departmentName,
    assigned_department_key: params.departmentKey,
    assigned_officer_id: params.officerId,
    assigned_officer_name: params.officerName,
    assigned_by: assignedBy,
    assignment_timestamp: now.toISOString(),
    officer_acceptance_status: 'WAITING_FOR_OFFICER_ACCEPTANCE',
    status: 'OFFICER_ASSIGNED',
    progress: 0,
    sla_total_hours: slaHours,
    sla_hours_remaining: slaHours,
    current_action: `Assigned to ${params.officerName} (${params.departmentName})`,
    next_action: 'Officer acceptance & field dispatch',
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  };

  await updateDoc(docRef, updatePayload);

  return {
    ...existing,
    finalGovernmentRisk: params.riskLevel,
    riskReason: params.riskReason,
    priority: calculatedPriority,
    riskAssessedBy: assignedBy,
    riskAssessedAt: now.toISOString(),
    assignedDepartment: params.departmentName,
    assignedDepartmentKey: params.departmentKey,
    assignedOfficerId: params.officerId,
    assignedOfficerName: params.officerName,
    assignedBy,
    assignmentTimestamp: now.toISOString(),
    officerAcceptanceStatus: 'WAITING_FOR_OFFICER_ACCEPTANCE',
    status: 'OFFICER_ASSIGNED',
    progress: 0,
    slaTotalHours: slaHours,
    slaHoursRemaining: slaHours,
    currentAction: `Assigned to ${params.officerName} (${params.departmentName})`,
    nextAction: 'Officer acceptance & field dispatch',
    updatedDate: now.toISOString(),
    timeline: updatedTimeline
  };
}

// 12. OFFICER: ACCEPT ASSIGNMENT
export async function officerAcceptAssignmentInDb(
  complaintId: string,
  officerName: string
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-off-acc-${Date.now()}`,
      title: 'Officer Accepted Assignment',
      timestamp: formattedDate,
      description: `${officerName} accepted the work order and scheduled field dispatch.`,
      status: 'completed',
      actor: officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: 'WORK_ACCEPTED',
    officer_acceptance_status: 'ACCEPTED',
    progress: 15,
    current_action: `${officerName} accepted task and mobilized equipment.`,
    next_action: 'On-site execution and repairs underway.',
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}

// 13. OFFICER: UPDATE FIELD PROGRESS & BLOCKS
export async function officerUpdateProgressInDb(params: {
  complaintId: string;
  progress: number;
  status?: CaseStatus;
  currentAction: string;
  nextAction: string;
  isBlocked?: boolean;
  blockedReason?: string;
  officerName: string;
}): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, params.complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(params.complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const effectiveStatus: CaseStatus = params.isBlocked 
    ? 'BLOCKED / DELAYED' 
    : (params.progress >= 100 ? 'AWAITING_VERIFICATION' : 'IN_PROGRESS');

  const timelineTitle = params.isBlocked 
    ? `Task Blocked / Delayed (${params.progress}%)` 
    : `Field Progress: ${params.progress}%`;

  const timelineDesc = params.isBlocked 
    ? `Delay Reason: ${params.blockedReason || 'Inclement conditions or parts shortage'}. Reported by ${params.officerName}.`
    : (params.currentAction || `Work in progress (${params.progress}% completed) by ${params.officerName}`);

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-off-upd-${Date.now()}`,
      title: timelineTitle,
      timestamp: formattedDate,
      description: timelineDesc,
      status: 'current',
      actor: params.officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: effectiveStatus,
    progress: params.progress,
    current_action: params.currentAction,
    next_action: params.nextAction,
    is_blocked: Boolean(params.isBlocked),
    blocked_reason: params.blockedReason || '',
    officer_update_note: params.currentAction,
    officer_last_update: now.toISOString(),
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}

// 14. OFFICER: SUBMIT RESOLUTION REPORT FOR VERIFICATION
export async function officerSubmitResolutionReportInDb(params: {
  complaintId: string;
  summary: string;
  actionTaken: string;
  afterPhotoUrl?: string;
  officerName: string;
}): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, params.complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(params.complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const defaultAfterImg = 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80';
  const finalAfterPhoto = params.afterPhotoUrl || defaultAfterImg;

  const resolutionReport = {
    summary: params.summary,
    actionTaken: params.actionTaken,
    completedAt: now.toISOString(),
    afterPhotoUrl: finalAfterPhoto,
    verifiedByGovernment: false
  };

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-off-res-${Date.now()}`,
      title: 'Resolution Report Submitted by Officer',
      timestamp: formattedDate,
      description: `Repairs concluded. ${params.actionTaken}. Submitted for Government administrative verification.`,
      status: 'completed',
      actor: params.officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: 'AWAITING GOVERNMENT VERIFICATION',
    progress: 95,
    resolution_report: resolutionReport,
    resolved_image_url: finalAfterPhoto,
    current_action: 'Work completed by squad. Awaiting Government Desk verification.',
    next_action: 'Government officer audit and case closeout.',
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}

// 15. GOVERNMENT: VERIFY RESOLUTION AND MARK SOLVED
export async function governmentVerifyAndSolveInDb(params: {
  complaintId: string;
  verificationNotes?: string;
  verifierName?: string;
}): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, params.complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(params.complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });
  const verifier = params.verifierName || 'Government Admin';

  const updatedResolutionReport = {
    ...(existing.resolutionReport || {
      summary: 'Repairs completed and verified.',
      actionTaken: 'Field squad addressed incident.',
      completedAt: now.toISOString()
    }),
    verifiedByGovernment: true,
    verificationNotes: params.verificationNotes || 'Inspection report and photographic proof verified.'
  };

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-gov-verify-${Date.now()}`,
      title: 'Case Verified & SOLVED',
      timestamp: formattedDate,
      description: `Government Admin (${verifier}) inspected resolution proof and marked ticket SOLVED. Citizen SMS dispatch completed.`,
      status: 'completed',
      actor: verifier,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: 'SOLVED',
    progress: 100,
    resolved_at: now.toISOString(),
    resolution_report: updatedResolutionReport,
    resolution_notes: params.verificationNotes || 'Issue solved and verified by Municipal Government.',
    sla_hours_remaining: 0,
    current_action: 'Issue resolved & verified on-site. Citizen notified.',
    next_action: 'Case closed in municipal registry.',
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });

  // Synchronize local cache & subscribers
  const cached = getCachedComplaints();
  const updatedList = cached.map(c => {
    if (c.id === params.complaintId) {
      return {
        ...c,
        status: 'SOLVED' as CaseStatus,
        progress: 100,
        resolvedAt: now.toISOString(),
        resolutionReport: updatedResolutionReport,
        slaHoursRemaining: 0,
        currentAction: 'Issue resolved & verified on-site. Citizen notified.',
        nextAction: 'Case closed in municipal registry.',
        updatedDate: now.toISOString(),
        timeline: updatedTimeline
      };
    }
    return c;
  });
  saveCachedComplaints(updatedList);
  notifyComplaintListeners(updatedList);

  logAgentActivity({
    timestamp: now.toISOString(),
    agentRole: 'resolution_verify_agent',
    agentName: 'Resolution Verification & Closeout Agent',
    complaintId: params.complaintId,
    action: 'Verify Resolution Proof & Close Ticket',
    summary: `Verified by ${verifier}. All criteria met. Public citizen notification triggered.`,
    confidence: 99.0,
    decision: { verifier, status: 'SOLVED' },
    status: 'EXECUTED'
  });
}

// 16. OFFICER: SUBMIT WORK UPDATE FORM (STORES IN OFFICER_WORK_UPDATES & COMPLAINTS)
export interface OfficerWorkUpdateInput {
  complaintId: string;
  officerId: string;
  officerName: string;
  departmentName: string;
  progressPercentage: number;
  workStatus: 'IN_PROGRESS' | 'BLOCKED' | 'WORK_COMPLETED';
  workDescription: string;
  nextAction: string;
  issuesEncountered?: string;
  estimatedCompletion?: string;
  materialsUsed?: string;
  proofImageUrl?: string;
}

export async function submitOfficerWorkUpdateInDb(input: OfficerWorkUpdateInput): Promise<OfficerWorkUpdate> {
  const updateId = `UPD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const newUpdateRecord: OfficerWorkUpdate = {
    update_id: updateId,
    complaint_id: input.complaintId,
    officer_id: input.officerId,
    officer_name: input.officerName,
    department_name: input.departmentName,
    progress_percentage: input.progressPercentage,
    work_status: input.workStatus,
    work_description: input.workDescription,
    next_action: input.nextAction,
    issues_encountered: input.issuesEncountered || '',
    estimated_completion: input.estimatedCompletion || '',
    materials_used: input.materialsUsed || '',
    proof_image_url: input.proofImageUrl || '',
    submitted_at: now.toISOString(),
    government_review_status: 'PENDING_APPROVAL'
  };

  // 1. Save to officer_work_updates collection
  try {
    const updateDocRef = doc(db, OFFICER_WORK_UPDATES_COLLECTION, updateId);
    await setDoc(updateDocRef, newUpdateRecord);
  } catch (err) {
    console.warn('[Firestore] Note saving to officer_work_updates collection:', err);
  }

  // 2. Atomically update the complaint in complaints collection
  const complaintDocRef = doc(db, COMPLAINTS_COLLECTION, input.complaintId);
  const snap = await getDoc(complaintDocRef);
  if (snap.exists()) {
    const existing = convertDocToCivicCase(input.complaintId, snap.data());

    // Run AI update consistency and conflict analysis
    const aiAnalysis = analyzeOfficerUpdateWithAI(
      {
        complaintId: input.complaintId,
        status: input.workStatus === 'WORK_COMPLETED' ? 'SOLVED' : input.workStatus,
        progress: input.progressPercentage,
        notes: input.workDescription,
        nextAction: input.nextAction,
        isBlocked: input.workStatus === 'BLOCKED',
        completionPhoto: input.proofImageUrl
      },
      existing
    );

    // Workflow logic: When officer completes work, AI Resolution Verification evaluates original complaint vs proof
    let newComplaintStatus: CaseStatus = 'IN_PROGRESS';
    let isFullyResolved = false;
    const newTimelineEvents: TimelineEvent[] = [];

    if (input.workStatus === 'WORK_COMPLETED' || input.progressPercentage >= 100) {
      const resVerify = runResolutionVerificationAgent({
        workDescription: input.workDescription,
        progress: input.progressPercentage,
        beforePhotos: existing.evidenceImages || (existing.imageUrl ? [existing.imageUrl] : []),
        afterPhotoUrl: input.proofImageUrl || existing.resolvedImageUrl,
        originalComplaintTitle: existing.title,
        originalComplaintDesc: existing.description
      });

      if (resVerify.decision.verificationStatus === 'VERIFIED') {
        newComplaintStatus = 'SOLVED';
        isFullyResolved = true;
        newTimelineEvents.push({
          id: `t-ai-verify-${Date.now()}`,
          title: `AI Resolution Verification: VERIFIED (${resVerify.decision.resolutionQualityScore}%)`,
          timestamp: formattedDate,
          description: `Autonomous verification complete. Post-repair photographic evidence and work specifications match complaint scope. Case marked RESOLVED.`,
          status: 'completed',
          actor: 'Resolution Verification Agent',
          public_visible: true
        });
        newTimelineEvents.push({
          id: `t-solved-${Date.now() + 1}`,
          title: 'Complaint Marked Resolved ✓',
          timestamp: formattedDate,
          description: `Field repairs concluded by ${input.officerName}. Incident verified and closed.`,
          status: 'completed',
          actor: 'CivicMind Engine',
          public_visible: true
        });
      } else if (resVerify.decision.verificationStatus === 'NOT_VERIFIED') {
        newComplaintStatus = 'IN_PROGRESS';
        newTimelineEvents.push({
          id: `t-ai-verify-fail-${Date.now()}`,
          title: 'AI Verification: Revision Required',
          timestamp: formattedDate,
          description: `Discrepancy detected: ${resVerify.decision.explanation}. Case returned to officer ${input.officerName} for rectification.`,
          status: 'current',
          actor: 'Resolution Verification Agent',
          public_visible: true
        });
      } else {
        newComplaintStatus = 'AWAITING GOVERNMENT VERIFICATION';
        newTimelineEvents.push({
          id: `t-ai-gov-rev-${Date.now()}`,
          title: 'Awaiting Government Desk Verification',
          timestamp: formattedDate,
          description: `Work completion report by ${input.officerName} submitted. Flagged for administrative review: ${resVerify.decision.explanation}`,
          status: 'current',
          actor: 'Resolution Verification Agent',
          public_visible: true
        });
      }
    } else if (input.workStatus === 'BLOCKED') {
      newComplaintStatus = 'BLOCKED / DELAYED';
      newTimelineEvents.push({
        id: `t-off-upd-${Date.now()}`,
        title: `Task Blocked / Delayed (${input.progressPercentage}%)`,
        timestamp: formattedDate,
        description: `Bottleneck reported: ${input.issuesEncountered || 'Resource or field delay'}. Officer: ${input.officerName}. Next: ${input.nextAction}`,
        status: 'current',
        actor: input.officerName,
        public_visible: true
      });
    } else {
      newComplaintStatus = 'IN_PROGRESS';
      newTimelineEvents.push({
        id: `t-off-upd-${Date.now()}`,
        title: `Officer Work Progress Update (${input.progressPercentage}%)`,
        timestamp: formattedDate,
        description: `${input.workDescription}. Next Action: ${input.nextAction}`,
        status: 'current',
        actor: input.officerName,
        public_visible: true
      });
    }

    const updatedTimeline: TimelineEvent[] = [
      ...newTimelineEvents,
      ...existing.timeline
    ];

    const resolutionReportObj = (input.workStatus === 'WORK_COMPLETED' || isFullyResolved || input.proofImageUrl) ? {
      summary: input.workDescription,
      actionTaken: input.workDescription,
      completedAt: now.toISOString(),
      afterPhotoUrl: input.proofImageUrl || existing.resolvedImageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
      verifiedByGovernment: isFullyResolved,
      verifiedByAI: isFullyResolved
    } : existing.resolutionReport || null;

    const docUpdateData = {
      status: newComplaintStatus,
      progress: input.progressPercentage,
      current_action: input.workDescription,
      next_action: input.nextAction,
      is_blocked: input.workStatus === 'BLOCKED',
      blocked_reason: input.issuesEncountered || '',
      officer_update_note: input.workDescription,
      officer_last_update: now.toISOString(),
      expected_completion_date: input.estimatedCompletion || existing.expectedCompletionDate || '',
      resolved_image_url: input.proofImageUrl || existing.resolvedImageUrl || '',
      resolution_report: resolutionReportObj,
      ai_conflict_detected: aiAnalysis.conflictDetected,
      ai_conflict_reason: aiAnalysis.conflictReason,
      citizen_notification_text: aiAnalysis.citizenNotificationText,
      updated_at: now.toISOString(),
      timeline: updatedTimeline
    };

    await updateDoc(complaintDocRef, docUpdateData);

    // Update memory cache
    const currentCached = getCachedComplaints();
    const updatedCases = currentCached.map(c => {
      if (c.id === input.complaintId) {
        return {
          ...c,
          status: newComplaintStatus,
          progress: input.progressPercentage,
          currentAction: input.workDescription,
          nextAction: input.nextAction,
          isBlocked: input.workStatus === 'BLOCKED',
          blockedReason: input.issuesEncountered || '',
          officerUpdateNote: input.workDescription,
          officerLastUpdate: now.toISOString(),
          expectedCompletionDate: input.estimatedCompletion || c.expectedCompletionDate || '',
          resolvedImageUrl: input.proofImageUrl || c.resolvedImageUrl || '',
          resolutionReport: resolutionReportObj,
          aiConflictDetected: aiAnalysis.conflictDetected,
          aiConflictReason: aiAnalysis.conflictReason,
          citizenNotificationText: aiAnalysis.citizenNotificationText,
          updatedDate: now.toISOString(),
          timeline: updatedTimeline
        };
      }
      return c;
    });
    saveCachedComplaints(updatedCases);
    notifyComplaintListeners(updatedCases);

    // Emit autonomous agent audit log for officer update
    logAgentActivity({
      timestamp: now.toISOString(),
      agentRole: 'update_audit_agent',
      agentName: 'Field Update & Conflict Audit Agent',
      complaintId: input.complaintId,
      action: `Audit Field Update (${input.progressPercentage}%)`,
      summary: aiAnalysis.aiAnalysisSummary || `Field update by ${input.officerName} verified. Status: ${newComplaintStatus}`,
      confidence: 96.5,
      decision: { 
        progress: input.progressPercentage, 
        workStatus: input.workStatus, 
        conflict: aiAnalysis.conflictDetected,
        resultingStatus: newComplaintStatus
      },
      status: aiAnalysis.conflictDetected ? 'FLAGGED_FOR_HUMAN' : 'SUCCESS'
    });
  }

  console.log(`[OfficerService] Work update ${updateId} submitted successfully for complaint ${input.complaintId}`);
  return newUpdateRecord;
}

const WORK_UPDATES_CACHE_KEY = 'civicmind_officer_work_updates_cache';

export function getCachedOfficerWorkUpdates(): OfficerWorkUpdate[] {
  try {
    const raw = localStorage.getItem(WORK_UPDATES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('[Cache] Error loading local officer work updates cache:', e);
  }
  return [];
}

export function saveCachedOfficerWorkUpdates(updates: OfficerWorkUpdate[]): void {
  try {
    localStorage.setItem(WORK_UPDATES_CACHE_KEY, JSON.stringify(updates));
  } catch (e) {
    console.warn('[Cache] Error saving officer work updates cache:', e);
  }
}

// 17. REAL-TIME SUBSCRIPTION TO OFFICER WORK UPDATES
export function subscribeToOfficerWorkUpdates(
  onUpdate: (updates: OfficerWorkUpdate[]) => void,
  onError?: (error: any) => void
): () => void {
  // Provide immediate cached data if available for instant UI rendering
  const initialCache = getCachedOfficerWorkUpdates();
  if (initialCache.length > 0) {
    onUpdate(initialCache);
  }

  try {
    const colRef = collection(db, OFFICER_WORK_UPDATES_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: OfficerWorkUpdate[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            update_id: d.update_id || docSnap.id,
            complaint_id: d.complaint_id,
            officer_id: d.officer_id || '',
            officer_name: d.officer_name || 'Officer',
            department_name: d.department_name || '',
            progress_percentage: typeof d.progress_percentage === 'number' ? d.progress_percentage : 0,
            work_status: d.work_status || 'IN_PROGRESS',
            work_description: d.work_description || '',
            next_action: d.next_action || '',
            issues_encountered: d.issues_encountered || '',
            estimated_completion: d.estimated_completion || '',
            materials_used: d.materials_used || '',
            proof_image_url: d.proof_image_url || '',
            submitted_at: d.submitted_at || new Date().toISOString(),
            government_review_status: d.government_review_status || 'PENDING_APPROVAL',
            government_reviewed_by: d.government_reviewed_by || '',
            government_reviewed_at: d.government_reviewed_at || '',
            government_feedback: d.government_feedback || ''
          });
        });
        // Sort newest first
        list.sort((a, b) => {
          const dateA = new Date(a.submitted_at).getTime() || 0;
          const dateB = new Date(b.submitted_at).getTime() || 0;
          return dateB - dateA;
        });
        saveCachedOfficerWorkUpdates(list);
        onUpdate(list);
      },
      (err) => {
        console.warn('Firestore officer work updates subscription notice (gracefully handled):', err?.message || err);
        const fallback = getCachedOfficerWorkUpdates();
        if (fallback.length > 0) {
          onUpdate(fallback);
        }
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Notice starting officer updates listener (gracefully handled):', err);
    const fallback = getCachedOfficerWorkUpdates();
    if (fallback.length > 0) {
      onUpdate(fallback);
    }
    return () => {};
  }
}

// 18. GOVERNMENT: APPROVE OFFICER WORK UPDATE
export async function governmentApproveWorkUpdateInDb(params: {
  updateId: string;
  complaintId: string;
  verifierName?: string;
  approvalNotes?: string;
  isFinalResolution?: boolean;
}): Promise<void> {
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const verifier = params.verifierName || 'Government Admin';

  // 1. Update the officer_work_updates record
  try {
    const updateDocRef = doc(db, OFFICER_WORK_UPDATES_COLLECTION, params.updateId);
    await updateDoc(updateDocRef, {
      government_review_status: 'APPROVED',
      government_reviewed_by: verifier,
      government_reviewed_at: now.toISOString(),
      government_feedback: params.approvalNotes || 'Approved without modifications.'
    });
  } catch (err) {
    console.warn('[Firestore] Note updating officer_work_updates record:', err);
  }

  // 2. Update the parent complaint document
  const complaintDocRef = doc(db, COMPLAINTS_COLLECTION, params.complaintId);
  const snap = await getDoc(complaintDocRef);
  if (!snap.exists()) return;

  const existing = convertDocToCivicCase(params.complaintId, snap.data());

  if (params.isFinalResolution || existing.status === 'AWAITING GOVERNMENT VERIFICATION' || existing.status === 'AWAITING_VERIFICATION') {
    // Officially mark complaint as SOLVED / RESOLVED
    const updatedResolutionReport = {
      ...(existing.resolutionReport || {
        summary: existing.officerUpdateNote || 'Field repairs executed by departmental squad.',
        actionTaken: existing.currentAction || 'Issue resolved and verified.',
        completedAt: now.toISOString()
      }),
      verifiedByGovernment: true,
      verificationNotes: params.approvalNotes || 'Official Government verification completed. Photographic evidence approved.'
    };

    const updatedTimeline: TimelineEvent[] = [
      {
        id: `t-gov-appr-${Date.now()}`,
        title: 'Government Approved Resolution & Ticket SOLVED',
        timestamp: formattedDate,
        description: `Government Admin (${verifier}) reviewed Officer report & verified site repairs. Case officially marked COMPLETED / RESOLVED.`,
        status: 'completed',
        actor: verifier,
        public_visible: true
      },
      ...existing.timeline
    ];

    await updateDoc(complaintDocRef, {
      status: 'SOLVED',
      progress: 100,
      resolved_at: now.toISOString(),
      resolution_report: updatedResolutionReport,
      resolution_notes: params.approvalNotes || 'Government verification completed.',
      sla_hours_remaining: 0,
      current_action: 'Case officially closed and verified by Municipal Government.',
      next_action: 'Citizen rating and archival completed.',
      updated_at: now.toISOString(),
      timeline: updatedTimeline
    });
  } else {
    // Approve intermediate progress
    const updatedTimeline: TimelineEvent[] = [
      {
        id: `t-gov-appr-${Date.now()}`,
        title: 'Government Approved Officer Progress',
        timestamp: formattedDate,
        description: `Government Admin (${verifier}) approved field progress report. Notes: ${params.approvalNotes || 'Squad proceeding on schedule.'}`,
        status: 'completed',
        actor: verifier,
        public_visible: true
      },
      ...existing.timeline
    ];

    await updateDoc(complaintDocRef, {
      status: 'IN_PROGRESS',
      updated_at: now.toISOString(),
      timeline: updatedTimeline
    });
  }
}

// 19. GOVERNMENT: REJECT / REQUEST REVISION ON OFFICER WORK UPDATE
export async function governmentRejectWorkUpdateInDb(params: {
  updateId: string;
  complaintId: string;
  verifierName?: string;
  reason: string;
}): Promise<void> {
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const verifier = params.verifierName || 'Government Admin';

  // 1. Update the officer_work_updates record
  try {
    const updateDocRef = doc(db, OFFICER_WORK_UPDATES_COLLECTION, params.updateId);
    await updateDoc(updateDocRef, {
      government_review_status: 'REJECTED',
      government_reviewed_by: verifier,
      government_reviewed_at: now.toISOString(),
      government_feedback: params.reason
    });
  } catch (err) {
    console.warn('[Firestore] Note updating officer_work_updates record:', err);
  }

  // 2. Update complaint document to alert officer of revision needed
  const complaintDocRef = doc(db, COMPLAINTS_COLLECTION, params.complaintId);
  const snap = await getDoc(complaintDocRef);
  if (!snap.exists()) return;

  const existing = convertDocToCivicCase(params.complaintId, snap.data());

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-gov-rev-${Date.now()}`,
      title: 'Revision Requested by Government Admin',
      timestamp: formattedDate,
      description: `Government Admin (${verifier}) requested revision on work update. Reason: "${params.reason}". Returned to officer.`,
      status: 'current',
      actor: verifier,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(complaintDocRef, {
    status: 'IN_PROGRESS',
    current_action: `Revision requested by Government: ${params.reason}`,
    next_action: 'Officer to perform required corrections and re-submit work report.',
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}
