/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { BRAND_DATA } from './constants';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './components/pages/HomePage';
import FoodLoader from './components/ui/FoodLoader';
import EnquiryModal from './components/ui/EnquiryModal';
import { Analytics } from '@vercel/analytics/react';

// Lazy loading pages for better performance
const PlansPage = lazy(() => import('./components/pages/PlansPage'));
const MenuPage = lazy(() => import('./components/pages/MenuPage'));
const AboutPage = lazy(() => import('./components/pages/AboutPage'));
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const TrackOrderPage = lazy(() => import('./components/pages/TrackOrderPage'));
const LoginPage = lazy(() => import('./components/pages/LoginPage'));
const RegisterPage = lazy(() => import('./components/pages/RegisterPage'));
const DashboardPage = lazy(() => import('./components/pages/DashboardPage'));

export type PageType = 'home' | 'about' | 'plans' | 'menu' | 'contact' | 'track' | 'login' | 'register' | 'dashboard';

const getInitialPage = (): PageType => {
  const path = window.location.pathname.replace('/', '') as PageType;
  const validPages: PageType[] = ['home', 'about', 'plans', 'menu', 'contact', 'track', 'login', 'register', 'dashboard'];
  if (validPages.includes(path)) {
    return path;
  }
  return 'home';
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>(getInitialPage);
  const [isAuthChecking, setIsAuthChecking] = useState(() => !localStorage.getItem('user') && !sessionStorage.getItem('user'));
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  // Sync URL with current page state
  useEffect(() => {
    const currentPath = window.location.pathname.replace('/', '');
    const newPath = currentPage === 'home' ? '/' : `/${currentPage}`;
    if (currentPath !== currentPage && !(currentPath === '' && currentPage === 'home')) {
      window.history.pushState({}, '', newPath);
    }
  }, [currentPage]);

  // Handle browser back and forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Auth state listener for preserving session
  useEffect(() => {
    let unsubscribe: any = null;
    
    const initAuthListener = async () => {
      try {
        const { auth, db } = await import('./firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        const { doc, getDoc } = await import('firebase/firestore');

        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Determine the storage type for this user session based on where token currently is
            // If they just logged in without remember me, token will be in sessionStorage.
            // If it's a new page load with session persistence, user will be logged in but we need to put token in session
            // As a heuristic: if we have a sessionStorage token, or if we don't have a localStorage token.
            const useSession = !!sessionStorage.getItem('token') || (!localStorage.getItem('token') && !localStorage.getItem('user'));
            const storage = useSession ? sessionStorage : localStorage;

            // Only fetch if we don't have it in storage to speed up initial load
            if (!storage.getItem('user')) {
              try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                  storage.setItem('user', JSON.stringify({ uid: user.uid, email: user.email, ...userDoc.data() }));
                }
              } catch (e: any) {
                console.error("Could not fetch user data", e);
                if (e.message && e.message.includes('offline')) {
                   console.warn("Client is offline, running with local authentication only.");
                }
              }
            }
            storage.setItem('token', `dummy-token-${user.uid}`);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            // If they are on a protected page, kick them to login
            if (currentPage === 'dashboard') {
              setCurrentPage('login');
            }
          }
          setIsAuthChecking(false);
        });
      } catch (e) {
        console.error("Error loading auth", e);
        setIsAuthChecking(false);
      }
    };

    initAuthListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentPage]);

  const renderPage = () => {
    if (isAuthChecking && currentPage === 'dashboard') {
      return (
        <div className="flex h-screen items-center justify-center">
          <FoodLoader />
        </div>
      );
    }

    let PageComponent;
    switch (currentPage) {
      case 'home':
        PageComponent = <HomePage onNavigate={setCurrentPage} />;
        break;
      case 'about':
        PageComponent = <AboutPage />;
        break;
      case 'plans':
        PageComponent = <PlansPage onNavigate={setCurrentPage} />;
        break;
      case 'menu':
        PageComponent = <MenuPage />;
        break;
      case 'contact':
        PageComponent = <ContactPage />;
        break;
      case 'track':
        PageComponent = <TrackOrderPage />;
        break;
      case 'login':
        PageComponent = <LoginPage onNavigate={setCurrentPage} />;
        break;
      case 'register':
        PageComponent = <RegisterPage onNavigate={setCurrentPage} />;
        break;
      case 'dashboard':
        PageComponent = <DashboardPage onNavigate={setCurrentPage} />;
        break;
      default:
        PageComponent = <HomePage onNavigate={setCurrentPage} />;
        break;
    }

    return (
      <Suspense fallback={<FoodLoader />}>
        {PageComponent}
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-primary selection:text-white overflow-x-hidden">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="flex-grow pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={setCurrentPage} />
      
      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsEnquiryModalOpen(true)}
          className="bg-brand-primary text-white px-6 py-4 rounded-full shadow-2xl hover:bg-brand-dark transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 font-bold border-2 border-white"
        >
          <span className="hidden sm:inline">Order Now</span>
          <span className="sm:hidden">Enquiry</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      <EnquiryModal 
        isOpen={isEnquiryModalOpen} 
        onClose={() => setIsEnquiryModalOpen(false)} 
      />

      <Analytics />
      <Toaster position="top-right" />
    </div>
  );
}

