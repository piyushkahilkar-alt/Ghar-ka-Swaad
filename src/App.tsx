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
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
        {/* Call Button */}
        <a
              href={`tel:${BRAND_DATA.brand.phone.replace(/[^0-9+]/g, '')}`}
              className="bg-brand-accent text-white p-4 rounded-full shadow-2xl hover:bg-opacity-90 transition-all hover:scale-110 active:scale-95 group flex items-center justify-center"
              aria-label="Call Customer Care"
            >
              <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md hidden sm:block">
                Call Customer Care
              </span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
            
            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${BRAND_DATA.brand.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110 active:scale-95 group flex items-center justify-center"
              aria-label="Contact on WhatsApp"
            >
              <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md hidden sm:block">
                Order on WhatsApp
              </span>
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
      </div>
      <Analytics />
      <Toaster position="top-right" />
    </div>
  );
}

