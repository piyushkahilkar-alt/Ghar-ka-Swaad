import { useState } from 'react';
import { BRAND_DATA } from '../../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Zap, Rocket, Star, Utensils, Leaf, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import { startPayment } from '../../payment';

export default function PlansPage({ onNavigate }: { onNavigate?: (page: any) => void }) {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState(2); // Start directly at payment step
  const [isProcessingInfo, setIsProcessingInfo] = useState('');

  const initiatePayment = async (plan: any) => {
    setSelectedPlan(plan);
    setCheckoutStep(2); // Initial payment step (now starts Razorpay process)

    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!userStr || !token) {
        alert("Please login first to subscribe.");
        if (onNavigate) onNavigate('login');
        return;
    }

    startPayment(
        plan, 
        userStr, 
        token, 
        (status) => {
            setIsProcessingInfo(status);
            if (status.includes('Verifying') || status.includes('Saving') || status.includes('Activating')) {
                setCheckoutStep(3); // Show Verifying state
            }
        },
        (paymentId) => {
            setCheckoutStep(4); // Success step
            // Update local storage so dashboard has newest subscription immediately
            const updatedUser = JSON.parse(userStr);
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            
            updatedUser.subscription = {
                planId: plan.id.toString(),
                planName: plan.name,
                isPaused: false,
                expiryDate: expiryDate.toISOString()
            };
            
            if (sessionStorage.getItem('user')) {
                sessionStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            setTimeout(() => {
                 if (onNavigate) onNavigate('dashboard');
            }, 3000);
        },
        (error) => {
            console.error('Payment Error:', error);
            alert(error.message);
            setCheckoutStep(2); // Go back to default/failed state
            setSelectedPlan(null);
        }
    );
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
                onClick={() => initiatePayment(plan)}
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
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-6">
                     <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2">Preparing Checkout</h3>
                  <p className="text-gray-500 mb-6">{isProcessingInfo}</p>
                </div>
              ) : checkoutStep === 3 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-6">
                     <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2">{isProcessingInfo}</h3>
                  <p className="text-gray-500">Please wait while we confirm your payment details securely.</p>
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
