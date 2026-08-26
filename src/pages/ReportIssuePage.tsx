import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Upload, 
  Crosshair, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Building2, 
  Layers,
  FileCheck2,
  X,
  RefreshCw,
  Eye,
  Trash2,
  SwitchCamera
} from 'lucide-react';
import { CivicCase, AppView, CivicCategory, ProblemDuration } from '../types';
import { CivicImageKey, resolveCivicImageKey } from '../utils/imageAssets';
import { createComplaintInDb } from '../services/complaintsService';
import { getCurrentUser, generateUniqueCitizenId, updateCitizenProfile } from '../services/authService';
import { GoogleMapLocationPickerModal, SelectedLocationData } from '../components/GoogleMapLocationPickerModal';
import { reverseGeocodeCoords } from '../utils/geocodingService';
import { validateIndianPhone, validateLocationConsistency } from '../utils/securityValidation';

interface ReportIssuePageProps {
  onStartAnalysis?: (draft: {
    title: string;
    description: string;
    category: CivicCategory;
    address: string;
    ward: string;
    landmark: string;
    imageKey: CivicImageKey;
    imageUrl: string;
  }) => void;
  onCaseCreated?: (newCase: CivicCase) => void;
  onNavigate: (view: AppView) => void;
  onViewCase?: (caseId: string) => void;
}

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({
  onCaseCreated,
  onNavigate,
  onViewCase
}) => {
  const currentUser = getCurrentUser();

  // Multi-step Wizard: 1: Personal, 2: Location, 3: Complaint, 4: Duration, 5: Success
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // STEP 1: Personal Details (dynamically populated from authenticated citizen profile)
  const [fullName, setFullName] = useState<string>(currentUser?.full_name || currentUser?.username || '');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [citizenId, setCitizenId] = useState<string>(currentUser?.citizen_id || currentUser?.id || '');

  // STEP 2: Location Details (empty by default)
  const [cityName, setCityName] = useState<string>('');
  const [areaName, setAreaName] = useState<string>('');
  const [colonyName, setColonyName] = useState<string>('');
  const [wardNumber, setWardNumber] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [selectedFormattedAddress, setSelectedFormattedAddress] = useState<string>('');
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // STEP 3: Complaint Details
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<CivicCategory>('Garbage / Sanitation');
  const [subcategory, setSubcategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dateFirstNoticed, setDateFirstNoticed] = useState<string>('');
  
  // Real Photo Attachments (EMPTY by default - NO stock or default photos)
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Real Camera Live Capture State & Multi-Camera Management
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [activeCameraLabel, setActiveCameraLabel] = useState<string>('');
  const [isSwitchingCamera, setIsSwitchingCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const currentDeviceIdRef = useRef<string | null>(null);

  // STEP 4: Problem Duration
  const [problemDuration, setProblemDuration] = useState<ProblemDuration>('1–3 Days');
  const [problemStartedDate, setProblemStartedDate] = useState<string>('');

  // Created Case Info
  const [createdCase, setCreatedCase] = useState<CivicCase | null>(null);

  // Sync personal fields when user profile loads
  useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.full_name || currentUser.username || '');
      if (!phone) setPhone(currentUser.phone || '');
      if (!email) setEmail(currentUser.email || '');
      if (!citizenId) setCitizenId(currentUser.citizen_id || currentUser.id || '');
    }
  }, [currentUser]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Helper functions to identify camera facing type by device labels
  const isBackCameraLabel = (label: string): boolean => {
    const l = (label || '').toLowerCase();
    return (
      l.includes('back') ||
      l.includes('rear') ||
      l.includes('environment') ||
      l.includes('facing back') ||
      l.includes('0, facing back') ||
      l.includes('camera2 0') ||
      l.includes('main') ||
      l.includes('wide') ||
      l.includes('ultra') ||
      l.includes('telephoto') ||
      l.includes('external')
    );
  };

  const isFrontCameraLabel = (label: string): boolean => {
    const l = (label || '').toLowerCase();
    return (
      l.includes('front') ||
      l.includes('user') ||
      l.includes('facing front') ||
      l.includes('1, facing front') ||
      l.includes('camera2 1') ||
      l.includes('selfie') ||
      l.includes('webcam') ||
      l.includes('integrated') ||
      l.includes('facetime') ||
      l.includes('internal')
    );
  };

  // Helper to enumerate video input devices
  const getVideoDevices = async (): Promise<MediaDeviceInfo[]> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(d => d.kind === 'videoinput');
    } catch (err) {
      console.warn('Error querying media devices:', err);
      return [];
    }
  };

  // Completely stop every track and clear video element srcObject
  const stopCameraStream = () => {
    if (videoRef.current) {
      try {
        if (videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          if (stream && typeof stream.getTracks === 'function') {
            stream.getTracks().forEach(track => {
              try {
                track.stop();
              } catch (e) {}
            });
          }
        }
        videoRef.current.srcObject = null;
      } catch (e) {
        console.warn('Error clearing video element srcObject:', e);
      }
    }

    if (mediaStreamRef.current) {
      try {
        if (typeof mediaStreamRef.current.getTracks === 'function') {
          mediaStreamRef.current.getTracks().forEach(track => {
            try {
              track.stop();
            } catch (e) {}
          });
        }
      } catch (e) {
        console.warn('Error stopping camera tracks:', e);
      }
      mediaStreamRef.current = null;
    }
    setCameraStream(null);
  };

  // Video element callback ref to instantly bind stream on DOM mount
  const handleVideoRef = (element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && mediaStreamRef.current) {
      try {
        element.srcObject = mediaStreamRef.current;
        element.muted = true;
        element.playsInline = true;
        element.play().catch(err => console.warn('Live video play warning:', err));
      } catch (e) {
        console.warn('Error binding video stream:', e);
      }
    }
  };

  // Sync video element srcObject when camera active state, stream or snapshot changes
  useEffect(() => {
    if (isCameraActive && videoRef.current && mediaStreamRef.current && !capturedSnapshot) {
      try {
        if (videoRef.current.srcObject !== mediaStreamRef.current) {
          videoRef.current.srcObject = mediaStreamRef.current;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
        }
        videoRef.current.play().catch(err => console.warn('Live video play warning:', err));
      } catch (e) {
        console.warn('Error playing video stream:', e);
      }
    }
  }, [isCameraActive, capturedSnapshot, cameraStream, cameraFacingMode]);

  // Start or Switch Camera Stream (Detects exact facingMode & deviceId to guarantee physical hardware switch)
  const startCameraStream = async (targetFacing: 'environment' | 'user' = 'environment', isExplicitSwitch: boolean = false) => {
    setCameraError(null);
    setIsSwitchingCamera(true);

    // Stop existing camera tracks completely before requesting new camera stream
    stopCameraStream();

    // Brief delay to allow mobile OS / browser camera hardware to cleanly release
    await new Promise(resolve => setTimeout(resolve, 80));

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Camera API not supported');
      setCameraError('Camera is not supported in this browser. Please upload a photo instead.');
      setIsSwitchingCamera(false);
      return;
    }

    try {
      let stream: MediaStream | null = null;

      // Query available video devices
      const devices = await getVideoDevices();

      // Check if we can identify specific deviceId for the target camera
      let targetDeviceId: string | undefined = undefined;
      if (devices.length > 1) {
        const backDevice = devices.find(d => isBackCameraLabel(d.label));
        const frontDevice = devices.find(d => isFrontCameraLabel(d.label));

        if (targetFacing === 'environment' && backDevice) {
          targetDeviceId = backDevice.deviceId;
        } else if (targetFacing === 'user' && frontDevice) {
          targetDeviceId = frontDevice.deviceId;
        } else if (isExplicitSwitch && currentDeviceIdRef.current) {
          // Switch to alternate device if available
          const otherDevice = devices.find(d => d.deviceId && d.deviceId !== currentDeviceIdRef.current);
          if (otherDevice) {
            targetDeviceId = otherDevice.deviceId;
          }
        }
      }

      // Strategy 1: If switching to an explicitly identified target deviceId
      if (targetDeviceId) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: targetDeviceId }
            },
            audio: false
          });
        } catch (err) {
          console.warn('Target deviceId constraint attempt failed, trying facingMode:', err);
        }
      }

      // Strategy 2: Ideal facingMode constraint (standard on mobile browsers)
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: targetFacing }
            },
            audio: false
          });
        } catch (err) {
          console.warn('Ideal facingMode constraint failed:', err);
        }
      }

      // Strategy 3: Exact facingMode constraint (forces physical camera switch on supported mobile browsers)
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: targetFacing }
            },
            audio: false
          });
        } catch (err) {
          console.warn('Exact facingMode constraint failed:', err);
        }
      }

      // Strategy 4: Direct string facingMode
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: targetFacing
            },
            audio: false
          });
        } catch (err) {
          console.warn('Direct facingMode fallback failed:', err);
        }
      }

      // Strategy 5: Alternate device from enumeration if explicit switch
      if (!stream && isExplicitSwitch && devices.length > 1) {
        const nextDevice = devices.find(d => d.deviceId && d.deviceId !== currentDeviceIdRef.current);
        if (nextDevice && nextDevice.deviceId) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: nextDevice.deviceId } },
              audio: false
            });
          } catch (err) {
            console.warn('Alternate device fallback failed:', err);
          }
        }
      }

      // Strategy 6: General fallback (desktop single webcam)
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      if (!stream) {
        throw new Error('Failed to acquire video stream from camera device.');
      }

      // Inspect acquired stream video track to detect actual hardware settings
      const track = stream.getVideoTracks()[0];
      let resolvedFacing: 'environment' | 'user' = targetFacing;
      let resolvedLabel = '';

      if (track) {
        resolvedLabel = track.label || '';
        const settings = typeof track.getSettings === 'function' ? track.getSettings() : {};
        if (settings.deviceId) {
          currentDeviceIdRef.current = settings.deviceId;
        }

        if (settings.facingMode === 'environment' || settings.facingMode === 'user') {
          resolvedFacing = settings.facingMode;
        } else if (isBackCameraLabel(resolvedLabel)) {
          resolvedFacing = 'environment';
        } else if (isFrontCameraLabel(resolvedLabel)) {
          resolvedFacing = 'user';
        } else {
          resolvedFacing = targetFacing;
        }
      }

      // Refresh device list in background now that permission is granted and labels are accessible
      getVideoDevices().catch(() => {});

      mediaStreamRef.current = stream;
      setCameraStream(stream);
      setCameraFacingMode(resolvedFacing);
      setActiveCameraLabel(resolvedLabel);
      setIsCameraActive(true);

      // Assign to video element immediately and play
      if (videoRef.current) {
        try {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          await videoRef.current.play();
        } catch (err) {
          console.warn('Video element auto-play warning:', err);
        }
      }

    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          'Camera access is required to take an evidence photo. Please allow camera access in your browser settings.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Camera is not available on this device. Please upload a photo instead.');
      } else if (err.name === 'NotSupportedError' || err.name === 'OverconstrainedError') {
        setCameraError('Requested camera mode is not supported. Please try uploading a photo instead.');
      } else {
        setCameraError('Camera access error. Please allow camera permissions in your browser settings or upload a photo.');
      }
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  // Start Camera Stream - Triggered when citizen clicks "Take Evidence Photo" (Defaults to Back Camera)
  const handleStartCamera = async () => {
    setCapturedSnapshot(null);
    setCameraFacingMode('environment');
    await startCameraStream('environment', false);
  };

  // Switch between Front and Back camera while keeping modal open
  const handleSwitchCamera = async () => {
    if (isSwitchingCamera) return;
    const nextFacing: 'environment' | 'user' = cameraFacingMode === 'environment' ? 'user' : 'environment';
    await startCameraStream(nextFacing, true);
  };

  // Capture Snapshot from Video Frame
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedSnapshot(dataUrl);
    }
  };

  // Confirm and Use Captured Snapshot
  const handleConfirmCapturedPhoto = () => {
    if (capturedSnapshot) {
      setEvidencePhotos(prev => [...prev, capturedSnapshot]);
    }
    handleCloseCamera();
  };

  // Retake photo: clear snapshot and continue live preview
  const handleRetakeSnapshot = () => {
    setCapturedSnapshot(null);
  };

  // Close Camera and clean up tracks
  const handleCloseCamera = () => {
    stopCameraStream();
    setIsCameraActive(false);
    setCapturedSnapshot(null);
    setCameraError(null);
    setCameraFacingMode('environment');
  };

  // Real Device File Upload Handler
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const base64Img = event.target.result as string;
            setEvidencePhotos(prev => [...prev, base64Img]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input so re-selecting works
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setEvidencePhotos(prev => prev.filter((_, idx) => idx !== index));
  };

  // Categories list
  const CATEGORIES: CivicCategory[] = [
    'Garbage / Sanitation',
    'Water Supply',
    'Road Damage',
    'Streetlights',
    'Drainage',
    'Electricity',
    'Public Safety',
    'Public Property Damage',
    'Environmental Issue',
    'Health / Sanitation Hazard',
    'Other'
  ];

  // Duration options
  const DURATION_OPTIONS: ProblemDuration[] = [
    'Today',
    '1–3 Days',
    '4–7 Days',
    '1–2 Weeks',
    '2–4 Weeks',
    '1–3 Months',
    '3–6 Months',
    'More Than 6 Months',
    'More Than 1 Year'
  ];

  // Location picker confirm handler
  const handleLocationPickerConfirm = (loc: SelectedLocationData) => {
    setLatitude(loc.lat);
    setLongitude(loc.lng);
    setSelectedFormattedAddress(loc.formattedAddress);
    setIsLocationConfirmed(true);

    // Auto-fill existing fields
    if (loc.city) setCityName(loc.city);
    if (loc.area) setAreaName(loc.area);
    if (loc.colony) setColonyName(loc.colony);
    if (loc.street) setStreetAddress(loc.street);
    if (loc.postalCode) setPostalCode(loc.postalCode);
    if (loc.landmark && !landmark) setLandmark(loc.landmark);
  };

  // Auto-detect & use current location
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setErrorMessage(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          setLatitude(lat);
          setLongitude(lng);

          const geocoded = await reverseGeocodeCoords(lat, lng);
          setSelectedFormattedAddress(geocoded.formattedAddress);
          setIsLocationConfirmed(true);

          if (geocoded.city) setCityName(geocoded.city);
          if (geocoded.area) setAreaName(geocoded.area);
          if (geocoded.colony) setColonyName(geocoded.colony);
          if (geocoded.street) setStreetAddress(geocoded.street);
          if (geocoded.postalCode) setPostalCode(geocoded.postalCode);
          if (geocoded.landmark && !landmark) setLandmark(geocoded.landmark);
          setIsLocating(false);
        },
        async (err) => {
          console.warn('Geolocation failed, setting default smart civic coordinates:', err);
          const fallbackLat = 17.2473;
          const fallbackLng = 80.1514;
          setLatitude(fallbackLat);
          setLongitude(fallbackLng);
          const geocoded = await reverseGeocodeCoords(fallbackLat, fallbackLng);
          setSelectedFormattedAddress(geocoded.formattedAddress);
          setIsLocationConfirmed(true);
          if (geocoded.city) setCityName(geocoded.city);
          if (geocoded.area) setAreaName(geocoded.area);
          if (geocoded.colony) setColonyName(geocoded.colony);
          if (geocoded.street) setStreetAddress(geocoded.street);
          if (geocoded.postalCode) setPostalCode(geocoded.postalCode);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      setIsMapModalOpen(true);
    }
  };

  // Submission handler to Firestore
  const handleSubmitComplaint = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!fullName.trim() || !phone.trim()) {
        setCurrentStep(1);
        throw new Error('Please provide your Full Name and Phone Number in Step 1.');
      }

      // Strict phone validation
      const phoneValidation = validateIndianPhone(phone);
      if (!phoneValidation.isValid) {
        setCurrentStep(1);
        throw new Error(phoneValidation.error || 'Please enter a valid 10-digit Indian mobile number.');
      }

      if (!cityName.trim() || !areaName.trim() || !colonyName.trim()) {
        setCurrentStep(2);
        throw new Error('Please fill in required location details: City, Area, and Colony in Step 2.');
      }

      if (!title.trim() || !description.trim()) {
        setCurrentStep(3);
        throw new Error('Please provide Complaint Title and Description in Step 3.');
      }

      // Location consistency validation against reverse geocoded details
      const locationCheck = validateLocationConsistency(
        {
          cityName: cityName.trim(),
          areaName: areaName.trim(),
          colonyName: colonyName.trim(),
          streetAddress: streetAddress.trim(),
          postalCode: postalCode.trim()
        },
        selectedFormattedAddress,
        latitude,
        longitude
      );

      const activeCitizenId = currentUser?.citizen_id || citizenId.trim() || generateUniqueCitizenId();
      const activeUserId = currentUser?.id || currentUser?.citizen_id || activeCitizenId;

      // Persist citizen's entered phone and full name to their permanent citizen account profile
      if (currentUser && phone.trim()) {
        updateCitizenProfile(currentUser.citizen_id || currentUser.id || currentUser.email, {
          phone: phoneValidation.normalizedValue || phone.trim(),
          full_name: fullName.trim()
        });
      }

      // Save new complaint permanently to database with real photos (or empty array if none)
      const created = await createComplaintInDb({
        userId: activeUserId,
        fullName: fullName.trim(),
        phone: phoneValidation.normalizedValue || phone.trim(),
        email: email.trim(),
        citizenId: activeCitizenId,
        emailVerified: currentUser?.emailVerified ?? true,
        phoneVerified: currentUser?.phoneVerified ?? true,
        locationValidationStatus: locationCheck.status,
        locationConflictReason: locationCheck.reason || '',

        cityName: cityName.trim(),
        areaName: areaName.trim(),
        colonyName: colonyName.trim(),
        wardNumber: wardNumber.trim(),
        streetAddress: streetAddress.trim() || selectedFormattedAddress,
        landmark: landmark.trim(),
        postalCode: postalCode.trim(),
        latitude: latitude || 17.3850,
        longitude: longitude || 78.4867,

        title: title.trim(),
        category,
        subcategory: subcategory.trim(),
        description: description.trim(),
        dateFirstNoticed,
        evidencePhotos: evidencePhotos,

        problemDuration,
        problemStartedDate
      });

      setCreatedCase(created);
      if (onCaseCreated) {
        onCaseCreated(created);
      }
      setCurrentStep(5); // Success step
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Unable to submit your complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Location' },
    { num: 3, label: 'Complaint' },
    { num: 4, label: 'Problem Duration' },
    { num: 5, label: 'Confirmation' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* 1. STEP PROGRESS BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone 
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : `0${s.num}`}
                  </div>
                  <span className={`text-xs font-bold hidden sm:inline ${
                    isCurrent ? 'text-blue-600' : isDone ? 'text-emerald-700' : 'text-slate-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-all ${
                    currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Validation Alert</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Camera Error Notice */}
      {cameraError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Camera Permission</span>
            <span>{cameraError}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setCameraError(null)} 
            className="text-amber-700 hover:text-amber-900 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* CAMERA MODAL / LIVE CAPTURE OVERLAY */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl overflow-hidden max-w-lg w-full border border-slate-700 shadow-2xl space-y-4 p-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-400" />
                <span className="font-extrabold text-sm uppercase tracking-wider">
                  {capturedSnapshot ? 'PHOTO PREVIEW' : 'TAKE EVIDENCE PHOTO'}
                </span>
              </div>
              <button 
                type="button" 
                onClick={handleCloseCamera}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="Cancel & Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Preview or Captured Frame */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
              {capturedSnapshot ? (
                <img src={capturedSnapshot} alt="Captured evidence preview" className="w-full h-full object-contain" />
              ) : (
                <>
                  <video 
                    ref={handleVideoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    onLoadedMetadata={(e) => {
                      (e.target as HTMLVideoElement).play().catch(() => {});
                    }}
                    className="w-full h-full object-cover"
                  />

                  {/* Active Camera Indicator Badge */}
                  <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-[11px] font-mono text-slate-200 border border-white/10 flex items-center gap-1.5 pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{cameraFacingMode === 'environment' ? 'Back Camera' : 'Front Camera'}</span>
                  </div>

                  {/* Switch Camera Button inside preview */}
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    disabled={isSwitchingCamera}
                    className="absolute bottom-3 right-3 z-10 px-3.5 py-2 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md border border-white/20 shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    title={`Switch to ${cameraFacingMode === 'environment' ? 'Front' : 'Back'} Camera`}
                  >
                    <SwitchCamera className={`w-4 h-4 text-cyan-400 ${isSwitchingCamera ? 'animate-spin' : ''}`} />
                    <span>Switch Camera</span>
                  </button>
                </>
              )}
            </div>

            {/* Camera Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {capturedSnapshot ? (
                <>
                  <button
                    type="button"
                    onClick={handleConfirmCapturedPhoto}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>USE PHOTO</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRetakeSnapshot}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>RETAKE</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseCamera}
                    className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>CANCEL</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCaptureSnapshot}
                    className="px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2.5 shadow-lg shadow-blue-600/30 cursor-pointer"
                  >
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white bg-white/20" />
                    <span>CAPTURE PHOTO</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseCamera}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>CANCEL</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input for Device Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelected}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
      />

      {/* 2. STEP 1: PERSONAL INFORMATION */}
      {currentStep === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-blue-600 font-bold tracking-wider">STEP 01</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Citizen Identity & Contact</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Step 1 of 4</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <span className="font-bold block">Authenticated Citizen Identity</span>
              <span>
                Complaints are securely tied to your unique Citizen ID (<strong className="font-mono text-blue-800">{citizenId || currentUser?.citizen_id || 'Active Citizen'}</strong>).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Citizen ID (Permanent Registry ID)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={citizenId}
                  readOnly
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-blue-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                if (!fullName.trim() || !phone.trim()) {
                  setErrorMessage('Please enter your Full Name and Mobile Phone Number to continue.');
                  return;
                }
                setErrorMessage(null);
                setCurrentStep(2);
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>NEXT: INCIDENT LOCATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* 3. STEP 2: LOCATION DETAILS */}
      {currentStep === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-blue-600 font-bold tracking-wider">STEP 02</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Incident Location Details</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Step 2 of 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Enter city name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Area Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="Enter area name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Colony / Locality <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={colonyName}
                onChange={(e) => setColonyName(e.target.value)}
                placeholder="Enter colony / locality"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ward Number / Zone
              </label>
              <input
                type="text"
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                placeholder="Enter ward or zone (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Street / Full Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Enter street or full address (optional)"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nearby Landmark (Hospital, School, Metro Pillar, Bus Stop)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Enter nearby landmark (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Enter postal code (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* INCIDENT LOCATION SETTER */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {isLocationConfirmed ? 'SELECTED INCIDENT LOCATION' : 'INCIDENT LOCATION'}
                </span>
              </div>
              {isLocationConfirmed && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Location selected
                </span>
              )}
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  {selectedFormattedAddress ? (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        📍 Selected Location
                      </span>
                      <p className="text-xs sm:text-sm font-black text-slate-900 leading-snug break-words">
                        {selectedFormattedAddress}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-500 italic">
                      No location selected yet. Click "SELECT LOCATION ON MAP" to pick the exact spot.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {selectedFormattedAddress ? (
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Change Location</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>SELECT LOCATION ON MAP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                    <span>USE MY CURRENT LOCATION</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK</span>
            </button>

            <button
              onClick={() => {
                if (!cityName.trim() || !areaName.trim() || !colonyName.trim()) {
                  setErrorMessage('Please fill in City Name, Area Name, and Colony / Locality to proceed.');
                  return;
                }
                setErrorMessage(null);
                setCurrentStep(3);
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>NEXT: PROBLEM DETAILS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* 4. STEP 3: COMPLAINT DETAILS & PHOTO ATTACHMENTS */}
      {currentStep === 3 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-blue-600 font-bold tracking-wider">STEP 03</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Problem Details & Evidence Photos</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Step 3 of 4</span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Complaint Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter complaint title"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-bold"
              required
            />
          </div>

          {/* Problem Category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Problem Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    category === cat
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {category === cat && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory & Date noticed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Optional Subcategory
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Enter subcategory (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date / Time First Noticed (Optional)
              </label>
              <input
                type="text"
                value={dateFirstNoticed}
                onChange={(e) => setDateFirstNoticed(e.target.value)}
                placeholder="Enter date/time first noticed (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem in detail: hazard severity, location specifics, traffic obstruction, health impacts..."
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white leading-relaxed font-normal"
              required
            />
          </div>

          {/* STRICT EVIDENCE PHOTOS SECTION (EMPTY BY DEFAULT) */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  EVIDENCE PHOTOS (OPTIONAL)
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  You can upload photos or take a new photo as evidence for your complaint.
                </p>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                  evidencePhotos.length > 0
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {evidencePhotos.length === 0 
                    ? 'No photos added yet.' 
                    : evidencePhotos.length === 1 
                    ? '1 Photo Attached' 
                    : `${evidencePhotos.length} Photos Attached`}
                </span>
              </div>
            </div>

            {/* Action Buttons: [ TAKE PHOTO ] and [ UPLOAD FROM DEVICE ] */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStartCamera}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>📷 TAKE PHOTO</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>🖼 UPLOAD FROM DEVICE</span>
              </button>

              {evidencePhotos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setEvidencePhotos([])}
                  className="px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove All</span>
                </button>
              )}
            </div>

            {/* Actual Evidence Photos Gallery Preview */}
            {evidencePhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {evidencePhotos.map((photo, idx) => (
                  <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-300 aspect-video bg-black group shadow-xs">
                    <img src={photo} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 cursor-pointer shadow-md transition-all"
                      title="Remove Photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono rounded-md">
                      Photo {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-white/70 text-center text-xs text-slate-500 font-medium">
                No photos added yet. Photos are completely optional and remain private to authorized Government Admins.
              </div>
            )}

          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK</span>
            </button>

            <button
              onClick={() => {
                if (!title.trim() || !description.trim()) {
                  setErrorMessage('Please enter Complaint Title and Problem Description to proceed.');
                  return;
                }
                setErrorMessage(null);
                setCurrentStep(4);
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>NEXT: PROBLEM DURATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* 5. STEP 4: PROBLEM DURATION & REVIEW */}
      {currentStep === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-blue-600 font-bold tracking-wider">STEP 04</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Problem Duration & Review</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Step 4 of 4</span>
          </div>

          {/* DURATION SELECTOR */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 space-y-4">
            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>How long has this problem persisted?</span>
              </label>
              <p className="text-[11px] text-blue-800">
                Duration assists AI triage in determining community risk and prioritization.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setProblemDuration(dur)}
                  className={`p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    problemDuration === dur
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-blue-50/50 border border-blue-200/80'
                  }`}
                >
                  <span>{dur}</span>
                  {problemDuration === dur && <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-1" />}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1">
                Specific Start Date / Event (Optional)
              </label>
              <input
                type="text"
                value={problemStartedDate}
                onChange={(e) => setProblemStartedDate(e.target.value)}
                placeholder="Enter specific start date or event (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blue-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* SUMMARY RECAP BEFORE SUBMIT */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>Complaint Submission Summary</span>
              <span className="font-mono text-blue-700">Initial Status: UNDER REVIEW</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Citizen Owner</span>
                <span className="font-bold text-slate-900">{fullName} ({citizenId || currentUser?.citizen_id || 'Active Citizen'})</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Location</span>
                <span className="font-bold text-slate-900">{colonyName}, {areaName}, {cityName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Category</span>
                <span className="font-bold text-slate-900">{category}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Evidence Photos</span>
                <span className="font-bold text-blue-700 font-mono">
                  {evidencePhotos.length > 0 ? `${evidencePhotos.length} Attached` : 'None (Optional)'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK</span>
            </button>

            <button
              onClick={handleSubmitComplaint}
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving to Database...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  <span>SUBMIT COMPLAINT PERMANENTLY</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* 6. STEP 5: COMPLAINT SUBMITTED SUCCESSFULLY */}
      {currentStep === 5 && createdCase && (
        <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-emerald-200 shadow-xl text-center space-y-6">
          
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
              ✓ COMPLAINT SUBMITTED SUCCESSFULLY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Complaint ID: {createdCase.id}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Your complaint has been submitted to the Government for review.
            </p>
          </div>

          {/* Ticket Details */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-lg mx-auto grid grid-cols-2 gap-4 text-left text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Complaint ID</span>
              <div className="font-mono font-bold text-blue-700">{createdCase.id}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
              <div className="font-bold text-blue-700 uppercase">UNDER REVIEW</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Citizen ID</span>
              <div className="font-bold text-slate-700 font-mono">{createdCase.citizenId}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Evidence Photos</span>
              <div className="font-bold text-slate-900">
                {createdCase.evidenceImages && createdCase.evidenceImages.length > 0 
                  ? `${createdCase.evidenceImages.length} uploaded` 
                  : 'No evidence photos were provided.'}
              </div>
            </div>
            <div className="col-span-2 border-t border-slate-200 pt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Incident Location</span>
              <div className="font-semibold text-slate-800">{createdCase.location.address}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                if (onViewCase) {
                  onViewCase(createdCase.id);
                } else {
                  onNavigate('citizen-case-details');
                }
              }}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>VIEW COMPLAINT</span>
            </button>

            <button
              onClick={() => {
                // Reset form for another complaint
                setTitle('');
                setDescription('');
                setSubcategory('');
                setEvidencePhotos([]);
                setProblemStartedDate('');
                setErrorMessage(null);
                setCurrentStep(2); // Go to location
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>FILE ANOTHER COMPLAINT</span>
            </button>
          </div>

        </div>
      )}

      {/* Google Maps Location Picker Modal */}
      <GoogleMapLocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialLat={latitude}
        initialLng={longitude}
        initialAddress={selectedFormattedAddress}
        onConfirmLocation={handleLocationPickerConfirm}
      />
    </div>
  );
};
