import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BRAND_DATA } from '../../constants';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../utils/firestoreError';

export default function LoginPage({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // Initialize recaptcha when component mounts
    const verifier = new RecaptchaVerifier(auth, 'login-recaptcha-container', {
      'size': 'invisible',
    });
    window.recaptchaVerifier = verifier;

    return () => {
      verifier.clear();
      window.recaptchaVerifier = null;
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    try {
      const phoneNumber = `+91${cleanPhone}`;
      const appVerifier = window.recaptchaVerifier;
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      if (window.recaptchaVerifier) {
         window.recaptchaVerifier.render().then((widgetId: any) => {
           (window as any).grecaptcha.reset(widgetId);
         });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error("No OTP confirmation result found. Try sending OTP again.");
      }

      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
           throw new Error('User not registered. Please register first.');
        }

        const userData = userDoc.data();
        
        // Also fetch token from mock backend to keep Dashboard API working
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phoneOrEmail: user.phoneNumber || phone, 
            password: user.uid 
          })
        });

        const data = await res.json();
        
        if (res.ok) {
           localStorage.setItem('token', data.token);
        }

        localStorage.setItem('user', JSON.stringify({ uid: user.uid, phone: user.phoneNumber, ...userData }));
      } catch (err: any) {
        if (err.message === 'User not registered. Please register first.') {
          throw err;
        }
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }
      
      onNavigate('dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid OTP or login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-secondary/30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-brand-primary/10"
      >
        <div id="login-recaptcha-container"></div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Login to your Ghar Ka Swaad account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 py-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 shadow-sm">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  className="flex-1 w-full px-4 py-3 rounded-r-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-dark shadow-lg hover:shadow-xl transition-all disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
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
              disabled={loading}
              className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-dark shadow-lg hover:shadow-xl transition-all disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button onClick={() => onNavigate('register')} className="text-brand-primary font-bold hover:underline">
              Register here
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
