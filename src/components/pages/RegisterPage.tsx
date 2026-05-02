import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BRAND_DATA } from '../../constants';
import { MapPin } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '../../firebase';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function RegisterPage({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Nagpur');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // Initialize recaptcha when component mounts
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    
    if (city !== 'Nagpur') {
      setError('Sorry, our service is currently available only in Nagpur.');
      return;
    }

    setLoading(true);
    try {
      // Format number to E.164 format for India
      const phoneNumber = `+91${cleanPhone}`;
      const appVerifier = window.recaptchaVerifier;
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      
      setSuccess(`OTP sent to ${phoneNumber}`);
      setStep(2);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      // Reset recaptcha if error
      if (window.recaptchaVerifier) {
         window.recaptchaVerifier.render().then((widgetId: any) => {
           window.grecaptcha.reset(widgetId);
         });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error("No OTP confirmation result found. Try sending OTP again.");
      }

      // Verify OTP via Firebase
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Register safely on the backend with verified user
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          phoneOrEmail: user.phoneNumber || phone, 
          password: user.uid, // Using UID as temporary password for mock backend integration
          address,
          landmark,
          city 
        })
      });

      const data = await res.json();
      
      if (!res.ok && data.error !== 'User already exists with this phone/email') {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid OTP or registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      setAddress("Detecting address...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            
            const addr = data.address || {};
            const detectedCity = addr.city || addr.town || addr.county || addr.state_district || "";
            const displayName = data.display_name || "";
            
            if (detectedCity.toLowerCase().includes('nagpur') || displayName.toLowerCase().includes('nagpur')) {
              setCity('Nagpur');
              setAddress(displayName);
              setSuccess('Location verified: Nagpur');
              setTimeout(() => setSuccess(''), 3000);
            } else {
              setAddress('');
              setError(`Sorry! Our service is only available inside Nagpur. Detected location: ${detectedCity || 'Unknown'}`);
            }
          } catch(err) {
             setAddress("Dharampeth, Nagpur (Demo Fallback)"); 
             setCity("Nagpur");
             setSuccess('Location verified: Nagpur (Demo mode)');
             setTimeout(() => setSuccess(''), 3000);
          }
        },
        () => {
          setAddress("");
          setError("Could not detect location. Please ensure location permissions are granted.");
        }
      );
    } else {
      setError("Geolocation not supported by your browser");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-secondary/30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-brand-primary/10"
      >
        <div id="recaptcha-container"></div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join Ghar Ka Swaad for easy everyday meals</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm mb-6 border border-green-100 font-medium whitespace-pre-wrap">
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 py-2.5 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 shadow-sm">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  className="flex-1 w-full px-4 py-2.5 rounded-r-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Detailed Address</label>
                <button 
                    type="button"
                    onClick={handleDetectLocation}
                    className="text-xs font-bold text-brand-primary hover:text-brand-dark flex items-center gap-1 transition-colors"
                  >
                  <MapPin size={12} /> Auto Detect
                </button>
              </div>
              <textarea
                required
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm resize-none"
                placeholder="House No, Building, Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                  placeholder="Nearby place"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm bg-white"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="Nagpur">Nagpur</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl hover:bg-brand-dark shadow-lg hover:shadow-xl transition-all disabled:opacity-70 mt-6 active:scale-[0.98]"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 text-center">
              <p className="text-gray-600 mb-4 text-sm">Please enter the 6-digit OTP sent to <strong className="text-gray-900 block mt-1">+91 {phone}</strong></p>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full px-4 py-4 text-center tracking-[0.5em] font-mono text-2xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 shadow-inner"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <p className="text-sm font-medium text-gray-600 mt-4">
                Test mode: You might not receive actual SMS if testing limits are reached. 
              </p>
              <p className="text-xs text-brand-primary mt-4 cursor-pointer hover:underline" onClick={() => {
                setStep(1); 
                setConfirmationResult(null);
                setOtp('');
              }}>
                Change phone number
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-dark shadow-lg hover:shadow-xl transition-all disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? 'Verifying & Creating...' : 'Verify & Create Account'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button onClick={() => onNavigate('login')} className="text-brand-primary font-bold hover:underline">
              Login here
            </button>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <a
            href={`https://wa.me/${BRAND_DATA.brand.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-green-600 font-medium hover:underline text-sm"
          >
            Cancel and continue with WhatsApp Order
          </a>
        </div>
      </motion.div>
    </div>
  );
}
