import { useState } from 'react';
import { motion } from 'motion/react';
import { BRAND_DATA } from '../../constants';
import { MapPin } from 'lucide-react';

export default function RegisterPage({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    const isNumber = /^\d+$/.test(phoneOrEmail);
    if (isNumber && phoneOrEmail.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    // Location check
    if (!city.toLowerCase().includes('nagpur')) {
      setError('Sorry, our service is currently available only in Nagpur.');
      return;
    }

    // Simulate OTP sent
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(`OTP sent successfully to ${phoneOrEmail}`);
      setStep(2);
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (otp.length < 4) {
      setError('Please enter a valid OTP (any 4 digits for demo)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phoneOrEmail, password })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      setCity("Detecting...");
      navigator.geolocation.getCurrentPosition(
        () => {
          // Simulation for demo purposes since precise reverse geocoding requires an API
          setCity("Nagpur");
        },
        () => {
          setCity("");
          setError("Could not detect location. Please enter manually.");
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
          <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm mb-6 border border-green-100 font-medium">
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number or Email</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                placeholder="e.g. 9876543210 or email@example.com"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current City</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full pl-4 pr-32 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                  placeholder="e.g. Nagpur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={handleDetectLocation}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-lg hover:bg-brand-primary/20 flex items-center gap-1 transition-colors"
                >
                  <MapPin size={14} /> Detect
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-dark shadow-lg hover:shadow-xl transition-all disabled:opacity-70 mt-4 active:scale-[0.98]"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 text-center">
              <p className="text-gray-600 mb-4 text-sm">Please enter the One-Time Password sent to <strong className="text-gray-900 block mt-1">{phoneOrEmail}</strong></p>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full px-4 py-4 text-center tracking-[0.5em] font-mono text-2xl rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 shadow-inner"
                placeholder="0000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <p className="text-xs text-brand-primary mt-4 cursor-pointer hover:underline" onClick={() => setStep(1)}>
                Change contact details
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
