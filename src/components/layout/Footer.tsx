import { PageType } from '../../App';
import { BRAND_DATA } from '../../constants';
import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import { logoBase64 } from '../../assets/logoBase64';

interface FooterProps {
  onNavigate: (page: PageType) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-brand-dark text-orange-100 py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="mb-8 inline-block bg-white p-2 rounded-xl shadow-lg border-2 border-white/20">
            <img 
              src={logoBase64} 
              alt="Ghar Ka Swaad Logo" 
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>
          <p className="text-sm leading-relaxed mb-6 font-medium">
            {BRAND_DATA.brand.tagline}. Delivering fresh, hygienic, and affordable home-cooked meals across Nagpur.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 flex items-center justify-center text-white bg-brand-primary rounded-full hover:bg-brand-primary/80 transition-colors"><Instagram size={18} /></a>
            <a href="#" className="w-10 h-10 flex items-center justify-center text-white bg-brand-primary rounded-full hover:bg-brand-primary/80 transition-colors"><Facebook size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-serif font-bold mb-6 text-2xl drop-shadow-sm">Quick Links</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Home</button></li>
            <li><button onClick={() => onNavigate('plans')} className="hover:text-white transition-colors">Subscription Plans</button></li>
            <li><button onClick={() => onNavigate('menu')} className="hover:text-white transition-colors">Weekly Menu</button></li>
            <li><button onClick={() => onNavigate('track')} className="hover:text-white transition-colors">Track Your Tiffin</button></li>
            <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact Us</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-serif font-bold mb-6 text-2xl drop-shadow-sm">Our Plans</h4>
          <ul className="space-y-4 text-sm font-medium">
            {BRAND_DATA.plans.map(plan => (
              <li key={plan.id}>
                <button onClick={() => onNavigate('plans')} className="hover:text-white transition-colors">
                  {plan.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-serif font-bold mb-6 text-2xl drop-shadow-sm">Contact Info</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-white flex-shrink-0 mt-0.5" />
              <span>{BRAND_DATA.brand.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-white flex-shrink-0" />
              <a href={`tel:${BRAND_DATA.brand.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors">
                 {BRAND_DATA.brand.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              {/* Using MessageCircle for WhatsApp */}
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              <a href={`https://wa.me/${BRAND_DATA.brand.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                 {BRAND_DATA.brand.whatsapp}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-white flex-shrink-0" />
              <a href={`mailto:${BRAND_DATA.brand.email}`} className="hover:text-white transition-colors">
                 {BRAND_DATA.brand.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-brand-primary/20 text-center text-xs text-orange-200">
        <p>&copy; {new Date().getFullYear()} {BRAND_DATA.brand.name}. All rights reserved. Designed for Nagpur Tiffins.</p>
      </div>
    </footer>
  );
}
