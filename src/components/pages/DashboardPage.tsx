import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogOut, History, Package, User, Bell, MapPin, PauseCircle, PlayCircle, X, Gift, Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { BRAND_DATA } from '../../constants';
import { db, auth } from '../../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../utils/firestoreError';

export default function DashboardPage({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ name: '', phone: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  
  const [showPauseModal, setShowPauseModal] = useState<number | boolean>(false);
  const [pauseData, setPauseData] = useState({ startDate: '', endDate: '' });
  const [isPausingStatus, setIsPausingStatus] = useState(false);
  const [showTrackingMap, setShowTrackingMap] = useState(false);

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    menuAnnouncements: false,
  });

  const getActiveUserStr = () => {
     // User is available from auth directly or storage override
     return sessionStorage.getItem('user') || localStorage.getItem('user');
  };

  useEffect(() => {
    const userStr = getActiveUserStr();
    if (!userStr) {
      onNavigate('login');
      return;
    }

    const { uid } = JSON.parse(userStr);

    const fetchDashboardData = async () => {
      try {
        const localUser = JSON.parse(userStr);
        
        // 1. Optimistically display cached local data instantly
        setUserData(localUser);
        setEditProfileData({ name: localUser.name || '', phone: localUser.phone || '' });
        if (localUser.notifications) {
          setNotifications(localUser.notifications);
        }
        
        let localHistory: any[] = [];
        if (localUser?.subscriptions && localUser.subscriptions.length > 0) {
            localHistory = localUser.subscriptions.map((sub: any, i: number) => ({ id: i + 1, date: new Date().toISOString().split('T')[0], meal: sub.planName, status: 'Out for Delivery' }));
        } else if (localUser?.subscription?.planName) {
            localHistory = [{ id: 1, date: new Date().toISOString().split('T')[0], meal: localUser.subscription.planName, status: 'Out for Delivery' }];
        }
    
        setOrders({
          activePlan: localUser?.subscription?.planName || null,
          history: localHistory,
          userLocation: {
            address: localUser?.address,
            mapLink: localUser?.mapLink,
            latitude: localUser?.latitude,
            longitude: localUser?.longitude
          }
        });
        
        // Stop loading spinner immediately
        setLoading(false);

        // 2. Fetch fresh data quietly in background
        let freshUser: any = null;
        try {
          // If we have a local token, try backend first
          const token = sessionStorage.getItem('token') || localStorage.getItem('token');
          if (token) {
              const res = await fetch('/api/profile', {
                 headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                 freshUser = Object.assign({}, freshUser, await res.json());
              }
          }
        } catch (e) {
             console.error("Backend fetch error", e);
        }

        try {
          const userRef = doc(db, 'users', uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            freshUser = Object.assign({}, freshUser, userDoc.data());
          }
        } catch (dbErr: any) {
          console.warn("Could not fetch latest user data from DB, using cached auth data", dbErr);
        }

        if (freshUser) {
          setUserData(freshUser);
          setEditProfileData({ name: freshUser.name || '', phone: freshUser.phone || '' });
          if (freshUser.notifications) {
            setNotifications(freshUser.notifications);
          }
          
          const storage = sessionStorage.getItem('token') ? sessionStorage : localStorage;
          storage.setItem('user', JSON.stringify({ uid: uid, email: localUser.email, ...freshUser }));

          let freshHistory: any[] = [];
          if (freshUser?.subscriptions && freshUser.subscriptions.length > 0) {
              freshHistory = freshUser.subscriptions.map((sub: any, i: number) => ({ id: i + 1, date: new Date().toISOString().split('T')[0], meal: sub.planName, status: 'Out for Delivery' }));
          } else if (freshUser?.subscription?.planName) {
              freshHistory = [{ id: 1, date: new Date().toISOString().split('T')[0], meal: freshUser.subscription.planName, status: 'Out for Delivery' }];
          }
      
          setOrders({
            activePlan: freshUser?.subscription?.planName || null,
            history: freshHistory,
            userLocation: {
              address: freshUser?.address,
              mapLink: freshUser?.mapLink,
              latitude: freshUser?.latitude,
              longitude: freshUser?.longitude
            }
          });
          
          // Fetch payment history
          try {
              const paymentsRef = collection(db, 'payments');
              const q = query(paymentsRef, where("userId", "==", uid));
              const paymentsSnapshot = await getDocs(q);
              const paymentsList = paymentsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              paymentsList.sort((a: any, b: any) => {
                  const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                  const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                  return timeB - timeA;
              });
              setPaymentHistory(paymentsList);
          } catch(paymentErr) {
              console.error("Error fetching payments", paymentErr);
          }
        }
      } catch (err: any) {
        console.error("Dashboard Sync Error:", err);
        // Do not force logout if simply offline
        if (err.message && err.message.includes('offline')) {
           console.warn("Operating safely with cached profile due to network offline mode.");
        } else if (err.code === 'permission-denied') {
          // Keep them logged in but maybe show error
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [onNavigate]);

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    onNavigate('home');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    
    const userStr = getActiveUserStr();
    if (!userStr) return;
    const { uid, email } = JSON.parse(userStr);

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, editProfileData);
      
      setUserData((prev: any) => ({ ...prev, ...editProfileData }));
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingProfile(false);
      
      // Update local storage
      const userObj = JSON.parse(userStr);
      const storage = sessionStorage.getItem('token') ? sessionStorage : localStorage;
      storage.setItem('user', JSON.stringify({ ...userObj, name: editProfileData.name, phone: editProfileData.phone }));
      
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message });
      try { handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`); } catch(e) {}
    }
  };

  const handlePauseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPausingStatus(true);
    const userStr = getActiveUserStr();
    if (!userStr) return;
    const { uid } = JSON.parse(userStr);

    try {
      const userRef = doc(db, 'users', uid);
      let updatePayload: any = {};
      let updatedUserData = { ...userData };

      if (typeof showPauseModal === 'number' && userData.subscriptions) {
        // Handle multiple subscriptions array
        const newSubscriptions = [...userData.subscriptions];
        newSubscriptions[showPauseModal] = {
          ...newSubscriptions[showPauseModal],
          isPaused: true,
          pauseStartDate: pauseData.startDate,
          pauseEndDate: pauseData.endDate
        };
        updatePayload.subscriptions = newSubscriptions;
        updatedUserData.subscriptions = newSubscriptions;
      } else {
        // Handle legacy single subscription
        const subscriptionData = {
          ...userData.subscription,
          isPaused: true,
          pauseStartDate: pauseData.startDate,
          pauseEndDate: pauseData.endDate
        };
        updatePayload.subscription = subscriptionData;
        updatedUserData.subscription = subscriptionData;
      }
      
      await updateDoc(userRef, updatePayload);
      
      setUserData(updatedUserData);
      setShowPauseModal(false);
      setPauseData({ startDate: '', endDate: '' });
    } catch (err) {
      console.error(err);
      alert('Could not pause subscription');
    } finally {
      setIsPausingStatus(false);
    }
  };

  const handleResumeSubscription = async (index?: number) => {
    setIsPausingStatus(true);
    const userStr = getActiveUserStr();
    if (!userStr) return;
    const { uid } = JSON.parse(userStr);

    try {
      const userRef = doc(db, 'users', uid);
      let updatePayload: any = {};
      let updatedUserData = { ...userData };

      if (typeof index === 'number' && userData.subscriptions) {
        const newSubscriptions = [...userData.subscriptions];
        newSubscriptions[index] = {
          ...newSubscriptions[index],
          isPaused: false,
          pauseStartDate: null,
          pauseEndDate: null
        };
        updatePayload.subscriptions = newSubscriptions;
        updatedUserData.subscriptions = newSubscriptions;
      } else {
        const subscriptionData = {
          ...userData.subscription,
          isPaused: false,
          pauseStartDate: null,
          pauseEndDate: null
        };
        updatePayload.subscription = subscriptionData;
        updatedUserData.subscription = subscriptionData;
      }

      await updateDoc(userRef, updatePayload);
      
      setUserData(updatedUserData);
    } catch (err) {
      console.error(err);
      alert('Could not resume subscription');
    } finally {
      setIsPausingStatus(false);
    }
  };

  const handleCancelSubscription = async (index?: number) => {
    if (!window.confirm("Are you sure you want to cancel your subscription? You will lose access immediately.")) return;
    setIsPausingStatus(true);
    const userStr = getActiveUserStr();
    if (!userStr) return;
    const { uid } = JSON.parse(userStr);

    try {
      const userRef = doc(db, 'users', uid);
      let updatePayload: any = {};
      let updatedUserData = { ...userData };

      if (typeof index === 'number' && userData.subscriptions) {
        const newSubscriptions = [...userData.subscriptions];
        newSubscriptions.splice(index, 1);
        updatePayload.subscriptions = newSubscriptions;
        updatedUserData.subscriptions = newSubscriptions;
      } else {
        // Use deleteField to ensure it is completely removed from Firestore
        const { deleteField } = await import('firebase/firestore');
        updatePayload.subscription = deleteField();
        delete updatedUserData.subscription;
      }

      await updateDoc(userRef, updatePayload);
      setUserData(updatedUserData);
      
      const storage = sessionStorage.getItem('token') ? sessionStorage : localStorage;
      storage.setItem('user', JSON.stringify({ uid: uid, email: updatedUserData.email, ...updatedUserData }));

      toast.success('Subscription cancelled successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Could not cancel subscription');
    } finally {
      setIsPausingStatus(false);
    }
  };

  const handleReorder = () => {
    window.open(`https://wa.me/${BRAND_DATA.brand.whatsapp.replace(/[^0-9]/g, '')}?text=Hi,%20I'd%20like%20to%20reorder%20my%20last%20meal`, '_blank');
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
    const newVal = !notifications[key];
    setNotifications(prev => ({ ...prev, [key]: newVal }));
    
    const userStr = getActiveUserStr();
    if (!userStr) return;
    const { uid } = JSON.parse(userStr);

    setSavingPrefs(true);
    try {
      const userRef = doc(db, 'users', uid);
      const updatedPrefs = { ...notifications, [key]: newVal };
      await updateDoc(userRef, { notifications: updatedPrefs });
    } catch (err) {
      console.error('Failed to update notifications', err);
      // Revert on error
      setNotifications(prev => ({ ...prev, [key]: !newVal }));
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome back, <span className="font-bold text-brand-primary">{userData?.name}</span></p>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate('track')}
            className="flex items-center gap-2 bg-brand-accent text-white px-5 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all font-bold shadow-md shadow-brand-accent/30"
          >
            <MapPin size={18} /> Track Order
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-medium"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1 space-y-6"
        >
          {/* User Profile Card */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-brand-secondary rounded-full flex items-center justify-center text-brand-primary mb-4 p-4 shrink-0">
              <User size={32} />
            </div>
            
            {profileMsg.text && (
              <div className={`w-full p-3 rounded-lg text-sm mb-4 ${profileMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                {profileMsg.text}
              </div>
            )}

            {!isEditingProfile ? (
              <>
                <h3 className="font-bold text-xl mb-1">{userData?.name}</h3>
                <p className="text-gray-500 text-sm mb-1">{userData?.phone}</p>
                <p className="text-gray-500 text-sm mb-2">{userData?.email}</p>
                
                {/* Subscription End Date in Profile */}
                {userData?.subscriptions && userData.subscriptions.length > 0 ? (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Next Expiry</p>
                    <p className="text-sm font-medium text-brand-dark">
                      {new Date(
                        Math.max(...userData.subscriptions.map((s: any) => new Date(s.expiryDate || 0).getTime()))
                      ).toLocaleDateString()}
                    </p>
                  </div>
                ) : userData?.subscription?.expiryDate ? (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Subscription Ends</p>
                    <p className="text-sm font-medium text-brand-dark">
                      {new Date(userData.subscription.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                ) : null}

                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-1.5 border border-brand-primary text-brand-primary rounded-lg text-sm font-bold hover:bg-brand-primary hover:text-white transition-colors mb-6"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleSaveProfile} className="w-full text-left mb-6">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                      value={editProfileData.name}
                      onChange={e => setEditProfileData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                      value={editProfileData.phone}
                      onChange={e => setEditProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditProfileData({ name: userData?.name, phone: userData?.phoneOrEmail });
                        setProfileMsg({ type: '', text: '' });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 px-3 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-dark transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="w-full pt-6 border-t border-gray-100 mt-auto">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Current Plans</p>
              
              {userData?.subscriptions && userData.subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {userData.subscriptions.map((sub: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-3 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                        <div className="flex items-center justify-center gap-2 text-brand-dark font-bold bg-brand-secondary/50 py-2 rounded-xl border border-brand-primary/20">
                          <Package size={18} /> {sub.planName}
                        </div>
                        {sub.expiryDate && (
                          <p className="text-xs text-center text-gray-500 font-bold">
                              Expires on: {new Date(sub.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                        <button
                          onClick={() => handleCancelSubscription(idx)}
                          disabled={isPausingStatus}
                          className="w-full py-2 border border-red-500 text-red-500 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                          <X size={16} /> Cancel Subscription
                        </button>
                    </div>
                  ))}
                </div>
              ) : userData?.subscription?.planName ? (
                // Legacy single-plan fallback
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-2 text-brand-dark font-bold bg-brand-secondary/50 py-3 rounded-xl border border-brand-primary/20">
                      <Package size={18} /> {orders?.activePlan || 'No Active Plan'}
                    </div>
                    {orders?.activePlan && userData?.subscription?.expiryDate && (
                      <p className="text-xs text-center text-gray-500 font-bold">
                          Expires on: {new Date(userData.subscription.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                    {(orders?.activePlan) && (
                        <button
                          onClick={() => handleCancelSubscription()}
                          disabled={isPausingStatus}
                          className="w-full py-2 border border-red-500 text-red-500 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                          <X size={16} /> Cancel Subscription
                        </button>
                    )}
                  </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <p className="text-gray-500 text-sm font-medium">No active plans.</p>
                </div>
              )}
            </div>
          </div>

          {/* Preferences Settings */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
             <div className="flex items-center gap-2 mb-6">
                <Bell size={20} className="text-brand-primary" />
                <h3 className="font-bold text-lg font-serif">Preferences</h3>
             </div>
             
             <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer group">
                   <div>
                     <p className="font-bold text-sm text-gray-800">Order Updates</p>
                     <p className="text-xs text-gray-500 mt-0.5">Receive SMS delivery alerts</p>
                   </div>
                   <div className="relative inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.orderUpdates} 
                        onChange={() => toggleNotification('orderUpdates')}
                        disabled={savingPrefs}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out transition-colors duration-300"></div>
                   </div>
                </label>

                <div className="border-t border-gray-100 pt-4"></div>

                <label className="flex items-center justify-between cursor-pointer group">
                   <div>
                     <p className="font-bold text-sm text-gray-800">Plan Updates & Food Messages</p>
                     <p className="text-xs text-gray-500 mt-0.5">Menu changes & special offers</p>
                   </div>
                   <div className="relative inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.menuAnnouncements} 
                        onChange={() => toggleNotification('menuAnnouncements')}
                        disabled={savingPrefs}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out transition-colors duration-300"></div>
                   </div>
                </label>
             </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 space-y-8"
        >
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-brand-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <Gift className="text-brand-primary" />
                <h2 className="text-2xl font-serif font-bold">Refer & Earn</h2>
              </div>
            </div>
            <div className="bg-gradient-to-r from-brand-secondary/40 to-brand-secondary/10 p-6 rounded-2xl border border-brand-primary/20 flex flex-col md:flex-row items-center gap-8 relative z-10">
               <div className="flex-1">
                 <h3 className="font-bold text-xl text-gray-800 mb-2">Invite friends, get ₹100 off!</h3>
                 <p className="text-sm text-gray-600 mb-5">Share your unique code with friends. When they subscribe to any plan, they get 10% off their first month, and you get ₹100 off your next renewal.</p>
                 <div className="flex flex-col sm:flex-row gap-3">
                   <div className="bg-white border-2 border-brand-primary/20 xl:w-64 px-4 py-3 rounded-xl font-mono font-bold text-brand-dark tracking-wide flex items-center justify-between shadow-sm">
                     <span className="truncate">{userData?.referralCode || (userData?.uid ? `GHS-${userData.uid.substring(0, 6).toUpperCase()}` : 'GHS-WELCOME')}</span>
                     <button 
                       onClick={() => {
                         navigator.clipboard.writeText(userData?.referralCode || (userData?.uid ? `GHS-${userData.uid.substring(0, 6).toUpperCase()}` : 'GHS-WELCOME'));
                         toast.success('Referral code copied!');
                       }}
                       className="text-brand-primary hover:text-brand-dark bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg p-1.5 transition-colors"
                       aria-label="Copy code"
                     >
                       <Copy size={18} />
                     </button>
                   </div>
                   <button 
                     onClick={() => {
                       const code = userData?.referralCode || (userData?.uid ? `GHS-${userData.uid.substring(0, 6).toUpperCase()}` : 'GHS-WELCOME');
                       const message = `Hey! Use my code ${code} to get 10% off your first month at Ghar Ka Swaad!`;
                       window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                     }}
                     className="bg-brand-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-dark transition-colors whitespace-nowrap flex items-center justify-center gap-2 shadow-md shadow-brand-primary/30"
                   >
                     <Gift size={18} /> Share on WhatsApp
                   </button>
                 </div>
               </div>
               <div className="bg-white p-6 rounded-2xl border-2 border-brand-primary/10 text-center shadow-lg w-full md:w-auto shrink-0 md:min-w-[160px] flex flex-col items-center justify-center">
                 <div className="mb-1 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-primary to-orange-500">
                   ₹{userData?.referralRewards || 0}
                 </div>
                 <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Rewards Earned</span>
               </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100">
            {orders?.history?.[0]?.status === 'Preparing' || orders?.history?.[0]?.status === 'Out for Delivery' ? (
              <div className="mb-8">
                <div className="bg-brand-primary p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div>
                     <h3 className="text-xl font-bold mb-1">Live Tracking</h3>
                     <p className="opacity-90">{orders.history[0].meal}</p>
                   </div>
                   <div className="flex flex-col md:items-end gap-3">
                     <span className="block text-2xl font-bold bg-white text-brand-primary px-4 py-1.5 rounded-full shadow-inner inline-block w-fit text-center md:text-right">{orders.history[0].status}</span>
                     {orders?.userLocation?.latitude && orders.history[0].status === 'Out for Delivery' && (
                       <button 
                         onClick={() => setShowTrackingMap(!showTrackingMap)}
                         className="flex items-center gap-2 bg-brand-secondary text-brand-primary px-4 py-2 rounded-full font-bold hover:bg-white hover:text-brand-primary transition-colors text-sm"
                       >
                         <MapPin size={16} />
                         {showTrackingMap ? 'Hide Map' : 'Track via Google Maps'}
                       </button>
                     )}
                   </div>
                </div>
                {showTrackingMap && orders?.userLocation?.latitude && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 rounded-2xl overflow-hidden border-2 border-brand-primary/20 bg-gray-50 p-2"
                  >
                     <div className="w-full h-80 rounded-xl overflow-hidden relative">
                       <iframe 
                         width="100%" 
                         height="100%" 
                         style={{ border: 0 }} 
                         loading="lazy" 
                         allowFullScreen 
                         src={`https://maps.google.com/maps?q=${orders.userLocation.latitude},${orders.userLocation.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                       ></iframe>
                       <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-brand-primary/10">
                          <div className="flex items-center gap-3">
                            <div className="bg-brand-primary/10 p-2 rounded-full text-brand-primary shrink-0">
                               <MapPin size={20} className="animate-bounce" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-gray-900">Delivery Address</p>
                               <p className="text-xs text-gray-600 line-clamp-2">{orders.userLocation.address}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                            <span>Delivery Partner knows exact location in Google Maps.</span>
                          </div>
                       </div>
                     </div>
                  </motion.div>
                )}
              </div>
            ) : null}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <History className="text-brand-primary" />
                <h2 className="text-2xl font-serif font-bold">Order History</h2>
              </div>
            </div>

            {orders?.history && orders.history.length > 0 ? (
              <div className="space-y-4">
                {orders.history.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-800">{order.meal}</h4>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-2">
                        {order.status}
                      </span>
                      {order.id === orders.history[0].id && !['Preparing', 'Out for Delivery'].includes(order.status) && (
                        <div>
                          <button 
                            onClick={handleReorder}
                            className="text-sm text-brand-primary font-bold hover:underline"
                          >
                            Re-order Last Meal
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl">
                <p className="text-gray-500">No recent orders found.</p>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6 mt-12">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-brand-primary" />
                <h2 className="text-2xl font-serif font-bold">Payment History</h2>
              </div>
            </div>

            {paymentHistory && paymentHistory.length > 0 ? (
              <div className="space-y-4">
                {paymentHistory.map((payment: any) => (
                  <div key={payment.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-800">Subscription: {payment.plan}</h4>
                      <p className="text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()} &middot; ID: {payment.paymentId ? payment.paymentId.substring(0, 15) + '...' : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-gray-800">₹{payment.amount}</h4>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mt-1">
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl">
                <p className="text-gray-500">No recent payments found.</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
