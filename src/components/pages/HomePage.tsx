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
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img 
            initial={{ scale: 1, x: 0, y: 0 }}
            animate={{ scale: 1.15, x: "-1%", y: "1%" }}
            transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=100&w=2676" 
            alt="Delicious Indian Tiffin Meals"
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay for modern look and text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-900/60 to-gray-950/90"></div>
          {/* Subtle warm tint to match food branding */}
          <div className="absolute inset-0 bg-amber-900 mix-blend-multiply opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center text-center mt-8">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
               <span className="inline-block py-2 px-6 bg-brand-accent/90 text-white rounded-full text-sm sm:text-base font-bold tracking-widest uppercase mb-6 shadow-lg backdrop-blur-md">
                 ₹50 OFF First Week
               </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl sm:text-6xl md:text-8xl font-serif font-bold text-white leading-[1.1] md:leading-[1.0] mb-6 drop-shadow-2xl"
            >
               Best <span className="text-brand-accent">Tiffin Service</span><br/> in Nagpur
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-3xl text-gray-200 font-serif italic mb-10 max-w-3xl drop-shadow-lg"
            >
              "घर जैसा खाना, रोज आपके दरवाजे तक" <br/>
              <span className="text-base md:text-xl font-sans not-italic text-gray-300 mt-5 block uppercase tracking-wider font-semibold">Nagpur's most trusted home-cooked meal subscription</span>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 w-full px-4 sm:px-0"
            >
              <a 
                href="/plans"
                onClick={(e) => { e.preventDefault(); onNavigate('plans'); }}
                className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-brand-accent text-white rounded-xl font-bold text-lg sm:text-xl hover:bg-brand-accent/90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group shadow-2xl shadow-brand-accent/30"
                title="View Tiffin Plans in Nagpur"
              >
                View Plans <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </a>
              <a 
                href="/menu"
                onClick={(e) => { e.preventDefault(); onNavigate('menu'); }}
                className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg sm:text-xl hover:bg-white/20 border border-white/20 hover:border-white/40 hover:scale-105 active:scale-95 transition-all shadow-xl"
                title="View Today's Tiffin Menu in Nagpur"
              >
                Today's Menu
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 uppercase tracking-tight">Why Choose Our Tiffin Service?</h2>
            <div className="w-24 h-1 bg-brand-primary mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">We bring the warmth and taste of home kitchens to your table, with every meal prepared with love and care.</p>
          </motion.div>

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
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 uppercase tracking-tight text-gray-900">Tiffin Delivery Areas in Nagpur</h2>
            <div className="w-16 h-1 bg-brand-accent mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">We currently deliver our fresh tiffins to these major locations in Nagpur and nearby areas.</p>
          </motion.div>
          
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
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8">
            Start your Tiffin subscription today &<br className="hidden md:block" /> never worry about food again
          </h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
             <a 
               href="/plans"
               onClick={(e) => { e.preventDefault(); onNavigate('plans'); }}
               className="bg-white text-brand-accent px-10 py-5 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
             >
               SUBSCRIBE NOW
             </a>
             <div className="text-white/80 font-serif italic text-lg leading-tight text-center sm:text-left">
               “Refer & Earn ₹100 for every friend who joins!”
             </div>
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-brand-secondary">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif font-bold mb-2">Loved by Nagpurians</h2>
            <p className="text-gray-500">Real taste, real reviews from our happy subscribers.</p>
          </motion.div>

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
