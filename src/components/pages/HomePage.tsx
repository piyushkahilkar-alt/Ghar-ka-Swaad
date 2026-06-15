import { PageType } from '../../App';
import { BRAND_DATA } from '../../constants';
import { motion } from 'motion/react';
import { CheckCircle2, Star, ArrowRight, Clock, Utensils, Heart, MapPin } from 'lucide-react';
import { logoBase64 } from '../../assets/logoBase64';
import { useSEO } from '../../utils/useSEO';

interface HomePageProps {
  onNavigate: (page: PageType) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  useSEO({
    title: 'Ghar Ka Swaad - Home Cooked Tiffin Service in Nagpur',
    description: 'Looking for the best tiffin service in Nagpur? Ghar Ka Swaad delivers 100% authentic, affordable, and healthy homemade veg food directly to your location.',
    keywords: 'tiffin service nagpur, best tiffin service in nagpur, homemade food nagpur, veg tiffin service nagpur, lunch box delivery',
    canonicalUrl: 'https://gharkaswaadngp.vercel.app/',
    schema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [{
        "@type": "Question",
        "name": "Can I customize my meals?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We offer a variety of addons and options to replace sabzi or roti with other items. You can chat with us and let us know your preferences."
        }
      }, {
        "@type": "Question",
        "name": "How do I pay?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We accept Razorpay for online payments, which supports Google Pay, PhonePe, Paytm, cards, and net banking."
        }
      }, {
        "@type": "Question",
        "name": "Do you deliver to my area?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We currently deliver to most major areas within Nagpur. If you are unsure, please reach out via our AI Chat below or WhatsApp."
        }
      }, {
        "@type": "Question",
        "name": "Can I cancel my subscription?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can pause or cancel your subscription anytime from your dashboard."
        }
      }]
    }
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden">
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
              className="flex flex-col items-center"
            >
               <span className="inline-block py-2 px-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full text-sm sm:text-base font-bold tracking-wider uppercase mb-2 shadow-lg backdrop-blur-md border border-white/20">
                 🎓 KDK College Student Special & 🔥 ₹59 Trial
               </span>
               <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                 <p className="text-white text-lg sm:text-xl font-bold drop-shadow-md bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm">
                   Get ₹100 OFF on Monthly Tiffin Plans
                 </p>
                 <p className="text-white text-lg sm:text-xl font-bold drop-shadow-md bg-brand-primary/80 px-3 py-1 rounded-lg backdrop-blur-sm">
                   🔥 Trial Meal for ₹59
                 </p>
               </div>
               <p className="text-white/80 text-xs sm:text-sm font-medium mb-6 backdrop-blur-sm drop-shadow-md">
                 Valid only for verified KDK College students with a valid Student ID Card. ⭐ Upload Proof & Unlock Discount.
               </p>
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
              className="text-xl md:text-3xl text-gray-200 font-serif mb-10 max-w-3xl drop-shadow-lg"
            >
              "घर जैसा खाना, रोज आपके दरवाजे तक" <br/>
              <span className="text-base md:text-xl font-sans text-gray-300 mt-5 block uppercase tracking-wider font-semibold">Nagpur's most trusted home-cooked meal subscription</span>
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

      {/* KDK Student Offer Section */}
      <section className="py-12 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 relative group"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
            <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200">
                  Limited Time
                </span>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">KDK Exclusive Student Offer</h3>
                <ul className="space-y-3 mb-6">
                  {[
                    "₹100 Instant Discount",
                    "Homemade Food",
                    "Daily Fresh Meals",
                    "Student Friendly Pricing",
                    "Verification via College ID Card"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700 font-medium font-sans">
                      <CheckCircle2 size={18} className="text-green-500 mr-3 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:w-auto flex flex-col items-center">
                 <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center mb-6 w-full shadow-sm">
                   <p className="text-sm text-gray-500 font-bold uppercase mb-1">Save Up To</p>
                   <p className="text-5xl font-black text-brand-primary">₹100<span className="text-2xl">/mo</span></p>
                 </div>
                 <button 
                  onClick={(e) => { e.preventDefault(); onNavigate('plans'); }}
                  className="w-full py-4 px-8 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-dark transition-all shadow-md hover:shadow-xl active:scale-95"
                 >
                   Claim Student Offer
                 </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-orange-100 relative group"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-yellow-500"></div>
            <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 border border-orange-200">
                  🔥 Student & Community Trial Offer
                </span>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-2">Try Ghar Ka Swaad for Just ₹59</h3>
                <p className="text-gray-500 font-medium mb-4">Complete the required steps and unlock the discounted trial meal.</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-700 font-medium font-sans">
                    <CheckCircle2 size={18} className="text-orange-500 mr-3 flex-shrink-0" /> Follow our Instagram page
                  </li>
                  <li className="flex items-center text-gray-700 font-medium font-sans">
                    <CheckCircle2 size={18} className="text-orange-500 mr-3 flex-shrink-0" /> Share our story/post on Instagram
                  </li>
                  <li className="flex items-center text-gray-700 font-medium font-sans">
                    <CheckCircle2 size={18} className="text-orange-500 mr-3 flex-shrink-0" /> Submit proof screenshots
                  </li>
                </ul>
              </div>
              <div className="w-full md:w-auto flex flex-col items-center">
                 <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 text-center mb-6 w-full shadow-sm relative overflow-hidden">
                   <div className="absolute -top-3 -right-3 text-red-500/10 rotate-12"><Star size={100} fill="currentColor" /></div>
                   <p className="text-sm text-gray-500 font-bold uppercase mb-1 line-through">Original: ₹79</p>
                   <p className="text-5xl font-black text-orange-600 relative z-10">₹59<span className="text-2xl"></span></p>
                 </div>
                 <button 
                  onClick={(e) => { e.preventDefault(); onNavigate('plans'); }}
                  className="w-full py-4 px-8 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md hover:shadow-xl active:scale-95"
                 >
                   Unlock Trial Offer
                 </button>
              </div>
            </div>
          </motion.div>
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
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white border-y border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
              Coverage
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-extrabold mb-6 tracking-tight text-gray-900">
              Delivery Areas in <span className="text-brand-primary">Nagpur</span>
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-brand-primary to-orange-400 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-600 text-lg leading-relaxed">
              We bring fresh, hot, and hygienic ghar jaisa khana right to your doorstep across major locations.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            {BRAND_DATA.locations.map((loc, idx) => (
              <motion.div
                key={loc}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white group overflow-hidden relative border border-gray-200 hover:border-brand-primary text-gray-800 px-6 py-5 rounded-2xl shadow-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-brand-primary/30 cursor-pointer transition-all duration-300 flex items-center justify-between"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary/10 group-hover:bg-brand-primary transition-colors"></div>
                <span className="font-bold text-gray-800 group-hover:text-brand-primary transition-colors z-10">{loc}</span>
                <MapPin size={20} className="text-gray-400 group-hover:text-brand-primary transition-colors z-10 opacity-50 group-hover:opacity-100" />
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
             <div className="text-white/80 font-serif text-lg leading-tight text-center sm:text-left">
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
                <p className="text-gray-700 font-serif text-lg mb-6">"{t.review}"</p>
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

      {/* FAQ Section */}
      <section className="py-24 bg-white hidden sm:block">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500">Got questions? We've got answers.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-2">Can I customize my meals?</h3>
              <p className="text-gray-600">Yes! We offer a variety of addons and options to replace sabzi or roti with other items. You can chat with us and let us know your preferences.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-2">How do I pay?</h3>
              <p className="text-gray-600">We accept Razorpay for online payments, which supports Google Pay, PhonePe, Paytm, cards, and net banking.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-2">Do you deliver to my area?</h3>
              <p className="text-gray-600">We currently deliver to most major areas within Nagpur. If you are unsure, please reach out via our AI Chat below or WhatsApp.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-600">Yes, you can pause or cancel your subscription anytime from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
