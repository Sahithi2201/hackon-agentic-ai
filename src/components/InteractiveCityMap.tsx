import React, { useState } from 'react';
import { 
  CivicCase, 
  CityHotspot, 
  CivicCategory, 
  PriorityLevel 
} from '../types';
import { 
  Layers, 
  Radio, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Navigation2, 
  AlertTriangle, 
  Info,
  CheckCircle,
  Eye
} from 'lucide-react';

interface InteractiveCityMapProps {
  cases: CivicCase[];
  hotspots?: CityHotspot[];
  selectedCaseId?: string | null;
  onSelectCase?: (caseItem: CivicCase) => void;
  onSelectHotspot?: (hotspot: CityHotspot) => void;
  heightClass?: string;
  showFilters?: boolean;
}

export const InteractiveCityMap: React.FC<InteractiveCityMapProps> = ({
  cases,
  hotspots = [],
  selectedCaseId,
  onSelectCase,
  onSelectHotspot,
  heightClass = 'h-[500px]',
  showFilters = true
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeLayer, setActiveLayer] = useState<'all' | 'critical' | 'hotspots' | 'resolved'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hoveredCase, setHoveredCase] = useState<CivicCase | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<CityHotspot | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map coordinate conversion helper (fits Pune / Smart City bounding box to 800x500 SVG canvas)
  const getCoordinates = (lat: number, lng: number) => {
    // Lat range ~18.515 to 18.545 -> Y: 460 to 40
    // Lng range ~73.835 to 73.880 -> X: 40 to 760
    const minLat = 18.514;
    const maxLat = 18.544;
    const minLng = 73.835;
    const maxLng = 73.878;

    const x = ((lng - minLng) / (maxLng - minLng)) * 720 + 40;
    const y = 500 - (((lat - minLat) / (maxLat - minLat)) * 420 + 40);
    return { x: Math.max(30, Math.min(770, x)), y: Math.max(30, Math.min(470, y)) };
  };

  const filteredCases = cases.filter((c) => {
    if (activeLayer === 'critical' && c.priority !== 'P1') return false;
    if (activeLayer === 'resolved' && c.status !== 'Resolved') return false;
    if (activeLayer === 'hotspots') return false;
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    return true;
  });

  const getPriorityColor = (priority: PriorityLevel, status: string) => {
    if (status === 'Resolved') return '#10B981'; // Emerald
    switch (priority) {
      case 'P1': return '#DC2626'; // Red Critical
      case 'P2': return '#EA580C'; // Orange High
      case 'P3': return '#D97706'; // Amber Medium
      default: return '#2563EB'; // Blue Low
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden bg-[#F1F5F9] border border-slate-200 shadow-md select-none group`}>
      
      {/* Top Map HUD Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Layer Pill Switcher */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md">
          <span className="px-2 text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
            <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
            GIS Feed
          </span>
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeLayer === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Incidents ({cases.length})
          </button>
          <button
            onClick={() => setActiveLayer('critical')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeLayer === 'critical' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            Critical P1 ({cases.filter(c => c.priority === 'P1').length})
          </button>
          <button
            onClick={() => setActiveLayer('hotspots')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeLayer === 'hotspots' ? 'bg-amber-500 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            AI Hotspots ({hotspots.length})
          </button>
          <button
            onClick={() => setActiveLayer('resolved')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeLayer === 'resolved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Resolved
          </button>
        </div>

        {/* Zoom & Viewport Tools */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md">
          <button
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.2, 1.8))}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.2, 0.8))}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-mono font-bold"
            title="Reset Map"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1.5 shadow-md">
          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            Municipal GIS Grid
          </div>
          <div className="flex items-center gap-3 font-medium">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping opacity-75" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 -ml-3.5" />
              <span>P1 Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span>P2 High</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main SVG Vector City Map Canvas */}
      <div className="w-full h-full overflow-hidden flex items-center justify-center">
        <div 
          style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s ease' }}
          className="w-full h-full relative flex items-center justify-center"
        >
          <svg
            viewBox="0 0 800 500"
            className="w-full h-full max-h-full"
          >
            {/* Background Grid & Waterways */}
            <defs>
              <pattern id="mapGridLight" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(203, 213, 225, 0.4)" strokeWidth="0.8" />
              </pattern>
              
              <linearGradient id="riverGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.9" />
              </linearGradient>

              <radialGradient id="radarGlowLight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(29, 78, 216, 0.12)" />
                <stop offset="100%" stopColor="rgba(29, 78, 216, 0)" />
              </radialGradient>
            </defs>

            {/* Canvas Base */}
            <rect width="800" height="500" fill="#F8FAFC" />
            <rect width="800" height="500" fill="url(#mapGridLight)" />

            {/* Smart City Radar Sweep Simulation */}
            <circle cx="400" cy="250" r="220" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="400" cy="250" r="140" fill="none" stroke="rgba(59, 130, 246, 0.12)" strokeWidth="1" strokeDasharray="3 5" />
            <circle cx="400" cy="250" r="60" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1" />
            <g className="animate-radar origin-[400px_250px]">
              <path d="M 400 250 L 620 250 A 220 220 0 0 0 550 90 Z" fill="url(#radarGlowLight)" />
            </g>

            {/* River Mutha / Waterway Curve */}
            <path
              d="M 20 420 Q 220 380 340 280 T 640 180 T 780 120"
              fill="none"
              stroke="url(#riverGradLight)"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <path
              d="M 20 420 Q 220 380 340 280 T 640 180 T 780 120"
              fill="none"
              stroke="#0284C7"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              strokeDasharray="6 4"
            />
            <text x="140" y="410" fill="#0284C7" opacity="0.8" fontSize="10" fontWeight="700" letterSpacing="2">
              MUTHA RIVER BASIN
            </text>

            {/* Municipal Ward Boundaries (Polygons) */}
            {/* Ward 12 (Central Zone) */}
            <polygon
              points="280,140 520,130 540,320 360,340 260,260"
              fill="rgba(59, 130, 246, 0.04)"
              stroke="rgba(37, 99, 235, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text x="370" y="170" fill="#1D4ED8" opacity="0.85" fontSize="11" fontWeight="800" letterSpacing="1">
              WARD 12 (CENTRAL)
            </text>

            {/* Ward 5 (North Ward) */}
            <polygon
              points="120,60 360,50 360,190 200,240 80,180"
              fill="rgba(16, 185, 129, 0.03)"
              stroke="rgba(16, 185, 129, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />
            <text x="180" y="100" fill="#059669" opacity="0.85" fontSize="11" fontWeight="800" letterSpacing="1">
              WARD 5 (NORTH)
            </text>

            {/* Ward 7 (Railway & Tech Corridor) */}
            <polygon
              points="480,190 740,160 760,390 530,370"
              fill="rgba(249, 115, 22, 0.04)"
              stroke="rgba(234, 88, 12, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />
            <text x="580" y="240" fill="#C2410C" opacity="0.85" fontSize="11" fontWeight="800" letterSpacing="1">
              WARD 7 (RAILWAY/TECH)
            </text>

            {/* Major Road Arteries */}
            {/* MG Road (Arterial West-East) */}
            <path d="M 60 270 Q 320 250 510 240 T 780 230" fill="none" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" />
            <path d="M 60 270 Q 320 250 510 240 T 780 230" fill="none" stroke="#64748B" strokeWidth="1.5" strokeOpacity="0.7" />
            <text x="100" y="285" fill="#475569" fontSize="9" fontWeight="700">MG ROAD</text>

            {/* Nehru Nagar Main Avenue (North-South) */}
            <path d="M 240 40 L 250 460" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
            <path d="M 240 40 L 250 460" fill="none" stroke="#64748B" strokeWidth="1" strokeOpacity="0.7" strokeDasharray="4 2" />
            <text x="255" y="90" fill="#475569" fontSize="9" fontWeight="700">NEHRU NAGAR BLVD</text>

            {/* Ring Road Express Belt */}
            <path d="M 80 440 Q 400 460 720 410" fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            <path d="M 80 440 Q 400 460 720 410" fill="none" stroke="#D97706" strokeWidth="1.5" strokeOpacity="0.6" />
            <text x="450" y="445" fill="#B45309" fontSize="9" fontWeight="700">OUTER RING ROAD</text>

            {/* Key Landmark Icons/Markers */}
            <g transform="translate(420, 230)">
              <circle cx="0" cy="0" r="4" fill="#2563EB" />
              <text x="8" y="3" fill="#1E293B" fontSize="9" fontWeight="700">Gandhi Chowk</text>
            </g>
            <g transform="translate(680, 220)">
              <circle cx="0" cy="0" r="4" fill="#2563EB" />
              <text x="8" y="3" fill="#1E293B" fontSize="9" fontWeight="700">Central Station</text>
            </g>
            <g transform="translate(230, 95)">
              <circle cx="0" cy="0" r="4" fill="#2563EB" />
              <text x="8" y="3" fill="#1E293B" fontSize="9" fontWeight="700">Civil Hospital</text>
            </g>

            {/* Hotspot Clusters Layer (when activeLayer is 'hotspots' or 'all') */}
            {(activeLayer === 'hotspots' || activeLayer === 'all') && hotspots.map((hs) => {
              const coords = getCoordinates(hs.lat, hs.lng);
              return (
                <g 
                  key={hs.id} 
                  transform={`translate(${coords.x}, ${coords.y})`}
                  className="cursor-pointer group/hs"
                  onClick={() => onSelectHotspot && onSelectHotspot(hs)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredHotspot(hs);
                    setHoveredCase(null);
                    setTooltipPos({ x: coords.x, y: coords.y });
                  }}
                  onMouseLeave={() => setHoveredHotspot(null)}
                >
                  {/* Outer Pulsing Heat Radius */}
                  <circle
                    cx="0"
                    cy="0"
                    r={hs.priority === 'P1' ? 32 : 24}
                    fill={hs.priority === 'P1' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.2)'}
                    className="animate-pulse"
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r={hs.priority === 'P1' ? 20 : 14}
                    fill={hs.priority === 'P1' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(249, 115, 22, 0.35)'}
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="7"
                    fill={hs.priority === 'P1' ? '#DC2626' : '#EA580C'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="8"
                    fontWeight="800"
                  >
                    {hs.activeCasesCount}
                  </text>
                </g>
              );
            })}

            {/* Incident Markers Layer */}
            {activeLayer !== 'hotspots' && filteredCases.map((caseItem) => {
              const coords = getCoordinates(caseItem.location.lat, caseItem.location.lng);
              const isSelected = selectedCaseId === caseItem.id;
              const color = getPriorityColor(caseItem.priority, caseItem.status);

              return (
                <g
                  key={caseItem.id}
                  transform={`translate(${coords.x}, ${coords.y})`}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => onSelectCase && onSelectCase(caseItem)}
                  onMouseEnter={() => {
                    setHoveredCase(caseItem);
                    setHoveredHotspot(null);
                    setTooltipPos({ x: coords.x, y: coords.y });
                  }}
                  onMouseLeave={() => setHoveredCase(null)}
                >
                  {/* Selected Ripple */}
                  {isSelected && (
                    <circle
                      cx="0"
                      cy="0"
                      r="18"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      className="animate-ping opacity-80"
                    />
                  )}

                  {/* Critical P1 Outer Pulse */}
                  {caseItem.priority === 'P1' && caseItem.status !== 'Resolved' && (
                    <circle
                      cx="0"
                      cy="0"
                      r="12"
                      fill="rgba(220, 38, 38, 0.3)"
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Pin Dot */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? 8 : 5.5}
                    fill={color}
                    stroke={isSelected ? '#2563EB' : '#FFFFFF'}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />

                  {/* Case Tag on Hover or Select */}
                  {isSelected && (
                    <g transform="translate(0, -14)">
                      <rect
                        x="-30"
                        y="-14"
                        width="60"
                        height="16"
                        rx="4"
                        fill="#1E293B"
                        stroke="#2563EB"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-3"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontWeight="700"
                      >
                        {caseItem.id}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredCase && (
        <div 
          style={{ 
            left: `${Math.min(Math.max(tooltipPos.x, 60), 620)}px`, 
            top: `${Math.max(tooltipPos.y - 120, 20)}px` 
          }}
          className="absolute z-30 pointer-events-none w-64 p-3 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-slate-100">
            <span className="text-[10px] font-mono font-bold text-blue-700">{hoveredCase.id}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              hoveredCase.priority === 'P1' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-800'
            }`}>
              {hoveredCase.priority} • {hoveredCase.status}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">{hoveredCase.title}</h4>
          <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
            <Navigation2 className="w-2.5 h-2.5 text-blue-600" />
            {hoveredCase.location.address}
          </p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100 font-medium">
            <span>AI Conf: <strong className="text-slate-900">{hoveredCase.aiConfidence}%</strong></span>
            <span>SLA: <strong className="text-amber-700 font-bold">{hoveredCase.slaHoursRemaining}h left</strong></span>
          </div>
        </div>
      )}

      {/* Hotspot Hover Tooltip */}
      {hoveredHotspot && (
        <div 
          style={{ 
            left: `${Math.min(Math.max(tooltipPos.x, 60), 620)}px`, 
            top: `${Math.max(tooltipPos.y - 140, 20)}px` 
          }}
          className="absolute z-30 pointer-events-none w-72 p-3 bg-white/95 backdrop-blur-md rounded-xl border border-amber-300 shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> AI Hotspot Cluster
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
              +{hoveredHotspot.trendPercentage}% Surge
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 mt-1.5">{hoveredHotspot.name}</h4>
          <p className="text-[10px] text-slate-600 mt-1 line-clamp-2 leading-relaxed font-medium">
            {hoveredHotspot.aiPattern}
          </p>
          <div className="mt-2 text-[10px] text-blue-700 font-bold pt-1 border-t border-slate-100">
            Click to inspect full correlation analysis
          </div>
        </div>
      )}
    </div>
  );
};
