import React from 'react';
import { resolveCivicImageKey, CIVIC_IMAGE_REGISTRY } from '../utils/imageAssets';

interface LayeredBackdropProps {
  imageKeyOrCategory: string;
  customImageUrl?: string;
  children: React.ReactNode;
  className?: string;
  intensity?: 'cinematic' | 'deep' | 'subtle';
}

export function LayeredBackdrop({
  imageKeyOrCategory,
  customImageUrl,
  children,
  className = '',
  intensity = 'cinematic'
}: LayeredBackdropProps) {
  const key = resolveCivicImageKey(imageKeyOrCategory);
  const imageUrl = customImageUrl || CIVIC_IMAGE_REGISTRY[key].url;

  const overlayOpacity = {
    cinematic: 'bg-white/85',
    deep: 'bg-[#F6F9FC]/92',
    subtle: 'bg-white/75'
  }[intensity];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* LAYER 1: Relevant Uploaded Category Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* LAYER 2: Professional Background Blur */}
      <div className="absolute inset-0 backdrop-blur-2xl pointer-events-none" />

      {/* LAYER 3: Bright White / Soft Gray Translucent Overlay */}
      <div className={`absolute inset-0 ${overlayOpacity} pointer-events-none`} />

      {/* LAYER 4: Subtle AI Blue & Cyan Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-transparent to-cyan-100/20 pointer-events-none" />

      {/* LAYER 5: Foreground Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
