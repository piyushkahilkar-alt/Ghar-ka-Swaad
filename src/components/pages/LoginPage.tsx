import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BRAND_DATA } from '../../constants';
import { loginUser } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../utils/firestoreError';

export default function LoginPage({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-flight validation
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      const { user, userData } = await loginUser(email, password, rememberMe);

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
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
         setError('Invalid email or password');
         alert('Invalid email or password. Please try again.');
      } else {
         setError(err.message || 'Login failed');
         alert(err.message || 'Login failed');
      }
      try { handleFirestoreError(err, OperationType.GET, 'users/login'); } catch(e) {}
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
        <div ></div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Login to your Ghar Ka Swaad account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

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
