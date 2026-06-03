import { BRAND_DATA } from '../../constants';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { useSEO } from '../../utils/useSEO';

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', phone: '', message: '' });
  const [isSent, setIsSent] = useState(false);

  useSEO({
    title: 'Contact Us - Ghar Ka Swaad Nagpur | Order Tiffin Online',
    description: 'Contact Ghar Ka Swaad for the best healthy homemade tiffin deliveries in Nagpur. Call or WhatsApp us to book a trial meal or customize your subscription.',
    keywords: 'contact tiffin service nagpur, Ghar Ka Swaad phone number, order tiffin online nagpur, tiffin service customer care',
    canonicalUrl: 'https://gharkaswaadngp.vercel.app/contact',
    schema: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://gharkaswaadngp.vercel.app/"
      },{
        "@type": "ListItem",
        "position": 2,
        "name": "Contact Us",
        "item": "https://gharkaswaadngp.vercel.app/contact"
      }]
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <div className="py-20 bg-brand-secondary min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Get In Touch</h1>
          <p className="text-gray-600 text-lg">Have questions about our service or want to custom order? Reach out to us anytime.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-xl">
             <h2 className="text-3xl font-serif font-bold mb-8">Send a Message</h2>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Piyush Kahilkar"
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="+91 82751-16821"
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    value={formState.phone}
                    onChange={(e) => setFormState({...formState, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Message</label>
                  <textarea 
                    rows={4} 
                    required 
                    placeholder="How can we help?"
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={isSent}
                  className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isSent ? 'bg-green-500 text-white' : 'bg-brand-primary text-white hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {isSent ? 'Message Sent!' : (
                    <>
                      Send Inquiry <Send size={18} />
                    </>
                  )}
                </button>
             </form>
          </div>

          <div className="space-y-8">
             <div className="bg-brand-primary p-12 rounded-[3rem] text-white">
                <h3 className="text-3xl font-serif font-bold mb-8">Contact Information</h3>
                <div className="space-y-6">
                   <a href={`tel:${BRAND_DATA.brand.phone.replace(/[^0-9+]/g, '')}`} className="flex gap-4 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Phone size={20} /></div>
                      <div>
                         <p className="text-xs uppercase opacity-60 mb-1">Call Us</p>
                         <p className="text-xl font-serif font-bold">{BRAND_DATA.brand.phone}</p>
                      </div>
                   </a>
                   <a href={`https://wa.me/${BRAND_DATA.brand.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex gap-4 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><MessageCircle size={20} /></div>
                      <div>
                         <p className="text-xs uppercase opacity-60 mb-1">WhatsApp</p>
                         <p className="text-xl font-serif font-bold">{BRAND_DATA.brand.whatsapp}</p>
                      </div>
                   </a>
                   {BRAND_DATA.brand.instagram && (
                   <a href={BRAND_DATA.brand.instagram} target="_blank" rel="noopener noreferrer" className="flex gap-4 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                         <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      </div>
                      <div>
                         <p className="text-xs uppercase opacity-60 mb-1">Instagram</p>
                         <p className="text-xl font-serif font-bold">@gharkaswaadngp</p>
                      </div>
                   </a>
                   )}
                   <a href={`mailto:${BRAND_DATA.brand.email}`} className="flex gap-4 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Mail size={20} /></div>
                      <div>
                         <p className="text-xs uppercase opacity-60 mb-1">Email</p>
                         <p className="text-xl font-serif font-bold">{BRAND_DATA.brand.email}</p>
                      </div>
                   </a>
                   <div className="flex gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><MapPin size={20} /></div>
                      <div>
                         <p className="text-xs uppercase opacity-60 mb-1">Kitchen Address</p>
                         <p className="text-xl font-serif font-bold">{BRAND_DATA.brand.address}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-10 bg-white rounded-[3rem] shadow-sm">
                <h4 className="font-serif font-bold text-xl mb-4 uppercase tracking-tighter">Quick Connect</h4>
                <p className="text-sm text-gray-500 mb-6">Need an instant response? Tap below to chat with us on WhatsApp.</p>
                <a 
                   href={`https://wa.me/${BRAND_DATA.brand.whatsapp.replace(/[^0-9]/g, '')}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center justify-center gap-3 bg-green-500 text-white font-bold py-4 rounded-2xl hover:bg-green-600 transition-colors"
                >
                   <MessageCircle size={20} /> CHAT ON WHATSAPP
                </a>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
