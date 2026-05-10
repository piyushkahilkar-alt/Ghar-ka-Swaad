import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BRAND_DATA } from '../../constants';
import { loginUser, signInWithGoogle, loginWithEmailOTP } from '../../firebase';
import emailjs from '@emailjs/browser';

export default function LoginPage({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [loginMethod, setLoginMethod] = useState<'email' | 'email_otp'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginMethod === 'email') {
      if (!email || !password) {
        setError('Please provide both email and password.');
        return;
      }
      setLoading(true);
      try {
        const { user, userData } = await loginUser(email, password, rememberMe);
        processLoginSuccess(user, userData);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
           setError('Invalid email or password');
        } else {
           setError(err.message || 'Login failed');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Email OTP Logic
      if (!otpSent) {
        if (!email) {
          setError('Please provide a valid email address.');
          return;
        }
        setLoading(true);
        try {
          const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedOTP(newOtp);
          await emailjs.send(
            "service_vkbkgck", // ⚠️ Please replace with your actual EmailJS Service ID
            "template_clksozt", // ⚠️ Please replace with your actual EmailJS Template ID
            {
              email: email,
              otp: newOtp,
            },
            "nTUZKHUOCZ3MpdmFQ"
          );
          setOtpSent(true);
          setError('');
          alert("OTP Sent Successfully");
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Failed to send OTP to email.');
        } finally {
          setLoading(false);
        }
      } else {
        if (!otp || otp.length < 6) {
          setError('Please enter a valid 6-digit OTP.');
          return;
        }
        if (otp === generatedOTP) {
            setLoading(true);
            try {
              const { user, userData } = await loginWithEmailOTP(email);
              processLoginSuccess(user, userData);
            } catch (err: any) {
              console.error(err);
              setError('Failed to authenticate with Firebase after OTP matched.');
            } finally {
              setLoading(false);
            }
        } else {
            setError('Invalid OTP');
            alert("Invalid OTP");
        }
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { user, userData } = await signInWithGoogle();
      processLoginSuccess(user, userData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const processLoginSuccess = (user: any, userData: any) => {
    // Fast login - set token and user in storage instantly
    const dummyToken = `dummy-token-${user.uid}`;
    const userDataStr = JSON.stringify({ uid: user.uid, email: user.email, ...userData });
    
    if (rememberMe) {
      localStorage.setItem('token', dummyToken);
      localStorage.setItem('user', userDataStr);
    } else {
      sessionStorage.setItem('token', dummyToken);
      sessionStorage.setItem('user', userDataStr);
    }
    
    onNavigate('dashboard');
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
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Login to your Ghar Ka Swaad account</p>
        </div>

        <div className="flex mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setLoginMethod('email'); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === 'email' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod('email_otp'); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === 'email_otp' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Email OTP
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
            {loginMethod === 'email' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                {!otpSent ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm text-center tracking-widest text-lg font-bold"
                      placeholder="------"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-dark shadow-lg hover:shadow-xl transition-all disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? 'Please wait...' : (loginMethod === 'email_otp' && !otpSent ? 'Send OTP' : 'Login')}
            </button>
          </form>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="border-t border-gray-200 flex-grow"></div>
          <span className="text-gray-400 text-sm">or</span>
          <div className="border-t border-gray-200 flex-grow"></div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-3 transition-colors disabled:opacity-70"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        </div>

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
