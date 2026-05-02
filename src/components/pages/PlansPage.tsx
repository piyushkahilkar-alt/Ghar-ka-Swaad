import { useState } from 'react';
import { BRAND_DATA } from '../../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Zap, Rocket, Star, Utensils, Leaf, X } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function PlansPage({ onNavigate }: { onNavigate?: (page: any) => void }) {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState(2); // Start directly at payment step

  const handlePaymentComplete = async () => {
    setCheckoutStep(3); // Processing step
    
    const token = localStorage.getItem('token');
    if (token) {
       try {
           await fetch('/api/plans/subscribe', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
               body: JSON.stringify({ planId: selectedPlan.id.toString(), planName: selectedPlan.name })
           });
       } catch (err) {
           console.error('Failed to subscribe via API');
       }
    }

    setTimeout(() => {
      setCheckoutStep(4); // Success step
      
      // If not logged in, we can still redirect to whatsapp, else we just stay on success step
      // Wait, let's keep WhatsApp for fallback or just remove it if user asked for dashboard feature
      if (!token) {
        const message = `Hi, I'd like to subscribe to the *${selectedPlan.name}*.\n\nI have completed the payment of ₹${selectedPlan.monthly_price} via UPI. (Please find screenshot attached if needed.)`;
        window.open(`https://wa.me/${BRAND_DATA.brand.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
      }
      
    }, 2000);
  };

  return (
    <div className="py-20 bg-brand-secondary min-h-screen relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Subscription Plans</h1>
          <p className="text-gray-600 text-lg">Choose a plan that fits your lifestyle. No hidden charges. Pause or cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 items-stretch max-w-7xl mx-auto">
          {BRAND_DATA.plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-white rounded-[2.5rem] p-6 flex flex-col border-2 transition-all hover:shadow-xl ${
                plan.id === 2 ? 'border-brand-primary lg:scale-105 z-10 shadow-lg' : 'border-black/5 hover:border-brand-primary/30'
              }`}
            >
              {plan.id === 2 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-accent text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                  Most Popular
                </div>
              )}
              {plan.id === 0 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                  Start Here
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-400">
                    {plan.id === 0 && <Utensils size={24} />}
                    {plan.id === 1 && <Star size={24} />}
                    {plan.id === 2 && <Zap size={24} className="text-brand-accent" />}
                    {plan.id === 3 && <Rocket size={24} />}
                    {plan.id === 4 && <Leaf size={24} className="text-green-500" />}
                  </span>
                  <h3 className="text-xl font-serif font-bold leading-tight">{plan.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5 line-clamp-2">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">₹{plan.monthly_price}</span>
                  {plan.id !== 0 && <span className="text-gray-500 text-sm">/ month</span>}
                </div>
                <div className="text-xs font-bold text-brand-accent uppercase mt-1">
                  ₹{plan.price_per_meal} per meal • {plan.meals_per_day} meals/day
                </div>
              </div>

              <div className="flex-grow">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">What's included:</p>
                <ul className="space-y-3 mb-8">
                  {plan.menu.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-800 font-serif italic text-base leading-tight">
                      <div className="w-5 h-5 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => { setSelectedPlan(plan); setCheckoutStep(2); }}
                className={`w-full py-4 rounded-2xl font-bold transition-all text-center text-base ${
                  plan.id === 2 
                    ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/30 hover:scale-105 active:scale-95' 
                    : plan.id === 0 ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95' : 'bg-brand-primary text-white hover:bg-brand-dark hover:scale-105 active:scale-95'
                }`}
              >
                {plan.id === 0 ? 'TRY NOW' : 'SELECT PLAN'}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-gray-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-10">
           <div className="flex-grow">
              <h2 className="text-3xl font-serif font-bold mb-4">Custom Individual Corporate Plan?</h2>
              <p className="text-gray-400">Need food for your office staff or a construction site? We provide bulk deliveries at special rates.</p>
           </div>
           <button className="bg-brand-accent text-white px-10 py-5 rounded-2xl font-bold whitespace-nowrap hover:scale-105 transition-all">
              CONTACT FOR BULK
           </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedPlan(null)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
              >
                <X size={18} />
              </button>

              {checkoutStep === 2 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <h3 className="text-2xl font-serif font-bold mb-2">Complete Payment</h3>
                  <p className="text-gray-500 mb-6">Scan the QR code below using PhonePe, GPay, Paytm, or any UPI app to pay <strong className="text-brand-accent">₹{selectedPlan.monthly_price}</strong></p>
                  
                  <div className="bg-white p-4 rounded-3xl border-2 border-brand-primary/20 shadow-xl mb-6 relative overflow-hidden flex justify-center items-center w-64 h-64 mx-auto">
                    <QRCode value={`upi://pay?pa=8275116821@ybl&pn=Ghar+Ka+Swaad&cur=INR&am=${selectedPlan.monthly_price}`} size={200} />
                  </div>
                  
                  <div className="bg-brand-secondary/50 px-6 py-3 rounded-xl mb-6 border border-brand-primary/20 flex flex-col w-full">
                    <span className="text-xs font-bold text-gray-500 uppercase">UPI ID</span>
                    <span className="text-lg font-bold text-brand-primary tracking-wide">8275116821@ybl</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 w-full mb-6 max-w-sm md:hidden">
                     <a href={`upi://pay?pa=8275116821@ybl&pn=Ghar+Ka+Swaad&cur=INR&am=${selectedPlan.monthly_price}`} className="flex flex-col items-center justify-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">Pe</div>
                        <span className="text-[10px] font-bold text-gray-600">PhonePe</span>
                     </a>
                     <a href={`upi://pay?pa=8275116821@ybl&pn=Ghar+Ka+Swaad&cur=INR&am=${selectedPlan.monthly_price}`} className="flex flex-col items-center justify-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">G</div>
                        <span className="text-[10px] font-bold text-gray-600">GPay</span>
                     </a>
                     <a href={`upi://pay?pa=8275116821@ybl&pn=Ghar+Ka+Swaad&cur=INR&am=${selectedPlan.monthly_price}`} className="flex flex-col items-center justify-center gap-1 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-xs">Pay</div>
                        <span className="text-[10px] font-bold text-gray-600">Paytm</span>
                     </a>
                  </div>

                  <button 
                    onClick={handlePaymentComplete}
                    className="w-full bg-brand-primary text-white font-bold text-lg py-4 rounded-xl hover:bg-brand-dark transition-all flex justify-center items-center shadow-lg shadow-brand-primary/20"
                  >
                    I Have Completed Payment
                  </button>
                  <p className="text-xs text-gray-400 mt-4 max-w-sm">After payment, our team will verify the transaction and activate your plan automatically.</p>
                </div>
              ) : checkoutStep === 3 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-6">
                     <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2">Verifying Payment...</h3>
                  <p className="text-gray-500">Please wait while we confirm your payment details.</p>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2">Subscription Confirmed!</h3>
                  <p className="text-gray-500 mb-8">Your {selectedPlan.name} is now active. You can track your meals in the dashboard.</p>
                  <button 
                    onClick={() => {
                       setSelectedPlan(null);
                       setCheckoutStep(1);
                       if (onNavigate) onNavigate('dashboard');
                    }}
                    className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
