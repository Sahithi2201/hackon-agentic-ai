import React, { useState } from 'react';
import { resolveCivicImageKey, CIVIC_IMAGE_REGISTRY } from '../utils/imageAssets';
import { MapPin, Eye, ShieldCheck, Sparkles, Maximize2, AlertCircle, ZoomIn } from 'lucide-react';

interface EvidencePanelProps {
  imageKeyOrCategory: string;
  customImageUrl?: string;
  locationAddress: string;
  ward?: string;
  lat?: number;
  lng?: number;
  aiConfidence?: number;
  severityLevel?: string;
  timestamp?: string;
  anomalyDetected?: string;
  compact?: boolean;
}

export function EvidencePanel({
  imageKeyOrCategory,
  customImageUrl,
  locationAddress,
  ward,
  lat = 12.9716,
  lng = 77.5946,
  aiConfidence = 96,
  severityLevel = 'High',
  timestamp = 'Today, 08:42 AM',
  anomalyDetected,
  compact = false
}: EvidencePanelProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const key = resolveCivicImageKey(imageKeyOrCategory);
  const meta = CIVIC_IMAGE_REGISTRY[key];
  const initialUrl = customImageUrl || meta.url;
  const [currentSrc, setCurrentSrc] = useState<string>(initialUrl);

  // Fallback map in case custom image or primary URL fails
  const fallbackUrls: Record<string, string> = {
    roads: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
    drinage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
    'public facilities': 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=1200&q=80',
    'street images': 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=80',
    waste: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80',
    water: 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=1200&q=80'
  };

  const handleImgError = () => {
    const fb = fallbackUrls[key] || fallbackUrls.roads;
    if (currentSrc !== fb) {
      setCurrentSrc(fb);
    }
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-cyan-500/20 bg-[#0B1C33]/90 shadow-xl">
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-[#0D223F] border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Civic Evidence Capture
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
            Image Asset: {key}
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> EXIF Verified
          </span>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className={`relative overflow-hidden ${compact ? 'h-48' : 'h-72'} bg-black/40`}>
        <img
          src={currentSrc}
          alt={meta.alt}
          onError={handleImgError}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* AI Bounding Box / Optical Tag Overlay */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-cyan-400/50 text-cyan-300 text-xs font-medium shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              AI Optical Score: {aiConfidence}%
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-950/80 backdrop-blur-md border border-red-500/50 text-red-300 text-xs font-medium shadow-lg">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              Severity: {severityLevel}
            </div>
          </div>

          {/* AI Segmentation Focus Reticle in Center */}
          <div className="self-center w-36 h-24 border-2 border-dashed border-cyan-400/70 rounded-lg bg-cyan-500/10 backdrop-blur-[1px] flex items-center justify-center p-2 text-center animate-pulse">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-200 bg-black/70 px-1.5 py-0.5 rounded">
              Defect Segment #01
            </span>
          </div>

          {/* Bottom Telemetry Overlay */}
          <div className="flex justify-between items-end">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-slate-600/60 text-slate-200 text-xs">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-mono text-[11px]">{lat.toFixed(4)}° N, {lng.toFixed(4)}° E</span>
            </div>
            <button
              onClick={() => setIsZoomed(true)}
              className="pointer-events-auto p-1.5 rounded-lg bg-black/80 hover:bg-cyan-600 text-slate-200 hover:text-white transition-colors border border-slate-600/60"
              title="Expand Evidence"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Metadata & Optical Anomaly */}
      <div className="p-3.5 bg-[#09172A] border-t border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">Location Tag:</span>
          <span className="font-medium text-slate-100">{locationAddress} {ward ? `(${ward})` : ''}</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">Classification:</span>
          <span className="font-semibold text-cyan-300">{meta.category}</span>
        </div>
        {anomalyDetected && (
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>{anomalyDetected}</span>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl w-full bg-[#0B1C33] rounded-2xl overflow-hidden border border-cyan-500/40 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-cyan-300">High-Resolution Evidence Inspection</span>
                <span className="text-xs font-mono text-slate-400">({key})</span>
              </div>
              <button 
                onClick={() => setIsZoomed(false)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
              >
                Close (ESC)
              </button>
            </div>
            <img 
              src={currentSrc} 
              alt={meta.alt} 
              onError={handleImgError} 
              className="w-full max-h-[70vh] object-contain rounded-lg" 
            />
            <div className="mt-3 flex justify-between text-xs text-slate-400">
              <span>{locationAddress}</span>
              <span className="text-cyan-300">Optical Validation Confidence: {aiConfidence}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
