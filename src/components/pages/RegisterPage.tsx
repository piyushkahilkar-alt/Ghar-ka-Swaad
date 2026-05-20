import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BRAND_DATA } from '../../constants';
import { MapPin } from 'lucide-react';
import { signupUser, loginUser, signInWithGoogle, requestEmailOTP, verifyEmailOTPFromFirestore, sendEmailOTP } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../utils/firestoreError';
import emailjs from '@emailjs/browser';

export default function RegisterPage({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Nagpur');
  const [mapLink, setMapLink] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const { user, userData, isNewUser } = await signInWithGoogle();
      
      const userDataToSave = {
        name: user.displayName || 'Customer',
        email: user.email,
        phone: user.phoneNumber || '',
        address: address || '',
        landmark: landmark || '',
        city: city || 'Nagpur',
        mapLink: mapLink || '',
        latitude: latitude || null,
        longitude: longitude || null
      };
      
      const dummyToken = `dummy-token-${user.uid}`;
      localStorage.setItem('token', dummyToken);
      localStorage.setItem('user', JSON.stringify({ uid: user.uid, ...userDataToSave }));

      setSuccess('Google Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        onNavigate('dashboard');
      }, 200);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Front-end validation
    if (!name || !email || !password || !address || !landmark) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (city !== 'Nagpur') {
      setError('Sorry, our service is currently available only in Nagpur.');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!otpSent) {
      setLoading(true);
      try {
        const newOtp = await requestEmailOTP(email);
        sendEmailOTP(email, newOtp).catch(console.error);
        
        setOtpSent(true);
        setSuccess('OTP sent to your email. Please check your inbox.');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        console.error("EmailJS Error:", err);
        setError('Failed to send OTP: ' + (err.text || err.message || JSON.stringify(err)));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!otp || otp.length < 6) {
        setError("Please provide the 6-digit OTP");
        return;
    }

    setLoading(true);
    try {
      // Very OTP from Firestore
      await verifyEmailOTPFromFirestore(email, otp);

      // Fast, database-once approach using modular function
      const userDataToSave = {
        name,
        email,
        phone,
        address,
        landmark,
        city,
        mapLink,
        latitude,
        longitude
      };
      
      const user = await signupUser(email, password, userDataToSave);

      // Create a dummy token to skip backend while maintaining flow
      const dummyToken = `dummy-token-${user.uid}`;
      localStorage.setItem('token', dummyToken);
      localStorage.setItem('user', JSON.stringify({ uid: user.uid, email, ...userDataToSave }));

      setSuccess('Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        onNavigate('dashboard');
      }, 200);
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        try {
          const { user: loggedInUser, userData } = await loginUser(email, password);
          const dummyToken = `dummy-token-${loggedInUser.uid}`;
          localStorage.setItem('token', dummyToken);
          localStorage.setItem('user', JSON.stringify({ uid: loggedInUser.uid, email, ...userData }));
          setSuccess('Account already exists. Logged you in securely!');
          setTimeout(() => {
            onNavigate('dashboard');
          }, 800);
        } catch(loginErr: any) {
          setError("Email already in use, but password doesn't match to login automatically. Please go to Login page.");
        }
      } else {
        setError(err.message || 'Registration failed');
      }
      try { handleFirestoreError(err, OperationType.WRITE, 'users/signup'); } catch(e) {}
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      setAddress("Detecting exact location...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            setLatitude(latitude);
            setLongitude(longitude);
            const googleMapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            setMapLink(googleMapLink);

            // Fetch address from Nominatim (Free open source Geocoder)
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
             setAddress("Location Detected, fetching address failed..."); 
             setCity("Nagpur");
             setSuccess('Location coordinates secured (Demo mode fallback)');
             setTimeout(() => setSuccess(''), 3000);
          }
        },
        () => {
          setAddress("");
          setError("Could not detect location. Please ensure location permissions are granted in your browser settings.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
        <div ></div>
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-brand-primary">*</span></label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm text-gray-900"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-brand-primary">*</span></label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm text-gray-900"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm text-center tracking-widest text-lg font-bold text-gray-900"
                  placeholder="------"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                   <button
                     type="button"
                     disabled={loading}
                     onClick={async () => {
                       setLoading(true);
                       try {
                         const newOtp = await requestEmailOTP(email);
                         sendEmailOTP(email, newOtp).catch(console.error);
                         setSuccess("New OTP request sent via Email");
                         setTimeout(() => setSuccess(''), 3000);
                       } catch (err: any) {
                         setError("Failed to resend OTP: " + (err.message || JSON.stringify(err)));
                       } finally {
                         setLoading(false);
                       }
                     }}
                     className="text-xs font-bold text-brand-primary hover:text-brand-dark transition-colors"
                   >
                     Resend OTP
                   </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl hover:bg-brand-dark shadow-lg hover:shadow-xl transition-all disabled:opacity-70 mt-6 active:scale-[0.98]"
            >
              {loading ? 'Please wait...' : (!otpSent ? 'Send OTP' : 'Verify & Create Account')}
            </button>
          </form>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="border-t border-gray-200 flex-grow"></div>
          <span className="text-gray-400 text-sm">or</span>
          <div className="border-t border-gray-200 flex-grow"></div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-3 transition-colors disabled:opacity-70"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>
        </div>

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
