import { CivicCase, CityHotspot, AIAgentDefinition, AIInsightItem } from '../types';
import { resolveCivicImageKey, getCivicImageUrl, CIVIC_IMAGE_REGISTRY, CivicImageKey } from '../utils/imageAssets';

export const INITIAL_CASES: CivicCase[] = [
  {
    id: 'CL-2026-0847',
    title: "Severe Pothole Near St. Mary's School",
    description: "Deep crater pothole causing vehicle skidding and severe safety risk during morning school hours near St. Mary's School entrance on MG Road.",
    category: 'Roads & Infrastructure',
    priority: 'P1',
    status: 'In Progress',
    location: {
      address: "Near St. Mary's School, MG Road",
      ward: 'Ward 12 (Central Zone)',
      landmark: 'Gate No. 2, St. Mary School',
      lat: 18.5204,
      lng: 73.8567
    },
    aiConfidence: 96,
    impactScore: 8.7,
    duplicateCount: 8,
    assignedDepartment: 'Roads & Infrastructure Department',
    slaHoursRemaining: 3.5,
    slaTotalHours: 12,
    createdDate: '2026-08-20 07:45 AM',
    updatedDate: '2026-08-20 10:15 AM',
    citizenId: 'CIT-1002',
    citizenName: 'Rahul Sharma',
    citizenEmail: 'rahul@gmail.com',
    citizenPhone: '+91 98230 44120',
    imageKey: 'roads',
    imageUrl: CIVIC_IMAGE_REGISTRY['roads'].url,
    evidenceImage: CIVIC_IMAGE_REGISTRY['roads'].url,
    backgroundImage: CIVIC_IMAGE_REGISTRY['roads'].url,
    resolvedImageUrl: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80',
    resolutionNotes: 'Emergency cold-mix asphalt patch team deployed. Base gravel reinforcement and compaction underway.',
    aiExplanation: {
      summary: 'Prioritized as P1 Critical due to proximity to school zone (<50m), high pedestrian child traffic, 8 duplicate citizen reports, and severe skidding hazard.',
      riskFactors: [
        'Located within 45m of active primary school pedestrian zone',
        'High morning rush traffic density (>4,200 vehicles/hr)',
        '8 corroborating duplicate reports filed by local citizens',
        'Active risk of two-wheeler vehicle skidding and severe injury'
      ],
      recommendedAction: 'Immediate field inspection, temporary barricading within 60 mins, and rapid cold-mix paving within 4 hours.',
      detectedAnomalies: [
        'Drainage back-flow reported 120m upstream may be eroding road sub-base'
      ]
    },
    timeline: [
      {
        id: 't1',
        title: 'Complaint Submitted',
        timestamp: '07:45 AM, Today',
        description: 'Citizen Rahul Sharma submitted photographic evidence via CivicMind Mobile Portal.',
        status: 'completed',
        actor: 'Citizen Portal'
      },
      {
        id: 't2',
        title: 'AI Analysis & Triage Completed',
        timestamp: '07:46 AM, Today',
        description: 'Vision Agent extracted road defect dimensions. Priority Agent assigned P1 High (Score 8.7/10).',
        status: 'completed',
        actor: 'CivicMind AI Engine'
      },
      {
        id: 't3',
        title: 'Duplicate Cluster Consolidated',
        timestamp: '07:48 AM, Today',
        description: 'Merged 8 duplicate citizen tickets into single master incident thread with high confidence (96%).',
        status: 'completed',
        actor: 'Duplicate Intelligence Agent'
      },
      {
        id: 't4',
        title: 'Department Assigned & Dispatched',
        timestamp: '08:00 AM, Today',
        description: 'Dispatched to Roads & Infrastructure Department (Ward 12 Rapid Response Squad #4).',
        status: 'completed',
        actor: 'Routing Agent'
      },
      {
        id: 't5',
        title: 'Repair & Bitumen Paving In Progress',
        timestamp: '10:15 AM, Today',
        description: 'Compactor roller and hot-mix bitumen batch on site. Patching layer 1 of 2.',
        status: 'current',
        actor: 'Road Works Crew #12'
      }
    ],
    relatedCases: [
      {
        id: 'CL-2026-0782',
        title: 'Road Surface Cracking & Small Pothole',
        similarityScore: 92,
        distanceMeters: 180,
        status: 'Open',
        reportedDate: 'Yesterday 04:20 PM'
      }
    ]
  },
  {
    id: 'CL-2026-0852',
    title: 'Major Water Pipeline Leakage Near Gandhi Chowk',
    description: 'High-pressure potable water pipeline burst flooding commercial market street with heavy water loss near Gandhi Chowk junction.',
    category: 'Water Supply & Pipelines',
    priority: 'P1',
    status: 'In Progress',
    location: {
      address: 'Gandhi Chowk, Near Central Clock Tower',
      ward: 'Ward 12 (Central Zone)',
      landmark: 'Opposite State Bank Branch',
      lat: 18.5246,
      lng: 73.8612
    },
    aiConfidence: 97,
    impactScore: 9.4,
    duplicateCount: 12,
    assignedDepartment: 'Water Supply & Sewerage Board',
    slaHoursRemaining: 1.8,
    slaTotalHours: 6,
    createdDate: '2026-08-20 08:30 AM',
    updatedDate: '2026-08-20 09:45 AM',
    citizenId: 'CIT-1001',
    citizenName: 'Ammu Sundaram',
    citizenEmail: 'ammu@gmail.com',
    citizenPhone: '+91 98765 11001',
    imageKey: 'water',
    imageUrl: CIVIC_IMAGE_REGISTRY['water'].url,
    evidenceImage: CIVIC_IMAGE_REGISTRY['water'].url,
    backgroundImage: CIVIC_IMAGE_REGISTRY['water'].url,
    resolvedImageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    aiExplanation: {
      summary: 'Identified as P1 Emergency pipeline rupture affecting potable water distribution for ~14,000 households in Ward 12. Water wastage exceeding 850L/min with structural flooding hazard.',
      riskFactors: [
        'Massive drinking water resource depletion (>50k liters lost)',
        'Inundation risk to 18 ground-floor commercial establishments',
        'Pressure drop detected in municipal SCADA sector node 12-B'
      ],
      recommendedAction: 'Emergency valve isolation on Grid Valve #V-12-04 immediately. Deploy excavator and pipe clamp welder.'
    },
    timeline: [
      { id: 't1', title: 'Telemetry & Citizen Alert', timestamp: '08:30 AM', description: '12 simultaneous citizen distress tickets combined with pressure drop alarm.', status: 'completed' },
      { id: 't2', title: 'Main Valve Isolated', timestamp: '09:05 AM', description: 'Feeder line shut down to prevent further street flooding.', status: 'completed' },
      { id: 't3', title: 'Excavation & Pipe Sleeve Clamp', timestamp: '09:45 AM', description: 'Heavy machinery digging pit to expose fractured cast iron joint.', status: 'current' }
    ],
    relatedCases: []
  },
  {
    id: 'CL-2026-0839',
    title: 'Blocked Drainage Causing Sewage Overflow',
    description: 'Heavy stormwater drain choke causing foul sewage water to overflow onto pedestrian walkway and residential lanes behind Nehru Nagar market.',
    category: 'Drainage & Sewage',
    priority: 'P1',
    status: 'In Progress',
    location: {
      address: 'Lane 4, Nehru Nagar Market Area',
      ward: 'Ward 5 (North Ward)',
      landmark: 'Behind Community Health Center',
      lat: 18.5362,
      lng: 73.8421
    },
    aiConfidence: 94,
    impactScore: 8.9,
    duplicateCount: 6,
    assignedDepartment: 'Drainage & Stormwater Division',
    slaHoursRemaining: 4.2,
    slaTotalHours: 12,
    createdDate: '2026-08-19 11:20 PM',
    updatedDate: '2026-08-20 06:30 AM',
    citizenId: 'CIT-1003',
    citizenName: 'Priya Nair',
    citizenEmail: 'priya@gmail.com',
    citizenPhone: '+91 94450 33003',
    imageKey: 'drinage',
    imageUrl: CIVIC_IMAGE_REGISTRY['drinage'].url,
    evidenceImage: CIVIC_IMAGE_REGISTRY['drinage'].url,
    backgroundImage: CIVIC_IMAGE_REGISTRY['drinage'].url,
    aiExplanation: {
      summary: 'P1 Public Health Hazard. Cross-contamination risk to open ground water table with vector-borne disease outbreak probability in densely populated low-lying settlement.',
      riskFactors: [
        'Sewage backflow reaching within 15m of Community Health Center',
        'Stagnant water accelerating mosquito breeding conditions',
        'Correlated with road sub-surface erosion in adjacent Sector 3'
      ],
      recommendedAction: 'Deploy high-pressure Super Sucker desilting jetting vehicle and robotic pipeline inspection crawler.'
    },
    timeline: [
      { id: 't1', title: 'Night Alert Received', timestamp: '11:20 PM', description: 'Complaint filed with photo of overflowing manhole chamber.', status: 'completed' },
      { id: 't2', title: 'Automated Triaging', timestamp: '11:22 PM', description: 'Classified under Drainage & Public Health hazard.', status: 'completed' },
      { id: 't3', title: 'Super Sucker Jet Machine Dispatched', timestamp: '06:00 AM', description: 'High-pressure vacuum vehicle unblocking 120m underground conduit.', status: 'current' }
    ],
    relatedCases: []
  },
  {
    id: 'CL-2026-0822',
    title: 'Garbage Overflow Near Station Road',
    description: 'Over 3 tons of unsegregated solid waste overflowing from secondary bin onto main pedestrian sidewalk near bus terminal, attracting stray animals.',
    category: 'Waste & Sanitation',
    priority: 'P2',
    status: 'Inspection Scheduled',
    location: {
      address: 'Station Road, Near Bus Terminus Gate #4',
      ward: 'Ward 7 (Railway Corridor)',
      landmark: 'Opposite Railway Parcel Office',
      lat: 18.5288,
      lng: 73.8744
    },
    aiConfidence: 98,
    impactScore: 7.6,
    duplicateCount: 5,
    assignedDepartment: 'Solid Waste Management',
    slaHoursRemaining: 5.5,
    slaTotalHours: 12,
    createdDate: '2026-08-20 06:10 AM',
    updatedDate: '2026-08-20 08:30 AM',
    citizenId: 'CIT-1001',
    citizenName: 'Ammu Sundaram',
    citizenEmail: 'ammu@gmail.com',
    citizenPhone: '+91 98765 11001',
    imageKey: 'waste',
    imageUrl: CIVIC_IMAGE_REGISTRY['waste'].url,
    evidenceImage: CIVIC_IMAGE_REGISTRY['waste'].url,
    backgroundImage: CIVIC_IMAGE_REGISTRY['waste'].url,
    aiExplanation: {
      summary: 'Classified as P2 Sanitation Priority. High footfall transit corridor (>25k daily commuters). Visual recognition detected mixed organic and non-recyclable packing materials.',
      riskFactors: [
        'Blockage of pedestrian transit walkway causing commuters to walk on live bus lane',
        'Stray cattle and dog congregation creating traffic hazards',
        'Bin fill sensor telemetry shows 140% capacity breach'
      ],
      recommendedAction: 'Dispatch 5-ton hydraulic compactor tipper and sanitize bin washing pad with bleaching powder.'
    },
    timeline: [
      { id: 't1', title: 'Complaint Registered', timestamp: '06:10 AM', description: 'Reported by morning commuter via app with geo-tagged snapshot.', status: 'completed' },
      { id: 't2', title: 'Route Optimization Assignment', timestamp: '07:00 AM', description: 'Assigned to Sector 7 Sanitation Compactor Truck #TS-09.', status: 'completed' },
      { id: 't3', title: 'Pickup Scheduled', timestamp: '08:30 AM', description: 'Truck ETA is 10:45 AM as part of morning clearance cycle.', status: 'current' }
    ],
    relatedCases: []
  },
  {
    id: 'CL-2026-0811',
    title: 'Streetlights Not Working on Lake View Road',
    description: 'Eight consecutive LED streetlights completely dark along pedestrian walking trail creating public safety hazard and poor visibility on Lake View Road.',
    category: 'Streetlights & Electrical',
    priority: 'P2',
    status: 'In Progress',
    location: {
      address: 'Lake View Promenade, Sector 8',
      ward: 'Ward 12 (Central Zone)',
      landmark: 'Near Joggers Park North Entrance',
      lat: 18.5321,
      lng: 73.8499
    },
    aiConfidence: 95,
    impactScore: 7.9,
    duplicateCount: 9,
    assignedDepartment: 'Electrical & Street Lighting Bureau',
    slaHoursRemaining: 8.0,
    slaTotalHours: 24,
    createdDate: '2026-08-19 09:15 PM',
    updatedDate: '2026-08-20 07:15 AM',
    citizenId: 'CIT-1002',
    citizenName: 'Rahul Sharma',
    citizenEmail: 'rahul@gmail.com',
    citizenPhone: '+91 98230 44120',
    imageKey: 'street images',
    imageUrl: CIVIC_IMAGE_REGISTRY['street images'].url,
    evidenceImage: CIVIC_IMAGE_REGISTRY['street images'].url,
    backgroundImage: CIVIC_IMAGE_REGISTRY['street images'].url,
    aiExplanation: {
      summary: 'Classified as P2 Public Safety Risk. Spatial clustering identified continuous 400-meter dark zone on popular women and senior citizen walking trail.',
      riskFactors: [
        'Consecutive feeder circuit trip indicates central phase short-circuit or MCB failure',
        'High crime vulnerability corridor identified in city safety GIS layer',
        '9 citizen reports filed between 09:00 PM and 11:30 PM'
      ],
      recommendedAction: 'Deploy hydraulic bucket ladder van to inspect Feeder Pillar #FP-LVR-03.'
    },
    timeline: [
      { id: 't1', title: 'Complaint Cluster Triggered', timestamp: '09:15 PM', description: 'Citizen reports aggregated automatically with smart feeder diagnostics.', status: 'completed' },
      { id: 't2', title: 'Fault Isolation Diagnostics', timestamp: '10:00 PM', description: 'AI identifies underground cable severed during recent optical fiber trenching.', status: 'completed' },
      { id: 't3', title: 'Lineman Repair Team Assigned', timestamp: '07:15 AM', description: 'Field team dispatched with cable jointing kit and replacement driver units.', status: 'current' }
    ],
    relatedCases: []
  },
  {
    id: 'CL-2026-0795',
    title: "Damaged Children's Play Equipment",
    description: 'Broken slide and rusted iron play structure with exposed metal edges posing immediate injury hazard to children in Nehru Children Memorial Garden.',
    category: 'Public Facilities',
    priority: 'P2',
    status: 'In Progress',
    location: {
      address: "Nehru Children's Memorial Garden, Sector 2",
      ward: 'Ward 5 (North Ward)',
      landmark: 'Near Central Fountain Gazebo',
      lat: 18.5399,
      lng: 73.8445
    },
    aiConfidence: 93,
    impactScore: 7.8,
    duplicateCount: 4,
    assignedDepartment: 'Public Works & Urban Facilities',
    slaHoursRemaining: 6.0,
    slaTotalHours: 24,
    createdDate: '2026-08-19 04:30 PM',
    updatedDate: '2026-08-20 08:00 AM',
    citizenId: 'CIT-1003',
    citizenName: 'Priya Nair',
    citizenEmail: 'priya@gmail.com',
    citizenPhone: '+91 94450 33003',
    imageKey: 'public facilities',
    imageUrl: CIVIC_IMAGE_REGISTRY['public facilities'].url,
    evidenceImage: CIVIC_IMAGE_REGISTRY['public facilities'].url,
    backgroundImage: CIVIC_IMAGE_REGISTRY['public facilities'].url,
    aiExplanation: {
      summary: 'P2 Child Safety Hazard. Structural failure of municipal play structure with sharp hazardous protrusions in high-density recreation area.',
      riskFactors: [
        'Direct risk of laceration or injury to young children',
        'Daily footfall exceeds 800 children during evening hours',
        'Visual assessment detected sheared structural welding at foundation plate'
      ],
      recommendedAction: 'Immediate temporary containment tape, removal of damaged swing/slide assembly, and workshop refurbishment.'
    },
    timeline: [
      { id: 't1', title: 'Citizen Complaint Logged', timestamp: '04:30 PM', description: 'Mother submitted incident photo after child near-injury.', status: 'completed' },
      { id: 't2', title: 'Safety Caution Cordoned', timestamp: '06:00 PM', description: 'Park security placed danger tape around play equipment.', status: 'completed' },
      { id: 't3', title: 'Fabrication Team on Site', timestamp: '08:00 AM', description: 'Welders removing dangerous sharp components.', status: 'current' }
    ],
    relatedCases: []
  }
];

export const CITY_HOTSPOTS: CityHotspot[] = [
  {
    id: 'hs-1',
    name: 'MG Road — School Corridor Hotspot',
    ward: 'Ward 12 (Central Zone)',
    category: 'Roads & Infrastructure',
    priority: 'P1',
    complaintCount: 27,
    trendPercentage: 18,
    lat: 18.5204,
    lng: 73.8567,
    aiPattern: 'Recurring road surface cavitation and asphalt breakdown following monsoon runoff.',
    possibleCorrelation: 'Underground stormwater drainage blockages 120m upstream are pushing pressurized overflow beneath road subgrade.',
    recommendedAction: 'Joint technical inspection by Roads Department and Stormwater Drainage Division for combined culvert desilting and asphalt resurfacing.',
    activeCasesCount: 9
  },
  {
    id: 'hs-2',
    name: 'Gandhi Chowk Water Supply Pressure Fault',
    ward: 'Ward 12 (Central Zone)',
    category: 'Water Supply & Pipelines',
    priority: 'P1',
    complaintCount: 34,
    trendPercentage: 34,
    lat: 18.5246,
    lng: 73.8612,
    aiPattern: 'Frequent pipeline bursts and contaminated water siphon events in aged 40-year cast-iron mains.',
    possibleCorrelation: 'Pressure surges during morning booster pump activation exceed pipe tensile threshold at bend junctions.',
    recommendedAction: 'Deploy pressure modulating PRV valves and schedule pipeline sleeve relining project.',
    activeCasesCount: 14
  },
  {
    id: 'hs-3',
    name: 'Nehru Nagar Drainage Silt Accumulation Zone',
    ward: 'Ward 5 (North Ward)',
    category: 'Drainage & Sewage',
    priority: 'P1',
    complaintCount: 22,
    trendPercentage: 23,
    lat: 18.5362,
    lng: 73.8421,
    aiPattern: 'Heavy plastic waste siltation leading to chronic reverse sewage flow during high tide / heavy rains.',
    possibleCorrelation: 'Unregulated commercial market dumping into open stormwater canals.',
    recommendedAction: 'Install automated trash rack screens and deploy robotic desilting crawlers.',
    activeCasesCount: 8
  },
  {
    id: 'hs-4',
    name: 'Station Road Multi-Transit Commercial Hub',
    ward: 'Ward 7 (Railway Corridor)',
    category: 'Waste & Sanitation',
    priority: 'P2',
    complaintCount: 19,
    trendPercentage: 12,
    lat: 18.5288,
    lng: 73.8744,
    aiPattern: 'Bin capacity overflow within 2 hours of morning train arrivals.',
    possibleCorrelation: 'Collection truck schedule (currently 11 AM) does not match commuter peak waste disposal window (7-9 AM).',
    recommendedAction: 'Shift primary compactor truck schedule to 06:30 AM and install IoT ultrasonic bin fill sensors.',
    activeCasesCount: 6
  },
  {
    id: 'hs-5',
    name: 'Lake View Promenade Public Safety Corridor',
    ward: 'Ward 12 (Central Zone)',
    category: 'Streetlights & Electrical',
    priority: 'P2',
    complaintCount: 15,
    trendPercentage: 9,
    lat: 18.5321,
    lng: 73.8499,
    aiPattern: 'Intermittent dark zones due to underground moisture ingress in non-armored lighting cables.',
    possibleCorrelation: 'Recent optical fiber utility trenching sliced protective conduit.',
    recommendedAction: 'Re-cable 400m stretch with armored underground copper wiring and IP67 junction boxes.',
    activeCasesCount: 5
  },
  {
    id: 'hs-6',
    name: 'Civil Hospital Emergency Access Corridor',
    ward: 'Ward 5 (North Ward)',
    category: 'Drainage & Sewage',
    priority: 'P1',
    complaintCount: 18,
    trendPercentage: 28,
    lat: 18.5388,
    lng: 73.8472,
    aiPattern: 'Stormwater overflow drowning ambulance access ramps.',
    possibleCorrelation: 'Culvert diameter (300mm) inadequate for upstream catchment area.',
    recommendedAction: 'Upgrade culvert to twin 900mm precast box culverts.',
    activeCasesCount: 5
  }
];

export const AI_AGENTS_LIST: AIAgentDefinition[] = [
  {
    id: 'agent-1',
    name: 'Intake Agent',
    role: 'Natural Language Understanding & Intent Extraction',
    iconName: 'MessageSquareText',
    description: 'Parses unstructured multilingual citizen voice & text complaints, extracts geo-landmarks, severity nuances, and citizen intent.',
    defaultConfidence: 98,
    sampleDecision: 'Extracted civic issue: "Pothole depth >8 inches near school gate". Extracted geo-entity: "St. Mary School, MG Road".',
    inputs: ['Raw citizen text', 'Voice audio transcripts', 'Mobile EXIF metadata'],
    outputs: ['Normalized structured complaint payload', 'Extracted spatial entities'],
    model: 'Gemini 2.5 Flash Multimodal',
    accuracyRate: '98.6%',
    latencyTarget: '< 250ms'
  },
  {
    id: 'agent-2',
    name: 'Classification Agent',
    role: 'Civic Taxonomy & Multi-Label Classification',
    iconName: 'Tag',
    description: 'Categorizes complaints across 6 municipal departments and 48 granular sub-categories with high-precision confidence calibration.',
    defaultConfidence: 96,
    sampleDecision: 'Assigned Category: Roads & Infrastructure -> Subcategory: Asphalt Cavitation / Pothole. Confidence 96.4%.',
    inputs: ['Normalized complaint payload', 'Municipal classification taxonomy (ISO 37120)'],
    outputs: ['Primary Category', 'Sub-classification', 'Confidence Calibration score'],
    model: 'Gemini 2.5 Pro Reasoner',
    accuracyRate: '96.4%',
    latencyTarget: '< 180ms'
  },
  {
    id: 'agent-3',
    name: 'Duplicate Intelligence Agent',
    role: 'Spatial & Semantic Cluster Consolidation',
    iconName: 'CopyCheck',
    description: 'Runs vector semantic similarity and spatial distance radius matching to merge redundant citizen tickets into single master incident threads.',
    defaultConfidence: 95,
    sampleDecision: 'Consolidated 8 duplicate reports within 200m radius. Prevented 8 redundant work orders from being issued.',
    inputs: ['Incoming incident vector embedding', 'Spatial GIS case database in 500m radius'],
    outputs: ['Master ticket cluster ID', 'Duplicate count', 'Consolidated citizen notification list'],
    model: 'Vector HNSW + Semantic Transformer',
    accuracyRate: '95.8%',
    latencyTarget: '< 120ms'
  },
  {
    id: 'agent-4',
    name: 'Priority Agent',
    role: 'Public Risk & Vulnerability Impact Scoring',
    iconName: 'AlertTriangle',
    description: 'Calculates dynamic impact scores (1-10) using proximity to schools, hospitals, transit hubs, traffic density, and vulnerable populations.',
    defaultConfidence: 94,
    sampleDecision: 'Priority Score: 8.7/10 (P1 HIGH). Elevated due to School Zone proximity (<50m) and 2-wheeler accident hazard.',
    inputs: ['Classified defect payload', 'City GIS POI layers (Schools, Hospitals, Metro)', 'Live Traffic API'],
    outputs: ['Priority level (P1-P4)', 'Impact Vulnerability Score (1-10)', 'Risk Factor breakdown'],
    model: 'Bayesian Multi-Criteria Decision Engine',
    accuracyRate: '97.2%',
    latencyTarget: '< 150ms'
  },
  {
    id: 'agent-5',
    name: 'Routing Agent',
    role: 'Jurisdiction & Department Load Balancing',
    iconName: 'GitMerge',
    description: 'Determines exact Ward jurisdiction, identifies responsible municipal department, and selects closest active field response squad.',
    defaultConfidence: 97,
    sampleDecision: 'Routed to: Roads & Infrastructure Department (Ward 12 Rapid Response Squad #4). Work ticket generated.',
    inputs: ['Priority classification', 'Ward boundary shapefiles', 'Field Squad GPS & current roster load'],
    outputs: ['Assigned Municipal Department', 'Field Squad ID', 'Auto-generated work order ticket'],
    model: 'Constraint Optimization Router',
    accuracyRate: '99.1%',
    latencyTarget: '< 110ms'
  },
  {
    id: 'agent-6',
    name: 'SLA Monitoring Agent',
    role: 'Predictive Deadline & Risk Tracking',
    iconName: 'Clock',
    description: 'Tracks real-time countdown against citizen charter mandates. Employs ML to predict likelihood of SLA breaches before they happen.',
    defaultConfidence: 93,
    sampleDecision: 'Calculated Mandate SLA: 12.0 Hours. Predictive delay risk: 18% (Low). Projected completion: 4.5 Hours.',
    inputs: ['Department SLA Citizen Charter table', 'Historical turnaround averages', 'Weather & material stock telemetry'],
    outputs: ['SLA countdown clock', 'Breach probability probability', 'Early warning triggers'],
    model: 'Predictive Survival Regression ML',
    accuracyRate: '94.0%',
    latencyTarget: '< 80ms'
  },
  {
    id: 'agent-7',
    name: 'Escalation Agent',
    role: 'Automated Hierarchical Alert Dispatch',
    iconName: 'ArrowUpRight',
    description: 'Autonomously triggers progressive alerts to Junior Engineers, Executive Engineers, and Municipal Commissioners upon SLA delay triggers.',
    defaultConfidence: 99,
    sampleDecision: 'Pre-escalation warning triggered at 75% SLA threshold. Automated WhatsApp & Dashboard alert sent to Section In-Charge.',
    inputs: ['SLA monitoring stream', 'Hierarchy escalation matrix (JE -> EE -> Commissioner)'],
    outputs: ['High-priority push notifications', 'SMS/WhatsApp dispatch', 'Executive Command Center banner'],
    model: 'Deterministic Rule Engine with Webhooks',
    accuracyRate: '99.9%',
    latencyTarget: '< 50ms'
  },
  {
    id: 'agent-8',
    name: 'Resolution Verification Agent',
    role: 'Computer Vision Evidence Verification',
    iconName: 'ShieldCheck',
    description: 'Validates before and after geo-tagged repair photos using optical segmentation to guarantee genuine, high-quality physical resolution.',
    defaultConfidence: 98,
    sampleDecision: 'Computer Vision analysis confirmed pothole cavity filled flush with bitumen. Zero visual edge gap. Resolution Verified.',
    inputs: ['Citizen before photo', 'Field squad completion after photo', 'GPS & timestamp EXIF validation'],
    outputs: ['Visual repair verification score', 'Case closure certificate', 'Citizen resolution SMS notice'],
    model: 'Deep Spatial Segmentation & Structural CV',
    accuracyRate: '98.1%',
    latencyTarget: '< 350ms'
  }
];

export const MOCK_CASES: CivicCase[] = INITIAL_CASES.map((c) => {
  const imageKey = c.imageKey || resolveCivicImageKey(c.category + ' ' + c.title);
  const imageUrl = getCivicImageUrl(imageKey);
  return {
    ...c,
    imageKey,
    evidenceImage: imageUrl,
    backgroundImage: imageUrl,
    imageUrl: imageUrl,
    affectedPopulation: c.affectedPopulation || (c.priority === 'P1' ? 'Estimated 4,500+ citizens' : 'Estimated 1,200+ citizens'),
    coordinates: c.coordinates || { lat: c.location.lat, lng: c.location.lng }
  };
});

export const DEPARTMENT_SLA_DATA = [
  { department: 'Roads & Infra', targetSla: 12, avgResponseHours: 4.2, complianceRate: 91.1 },
  { department: 'Water Supply', targetSla: 8, avgResponseHours: 3.1, complianceRate: 94.6 },
  { department: 'Drainage', targetSla: 16, avgResponseHours: 6.4, complianceRate: 86.9 },
  { department: 'Waste & Sanitation', targetSla: 6, avgResponseHours: 2.3, complianceRate: 96.0 },
  { department: 'Streetlights', targetSla: 12, avgResponseHours: 3.8, complianceRate: 94.2 },
  { department: 'Public Works', targetSla: 24, avgResponseHours: 11.0, complianceRate: 86.8 }
];

export const AI_LIVE_INSIGHTS: AIInsightItem[] = [
  {
    id: 'ins-1',
    type: 'urgent',
    title: 'Water Supply Surge in Ward 12',
    description: 'Water-related complaints in Ward 12 increased by 34% in the last 7 days. Spatial clustering points to main 600mm feeder junction near Gandhi Chowk.',
    confidence: 94,
    ward: 'Ward 12 (Central Zone)',
    category: 'Water Supply & Pipelines',
    recommendedAction: 'Investigate possible pipeline joint failure and deploy pressure telemetry sensors.',
    timestamp: '10 mins ago',
    connectedCasesCount: 14
  },
  {
    id: 'ins-2',
    type: 'sla_risk',
    title: '7 Active Cases Predicted to Breach SLA',
    description: 'Machine learning model flags 7 active cases in Ward 5 & Ward 7 at high risk (>85% probability) of exceeding SLA within next 24 hours.',
    confidence: 91,
    ward: 'Ward 5 & Ward 7',
    category: 'Drainage & Sewage',
    recommendedAction: 'Reassign 2 idle vacuum jetting squads from Ward 3 to Ward 5 immediately.',
    timestamp: '25 mins ago',
    connectedCasesCount: 7
  },
  {
    id: 'ins-3',
    type: 'pattern',
    title: 'Cross-Department Causal Pattern Detected',
    description: 'Recurring stormwater drainage blockages in Nehru Nagar are statistically correlated (r=0.88) with rapid road asphalt cavitation 2 weeks later.',
    confidence: 96,
    ward: 'Ward 5 (North Ward)',
    category: 'Roads & Infrastructure',
    recommendedAction: 'Execute joint culvert desilting before approving road asphalt resurfacing tender.',
    timestamp: '1 hour ago',
    connectedCasesCount: 22
  },
  {
    id: 'ins-4',
    type: 'anomaly',
    title: 'Unusual Nighttime Sanitation Dumping Surge',
    description: 'Station Road bus terminus sector saw a 140% spike in commercial packing waste between 02:00 AM and 05:00 AM.',
    confidence: 89,
    ward: 'Ward 7 (Railway Corridor)',
    category: 'Waste & Sanitation',
    recommendedAction: 'Review ANPR traffic camera feeds and dispatch municipal enforcement marshals.',
    timestamp: '2 hours ago',
    connectedCasesCount: 5
  }
];

export const CAUSAL_CHAIN_STEPS = [
  {
    step: 1,
    title: 'Drainage Canal Blockage',
    description: 'Unsegregated plastic waste & silt choke underground stormwater culverts during early rain showers.',
    department: 'Drainage & Stormwater Division',
    complaintSurge: '+42% Drainage complaints in Week 1'
  },
  {
    step: 2,
    title: 'Sub-surface Water Inundation',
    description: 'Blocked water cannot discharge, creating hydrostatic pressure beneath road asphalt layers and sidewalk foundations.',
    department: 'Water & Irrigation Board',
    complaintSurge: '+28% Water logging alerts in Week 2'
  },
  {
    step: 3,
    title: 'Asphalt & Sub-Base Deterioration',
    description: 'Passing heavy vehicular traffic fractures water-saturated bitumen, rapidly carving craters and structural sinkholes.',
    department: 'Roads & Infrastructure Department',
    complaintSurge: '+84% Pothole emergency reports in Week 3'
  },
  {
    step: 4,
    title: 'Mass Citizen Complaints & Accidents',
    description: 'Critical bottleneck forms on arterial corridors, leading to vehicle skids, traffic gridlock, and citizen dissatisfaction.',
    department: 'Municipal Operations & Traffic Police',
    complaintSurge: '183 duplicate reports & P1 alerts'
  }
];

export const MUNICIPAL_METRICS = {
  activeCases: 1248,
  activeCasesTrend: '+12% this week',
  criticalIssues: 47,
  criticalSubtitle: 'Requires immediate attention',
  slaCompliance: 91.4,
  slaComplianceTrend: '+4.2% vs last month',
  duplicatesConsolidated: 183,
  duplicatesSubtitle: 'AI consolidated into master threads',
  citizenSatisfaction: 4.6,
  citizenSatisfactionSubtitle: 'Out of 5.0 (from 8,420 ratings)',
  avgResolutionTimeHours: 14.8,
  resolvedThisMonth: 3412
};

export const MONTHLY_COMPLAINT_TRENDS = [
  { month: 'Mar', reported: 820, resolved: 790, critical: 32 },
  { month: 'Apr', reported: 940, resolved: 890, critical: 38 },
  { month: 'May', reported: 1120, resolved: 1040, critical: 44 },
  { month: 'Jun', reported: 1450, resolved: 1320, critical: 62 },
  { month: 'Jul', reported: 1680, resolved: 1540, critical: 71 },
  { month: 'Aug', reported: 1248, resolved: 1190, critical: 47 }
];

export const CATEGORY_BREAKDOWN = [
  { name: 'Roads & Infrastructure', value: 38, count: 474, color: '#146CFF' },
  { name: 'Drainage & Sewage', value: 22, count: 275, color: '#00D2FF' },
  { name: 'Water Supply', value: 18, count: 224, color: '#38EF7D' },
  { name: 'Waste & Sanitation', value: 12, count: 150, color: '#F7B733' },
  { name: 'Streetlights & Electrical', value: 7, count: 87, color: '#FC4A1A' },
  { name: 'Public Facilities', value: 3, count: 38, color: '#8E2DE2' }
];

export const DEPARTMENT_PERFORMANCE = [
  { department: 'Roads & Infrastructure', total: 474, resolvedOnTime: 432, slaRate: 91.1, avgHours: 14.2 },
  { department: 'Water Supply Board', total: 224, resolvedOnTime: 212, slaRate: 94.6, avgHours: 7.8 },
  { department: 'Drainage & Stormwater', total: 275, resolvedOnTime: 239, slaRate: 86.9, avgHours: 16.4 },
  { department: 'Solid Waste Management', total: 150, resolvedOnTime: 144, slaRate: 96.0, avgHours: 5.2 },
  { department: 'Street Lighting Bureau', total: 87, resolvedOnTime: 82, slaRate: 94.2, avgHours: 9.1 },
  { department: 'Public Works & Facilities', total: 38, resolvedOnTime: 33, slaRate: 86.8, avgHours: 21.0 }
];
