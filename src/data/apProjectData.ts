import { APCity, APDepartment, APOfficer, APProject, APProjectUpdate } from '../types/apProjectTypes';

export const AP_CITIES: APCity[] = [
  'Visakhapatnam',
  'Vijayawada',
  'Guntur',
  'Tirupati',
  'Kurnool',
  'Nellore',
  'Rajahmundry',
  'Kakinada',
  'Kadapa',
  'Anantapur'
];

export const AP_DEPARTMENTS: APDepartment[] = [
  'Roads & Infrastructure',
  'Water Supply',
  'Sanitation',
  'Health',
  'Education',
  'Electricity',
  'Municipal Development',
  'Housing',
  'Public Works'
];

// Department Code mappings
const DEPT_CODES: Record<APDepartment, string> = {
  'Roads & Infrastructure': 'RDS',
  'Water Supply': 'WTR',
  'Sanitation': 'SAN',
  'Health': 'HLT',
  'Education': 'EDU',
  'Electricity': 'ELE',
  'Municipal Development': 'MUN',
  'Housing': 'HSG',
  'Public Works': 'PWD'
};

const CITY_CODES: Record<APCity, string> = {
  'Visakhapatnam': 'VSP',
  'Vijayawada': 'BZA',
  'Guntur': 'GNT',
  'Tirupati': 'TPT',
  'Kurnool': 'KRN',
  'Nellore': 'NLR',
  'Rajahmundry': 'RJY',
  'Kakinada': 'KKD',
  'Kadapa': 'KDP',
  'Anantapur': 'ATP'
};

// Realistic Officer Names pool
const FIRST_NAMES = [
  'K. Suresh Kumar', 'P. Ramesh Reddy', 'Dr. V. Lakshmi Narayana', 'B. Satyanarayana', 'M. Srinivas Rao',
  'T. Venkata Ramana', 'Ch. Anuradha', 'G. Siva Prasad', 'A. Mallikarjuna', 'K. Rajesh Babu',
  'D. Padmavathi', 'N. Chandra Sekhar', 'S. Murali Mohan', 'V. Venkateswara Rao', 'Y. Kishore Kumar',
  'J. Hemalatha', 'P. Bhaskar Rao', 'B. Ravi Shankar', 'T. Sujatha', 'R. Anjaneyulu',
  'K. Prasad Varma', 'M. Sarada Devi', 'L. Gopala Krishna', 'N. Mohan Reddy', 'E. Vijaya Bhaskar'
];

const DESIGNATIONS: Record<APDepartment, string[]> = {
  'Roads & Infrastructure': [
    'Superintending Engineer (SE)',
    'Executive Engineer (EE)',
    'Assistant Executive Engineer (AEE)',
    'Divisional Engineer (DE)',
    'Project Director (Roads)'
  ],
  'Water Supply': [
    'Chief Water Works Engineer',
    'Executive Engineer (RWS)',
    'Assistant Engineer (Urban Water)',
    'Superintendent (Water Treatment)',
    'Project Manager (Jal Jeevan)'
  ],
  'Sanitation': [
    'Chief Municipal Health Officer',
    'Sanitation Project Director',
    'Executive Sanitary Engineer',
    'Solid Waste Management Officer',
    'Zonal Sanitation Incharge'
  ],
  'Health': [
    'District Medical & Health Officer (DMHO)',
    'Hospital Infrastructure Executive',
    'Biomedical Project Director',
    'Public Health Engineer',
    'Assistant Project Coordinator'
  ],
  'Education': [
    'Nadu-Nedu Project Director',
    'Executive Engineer (School Infrastructure)',
    'Assistant Executive Engineer (Education)',
    'District Educational Planning Officer',
    'Smart Campus Coordinator'
  ],
  'Electricity': [
    'Superintending Engineer (APEPDCL/APSPDCL)',
    'Divisional Electrical Engineer (DEE)',
    'Assistant Executive Engineer (Grid/Solar)',
    'Substation Project Manager',
    'Urban Distribution Incharge'
  ],
  'Municipal Development': [
    'Additional Municipal Commissioner (Projects)',
    'Smart City Project Engineer',
    'Urban Infrastructure Specialist',
    'Town Planning Officer',
    'Zonal Development Engineer'
  ],
  'Housing': [
    'Project Director (YSR Jagananna Housing)',
    'Executive Housing Engineer',
    'Assistant Executive Engineer (Townships)',
    'Quality Control Officer (Housing)',
    'Layout Development Incharge'
  ],
  'Public Works': [
    'Superintending Engineer (PWD Building)',
    'Executive Engineer (Bridges & Flyovers)',
    'Assistant Executive Engineer (Civil Works)',
    'Senior Structural Consultant',
    'Project Coordinator (PWD)'
  ]
};

// Generate 5 Officers for every Department in every City (10 * 9 * 5 = 450 Officers)
export const GENERATED_OFFICERS: APOfficer[] = [];

let officerNameIdx = 0;
AP_CITIES.forEach((city) => {
  const cityCode = CITY_CODES[city];
  AP_DEPARTMENTS.forEach((dept) => {
    const deptCode = DEPT_CODES[dept];
    const designations = DESIGNATIONS[dept];
    
    for (let i = 1; i <= 5; i++) {
      const officerId = `AP-${cityCode}-${deptCode}-0${i}`;
      const name = FIRST_NAMES[officerNameIdx % FIRST_NAMES.length];
      officerNameIdx++;
      const designation = designations[(i - 1) % designations.length];
      const email = `officer.${cityCode.toLowerCase()}.${deptCode.toLowerCase()}0${i}@ap.gov.in`;
      const phone = `+91 94${Math.floor(10000000 + Math.random() * 89999999)}`;

      // Realistic project counts
      const assigned = 2 + ((i + city.length) % 4);
      const completed = 1 + ((i * 2) % 3);
      const ongoing = Math.max(1, assigned - completed);
      const delayed = (i % 3 === 0) ? 1 : 0;
      const pending = Math.max(0, assigned - completed - ongoing);

      GENERATED_OFFICERS.push({
        officerId,
        name,
        department: dept,
        city,
        designation,
        email,
        phone,
        assignedProjects: assigned,
        ongoingProjects: ongoing,
        completedProjects: completed,
        pendingProjects: pending,
        delayedProjects: delayed
      });
    }
  });
});

// Helper to look up an officer
export const getOfficerById = (id: string): APOfficer | undefined => {
  return GENERATED_OFFICERS.find((o) => o.officerId === id);
};

// Sample realistic project images
const INFRA_IMAGES = {
  roads_ongoing: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
  roads_completed: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
  water_ongoing: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  water_completed: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
  bridge_completed: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1200&q=80',
  school_completed: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
  hospital_completed: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
  housing_completed: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  solar_completed: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
  sanitation_ongoing: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80'
};

// Initial Realistic Andhra Pradesh State Projects
export const INITIAL_AP_PROJECTS: APProject[] = [
  {
    projectId: 'AP-PRJ-VSP-RDS-101',
    projectName: 'Visakhapatnam Beach Road 6-Lane Coastal Corridor & Elevated Promenade',
    state: 'Andhra Pradesh',
    city: 'Visakhapatnam',
    department: 'Roads & Infrastructure',
    location: 'RK Beach to Bheemili Coastal Highway, Sector 4, Visakhapatnam',
    officerId: 'AP-VSP-RDS-01',
    officerName: GENERATED_OFFICERS.find(o => o.officerId === 'AP-VSP-RDS-01')?.name || 'K. Suresh Kumar',
    officerDesignation: 'Superintending Engineer (SE)',
    budget: 145.50, // in Crores
    amountSpent: 112.80,
    remainingAmount: 32.70,
    completionPercentage: 78,
    status: 'Ongoing',
    startDate: '2025-02-15',
    expectedCompletionDate: '2026-11-30',
    latestSituation: 'Sub-grade bituminous laying completed for 18km stretch. Pier cap construction in progress near Rushikonda junction with 120 workers on double shift.',
    lastUpdated: '2026-08-20 14:30',
    progressPhotos: [
      INFRA_IMAGES.roads_ongoing,
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'
    ],
    latestReviewStatus: 'Submitted for Government Review',
    priority: 'Critical',
    updates: [
      {
        updateId: 'UPD-101-03',
        projectId: 'AP-PRJ-VSP-RDS-101',
        officerId: 'AP-VSP-RDS-01',
        officerName: 'K. Suresh Kumar',
        officerDesignation: 'Superintending Engineer (SE)',
        previousStatus: 'Ongoing',
        newStatus: 'Ongoing',
        previousCompletionPercentage: 70,
        newCompletionPercentage: 78,
        previousAmountSpent: 98.40,
        amountSpent: 112.80,
        situationReport: 'Completed bituminous concrete overlay for Sector 2. Heavy monsoon drainage integration underway. Soil stability tests passed at CRZ zone.',
        completionPhoto: INFRA_IMAGES.roads_ongoing,
        additionalPhotos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'],
        submittedAt: '2026-08-20 14:30',
        reviewStatus: 'Submitted for Government Review'
      },
      {
        updateId: 'UPD-101-02',
        projectId: 'AP-PRJ-VSP-RDS-101',
        officerId: 'AP-VSP-RDS-01',
        officerName: 'K. Suresh Kumar',
        officerDesignation: 'Superintending Engineer (SE)',
        previousStatus: 'Ongoing',
        newStatus: 'Ongoing',
        previousCompletionPercentage: 55,
        newCompletionPercentage: 70,
        previousAmountSpent: 75.00,
        amountSpent: 98.40,
        situationReport: 'Grade separation earthwork completed. 8 culverts constructed and tested.',
        submittedAt: '2026-06-12 11:15',
        reviewStatus: 'Approved',
        governmentRemarks: 'Approved. Proceed with coastal erosion barrier installation.',
        reviewedAt: '2026-06-14 09:30',
        reviewedBy: 'AP Secretariat Works Review Board'
      }
    ]
  },
  {
    projectId: 'AP-PRJ-BZA-WTR-201',
    projectName: 'Vijayawada 24x7 Krishna River Continuous Pressurized Water Supply Scheme',
    state: 'Andhra Pradesh',
    city: 'Vijayawada',
    department: 'Water Supply',
    location: 'Head Water Works, Prakasam Barrage upstream to Bhavanipuram Zone',
    officerId: 'AP-BZA-WTR-01',
    officerName: GENERATED_OFFICERS.find(o => o.officerId === 'AP-BZA-WTR-01')?.name || 'P. Ramesh Reddy',
    officerDesignation: 'Chief Water Works Engineer',
    budget: 88.00,
    amountSpent: 88.00,
    remainingAmount: 0.00,
    completionPercentage: 100,
    status: 'Completed',
    startDate: '2024-09-01',
    expectedCompletionDate: '2026-07-31',
    latestSituation: 'All 4 rapid gravity filtration units commissioned and hydro-tested. Flow calibration automated via SCADA center at Head Water Works. 100% water quality standard compliance verified.',
    lastUpdated: '2026-08-05 16:45',
    completionPhoto: INFRA_IMAGES.water_completed,
    progressPhotos: [
      INFRA_IMAGES.water_completed,
      INFRA_IMAGES.water_ongoing
    ],
    latestReviewStatus: 'Approved',
    priority: 'High',
    updates: [
      {
        updateId: 'UPD-201-04',
        projectId: 'AP-PRJ-BZA-WTR-201',
        officerId: 'AP-BZA-WTR-01',
        officerName: 'P. Ramesh Reddy',
        officerDesignation: 'Chief Water Works Engineer',
        previousStatus: 'Ongoing',
        newStatus: 'Completed',
        previousCompletionPercentage: 92,
        newCompletionPercentage: 100,
        previousAmountSpent: 81.50,
        amountSpent: 88.00,
        situationReport: 'Project fully completed. SCADA live telemetric testing passed with 2.8 bar uniform terminal pressure. Mandatory completion photo attached.',
        completionPhoto: INFRA_IMAGES.water_completed,
        submittedAt: '2026-08-05 16:45',
        reviewStatus: 'Approved',
        governmentRemarks: 'Final inspection passed. Project designated as landmark municipal water success.',
        reviewedAt: '2026-08-07 10:20',
        reviewedBy: 'Directorate of Municipal Administration, Amaravati'
      }
    ]
  },
  {
    projectId: 'AP-PRJ-GNT-HLT-301',
    projectName: 'Guntur Government General Hospital Super-Specialty Mother & Child Block',
    state: 'Andhra Pradesh',
    city: 'Guntur',
    department: 'Health',
    location: 'GGH Campus, Sambasiva Pet, Guntur',
    officerId: 'AP-GNT-HLT-01',
    officerName: GENERATED_OFFICERS.find(o => o.officerId === 'AP-GNT-HLT-01')?.name || 'Dr. V. Lakshmi Narayana',
    officerDesignation: 'District Medical & Health Officer (DMHO)',
    budget: 110.00,
    amountSpent: 72.50,
    remainingAmount: 37.50,
    completionPercentage: 65,
    status: 'Ongoing',
    startDate: '2025-01-10',
    expectedCompletionDate: '2027-01-15',
    latestSituation: 'Civil structure completed up to 6th floor. Centralized medical gas pipeline and HVAC installation currently in progress on floors 1 through 3.',
    lastUpdated: '2026-08-18 10:20',
    progressPhotos: [
      INFRA_IMAGES.hospital_completed
    ],
    latestReviewStatus: 'Approved',
    priority: 'Critical',
    updates: [
      {
        updateId: 'UPD-301-02',
        projectId: 'AP-PRJ-GNT-HLT-301',
        officerId: 'AP-GNT-HLT-01',
        officerName: 'Dr. V. Lakshmi Narayana',
        officerDesignation: 'DMHO',
        previousStatus: 'Ongoing',
        newStatus: 'Ongoing',
        previousCompletionPercentage: 50,
        newCompletionPercentage: 65,
        previousAmountSpent: 55.00,
        amountSpent: 72.50,
        situationReport: 'Structure completed. NICU and Modular OT wall panels delivery inspected.',
        submittedAt: '2026-08-18 10:20',
        reviewStatus: 'Approved',
        governmentRemarks: 'Approved. Ensure backup oxygen plant installation syncs with floor completion.',
        reviewedAt: '2026-08-19 14:00',
        reviewedBy: 'Health & Family Welfare Directorate'
      }
    ]
  },
  {
    projectId: 'AP-PRJ-TPT-EDU-401',
    projectName: 'Tirupati Smart Government Model High School & Digital Science Labs (Mana Badi)',
    state: 'Andhra Pradesh',
    city: 'Tirupati',
    department: 'Education',
    location: 'Bhavani Nagar, Tirupati Urban',
    officerId: 'AP-TPT-EDU-01',
    officerName: GENERATED_OFFICERS.find(o => o.officerId === 'AP-TPT-EDU-01')?.name || 'B. Satyanarayana',
    officerDesignation: 'Nadu-Nedu Project Director',
    budget: 34.20,
    amountSpent: 34.20,
    remainingAmount: 0.00,
    completionPercentage: 100,
    status: 'Completed',
    startDate: '2025-03-01',
    expectedCompletionDate: '2026-06-30',
    latestSituation: 'Modern green building campus delivered with 24 interactive digital classrooms, STEM robotics laboratory, sports complex and solar rooftop grid.',
    lastUpdated: '2026-07-25 11:30',
    completionPhoto: INFRA_IMAGES.school_completed,
    progressPhotos: [
      INFRA_IMAGES.school_completed
    ],
    latestReviewStatus: 'Approved',
    priority: 'Medium',
    updates: [
      {
        updateId: 'UPD-401-01',
        projectId: 'AP-PRJ-TPT-EDU-401',
        officerId: 'AP-TPT-EDU-01',
        officerName: 'B. Satyanarayana',
        officerDesignation: 'Nadu-Nedu Project Director',
        previousStatus: 'Ongoing',
        newStatus: 'Completed',
        previousCompletionPercentage: 88,
        newCompletionPercentage: 100,
        previousAmountSpent: 30.10,
        amountSpent: 34.20,
        situationReport: 'Handover completed to District Educational Officer. All smart screens, high speed broadband and student furniture verified.',
        completionPhoto: INFRA_IMAGES.school_completed,
        submittedAt: '2026-07-25 11:30',
        reviewStatus: 'Approved',
        governmentRemarks: 'Handover acknowledged. Good job on timely completion within budget.',
        reviewedAt: '2026-07-28 09:00',
        reviewedBy: 'Department of School Education, Amaravati'
      }
    ]
  },
  {
    projectId: 'AP-PRJ-KRN-ELE-501',
    projectName: 'Kurnool Mega Ultra-Solar Microgrid & 220kV Substation Modernization',
    state: 'Andhra Pradesh',
    city: 'Kurnool',
    department: 'Electricity',
    location: 'Orvakal Industrial Park, Kurnool District',
    officerId: 'AP-KRN-ELE-01',
    officerName: GENERATED_OFFICERS.find(o => o.officerId === 'AP-KRN-ELE-01')?.name || 'M. Srinivas Rao',
    officerDesignation: 'Superintending Engineer (APSPDCL)',
    budget: 180.00,
    amountSpent: 85.00,
    remainingAmount: 95.00,
    completionPercentage: 48,
    status: 'Delayed',
    startDate: '2024-11-01',
    expectedCompletionDate: '2026-09-30',
    latestSituation: 'Delay encountered due to specialized step-up transformer delivery delay from manufacturer. Civil foundations ready. Revised delivery scheduled for next month.',
    lastUpdated: '2026-08-15 17:00',
    progressPhotos: [
      INFRA_IMAGES.solar_completed
    ],
    latestReviewStatus: 'Correction Requested',
    latestCorrectionRemark: 'Please upload the manufacturer warranty and revised shipment dispatch tracking note before budget disbursement.',
    priority: 'Critical',
    updates: [
      {
        updateId: 'UPD-501-02',
        projectId: 'AP-PRJ-KRN-ELE-501',
        officerId: 'AP-KRN-ELE-01',
        officerName: 'M. Srinivas Rao',
        officerDesignation: 'Superintending Engineer',
        previousStatus: 'Ongoing',
        newStatus: 'Delayed',
        previousCompletionPercentage: 45,
        newCompletionPercentage: 48,
        previousAmountSpent: 78.00,
        amountSpent: 85.00,
        situationReport: 'Transformer delivery supplier invoked supply chain delay. Foundations for 8 feeder bays completed.',
        submittedAt: '2026-08-15 17:00',
        reviewStatus: 'Correction Requested',
        governmentRemarks: 'Please upload the manufacturer warranty and revised shipment dispatch tracking note before budget disbursement.',
        reviewedAt: '2026-08-16 11:30',
        reviewedBy: 'Energy Department Review Board'
      }
    ]
  },
  {
    projectId: 'AP-PRJ-NLR-HSG-601',
    projectName: 'Nellore YSR Jagananna Smart Housing Township (3,500 Units)',
    state: 'Andhra Pradesh',
    city: 'Nellore',
    department: 'Housing',
    location: 'Allipuram Layout, Sector B & C, Nellore',
    officerId: 'AP-NLR-HSG-01',
    officerName: GENERATED_OFFICERS.find(o => o.officerId === 'AP-NLR-HSG-01')?.name || 'T. Venkata Ramana',
    officerDesignation: 'Project Director (Housing)',
    budget: 165.00,
    amountSpent: 128.50,
    remainingAmount: 36.50,
    completionPercentage: 82,
    status: 'Ongoing',
    startDate: '2024-08-15',
    expectedCompletionDate: '2026-12-31',
    latestSituation: 'Plumbing and internal electrification completed for Block 1 to 24. External asphalt roads, overhead water tank and park landscaping nearing completion.',
    lastUpdated: '2026-08-21 09:15',
    progressPhotos: [
      INFRA_IMAGES.housing_completed
    ],
    latestReviewStatus: 'Submitted for Government Review',
    priority: 'High',
    updates: [
      {
        updateId: 'UPD-601-03',
        projectId: 'AP-PRJ-NLR-HSG-601',
        officerId: 'AP-NLR-HSG-01',
        officerName: 'T. Venkata Ramana',
        officerDesignation: 'Project Director (Housing)',
        previousStatus: 'Ongoing',
        newStatus: 'Ongoing',
        previousCompletionPercentage: 74,
        newCompletionPercentage: 82,
        previousAmountSpent: 115.00,
        amountSpent: 128.50,
        situationReport: '2,800 units painted and fitted with pre-cast doors. Solar streetlights activated along main boulevard.',
        completionPhoto: INFRA_IMAGES.housing_completed,
        submittedAt: '2026-08-21 09:15',
        reviewStatus: 'Submitted for Government Review'
      }
    ]
  },
  {
    projectId: 'AP-PRJ-RJY-MUN-701',
    projectName: 'Rajahmundry Godavari Riverfront Beautification & Heritage Ghats Promenade',
    state: 'Andhra Pradesh',
    city: 'Rajahmundry',
    department: 'Municipal Development',
    location: 'Kotilingala Ghat to Pushkar Ghat, Rajahmundry',
    officerId: 'AP-RJY-MUN-01',
    officerName: GENERATED_OFFICERS.find(o => o.officerId === 'AP-RJY-MUN-01')?.name || 'Ch. Anuradha',
    officerDesignation: 'Additional Municipal Commissioner (Projects)',
    budget: 65.00,
    amountSpent: 42.00,
    remainingAmount: 23.00,
    completionPercentage: 62,
    status: 'Ongoing',
    startDate: '2025-04-01',
    expectedCompletionDate: '2027-02-28',
    latestSituation: 'River protection retaining wall reinforced for 2.4 km stretch. Heritage stone paving and decorative LED lighting poles installed on upper deck.',
    lastUpdated: '2026-08-19 15:40',
    progressPhotos: [
      INFRA_IMAGES.bridge_completed
    ],
    latestReviewStatus: 'Approved',
    priority: 'Medium',
    updates: [
      {
        updateId: 'UPD-701-02',
        projectId: 'AP-PRJ-RJY-MUN-701',
        officerId: 'AP-RJY-MUN-01',
        officerName: 'Ch. Anuradha',
        officerDesignation: 'Addl Municipal Commissioner',
        previousStatus: 'Ongoing',
        newStatus: 'Ongoing',
        previousCompletionPercentage: 50,
        newCompletionPercentage: 62,
        previousAmountSpent: 33.00,
        amountSpent: 42.00,
        situationReport: 'Completed embankment stone revetment. Fountain plumbing tests in progress.',
        submittedAt: '2026-08-19 15:40',
        reviewStatus: 'Approved',
        governmentRemarks: 'Approved. Maintain flood prevention safety buffers.',
        reviewedAt: '2026-08-20 11:00',
        reviewedBy: 'Municipal Administration Dept'
      }
    ]
  },
  {
    projectId: 'AP-PRJ-KKD-SAN-801',
    projectName: 'Kakinada Smart Automated Solid Waste Processing & Bio-CNG Facility',
    state: 'Andhra Pradesh',
    city: 'Kakinada',
    department: 'Sanitation',
    location: 'Vakalapudi Industrial Belt, Kakinada',
    officerId: 'AP-KKD-SAN-01',
    officerName: GENERATED_OFFICERS.find(o => o.officerId === 'AP-KKD-SAN-01')?.name || 'G. Siva Prasad',
    officerDesignation: 'Sanitation Project Director',
    budget: 45.00,
    amountSpent: 45.00,
    remainingAmount: 0.00,
    completionPercentage: 100,
    status: 'Completed',
    startDate: '2024-10-01',
    expectedCompletionDate: '2026-06-15',
    latestSituation: 'Plant fully operational processing 250 metric tonnes of municipal waste daily. Producing 8,000 kg/day purified Bio-CNG for commercial transit.',
    lastUpdated: '2026-06-20 12:00',
    completionPhoto: INFRA_IMAGES.sanitation_ongoing,
    progressPhotos: [
      INFRA_IMAGES.sanitation_ongoing
    ],
    latestReviewStatus: 'Approved',
    priority: 'High',
    updates: [
      {
        updateId: 'UPD-801-03',
        projectId: 'AP-PRJ-KKD-SAN-801',
        officerId: 'AP-KKD-SAN-01',
        officerName: 'G. Siva Prasad',
        officerDesignation: 'Sanitation Project Director',
        previousStatus: 'Ongoing',
        newStatus: 'Completed',
        previousCompletionPercentage: 90,
        newCompletionPercentage: 100,
        previousAmountSpent: 40.20,
        amountSpent: 45.00,
        situationReport: 'Trial run completed successfully for 30 consecutive days. AP Pollution Control Board clearance certificate issued.',
        completionPhoto: INFRA_IMAGES.sanitation_ongoing,
        submittedAt: '2026-06-20 12:00',
        reviewStatus: 'Approved',
        governmentRemarks: 'Project verified and cleared for commercial operations.',
        reviewedAt: '2026-06-22 10:00',
        reviewedBy: 'AP Swachh Andhra Corporation'
      }
    ]
  },
  {
    projectId: 'AP-PRJ-KDP-PWD-901',
    projectName: 'Kadapa Penna River 4-Lane High-Level Cable-Stayed Bridge',
    state: 'Andhra Pradesh',
    city: 'Kadapa',
    department: 'Public Works',
    location: 'Penna River Crossing, Outer Ring Road Phase-2, Kadapa',
    officerId: 'AP-KDP-PWD-01',
    officerName: GENERATED_OFFICERS.find(o => o.officerId === 'AP-KDP-PWD-01')?.name || 'A. Mallikarjuna',
    officerDesignation: 'Executive Engineer (Bridges & Flyovers)',
    budget: 95.00,
    amountSpent: 22.00,
    remainingAmount: 73.00,
    completionPercentage: 25,
    status: 'Ongoing',
    startDate: '2025-06-01',
    expectedCompletionDate: '2027-08-30',
    latestSituation: 'Pylon foundation caisson sinking completed for 4 central piers. Stay-cable anchoring jigs assembled on site.',
    lastUpdated: '2026-08-14 11:20',
    progressPhotos: [
      INFRA_IMAGES.bridge_completed
    ],
    latestReviewStatus: 'Approved',
    priority: 'High',
    updates: [
      {
        updateId: 'UPD-901-01',
        projectId: 'AP-PRJ-KDP-PWD-901',
        officerId: 'AP-KDP-PWD-01',
        officerName: 'A. Mallikarjuna',
        officerDesignation: 'Executive Engineer (Bridges)',
        previousStatus: 'Assigned',
        newStatus: 'Ongoing',
        previousCompletionPercentage: 0,
        newCompletionPercentage: 25,
        previousAmountSpent: 0,
        amountSpent: 22.00,
        situationReport: 'Site mobilization completed and underwater foundation caissons grounded to bedrock.',
        submittedAt: '2026-08-14 11:20',
        reviewStatus: 'Approved',
        governmentRemarks: 'Approved.',
        reviewedAt: '2026-08-15 09:30',
        reviewedBy: 'PWD Directorate'
      }
    ]
  },
  {
    projectId: 'AP-PRJ-ATP-RDS-1001',
    projectName: 'Anantapur National Highway Bypass Expressway & Grade Separator Flyover',
    state: 'Andhra Pradesh',
    city: 'Anantapur',
    department: 'Roads & Infrastructure',
    location: 'NH-44 Bypass Junction to Collectorate Road, Anantapur',
    officerId: 'AP-ATP-RDS-01',
    officerName: GENERATED_OFFICERS.find(o => o.officerId === 'AP-ATP-RDS-01')?.name || 'K. Rajesh Babu',
    officerDesignation: 'Superintending Engineer (SE)',
    budget: 120.00,
    amountSpent: 15.00,
    remainingAmount: 105.00,
    completionPercentage: 15,
    status: 'Pending',
    startDate: '2026-01-15',
    expectedCompletionDate: '2028-03-31',
    latestSituation: 'Utility shifting (water main and electric line clearance) completed by 90%. Land acquisition documentation finalized.',
    lastUpdated: '2026-08-10 14:00',
    progressPhotos: [
      INFRA_IMAGES.roads_ongoing
    ],
    latestReviewStatus: 'Approved',
    priority: 'Medium',
    updates: [
      {
        updateId: 'UPD-1001-01',
        projectId: 'AP-PRJ-ATP-RDS-1001',
        officerId: 'AP-ATP-RDS-01',
        officerName: 'K. Rajesh Babu',
        officerDesignation: 'Superintending Engineer',
        previousStatus: 'Assigned',
        newStatus: 'Pending',
        previousCompletionPercentage: 0,
        newCompletionPercentage: 15,
        previousAmountSpent: 0,
        amountSpent: 15.00,
        situationReport: 'Land acquisition compensation disbursal completed. Tenders for pre-stressed girders floated.',
        submittedAt: '2026-08-10 14:00',
        reviewStatus: 'Approved',
        governmentRemarks: 'Approved. Accelerate pillar foundation work before wet season.',
        reviewedAt: '2026-08-11 16:00',
        reviewedBy: 'AP Roads Development Board'
      }
    ]
  }
];

// Seed additional realistic projects across all 10 cities to ensure robust multi-department catalog
const CITY_PROJECT_TEMPLATES = [
  { dept: 'Water Supply', nameSuffix: 'Surface Water Treatment Plant & Underground Pipeline Network', budgetRange: [40, 95] },
  { dept: 'Sanitation', nameSuffix: 'Mechanized Drainage, Sewerage Treatment Plant (STP) & Desilting', budgetRange: [25, 60] },
  { dept: 'Health', nameSuffix: 'Modern Community Health Center (CHC) Upgradation & Diagnostic Wing', budgetRange: [20, 50] },
  { dept: 'Education', nameSuffix: 'Nadu-Nedu Phase-2 Infrastructure Upgradation & Science Centers', budgetRange: [15, 35] },
  { dept: 'Electricity', nameSuffix: 'High Voltage Underground Cabling & Smart Grid Distribution', budgetRange: [30, 85] },
  { dept: 'Municipal Development', nameSuffix: 'Integrated Command Control Center & Multi-Level Car Parking', budgetRange: [35, 75] },
  { dept: 'Housing', nameSuffix: 'Affordable Urban Housing Complex & Civic Amenities Layout', budgetRange: [60, 140] },
  { dept: 'Public Works', nameSuffix: 'District Collectorate Complex Extension & Integrated Public Hall', budgetRange: [25, 70] },
  { dept: 'Roads & Infrastructure', nameSuffix: 'Internal Smart Ring Road Widening & Stormwater Drains', budgetRange: [40, 110] }
];

AP_CITIES.forEach((city, cityIdx) => {
  const cityCode = CITY_CODES[city];
  
  CITY_PROJECT_TEMPLATES.forEach((tmpl, tmplIdx) => {
    const dept = tmpl.dept as APDepartment;
    const deptCode = DEPT_CODES[dept];
    const projectId = `AP-PRJ-${cityCode}-${deptCode}-${200 + cityIdx * 10 + tmplIdx}`;
    
    // Don't duplicate if already present in INITIAL_AP_PROJECTS
    if (INITIAL_AP_PROJECTS.some(p => p.projectId === projectId)) return;

    const assignedOfficer = GENERATED_OFFICERS.find(o => o.city === city && o.department === dept) || GENERATED_OFFICERS[0];
    const budget = Math.round((tmpl.budgetRange[0] + ((cityIdx * 7 + tmplIdx * 13) % (tmpl.budgetRange[1] - tmpl.budgetRange[0]))) * 10) / 10;
    
    // Status variation
    const statuses: ('Ongoing' | 'Completed' | 'Delayed' | 'Pending' | 'Assigned')[] = ['Ongoing', 'Completed', 'Ongoing', 'Delayed', 'Pending', 'Ongoing'];
    const status = statuses[(cityIdx + tmplIdx) % statuses.length];
    
    let completionPercentage = 0;
    let amountSpent = 0;
    let compPhoto: string | undefined = undefined;

    if (status === 'Completed') {
      completionPercentage = 100;
      amountSpent = budget;
      compPhoto = (dept === 'Education' ? INFRA_IMAGES.school_completed : (dept === 'Water Supply' ? INFRA_IMAGES.water_completed : (dept === 'Roads & Infrastructure' ? INFRA_IMAGES.roads_completed : INFRA_IMAGES.housing_completed)));
    } else if (status === 'Ongoing') {
      completionPercentage = 30 + ((cityIdx * 11 + tmplIdx * 7) % 55);
      amountSpent = Math.round((budget * (completionPercentage / 100)) * 100) / 100;
    } else if (status === 'Delayed') {
      completionPercentage = 40 + ((cityIdx * 5) % 25);
      amountSpent = Math.round((budget * 0.45) * 100) / 100;
    } else if (status === 'Pending') {
      completionPercentage = 10 + (tmplIdx % 15);
      amountSpent = Math.round((budget * 0.12) * 100) / 100;
    } else {
      completionPercentage = 0;
      amountSpent = 0;
    }

    const remainingAmount = Math.max(0, Math.round((budget - amountSpent) * 100) / 100);

    const project: APProject = {
      projectId,
      projectName: `${city} ${dept} — ${tmpl.nameSuffix}`,
      state: 'Andhra Pradesh',
      city,
      department: dept,
      location: `${city} Central Sector, Zone ${1 + (tmplIdx % 5)}, ${city}`,
      officerId: assignedOfficer.officerId,
      officerName: assignedOfficer.name,
      officerDesignation: assignedOfficer.designation,
      budget,
      amountSpent,
      remainingAmount,
      completionPercentage,
      status,
      startDate: `2025-0${1 + (tmplIdx % 8)}-15`,
      expectedCompletionDate: `2027-0${1 + ((tmplIdx + 4) % 8)}-30`,
      latestSituation: status === 'Completed' 
        ? `Project successfully completed and dedicated to the public of ${city}. All quality inspections certified.`
        : (status === 'Delayed' 
          ? `Work execution temporarily slowed down due to clearance procedures. Manpower reinforcement planned for next phase.`
          : `Phase-2 structural construction active on site. 85+ technical workers deployed daily under strict municipal QA protocols.`),
      lastUpdated: '2026-08-18 16:30',
      completionPhoto: compPhoto,
      progressPhotos: [
        INFRA_IMAGES.roads_ongoing,
        INFRA_IMAGES.water_ongoing
      ],
      latestReviewStatus: (cityIdx + tmplIdx) % 3 === 0 ? 'Submitted for Government Review' : 'Approved',
      priority: (budget > 70 ? 'Critical' : (budget > 40 ? 'High' : 'Medium')),
      updates: [
        {
          updateId: `UPD-${projectId}-01`,
          projectId,
          officerId: assignedOfficer.officerId,
          officerName: assignedOfficer.name,
          officerDesignation: assignedOfficer.designation,
          previousStatus: 'Assigned',
          newStatus: status,
          previousCompletionPercentage: 0,
          newCompletionPercentage: completionPercentage,
          previousAmountSpent: 0,
          amountSpent,
          situationReport: `Quarterly progress update recorded for ${city} ${dept} project. Ongoing milestones monitored.`,
          completionPhoto: compPhoto,
          submittedAt: '2026-08-18 16:30',
          reviewStatus: (cityIdx + tmplIdx) % 3 === 0 ? 'Submitted for Government Review' : 'Approved',
          governmentRemarks: (cityIdx + tmplIdx) % 3 === 0 ? undefined : 'Routine review cleared.'
        }
      ]
    };

    INITIAL_AP_PROJECTS.push(project);
  });
});
