import { PageType } from '../../App';
import { BRAND_DATA } from '../../constants';
import { motion } from 'motion/react';
import { CheckCircle2, Star, ArrowRight, Clock, Utensils, Heart } from 'lucide-react';
import { logoBase64 } from '../../assets/logoBase64';

interface HomePageProps {
  onNavigate: (page: PageType) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-end md:justify-center overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=2000" 
            alt="Traditional Indian Food"
            className="absolute w-full h-full object-cover opacity-10"
          />
          <img 
            src={logoBase64} 
            alt="Background Logo" 
            className="absolute w-[120%] md:w-[80%] max-w-[800px] object-contain opacity-10 rotate-[-5deg]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary via-brand-secondary/90 to-brand-secondary/40"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
               <span className="inline-block py-1 px-3 bg-brand-accent/10 text-brand-accent rounded-full text-sm font-bold tracking-widest uppercase mb-4">
                 ₹50 OFF First Week
               </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-6xl md:text-8xl font-serif font-bold text-gray-900 leading-[0.95] mb-6"
            >
               Best <span className="text-brand-accent">Tiffin Service</span> in Nagpur
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-700 font-serif italic mb-8 max-w-xl"
            >
              "घर जैसा खाना, रोज आपके दरवाजे तक" — Nagpur's most trusted home-cooked meal subscription.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={() => onNavigate('plans')}
                className="px-8 py-4 bg-brand-accent text-white rounded-xl font-bold text-lg hover:bg-brand-accent/90 transition-all flex items-center gap-2 group shadow-xl shadow-brand-accent/20"
              >
                View Plans <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigate('menu')}
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-50 border border-gray-200 transition-all shadow-lg"
              >
                Today's Menu
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 uppercase tracking-tight">Why Choose Our Tiffin Service?</h2>
            <div className="w-24 h-1 bg-brand-primary mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">We bring the warmth and taste of home kitchens to your table, with every meal prepared with love and care.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BRAND_DATA.features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-brand-secondary border border-black/5 hover:border-brand-primary/20 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary mb-6 shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                   {feature.title === 'Fresh Ingredients' && <Heart size={24} />}
                   {feature.title === 'Hygienic Kitchen' && <CheckCircle2 size={24} />}
                   {feature.title === 'On-time Delivery' && <Clock size={24} />}
                   {feature.title === 'Custom Plans' && <Utensils size={24} />}
                </div>
                <h3 className="text-xl font-serif font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20 bg-brand-secondary border-y border-brand-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 uppercase tracking-tight text-gray-900">Tiffin Delivery Areas in Nagpur</h2>
            <div className="w-16 h-1 bg-brand-accent mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">We currently deliver our fresh tiffins to these major locations in Nagpur and nearby areas.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {BRAND_DATA.locations.slice(0, 10).map((loc, idx) => (
              <motion.div
                key={loc}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border-2 border-brand-primary/20 text-brand-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-brand-primary hover:text-white transition-colors cursor-default shadow-sm"
              >
                {loc}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-accent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8">
            Start your Tiffin subscription today &<br className="hidden md:block" /> never worry about food again
          </h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
             <button 
               onClick={() => onNavigate('plans')}
               className="bg-white text-brand-accent px-10 py-5 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
             >
               SUBSCRIBE NOW
             </button>
             <div className="text-white/80 font-serif italic text-lg leading-tight text-center sm:text-left">
               “Refer & Earn ₹100 for every friend who joins!”
             </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-brand-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-2">Loved by Nagpurians</h2>
            <p className="text-gray-500">Real taste, real reviews from our happy subscribers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BRAND_DATA.testimonials.map((t, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm relative"
              >
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-gray-700 font-serif text-lg italic mb-6">"{t.review}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-10 h-10 object-cover rounded-full border-2 border-brand-primary/20" />
                  <div>
                    <h4 className="font-bold text-sm">{t.name}</h4>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Happy Customer</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
