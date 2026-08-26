import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Cpu, 
  ShieldCheck, 
  ArrowLeft, 
  UserCheck, 
  Lock, 
  Mail, 
  Sparkles, 
  CheckCircle2,
  ArrowRight,
  UserPlus,
  User,
  Phone,
  AlertCircle,
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  X,
  Send,
  Image as ImageIcon
} from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { 
  loginCitizenAsync, 
  registerCitizenAsync, 
  loginCitizen, 
  registerCitizen,
  resendVerificationEmail
} from '../services/authService';
import { 
  validateEmail, 
  validatePassword, 
  validateIndianPhone, 
  validateUserProfileFields 
} from '../utils/securityValidation';
import citizenPortalBg from '../assets/images/citizen_grievance_desk_1787490850787.jpg';

interface CitizenLoginPageProps {
  onNavigate: (view: AppView) => void;
  onLoginSuccess: (userRole: 'citizen' | 'gov', user?: UserProfile) => void;
}

export const CitizenLoginPage: React.FC<CitizenLoginPageProps> = ({
  onNavigate,
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Sign In state - strictly empty by default
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up state - strictly empty by default
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResendBtn, setShowResendBtn] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowResendBtn(false);

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMessage('Please enter your username, email, phone number, or Citizen ID and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginCitizenAsync(cleanIdentifier, cleanPassword);
      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Account not found. Please create an account first.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(`Welcome back, ${res.user.username || res.user.full_name}! Redirecting...`);
      setTimeout(() => {
        onLoginSuccess('citizen', res.user);
        onNavigate('citizen-dashboard');
      }, 500);
    } catch (err: any) {
      setErrorMessage('Unable to sign in right now. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowResendBtn(false);

    const cleanUsername = signupUsername.trim();
    const cleanEmail = signupEmail.trim();
    const cleanPassword = signupPassword.trim();
    const cleanConfirmPassword = signupConfirmPassword.trim();
    const cleanPhone = signupPhone.trim();
    const cleanFullName = signupFullName.trim();

    // 1. Validate Username
    if (!cleanUsername || cleanUsername.length < 2) {
      setErrorMessage('Please enter a valid username (at least 2 characters).');
      return;
    }

    // 2. Validate Email
    const emailVal = validateEmail(cleanEmail);
    if (!emailVal.isValid) {
      setErrorMessage(emailVal.error || 'Please enter a valid email address.');
      return;
    }

    // 3. Validate Phone (if entered)
    if (cleanPhone) {
      const phoneVal = validateIndianPhone(cleanPhone);
      if (!phoneVal.isValid) {
        setErrorMessage(phoneVal.error || 'Please enter a valid 10-digit Indian mobile number.');
        return;
      }
    }

    // 4. Validate Password
    const passwordVal = validatePassword(cleanPassword, cleanConfirmPassword);
    if (!passwordVal.isValid) {
      setErrorMessage(passwordVal.error || 'Invalid password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await registerCitizenAsync({
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        full_name: cleanFullName || cleanUsername,
        phone: cleanPhone
      });

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Unable to create account. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (res.verificationSent) {
        setShowResendBtn(true);
        setSuccessMessage(`Account created successfully! Verification email sent to ${cleanEmail}. Redirecting to Citizen Portal...`);
      } else {
        setSuccessMessage(`Account created successfully with Citizen ID ${res.user.citizen_id}! Redirecting...`);
      }

      setTimeout(() => {
        onLoginSuccess('citizen', res.user);
        onNavigate('citizen-dashboard');
      }, 700);
    } catch (err: any) {
      setErrorMessage('Unable to create account right now. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    const res = await resendVerificationEmail();
    setIsResending(false);
    if (res.success) {
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div 
      className="min-h-screen w-screen overflow-y-auto text-[#0F172A] flex items-center justify-center p-4 sm:p-6 relative select-none"
      style={{
        backgroundImage: `url(${citizenPortalBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-900/20 backdrop-blur-[1px]" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden my-4">
        
        {/* LEFT SIDE: Citizen Portal Proposition */}
        <div className="md:col-span-5 p-6 sm:p-8 bg-gradient-to-br from-blue-50/70 to-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Landing Page</span>
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>CivicMind Citizen Gateway</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Your City. <br />
                Your Voice. <br />
                <span className="text-blue-600">Intelligently Heard.</span>
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Connect directly to your municipal corporation. File complaints, track active municipal progress, and follow resolution milestones in real time.
              </p>
            </div>

            {/* THREE FEATURE INDICATORS */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Personalized Complaint History</h4>
                  <p className="text-[11px] text-slate-500">Every issue you report stays permanently in your account</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Multi-User Privacy</h4>
                  <p className="text-[11px] text-slate-500">Isolated dashboard & confidential citizen data</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Live Municipal Tracking</h4>
                  <p className="text-[11px] text-slate-500">Official Government verification & real-time progress</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="font-medium">Citizen Portal Active</span>
            <span className="font-mono text-blue-600">256-Bit Encrypted</span>
          </div>
        </div>

        {/* RIGHT SIDE: Dynamic Login & Sign Up Form */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white">
          <div className="space-y-4">
            
            {/* TAB SELECTOR: SIGN IN / SIGN UP */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error or Success feedback alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* 1. SIGN IN TAB */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Citizen Sign In</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Enter your Username, Email, Phone Number, or Citizen ID.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username, Email, Phone, or Citizen ID *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                      placeholder="Enter username, email, phone, or citizen ID"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing In...
                    </span>
                  ) : (
                    <>
                      <span>SIGN IN TO CITIZEN PORTAL</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. SIGN UP TAB */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Create Citizen Account</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Register your profile to start filing and tracking civic issues.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Username *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                        placeholder="Enter username"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                        placeholder="Enter password"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>REGISTER & ENTER CITIZEN PORTAL</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Secure Citizen Authentication • </span>
            <span className="font-semibold text-slate-700">Dynamic Multi-User Identity System</span>
          </div>
        </div>

      </div>
    </div>
  );
};
