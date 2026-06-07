import { useState, useEffect } from 'react';
import { BRAND_DATA } from '../../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Zap, Rocket, Star, Utensils, Leaf, X, Copy, UploadCloud, CheckCircle2 } from 'lucide-react';
import { db } from '../../firebase';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useSEO } from '../../utils/useSEO';

export default function PlansPage({ onNavigate }: { onNavigate?: (page: any) => void }) {
  useSEO({
    title: 'Tiffin Service Plans & Pricing - Nagpur | Ghar Ka Swaad',
    description: 'Explore affordable daily, weekly, and monthly tiffin subscription plans in Nagpur. Enjoy pure veg, home-cooked food delivered to your home or office.',
    keywords: 'tiffin plans nagpur, food subscription nagpur, daily meals nagpur, affordable tiffin service, office lunch plans',
    canonicalUrl: 'https://gharkaswaadngp.vercel.app/plans',
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": BRAND_DATA.plans.map((plan, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": plan.name,
            "description": plan.description,
            "offers": {
              "@type": "Offer",
              "price": plan.monthly_price,
              "priceCurrency": "INR"
            }
          }
        }))
      },
      {
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
          "name": "Subscription Plans",
          "item": "https://gharkaswaadngp.vercel.app/plans"
        }]
      }
    ]
  });

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState(2); // Start directly at payment step
  const [isProcessingInfo, setIsProcessingInfo] = useState('');

  const [customAmount, setCustomAmount] = useState<number | ''>('');
  const [baseAmount, setBaseAmount] = useState<number>(0);
  
  // Student KDK details
  const [isStudent, setIsStudent] = useState<boolean | null>(null);
  const [studentIdImage, setStudentIdImage] = useState<string | null>(null);
  const [rollNumber, setRollNumber] = useState('');
  const [courseBranch, setCourseBranch] = useState('');
  
  // Trial Offer Details removed
  
  // Custom UPI QR Payment states
  const [countdown, setCountdown] = useState(300);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (checkoutStep === 2) {
      setCountdown(300);
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [checkoutStep]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const initiatePayment = (plan: any) => {
    setSelectedPlan(plan);
    const planPrice = parseInt(plan.monthly_price.toString().replace(/[^0-9]/g, ''), 10) || 0;
    setBaseAmount(planPrice);
    setCustomAmount(planPrice);
    
    // Reset student states
    setIsStudent(null);
    setStudentIdImage(null);
    setRollNumber('');
    setCourseBranch('');
    
    // Reset trial offer states removed
    
    setCheckoutStep(0); // Proceed to step 0
  };

  const handleProceedToPayment = async () => {
    if (!customAmount || customAmount <= 0) {
        toast.error("Please enter a valid amount.");
        return;
    }
    if (isStudent) {
        if (!studentIdImage) {
            toast.error("Please upload your Student ID Card.");
            return;
        }
        if (!rollNumber.trim() || !courseBranch.trim()) {
            toast.error("Please fill in Roll Number and Course/Branch.");
            return;
        }
    }
    


    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!userStr || !token) {
        toast.error("Please login first to subscribe.");
        if (onNavigate) onNavigate('login');
        return;
    }

    setCheckoutStep(2); // Show QR Code Screen
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
       const img = new Image();
       img.onload = () => {
           const canvas = document.createElement('canvas');
           const MAX_WIDTH = 800;
           const MAX_HEIGHT = 800;
           let width = img.width;
           let height = img.height;
           
           if (width > height) {
               if (width > MAX_WIDTH) {
                   height *= MAX_WIDTH / width;
                   width = MAX_WIDTH;
               }
           } else {
               if (height > MAX_HEIGHT) {
                   width *= MAX_HEIGHT / height;
                   height = MAX_HEIGHT;
               }
           }
           canvas.width = width;
           canvas.height = height;
           const ctx = canvas.getContext('2d');
           if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
             setPaymentScreenshot(dataUrl);
           }
       };
       img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDynamicImageUpload = (e: any, setFn: (val: string | null) => void) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
       const img = new Image();
       img.onload = () => {
           const canvas = document.createElement('canvas');
           const MAX_WIDTH = 800;
           const MAX_HEIGHT = 800;
           let width = img.width;
           let height = img.height;
           if (width > height) {
               if (width > MAX_WIDTH) {
                   height *= MAX_WIDTH / width;
                   width = MAX_WIDTH;
               }
           } else {
               if (height > MAX_HEIGHT) {
                   width *= MAX_HEIGHT / height;
                   height = MAX_HEIGHT;
               }
           }
           canvas.width = width;
           canvas.height = height;
           const ctx = canvas.getContext('2d');
           if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
             setFn(dataUrl);
           }
       };
       img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleStudentIdUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
       const img = new Image();
       img.onload = () => {
           const canvas = document.createElement('canvas');
           const MAX_WIDTH = 800;
           const MAX_HEIGHT = 800;
           let width = img.width;
           let height = img.height;
           if (width > height) {
               if (width > MAX_WIDTH) {
                   height *= MAX_WIDTH / width;
                   width = MAX_WIDTH;
               }
           } else {
               if (height > MAX_HEIGHT) {
                   width *= MAX_HEIGHT / height;
                   height = MAX_HEIGHT;
               }
           }
           canvas.width = width;
           canvas.height = height;
           const ctx = canvas.getContext('2d');
           if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
             setStudentIdImage(dataUrl);
           }
       };
       img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFinalSubmit = async () => {
    if (!paymentScreenshot) {
        toast.error("Please upload payment screenshot.");
        return;
    }
    setCheckoutStep(3); // Saving step
    setIsProcessingInfo('Verifying and saving your payment...');
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) throw new Error("User not found");
        const userObj = JSON.parse(userStr);
        const uid = userObj.uid;
        const planWithCustomAmount = { ...selectedPlan, monthly_price: customAmount };

        const paymentId = `pay_${Date.now()}`;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        
        const studentInfo = isStudent ? {
            isStudent: true,
            rollNumber,
            courseBranch,
            studentIdImage,
            discountRecieved: 100
        } : null;

        const trialOfferInfo = null;

        const newSubInfo = {
           status: 'active',
           planName: planWithCustomAmount.name,
           planId: planWithCustomAmount.id.toString(),
           isPaused: false,
           startDate: new Date().toISOString(),
           renewalDate: expiryDate.toISOString(),
           expiryDate: expiryDate.toISOString(),
           paymentId: paymentId,
           amountPaid: customAmount,
           paymentStatus: 'Pending Verification',
           screenshot: paymentScreenshot,
           transactionId: transactionId,
           studentInfo,
           trialOfferInfo
        };

        // Save to Firestore payments collection
        await setDoc(doc(db, "payments", paymentId), {
            paymentId: paymentId,
            orderId: `order_${Date.now()}`,
            userId: uid,
            amount: customAmount,
            status: "Pending Verification",
            plan: planWithCustomAmount.name,
            createdAt: new Date().toISOString(),
            screenshot: paymentScreenshot,
            transactionId: transactionId,
            studentInfo,
            trialOfferInfo
        });

        // Save to Users collection
        await setDoc(doc(db, "users", uid), {
            subscription: newSubInfo, // Legacy fallback
            subscriptions: arrayUnion(newSubInfo)
        }, { merge: true });

        // Send to Google Sheets Webhook
        const addressJoined = [userObj.address, userObj.landmark, userObj.city].filter(Boolean).join(', ');
        const sheetData = {
            "name": userObj.name || userObj.displayName || "Not Provided",
            "contact": userObj.phone || userObj.phoneNumber || userObj.email || "Not Provided",
            "mobile no": userObj.phone || userObj.phoneNumber || userObj.email || "Not Provided",
            "location": addressJoined || "Not Provided",
            "plan": planWithCustomAmount.name || "Not Provided",
            "amount": customAmount || 0,
            "amount paid": customAmount || 0,
            "query": userObj.userQuery || "Not Provided",
            "date": new Date().toLocaleString()
        };
        fetch("https://script.google.com/macros/s/AKfycbza3rOBAMdqHo8nz8OCwXBR5bL2Ia7ZPEDeoyFVmrX04X_eGRtzIk9b3x4NH8bIrqQi/exec", {
           method: "POST",
           mode: "no-cors",
           headers: { "Content-Type": "text/plain" },
           body: JSON.stringify(sheetData)
        }).catch(err => console.error("Webhook error: ", err));

        // Update local state
        const updatedUser = { ...userObj, subscription: newSubInfo };
        if (sessionStorage.getItem('user')) {
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        setCheckoutStep(4); // Success

        let uploadedScreenshotsCount = 1; // payment receipt is 1
        if (isStudent && studentIdImage) uploadedScreenshotsCount++;

        let whatsappMsg = '';
        const adminUrl = typeof window !== 'undefined' ? window.location.origin + '/dashboard' : 'https://gharkaswaadngp.vercel.app/dashboard';
        
        let commonText = `Name: ${sheetData.name}\nContact: ${sheetData["mobile no"]}\nAddress: ${sheetData.location}\nPlan: ${sheetData.plan}\nAmount Paid: ₹${customAmount}\n\nKDK Student: ${isStudent ? 'Yes' : 'No'}${isStudent ? `\nRoll No: ${rollNumber}` : ''}\n\nUploads and Images:\n`;
        if (paymentScreenshot) commonText += `Payment Receipt: View on Dashboard -> ${adminUrl}\n`;
        if (isStudent && studentIdImage) commonText += `Student ID Card: View on Dashboard -> ${adminUrl}\n`;

        if (selectedPlan.id === 0) {
            whatsappMsg = `New Ghar Ka Swaad Trial Request\n\n${commonText}\nPlease verify and approve.`;
        } else {
            whatsappMsg = `New Ghar Ka Swaad Order\n\n${commonText}Transaction ID: ${transactionId || paymentId}\n\nPayment Completed Successfully.\nPlease verify.`;
        }

        setTimeout(() => {
            window.open(`https://wa.me/918275116821?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
            if (onNavigate) onNavigate('dashboard');
        }, 3000);

    } catch (err: any) {
        toast.error("Error saving payment: " + err.message);
        setCheckoutStep(2); // Go back
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('UPI ID copied to clipboard!');
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
                <div className="bg-blue-50 text-blue-600 text-[10px] font-bold uppercase py-1 px-2 rounded flex items-center justify-center gap-1 mb-3 border border-blue-100">
                  <span role="img" aria-label="student">🎓</span> KDK Student Offer Available
                </div>
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
                <p className="text-sm text-gray-600 mb-5">{plan.description}</p>
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
                    <li key={i} className="flex items-start gap-3 text-gray-800 font-serif text-base leading-tight">
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

              {checkoutStep === 0 ? (
                <div className="py-4 flex flex-col items-center justify-center text-center">
                  <h3 className="text-2xl font-serif font-bold mb-4">Verification Steps</h3>
                  
                  {selectedPlan.id === 0 && (
                     <div className="w-full text-left bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-6">
                        <h4 className="font-bold text-orange-800 mb-1">Trial Plan Selected</h4>
                        <p className="text-sm text-orange-600 mb-4">Registration and login are required to continue.</p>
                     </div>
                  )}

                  <div className="w-full text-left bg-gray-50 border border-gray-100 p-6 rounded-2xl mb-6">
                    <p className="text-gray-800 font-bold mb-4">Are you a KDK College Student?</p>
                    
                    <div className="flex gap-4 w-full mb-6 relative z-10">
                      <button 
                        onClick={() => setIsStudent(true)}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${isStudent === true ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-200 text-gray-500 hover:border-brand-primary/50 bg-white'}`}
                      >
                        Yes, I am
                      </button>
                      <button 
                        onClick={() => setIsStudent(false)}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${isStudent === false ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-gray-200 text-gray-500 hover:border-brand-primary/50 bg-white'}`}
                      >
                        No
                      </button>
                    </div>

                    {isStudent === true && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="w-full text-left space-y-4">
                        {selectedPlan.id !== 0 && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mb-4">
                               <span className="text-2xl mt-1">🎓</span>
                               <div>
                                  <p className="font-bold text-blue-700">₹100 Student Discount Applied!</p>
                                  <p className="text-xs text-blue-600">Please provide your details below.</p>
                               </div>
                            </div>
                        )}
                        {selectedPlan.id === 0 && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mb-4">
                               <span className="text-2xl mt-1">🎓</span>
                               <div>
                                  <p className="font-bold text-blue-700">Student Details Required</p>
                                  <p className="text-xs text-blue-600">Please provide your student details to verify your identity.</p>
                               </div>
                            </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Upload Student ID Card</label>
                          <div className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all relative ${studentIdImage ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-brand-primary bg-white'}`}>
                            {studentIdImage ? (
                              <img src={studentIdImage} alt="ID Card" className="w-full h-full object-contain" />
                            ) : (
                              <>
                                <UploadCloud size={32} className="text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Tap to upload ID</p>
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleStudentIdUpload} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Roll Number</label>
                            <input 
                              type="text" 
                              value={rollNumber}
                              onChange={(e) => setRollNumber(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary outline-none"
                              placeholder="e.g. 45"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Branch/Course</label>
                            <input 
                              type="text" 
                              value={courseBranch}
                              onChange={(e) => setCourseBranch(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary outline-none"
                              placeholder="e.g. CSE"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                        if (isStudent === null) {
                            toast.error("Please answer if you are a KDK student");
                            return;
                        }
                        
                        const today = new Date();
                        const isOfferDay = today.getMonth() === 5 && today.getDate() === 9; // June 9th
                        let finalAmt = baseAmount;
                        if (selectedPlan.id === 0) {
                            if (isStudent && isOfferDay) {
                                finalAmt = Math.round(baseAmount * 0.5); // 50% off
                            } else {
                                finalAmt = baseAmount; // 79 otherwise
                            }
                        } else if (selectedPlan.id !== 0 && isStudent) {
                            finalAmt -= 100; // Monthly KDK discount
                        }
                        setCustomAmount(finalAmt);
                        
                        setCheckoutStep(1);
                    }}
                    className="w-full py-4 rounded-2xl font-bold bg-brand-primary text-white transition-all hover:bg-brand-dark hover:scale-105 active:scale-95"
                  >
                    Continue
                  </button>
                </div>
              ) : checkoutStep === 1 ? (
                 <div className="py-8 flex flex-col items-center justify-center text-center">
                  <h3 className="text-2xl font-serif font-bold mb-2">Confirm Payment</h3>
                  <p className="text-gray-500 mb-6">You selected <strong>{selectedPlan.name}</strong>.</p>
                  
                  <div className="w-full bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 space-y-3">
                     <div className="flex justify-between items-center text-gray-600">
                        <span>Original Price</span>
                        <span className="font-bold">₹{baseAmount}</span>
                     </div>
                     {baseAmount > (customAmount || 0) && (
                     <div className="flex justify-between items-center text-green-600 font-bold">
                        <span>Discount Applied</span>
                        <span>- ₹{baseAmount - (customAmount || 0)}</span>
                     </div>
                     )}
                     <div className="w-full h-px bg-gray-200 my-2"></div>
                     <div className="flex justify-between items-center text-xl">
                        <span className="font-bold text-gray-900">Final Price</span>
                        <span className="font-black text-brand-primary">₹{customAmount}</span>
                     </div>
                  </div>

                  <button 
                    onClick={handleProceedToPayment}
                    className="w-full py-4 rounded-2xl font-bold bg-brand-primary text-white transition-all hover:bg-brand-dark hover:scale-105 active:scale-95"
                  >
                    Proceed to Pay ₹{customAmount}
                  </button>
                </div>
              ) : checkoutStep === 2 ? (
                <div className="py-2 flex flex-col items-center justify-center w-full">
                  <div className="flex items-center justify-between w-full mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Scan & Pay</h3>
                    <div className="text-brand-primary font-mono font-bold bg-brand-primary/10 px-3 py-1 rounded-lg">
                      {formatTime(countdown)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-6 mb-6 flex flex-col items-center justify-center w-full max-w-[350px] aspect-square relative overflow-hidden">
                    <img src="/qrimage1.jpeg" alt="UPI QR Code" className="w-full h-full object-contain mix-blend-multiply" onError={(e) => { e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=upi://pay?pa=gharkaswaad@upi&pn=Ghar+Ka+Swaad&am=' + customAmount; }} />
                  </div>

                  <div className="w-full text-center mb-6">
                    <p className="text-sm text-gray-500 mb-1">Paying to Ghar Ka Swaad</p>
                    <p className="text-3xl font-bold mb-4">₹{customAmount}</p>

                    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-xl">
                       <span className="font-mono text-sm font-medium text-gray-700">9356615556@fam</span>
                       <button onClick={() => copyToClipboard('9356615556@fam')} className="text-brand-primary hover:text-brand-dark p-2 rounded-lg hover:bg-brand-primary/10 transition-colors flex items-center gap-2 text-sm font-bold">
                         <Copy size={16} /> Copy
                       </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => setCheckoutStep(3)}
                    className="w-full py-4 rounded-2xl font-bold bg-brand-primary text-white transition-all hover:bg-brand-dark hover:scale-105 active:scale-95"
                  >
                    I Have Paid
                  </button>
                </div>
              ) : checkoutStep === 3 ? (
                <div className="py-4 flex flex-col items-center w-full text-center">
                  <h3 className="text-xl font-bold mb-2">Verify Payment</h3>
                  <p className="text-sm text-gray-500 mb-6">Upload the payment screenshot or enter the transaction ID to confirm your subscription.</p>

                  <div className="w-full text-left mb-6 relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Payment Screenshot</label>
                    <div className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all relative ${paymentScreenshot ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-brand-primary bg-gray-50'}`}>
                      {paymentScreenshot ? (
                        <img src={paymentScreenshot} alt="Receipt" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <UploadCloud size={32} className="text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Tap to upload receipt</p>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="w-full text-left mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Transaction ID (Optional)</label>
                    <input 
                      type="text" 
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. UPI Ref Number"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>

                  <button 
                    onClick={handleFinalSubmit}
                    disabled={!paymentScreenshot && !transactionId}
                    className="w-full py-4 rounded-2xl font-bold bg-green-500 text-white transition-all hover:bg-green-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isProcessingInfo ? 'Verifying...' : 'Confirm Details'}
                  </button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2">Thank you for your order!</h3>
                  <p className="text-gray-500 mb-8 font-medium">Please press Send in WhatsApp to complete your order notification.</p>
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
