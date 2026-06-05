import { BRAND_DATA } from '../../constants';
import { motion } from 'motion/react';
import { Calendar, UtensilsCrossed, Soup, Beef } from 'lucide-react';
import { useSEO } from '../../utils/useSEO';

export default function MenuPage() {
  const days = Object.keys(BRAND_DATA.daily_menu) as (keyof typeof BRAND_DATA.daily_menu)[];

  useSEO({
    title: 'Daily Menu - Ghar Ka Swaad Tiffin Service Nagpur',
    description: 'Check out our weekly rotating menu of fresh, home-cooked pure veg tiffins in Nagpur. Delicious Dal, Sabzi, Roti, and Rice delivered daily.',
    keywords: 'tiffin menu nagpur, veg daily menu, office lunch menu nagpur, Ghar Ka Swaad menu, weekly meal plan',
    canonicalUrl: 'https://gharkaswaadngp.vercel.app/menu',
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
        "name": "Weekly Menu",
        "item": "https://gharkaswaadngp.vercel.app/menu"
      }]
    }
  });

  return (
    <div className="py-20 bg-brand-secondary min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Our Weekly Menu</h1>
          <p className="text-gray-600 text-lg">We rotate our menu every week to ensure you get variety. Here is the standard lineup for this month.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
           <div className="space-y-6">
              {days.map((day, idx) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-black/5 hover:border-brand-primary/20 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-brand-secondary rounded-2xl flex flex-col items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                       <span className="text-[10px] uppercase font-bold tracking-widest">{day.substring(0, 3)}</span>
                       <UtensilsCrossed size={20} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif font-bold capitalize mb-3 text-gray-900">{day}</h3>
                      <div className="flex flex-wrap gap-2.5">
                        {BRAND_DATA.daily_menu[day].map((item, i) => {
                           const isNV = item.includes('NV:');
                           const isJain = item.includes('Jain:');
                           let tagClass = 'bg-gray-100 text-gray-700';
                           if (isNV) tagClass = 'bg-red-50 text-red-700 font-bold border border-red-200';
                           if (isJain) tagClass = 'bg-green-50 text-green-700 font-bold border border-green-200';
                           
                           return (
                             <span 
                               key={i} 
                               className={`text-sm md:text-[15px] px-3 py-1 rounded-md font-medium font-sans capitalize ${tagClass}`}
                             >
                               {item}
                             </span>
                           );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {day === 'sunday' && (
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase px-2 py-1 rounded">Special Day</span>
                  )}
                </motion.div>
              ))}
           </div>

           <div className="lg:sticky lg:top-24 h-fit space-y-8">
              <div className="p-10 bg-brand-primary rounded-[3rem] text-white">
                 <h2 className="text-3xl font-serif font-bold mb-6">Quality Guarantee</h2>
                 <ul className="space-y-6">
                    <li className="flex gap-4">
                       <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Soup size={18} />
                       </div>
                       <div>
                          <h4 className="font-bold">Fresh Daily Dal</h4>
                          <p className="text-sm text-white/70">Our dal is prepared fresh for every meal using high-quality pulses.</p>
                       </div>
                    </li>
                    <li className="flex gap-4">
                       <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Beef size={18} />
                       </div>
                       <div>
                          <h4 className="font-bold">Organic Veggies</h4>
                          <p className="text-sm text-white/70">Local farm-fresh seasonal vegetables are picked daily.</p>
                       </div>
                    </li>
                    <li className="flex gap-4">
                       <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar size={18} />
                       </div>
                       <div>
                          <h4 className="font-bold">Timely Punctuality</h4>
                          <p className="text-sm text-white/70">Lunch by 1:00 PM and Dinner by 8:30 PM, guaranteed.</p>
                       </div>
                    </li>
                 </ul>
              </div>

              <div className="relative group overflow-hidden rounded-[3rem] aspect-video flex items-center justify-center">
                 <img 
                    src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                    alt="Healthy Indian salad and home cooked meals served fresh in a lunch box"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="relative text-white text-center p-8">
                     <h3 className="text-2xl font-serif font-bold mb-2">"Health is wealth, started from your plate."</h3>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
