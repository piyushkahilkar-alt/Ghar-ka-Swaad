import { PageType } from '../../App';
import { BRAND_DATA } from '../../constants';
import { Menu, X, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { logoBase64 } from '../../assets/logoBase64';

interface NavbarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoggedIn = !!localStorage.getItem('user');

  const navItems: { label: string; value: PageType }[] = [
    { label: 'Home', value: 'home' },
    { label: 'Plans', value: 'plans' },
    { label: 'Menu', value: 'menu' },
    { label: 'Contact', value: 'contact' },
    ...(isLoggedIn 
      ? [{ label: 'Dashboard', value: 'dashboard' as PageType }] 
      : [{ label: 'Login', value: 'login' as PageType }])
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-brand-secondary/90 backdrop-blur-md z-40 border-b border-brand-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 md:h-24 items-center">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center group transition-all"
          >
            <img 
              src={logoBase64} 
              alt="Ghar Ka Swaad Logo" 
              className="h-16 md:h-[75px] w-auto object-contain"
            />
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onNavigate(item.value)}
                className={`text-sm font-medium transition-colors hover:text-brand-primary ${
                  currentPage === item.value ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => onNavigate('plans')}
              className="bg-brand-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-primary/90 transition-all active:scale-95"
            >
              Order Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-4 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                onNavigate(item.value);
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg text-base font-medium ${
                currentPage === item.value ? 'bg-brand-secondary text-brand-primary' : 'text-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onNavigate('plans');
              setIsMobileMenuOpen(false);
            }}
            className="block w-full bg-brand-primary text-white px-4 py-3 rounded-xl text-center font-bold"
          >
            Order Now
          </button>
        </div>
      )}
    </nav>
  );
}
