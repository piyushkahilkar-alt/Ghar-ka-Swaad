import { motion } from 'motion/react';
import { ChefHat, GraduationCap, Utensils, Clock, CheckCircle2, Award, Heart, ShieldCheck } from 'lucide-react';
import { useSEO } from '../../utils/useSEO';

export default function AboutPage() {
  useSEO({
    title: 'About Us | Ghar Ka Swaad - Authentic Homemade Tiffin Service Nagpur',
    description: 'Learn about the experts behind Ghar Ka Swaad. Founded by Head Chef Sunanda Kahilkar with 5+ years hotel experience and Digital Marketer Piyush Kahilkar.',
    keywords: 'about ghar ka swaad, best tiffin service founders, sunanda kahilkar chef, piyush kahilkar, home cooked food nagpur, hygiene tiffin',
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Section 1: Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-brand-primary">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745a872f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary to-transparent opacity-90"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 bg-white/20 text-white rounded-full text-sm font-bold tracking-wider uppercase mb-6 backdrop-blur-md border border-white/30">
               Our Story
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Restaurant Expertise,<br />Home-Made Love <span className="inline-block text-red-500 animate-pulse">❤️</span>
            </h1>
            <p className="text-lg md:text-2xl text-orange-50 font-medium">
              Meals prepared by an experienced hotel chef and delivered with the care of family.
            </p>
          </motion.div>
        </div>

        {/* Floating Badges */}
        <div className="absolute bottom-[-30px] left-0 w-full flex justify-center z-20">
            <div className="bg-white px-6 md:px-12 py-6 rounded-3xl shadow-xl flex flex-wrap justify-center gap-6 md:gap-12 mx-4 border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><Award size={24} /></div>
                    <span className="font-bold text-gray-800 text-sm md:text-base">5+ Years Hotel Exp.</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><Heart size={24} /></div>
                    <span className="font-bold text-gray-800 text-sm md:text-base">Authentic Taste</span>
                </div>
                <div className="flex items-center gap-3 hidden md:flex">
                    <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><ShieldCheck size={24} /></div>
                    <span className="font-bold text-gray-800 text-sm md:text-base">Hygienic & Fresh</span>
                </div>
            </div>
        </div>
      </section>

      {/* Section 2: Chef Profile */}
      <section className="py-24 pt-32 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] md:aspect-[3/4] group border-8 border-white p-2 bg-gray-100"
            >
              <div className="absolute inset-0 bg-brand-primary/10 rounded-2xl z-0"></div>
              <img 
                src="/sunanda-new.jpeg" 
                alt="Chef Sunanda Kahilkar" 
                className="w-full h-full object-contain bg-gray-100 rounded-2xl transform group-hover:scale-105 transition-transform duration-700 relative z-10"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/50 z-20">
                <h3 className="text-xl font-bold text-gray-900 flex items-center justify-between">
                    Sunanda Kahilkar <ChefHat className="text-brand-primary" />
                </h3>
                <p className="text-sm font-medium text-brand-dark uppercase tracking-wide">Head Chef & Founder</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                Culinary Perfection,<br/>Mastered Over Years
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Behind every delicious meal at Ghar Ka Swaad is the expertise of Mrs. Sunanda Kahilkar. With a rich background in professional hospitality, she ensures every tiffin meets restaurant-grade quality while retaining the warmth of mother's cooking.
              </p>
              
              <div className="space-y-4">
                <div className="flex p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mr-4 mt-1 bg-brand-primary/10 text-brand-primary p-2 h-fit rounded-xl">
                        <Award size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg">3 Years at Regenta Central Hotel</h4>
                        <p className="text-sm text-gray-500">Mastered volume cooking with uncompromising quality.</p>
                    </div>
                </div>
                
                <div className="flex p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mr-4 mt-1 bg-brand-primary/10 text-brand-primary p-2 h-fit rounded-xl">
                        <Award size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg">2 Years at Tuli International</h4>
                        <p className="text-sm text-gray-500">Refined skills in diverse culinary styles and hygiene protocols.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div>
                        <span className="flex items-center text-sm font-bold text-gray-700 mb-2 whitespace-nowrap">
                            <CheckCircle2 size={16} className="text-green-500 mr-2" /> South Indian Specialist
                        </span>
                        <span className="flex items-center text-sm font-bold text-gray-700">
                            <CheckCircle2 size={16} className="text-green-500 mr-2" /> Pro Hygiene Standards
                        </span>
                    </div>
                    <div>
                        <span className="flex items-center text-sm font-bold text-gray-700 mb-2">
                            <CheckCircle2 size={16} className="text-green-500 mr-2" /> Taste Consistency
                        </span>
                        <span className="flex items-center text-sm font-bold text-gray-700">
                            <CheckCircle2 size={16} className="text-green-500 mr-2" /> Bulk Meal Prep Expert
                        </span>
                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: Operations Profile */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center flex-col-reverse md:flex-row">
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <span className="text-brand-primary font-bold tracking-wider uppercase text-sm mb-2 block">The Operations</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                Modernizing the Traditional Tiffin
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Piyush represents the modern driving force of Ghar Ka Swaad. Balancing his Computer Science studies with entrepreneurial drive, he ensures the seamless digital and operational experience for every customer.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-400">
                   <h4 className="font-bold text-gray-900 mb-1">Marketing & Branding</h4>
                   <p className="text-xs text-gray-500">Digital agency owner scaling the brand's reach.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-400">
                   <h4 className="font-bold text-gray-900 mb-1">Tech & Operations</h4>
                   <p className="text-xs text-gray-500">CS Student at KDK College optimizing delivery logic.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-400">
                   <h4 className="font-bold text-gray-900 mb-1">Customer Experience</h4>
                   <p className="text-xs text-gray-500">Ensuring 100% satisfaction and rapid support.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-400">
                   <h4 className="font-bold text-gray-900 mb-1">Order Management</h4>
                   <p className="text-xs text-gray-500">Smooth logistics from kitchen to your doorstep.</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] md:aspect-[3/4] group border-8 border-white p-2 bg-gray-200 order-1 md:order-2"
            >
              <img 
                src="/piyush-new.jpeg" 
                alt="Piyush Kahilkar" 
                className="w-full h-full object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 flex items-center justify-between">
                    Piyush Kahilkar <GraduationCap className="text-blue-500" />
                </h3>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Marketing & Operations Head</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 4: Kitchen Video & Trust */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Inside Our Kitchen</h2>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">See where the magic happens. A glimpse into our daily fresh preparations.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-100 bg-gray-900 relative aspect-video"
                >
                    <div className="flex overflow-x-auto snap-x snap-mandatory h-full [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <div className="min-w-full h-full snap-center relative shrink-0">
                            <video 
                                src="/kitchen-vid-new.mp4" 
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                                className="w-full h-full object-cover pointer-events-none"
                            ></video>
                        </div>
                        <div className="min-w-full h-full snap-center relative shrink-0 bg-gray-100">
                            <img src="/kitchen1.jpeg" alt="Kitchen Prep" className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-full h-full snap-center relative shrink-0">
                            <img src="https://images.unsplash.com/photo-1556910103-1c02745a872f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Kitchen Setup" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="absolute bottom-4 left-0 w-full flex justify-center gap-3 z-10 pointer-events-none">
                       <span className="w-2 h-2 rounded-full bg-white shadow-sm border border-black/10"></span>
                       <span className="w-2 h-2 rounded-full bg-white/50 shadow-sm border border-black/10"></span>
                       <span className="w-2 h-2 rounded-full bg-white/50 shadow-sm border border-black/10"></span>
                    </div>
                    <p className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm z-10 pointer-events-none border border-white/20">Swipe &rarr;</p>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-6">
                    {[
                        { title: "Professional Hotel Chef", desc: "Expert recipes & techniques." },
                        { title: "Fresh Daily Cooking", desc: "Never frozen or stale." },
                        { title: "Hygienic Standards", desc: "Strict cleanliness protocols." },
                        { title: "Affordable Plans", desc: "Premium food, pocket-friendly." },
                        { title: "Timely Delivery", desc: "Hot meals exactly when you need." },
                        { title: "Authentic Home Taste", desc: "Just like mom makes it." },
                    ].map((feature, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gray-50 p-6 rounded-2xl border border-gray-100"
                        >
                            <CheckCircle2 className="text-green-500 mb-3" size={28} />
                            <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                            <p className="text-sm text-gray-500">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* Section 5: Mission Statement */}
      <section className="py-24 bg-brand-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <Utensils className="mx-auto text-brand-primary mb-6" size={48} />
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight">
                "Our mission is to ensure that students, working professionals, and families never have to compromise on healthy, delicious food. I want to spread it all over Nagpur."
            </h2>
            <div className="w-24 h-1 bg-brand-primary mx-auto rounded-full"></div>
        </div>
      </section>
    </div>
  );
}
