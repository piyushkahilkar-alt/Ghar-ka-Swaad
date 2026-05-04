import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BRAND_DATA } from '../../constants';
import { MapPin } from 'lucide-react';
import { signupUser } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../utils/firestoreError';

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

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
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
        setError('This email is already registered. Please login instead.');
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

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl hover:bg-brand-dark shadow-lg hover:shadow-xl transition-all disabled:opacity-70 mt-6 active:scale-[0.98]"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

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
