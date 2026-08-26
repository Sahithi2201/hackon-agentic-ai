/**
 * CivicMind Dynamic Image Asset System
 * 
 * Strict Category Mapping:
 * - 'roads': Road Infrastructure, Road Damage, Potholes, Damaged Roads
 * - 'drinage': Drainage Problems, Blocked Drainage, Drainage Overflow
 * - 'public facilities': Public Facility Damage, Damaged Public Assets, Broken Benches, Parks
 * - 'street images': Streetlight Failure, Street Infrastructure Problems, Dark Corridors
 * - 'waste': Waste Management, Garbage Overflow, Garbage Collection Problems
 * - 'water': Water Leakage, Water Services, Pipeline Problems, Flooding Burst
 */

export type CivicImageKey = 
  | 'roads' 
  | 'drinage' 
  | 'public facilities' 
  | 'street images' 
  | 'waste' 
  | 'water';

export interface ImageAssetData {
  key: CivicImageKey;
  label: string;
  url: string;
  alt: string;
  category: string;
  badgeColor: string;
}

export const CIVIC_IMAGE_REGISTRY: Record<CivicImageKey, ImageAssetData> = {
  'roads': {
    key: 'roads',
    label: 'Road Damage & Potholes',
    category: 'Roads & Infrastructure',
    badgeColor: 'from-amber-500 to-red-500',
    alt: 'Road asphalt damage and hazardous cavitation near pedestrian zone',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzA91JEy_eSGzF4XBhfRtTXk9bzJxYzzHGGFXh0tI4jg&s=10'
  },
  'drinage': {
    key: 'drinage',
    label: 'Drainage Overflow & Blockages',
    category: 'Drainage & Sewage',
    badgeColor: 'from-cyan-500 to-blue-600',
    alt: 'Stormwater drainage clog and monsoon overflow causing surface inundation',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvmeZhWBrrjHr3DibwpEwAcTcV5ca8un8OjAgMdYcpPA&s=10'
  },
  'public facilities': {
    key: 'public facilities',
    label: 'Public Facility Damage',
    category: 'Public Facilities',
    badgeColor: 'from-purple-500 to-indigo-600',
    alt: 'Damaged community park bench, broken public safety railing and vandalized municipal property',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL-Or_FUP8GD0JKCEDWnKJWvjSJe6HE3-SvpSpQmkQIA&s=10'
  },
  'street images': {
    key: 'street images',
    label: 'Streetlight Failure & Electrical',
    category: 'Streetlights & Electrical',
    badgeColor: 'from-yellow-400 to-orange-500',
    alt: 'Failed urban municipal streetlight pole creating dark corridor hazard at night',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt6ZuCVPkwl8NJtZyqyuTTDzGqZQx6VBeM6uIQ6jm87Q&s=10'
  },
  'waste': {
    key: 'waste',
    label: 'Garbage Overflow & Waste',
    category: 'Waste & Sanitation',
    badgeColor: 'from-emerald-500 to-teal-600',
    alt: 'Unattended municipal solid waste dumpster overflow near commercial transit point',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmvN6aVZhGszvpeBKRJKV8slOmITWbAPle5dswbA5FFw&s=10'
  },
  'water': {
    key: 'water',
    label: 'Water Pipeline Leakage',
    category: 'Water Supply & Pipelines',
    badgeColor: 'from-blue-400 to-cyan-500',
    alt: 'High pressure municipal water supply pipeline rupture causing street flooding',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSi2N4mwll-uY7d_2uPA5o1Ynh2VOBLQUPGkpniQgSIw&s=10'
  }
};

/**
 * Resolves the appropriate image key given a category or free text
 */
export function resolveCivicImageKey(input: string): CivicImageKey {
  const norm = (input || '').trim().toLowerCase();
  
  // Exact key match
  if (norm === 'roads' || norm === 'road') return 'roads';
  if (norm === 'drinage' || norm === 'drainage') return 'drinage';
  if (norm === 'public facilities' || norm === 'public facility') return 'public facilities';
  if (norm === 'street images' || norm === 'street image' || norm === 'streetlights' || norm === 'streetlight') return 'street images';
  if (norm === 'waste' || norm === 'garbage') return 'waste';
  if (norm === 'water') return 'water';

  // Specific semantic matching in order of specificity
  if (norm.includes('water') || norm.includes('pipeline') || norm.includes('pipe') || norm.includes('leak') || norm.includes('chowk')) {
    return 'water';
  }
  if (norm.includes('drain') || norm.includes('sewer') || norm.includes('sewage') || norm.includes('gutter') || norm.includes('clog') || norm.includes('drinage') || norm.includes('silt')) {
    return 'drinage';
  }
  if (norm.includes('waste') || norm.includes('garbage') || norm.includes('trash') || norm.includes('sanitat') || norm.includes('dump') || norm.includes('refuse')) {
    return 'waste';
  }
  if (norm.includes('street') || norm.includes('light') || norm.includes('lamp') || norm.includes('pole') || norm.includes('electric') || norm.includes('dark')) {
    return 'street images';
  }
  if (norm.includes('facilit') || norm.includes('park') || norm.includes('bench') || norm.includes('play') || norm.includes('equipment') || norm.includes('garden') || norm.includes('building') || norm.includes('public')) {
    return 'public facilities';
  }
  if (norm.includes('road') || norm.includes('pothole') || norm.includes('asphalt') || norm.includes('tar') || norm.includes('cavitation') || norm.includes('crater') || norm.includes('infra')) {
    return 'roads';
  }
  
  return 'roads';
}

/**
 * Gets the direct high-res image URL for an image key or category
 */
export function getCivicImageUrl(keyOrCategory: string): string {
  const key = resolveCivicImageKey(keyOrCategory);
  return CIVIC_IMAGE_REGISTRY[key].url;
}

/**
 * Gets the full image metadata object
 */
export function getCivicImageData(keyOrCategory: string): ImageAssetData {
  const key = resolveCivicImageKey(keyOrCategory);
  return CIVIC_IMAGE_REGISTRY[key];
}
