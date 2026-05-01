import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, Package, ChefHat, CheckCircle2, Truck, Home, MapPin } from 'lucide-react';

type Status = 'received' | 'preparing' | 'quality' | 'out' | 'delivered';

interface TrackingStep {
  id: Status;
  label: string;
  description: string;
  icon: any;
}

const steps: TrackingStep[] = [
  { id: 'received', label: 'Order Received', description: 'We have received your request and started planning.', icon: Package },
  { id: 'preparing', label: 'In the Kitchen', description: 'Our chefs are preparing your fresh home-cooked meal.', icon: ChefHat },
  { id: 'quality', label: 'Quality Check', description: 'Ensuring hygiene and perfect packing.', icon: CheckCircle2 },
  { id: 'out', label: 'Out for Delivery', description: 'Our delivery partner is on the way to your location.', icon: Truck },
  { id: 'delivered', label: 'Delivered', description: 'Hope you enjoy your Ghar Ka Swaad!', icon: Home },
];

export default function TrackOrderPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<Status | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTrack = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate real-time tracking logic
    setTimeout(() => {
      setIsLoading(false);
      // For demo: if number ends in 0, delivered. 1-2: received. 3-4: preparing. 5-6: quality. 7-9: out.
      const lastDigit = parseInt(phoneNumber.slice(-1)) || 0;
      if (lastDigit === 0) setOrderStatus('delivered');
      else if (lastDigit <= 2) setOrderStatus('received');
      else if (lastDigit <= 4) setOrderStatus('preparing');
      else if (lastDigit <= 6) setOrderStatus('quality');
      else setOrderStatus('out');
    }, 1500);
  };

  const getStepIndex = (status: Status) => steps.findIndex(s => s.id === status);
  const currentStepIndex = orderStatus ? getStepIndex(orderStatus) : -1;

  return (
    <div className="py-20 bg-brand-secondary min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Track Your Tiffin</h1>
          <p className="text-gray-600 text-lg">Enter your registered phone number to see exactly where your meal is.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Tracking Search */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl mb-12">
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <input
                  type="tel"
                  required
                  placeholder="Enter Registered Phone Number"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-primary outline-none transition-all text-lg"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-brand-accent text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                TRACK STATUS
              </button>
            </form>
          </div>

          {/* Tracking Result */}
          {orderStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-right hidden sm:block">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Live Status Time</p>
                  <p className="text-2xl font-mono font-bold text-brand-primary">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-12">
                   <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                      <MapPin size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-serif font-bold">Delivery Location</h3>
                      <p className="text-gray-500 text-sm italic">Sitabuldi Area, Nagpur</p>
                   </div>
                </div>

                {/* Progress Line */}
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-100 md:left-0 md:right-0 md:top-6 md:h-1 md:w-full"></div>
                  <div 
                    className="absolute left-6 top-0 w-1 bg-brand-accent transition-all duration-1000 md:left-0 md:right-0 md:top-6 md:h-1" 
                    style={{ 
                      height: typeof window !== 'undefined' && window.innerWidth < 768 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '4px',
                      width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '4px'
                    }}
                  ></div>

                  <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-4">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      const Icon = step.icon;

                      return (
                        <div key={step.id} className="flex md:flex-col items-center md:text-center group flex-1">
                          <div 
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
                              isCompleted ? 'bg-brand-accent text-white scale-110' : 'bg-white text-gray-300 border-2 border-gray-100'
                            } ${isCurrent ? 'ring-4 ring-brand-accent/20' : ''}`}
                          >
                            <Icon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                          </div>
                          <div className="ml-6 md:ml-0 md:mt-6">
                            <h4 className={`font-serif font-bold text-lg ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                              {step.label}
                            </h4>
                            <p className="text-xs text-gray-500 max-w-[150px] md:mx-auto mt-1 hidden sm:block">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white flex items-center gap-6">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-brand-primary">
                       <ChefHat size={28} />
                    </div>
                    <div>
                       <h4 className="font-bold text-lg">Today's Lunch</h4>
                       <p className="text-sm text-gray-400 italic">Paneer Butter Masala, Dal Fry, Roti, Jeera Rice</p>
                    </div>
                 </div>
                 <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white flex flex-col justify-center">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Estimated Arrival</p>
                    <p className="text-3xl font-serif font-bold">12:45 PM – 1:15 PM</p>
                 </div>
              </div>
            </motion.div>
          )}

          {!orderStatus && !isLoading && (
            <div className="text-center py-12 opacity-30">
               <Package size={80} className="mx-auto mb-4" />
               <p className="font-serif italic text-xl">Waiting for your magic number...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
