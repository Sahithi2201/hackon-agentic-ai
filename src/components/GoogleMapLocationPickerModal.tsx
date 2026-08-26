import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  APIProvider, 
  Map as GoogleMap, 
  AdvancedMarker, 
  Pin as GooglePin, 
  useMap as useGoogleMap, 
  useMapsLibrary 
} from '@vis.gl/react-google-maps';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Crosshair, 
  Search, 
  Check, 
  X, 
  AlertCircle, 
  Info,
  Loader2,
  Layers,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { reverseGeocodeCoords, searchLocationsByQuery, GeocodedAddress } from '../utils/geocodingService';

export interface SelectedLocationData {
  lat: number;
  lng: number;
  formattedAddress: string;
  city: string;
  area: string;
  colony: string;
  street: string;
  state?: string;
  country?: string;
  postalCode: string;
  landmark?: string;
  placeId?: string;
}

interface GoogleMapLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onConfirmLocation: (location: SelectedLocationData) => void;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidGoogleKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

/**
 * ----------------------------------------------------
 * Google Maps Controller for @vis.gl/react-google-maps
 * ----------------------------------------------------
 */
function GoogleMapController({
  markerPosition,
  onMarkerChange,
}: {
  markerPosition: google.maps.LatLngLiteral;
  onMarkerChange: (pos: google.maps.LatLngLiteral, addressData?: Partial<SelectedLocationData>) => void;
}) {
  const map = useGoogleMap();
  const geocodingLib = useMapsLibrary('geocoding');
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (geocodingLib && !geocoderRef.current) {
      geocoderRef.current = new geocodingLib.Geocoder();
    }
  }, [geocodingLib]);

  useEffect(() => {
    if (map && markerPosition) {
      map.panTo(markerPosition);
    }
  }, [map, markerPosition]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    
    if (geocoderRef.current) {
      geocoderRef.current.geocode({ location: newPos }, async (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const parsed = parseGoogleGeocodingResult(results[0], newPos);
          onMarkerChange(newPos, parsed);
        } else {
          const fallback = await reverseGeocodeCoords(newPos.lat, newPos.lng);
          onMarkerChange(newPos, fallback);
        }
      });
    } else {
      reverseGeocodeCoords(newPos.lat, newPos.lng).then(fallback => {
        onMarkerChange(newPos, fallback);
      });
    }
  }, [onMarkerChange]);

  return (
    <GoogleMap
      defaultCenter={markerPosition}
      defaultZoom={15}
      mapId="DEMO_MAP_ID"
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      style={{ width: '100%', height: '100%' }}
      onClick={handleMapClick}
      gestureHandling="greedy"
      disableDefaultUI={false}
      zoomControl={true}
      streetViewControl={false}
      mapTypeControl={false}
    >
      <AdvancedMarker
        position={markerPosition}
        draggable={true}
        onDragEnd={(e) => {
          if (e.latLng) {
            const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            if (geocoderRef.current) {
              geocoderRef.current.geocode({ location: newPos }, async (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  const parsed = parseGoogleGeocodingResult(results[0], newPos);
                  onMarkerChange(newPos, parsed);
                } else {
                  const fallback = await reverseGeocodeCoords(newPos.lat, newPos.lng);
                  onMarkerChange(newPos, fallback);
                }
              });
            } else {
              reverseGeocodeCoords(newPos.lat, newPos.lng).then(fallback => {
                onMarkerChange(newPos, fallback);
              });
            }
          }
        }}
      >
        <GooglePin background="#E11D48" glyphColor="#FFFFFF" borderColor="#9F1239" scale={1.2} />
      </AdvancedMarker>
    </GoogleMap>
  );
}

function parseGoogleGeocodingResult(
  result: google.maps.GeocoderResult,
  pos: google.maps.LatLngLiteral
): Partial<SelectedLocationData> {
  const components = result.address_components || [];
  let streetNumber = '';
  let route = '';
  let neighborhood = '';
  let sublocality = '';
  let city = '';
  let state = '';
  let country = '';
  let postalCode = '';

  components.forEach(comp => {
    const types = comp.types;
    if (types.includes('street_number')) streetNumber = comp.long_name;
    if (types.includes('route')) route = comp.long_name;
    if (types.includes('neighborhood')) neighborhood = comp.long_name;
    if (types.includes('sublocality_level_1') || types.includes('sublocality')) sublocality = comp.long_name;
    if (types.includes('locality')) city = comp.long_name;
    else if (!city && types.includes('administrative_area_level_2')) city = comp.long_name;
    if (types.includes('administrative_area_level_1')) state = comp.long_name;
    if (types.includes('country')) country = comp.long_name;
    if (types.includes('postal_code')) postalCode = comp.long_name;
  });

  const street = [streetNumber, route].filter(Boolean).join(' ') || route || '';
  const colony = neighborhood || sublocality || (street ? `${street} Area` : 'Civic Ward');
  const area = sublocality || neighborhood || city || 'Central Zone';

  return {
    lat: Number(pos.lat.toFixed(6)),
    lng: Number(pos.lng.toFixed(6)),
    formattedAddress: result.formatted_address,
    city: city || 'Khammam',
    area: area || 'Central Zone',
    colony: colony || 'Municipal Ward Locality',
    street: street || '',
    state: state || 'Telangana',
    country: country || 'India',
    postalCode: postalCode || '',
    placeId: result.place_id
  };
}

/**
 * ----------------------------------------------------
 * Interactive Leaflet Map Engine
 * ----------------------------------------------------
 */
function InteractiveLeafletMap({
  center,
  onMarkerChange,
}: {
  center: { lat: number; lng: number };
  onMarkerChange: (pos: { lat: number; lng: number }, addressData?: Partial<SelectedLocationData>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Custom SVG Map Pin Icon
      const customPinIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab;">
            <div style="width: 32px; height: 32px; border-radius: 50% 50% 50% 0; background: #E11D48; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35); border: 2px solid #ffffff;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background: #ffffff; transform: rotate(45deg);"></div>
            </div>
            <div style="width: 14px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; margin-top: 2px;"></div>
          </div>
        `,
        iconSize: [32, 38],
        iconAnchor: [16, 38],
      });

      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: 15,
        zoomControl: false,
      });

      // Standard High Resolution OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Create Draggable Marker
      const marker = L.marker([center.lat, center.lng], {
        icon: customPinIcon,
        draggable: true,
        autoPan: true,
      }).addTo(map);

      // Marker Drag End Listener
      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        const address = await reverseGeocodeCoords(pos.lat, pos.lng);
        onMarkerChange({ lat: pos.lat, lng: pos.lng }, address);
      });

      // Map Click Listener
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        const address = await reverseGeocodeCoords(lat, lng);
        onMarkerChange({ lat, lng }, address);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Invalidate size shortly after mounting to ensure perfect map rendering
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []);

  // Update map and marker when center changes
  useEffect(() => {
    if (mapInstanceRef.current && markerInstanceRef.current) {
      const currentPos = markerInstanceRef.current.getLatLng();
      if (Math.abs(currentPos.lat - center.lat) > 0.0001 || Math.abs(currentPos.lng - center.lng) > 0.0001) {
        mapInstanceRef.current.setView([center.lat, center.lng], 15, { animate: true });
        markerInstanceRef.current.setLatLng([center.lat, center.lng]);
        mapInstanceRef.current.invalidateSize();
      }
    }
  }, [center]);

  return <div ref={containerRef} className="w-full h-full min-h-[180px] relative z-0" />;
}

/**
 * ----------------------------------------------------
 * Main Google Map Location Picker Modal Component
 * ----------------------------------------------------
 */
export const GoogleMapLocationPickerModal: React.FC<GoogleMapLocationPickerModalProps> = ({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  initialAddress,
  onConfirmLocation,
}) => {
  // Default coordinates (Khammam / Hyderabad / Amaravati regional default)
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>({
    lat: initialLat && initialLat !== 0 ? initialLat : 17.2473,
    lng: initialLng && initialLng !== 0 ? initialLng : 80.1514,
  });

  const [currentAddress, setCurrentAddress] = useState<string>(
    initialAddress || 'Street 4, Agraharam, Konijerla, Khammam, Telangana, India'
  );

  const [parsedData, setParsedData] = useState<Partial<SelectedLocationData>>({
    lat: initialLat && initialLat !== 0 ? initialLat : 17.2473,
    lng: initialLng && initialLng !== 0 ? initialLng : 80.1514,
    formattedAddress: initialAddress || 'Street 4, Agraharam, Konijerla, Khammam, Telangana, India',
    city: 'Khammam',
    area: 'Konijerla',
    colony: 'Agraharam',
    street: 'Street 4',
    postalCode: '507165',
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Array<{ displayName: string; lat: number; lng: number; addressData: GeocodedAddress }>>([]);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Initialize on open
  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLng && initialLat !== 0 && initialLng !== 0) {
        setMarkerPosition({ lat: initialLat, lng: initialLng });
      }
      if (initialAddress) {
        setCurrentAddress(initialAddress);
      } else if (!initialLat) {
        // Reverse geocode default center if no address given
        reverseGeocodeCoords(17.2473, 80.1514).then(res => {
          setCurrentAddress(res.formattedAddress);
          setParsedData(res);
        });
      }
    }
  }, [isOpen, initialLat, initialLng, initialAddress]);

  if (!isOpen) return null;

  // Handle marker updates from map clicks, dragging, or place search
  const handleMarkerChange = (
    pos: { lat: number; lng: number },
    data?: Partial<SelectedLocationData>
  ) => {
    setMarkerPosition(pos);
    if (data && data.formattedAddress) {
      setCurrentAddress(data.formattedAddress);
      setParsedData({
        ...data,
        lat: Number(pos.lat.toFixed(6)),
        lng: Number(pos.lng.toFixed(6)),
      });
      setLocationStatus('Location updated');
    }
  };

  // Search places handler (e.g. "Vijayawada", "Guntur", "Khammam", "Vignan University", "Street 4, Agraharam")
  const handleSearchInput = async (text: string) => {
    setSearchQuery(text);
    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    const results = await searchLocationsByQuery(text);
    setIsSearching(false);
    setSuggestions(results);
  };

  const handleSelectSuggestion = (item: { displayName: string; lat: number; lng: number; addressData: GeocodedAddress }) => {
    setSearchQuery('');
    setSuggestions([]);
    const newPos = { lat: item.lat, lng: item.lng };
    setMarkerPosition(newPos);
    setCurrentAddress(item.addressData.formattedAddress);
    setParsedData(item.addressData);
    setLocationStatus(`Selected: ${item.addressData.city || item.displayName}`);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchLocationsByQuery(searchQuery);
    setIsSearching(false);
    if (results.length > 0) {
      handleSelectSuggestion(results[0]);
    }
  };

  // USE MY CURRENT LOCATION
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setLocationStatus('Detecting GPS location...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const userPos = { lat, lng };
          setMarkerPosition(userPos);
          
          const geocoded = await reverseGeocodeCoords(lat, lng);
          setCurrentAddress(geocoded.formattedAddress);
          setParsedData(geocoded);
          setIsLocating(false);
          setLocationStatus('Current location detected. You can drag the pin to adjust.');
        },
        async (err) => {
          console.warn('Geolocation failed:', err);
          setIsLocating(false);
          // Fallback to default location
          const fallbackPos = { lat: 17.2473, lng: 80.1514 };
          setMarkerPosition(fallbackPos);
          const geocoded = await reverseGeocodeCoords(fallbackPos.lat, fallbackPos.lng);
          setCurrentAddress(geocoded.formattedAddress);
          setParsedData(geocoded);
          setLocationStatus('Could not access GPS. Please click or drag pin on the map.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      setLocationStatus('Geolocation is not supported by your browser.');
    }
  };

  // CONFIRM LOCATION
  const handleConfirm = () => {
    const finalData: SelectedLocationData = {
      lat: parsedData.lat || markerPosition.lat,
      lng: parsedData.lng || markerPosition.lng,
      formattedAddress: currentAddress || parsedData.formattedAddress || 'Selected Incident Location',
      city: parsedData.city || 'Khammam',
      area: parsedData.area || 'Mamillagudem',
      colony: parsedData.colony || parsedData.area || 'Mamillagudem Locality',
      street: parsedData.street || '',
      state: parsedData.state || 'Telangana',
      country: parsedData.country || 'India',
      postalCode: parsedData.postalCode || '507001',
      landmark: parsedData.landmark || '',
      placeId: parsedData.placeId,
    };

    onConfirmLocation(finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[92vh] max-h-[720px]">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black tracking-wide">Select Incident Location on Map</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Click anywhere on the map or drag the pin to fix the exact civic issue spot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Real Search Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search place, landmark, street, colony (e.g. Khammam, Vijayawada, Guntur)..."
                className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 shadow-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute right-3" />
              )}
            </form>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 max-h-56 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium flex items-center gap-2 border-b border-slate-100 last:border-0 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{item.displayName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* USE MY CURRENT LOCATION BUTTON */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer transition-all active:scale-[0.98]"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Crosshair className="w-3.5 h-3.5" />
            )}
            <span>{isLocating ? 'Acquiring GPS...' : 'USE MY CURRENT LOCATION'}</span>
          </button>
        </div>

        {/* Real Interactive Map Canvas */}
        <div className="relative flex-1 w-full min-h-0 bg-slate-100 overflow-hidden">
          {hasValidGoogleKey ? (
            <APIProvider apiKey={API_KEY} version="weekly">
              <GoogleMapController
                markerPosition={markerPosition}
                onMarkerChange={handleMarkerChange}
              />
            </APIProvider>
          ) : (
            <InteractiveLeafletMap
              center={markerPosition}
              onMarkerChange={handleMarkerChange}
            />
          )}

          {/* Guidance badge */}
          <div className="absolute top-3 left-3 pointer-events-none z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium shadow-md">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Click map or drag the pin to fix the exact spot</span>
          </div>
        </div>

        {/* Selected Location Summary & Confirm Bottom Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-3 z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          
          <div className="flex items-start gap-2.5 bg-blue-50/90 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-blue-200">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider block">
                SELECTED INCIDENT LOCATION
              </span>
              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 leading-snug break-words">
                {currentAddress || 'No location selected yet. Click map to place marker.'}
              </p>
              <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                ✓ {locationStatus || 'Location updated'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-0.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 sm:py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs sm:text-sm font-bold cursor-pointer transition-colors text-center shrink-0"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial sm:min-w-[240px] px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4 text-white stroke-[3]" />
              <span>SELECT LOCATION →</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
