import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogOut, History, Package, User, Bell, MapPin, PauseCircle, PlayCircle, X, Gift, Copy, CheckCircle2 } from 'lucide-react';
import { BRAND_DATA } from '../../constants';

export default function DashboardPage({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ name: '', phoneOrEmail: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseData, setPauseData] = useState({ startDate: '', endDate: '' });
  const [isPausingStatus, setIsPausingStatus] = useState(false);
  const [showTrackingMap, setShowTrackingMap] = useState(false);

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    menuAnnouncements: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      onNavigate('login');
      return;
    }

    // Fetch user and order data
    const fetchDashboardData = async () => {
      try {
        const [userRes, ordersRes] = await Promise.all([
          fetch('/api/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!userRes.ok) throw new Error('Failed to fetch profile');
        
        const user = await userRes.json();
        const ordersData = await ordersRes.json();

        setUserData(user);
        setEditProfileData({ name: user.name, phoneOrEmail: user.phoneOrEmail });
        if (user.notifications) {
          setNotifications(user.notifications);
        }
        setOrders(ordersData);
      } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onNavigate('login');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [onNavigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onNavigate('home');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editProfileData)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      
      setUserData(data);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingProfile(false);
      
      // Update local storage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({ ...userObj, name: data.name, phoneOrEmail: data.phoneOrEmail }));
      }
      
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message });
    }
  };

  const handlePauseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPausingStatus(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/profile/subscription/pause', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(pauseData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to pause subscription');
      setUserData(data);
      setShowPauseModal(false);
      setPauseData({ startDate: '', endDate: '' });
    } catch (err) {
      console.error(err);
      alert('Could not pause subscription');
    } finally {
      setIsPausingStatus(false);
    }
  };

  const handleResumeSubscription = async () => {
    setIsPausingStatus(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/profile/subscription/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resume subscription');
      setUserData(data);
    } catch (err) {
      console.error(err);
      alert('Could not resume subscription');
    } finally {
      setIsPausingStatus(false);
    }
  };

  const handleReorder = () => {
    // Basic interaction
    window.open(`https://wa.me/${BRAND_DATA.brand.whatsapp.replace(/[^0-9]/g, '')}?text=Hi,%20I'd%20like%20to%20reorder%20my%20last%20meal`, '_blank');
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
    const newVal = !notifications[key];
    setNotifications(prev => ({ ...prev, [key]: newVal }));
    
    const token = localStorage.getItem('token');
    if (!token) return;

    setSavingPrefs(true);
    try {
      await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...notifications, [key]: newVal })
      });
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
                <p className="text-gray-500 text-sm mb-4">{userData?.phoneOrEmail}</p>
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
                    <label className="block text-xs font-bold text-gray-700 mb-1">Contact (Phone/Email)</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                      value={editProfileData.phoneOrEmail}
                      onChange={e => setEditProfileData(prev => ({ ...prev, phoneOrEmail: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditProfileData({ name: userData?.name, phoneOrEmail: userData?.phoneOrEmail });
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
              <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Current Plan</p>
              
              {userData?.subscription?.isPaused ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2 text-amber-600 font-bold bg-amber-50 py-3 rounded-xl border border-amber-200">
                    <PauseCircle size={18} /> Subscription Paused
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    Paused until {userData?.subscription?.pauseEndDate ? new Date(userData.subscription.pauseEndDate).toLocaleDateString() : 'Manual Resume'}
                  </p>
                  <button
                    onClick={handleResumeSubscription}
                    disabled={isPausingStatus}
                    className="w-full py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
                  >
                    {isPausingStatus ? 'Resuming...' : <><PlayCircle size={16} /> Resume Delivery</>}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2 text-brand-dark font-bold bg-brand-secondary/50 py-3 rounded-xl border border-brand-primary/20">
                    <Package size={18} /> {orders?.activePlan || 'No Active Plan'}
                  </div>
                  {(orders?.activePlan) && (
                    <button
                      onClick={() => setShowPauseModal(true)}
                      className="w-full py-2 border border-brand-primary text-brand-primary rounded-lg text-sm font-bold hover:bg-brand-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <PauseCircle size={16} /> Pause Subscription
                    </button>
                  )}
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
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${notifications.orderUpdates ? 'bg-brand-primary' : ''}`}></div>
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
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${notifications.menuAnnouncements ? 'bg-brand-primary' : ''}`}></div>
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
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Gift className="text-brand-primary" />
                <h2 className="text-2xl font-serif font-bold">Refer & Earn</h2>
              </div>
            </div>
            <div className="bg-brand-secondary/30 p-6 rounded-2xl border border-brand-primary/10 flex flex-col md:flex-row items-center gap-6">
               <div className="flex-1">
                 <h3 className="font-bold text-lg text-gray-800 mb-2">Invite friends, get ₹100 off!</h3>
                 <p className="text-sm text-gray-600 mb-4">Share your unique code with friends. When they subscribe to any plan, they get 10% off their first month, and you get ₹100 off your next renewal.</p>
                 <div className="flex flex-col sm:flex-row gap-2">
                   <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-mono font-bold text-brand-dark tracking-wide flex items-center justify-between flex-1">
                     {userData?.referralCode || 'GHS-WELCOME'}
                     <button 
                       onClick={() => {
                         navigator.clipboard.writeText(userData?.referralCode || 'GHS-WELCOME');
                         alert('Referral code copied to clipboard!');
                       }}
                       className="text-brand-primary hover:text-brand-dark ml-2 flex items-center justify-center p-1"
                       aria-label="Copy code"
                     >
                       <Copy size={16} />
                     </button>
                   </div>
                   <button 
                     onClick={() => {
                       const message = `Hey! Use my code ${userData?.referralCode || 'GHS-WELCOME'} to get 10% off your first month at Ghar Ka Swaad!`;
                       window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                     }}
                     className="bg-brand-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                   >
                     <Gift size={16} /> Share
                   </button>
                 </div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm w-full md:w-auto shrink-0 md:min-w-[120px]">
                 <span className="block text-3xl font-bold text-brand-primary mb-1">₹{userData?.referralRewards || 0}</span>
                 <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block">Rewards Earned</span>
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
          </div>
        </motion.div>

      </div>

      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
          >
            <button 
              onClick={() => setShowPauseModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-bold mb-2">Pause Subscription</h3>
            <p className="text-sm text-gray-500 mb-6">
              Going out of town? You can pause your deliveries and resume them when you're back. 
              The paused days will be extended on your current plan.
            </p>
            <form onSubmit={handlePauseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pause Start Date</label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={pauseData.startDate}
                  onChange={e => setPauseData(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Resume Date (Optional)</label>
                <input 
                  type="date" 
                  min={pauseData.startDate || new Date().toISOString().split('T')[0]}
                  value={pauseData.endDate}
                  onChange={e => setPauseData(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
                <p className="text-xs text-gray-400 mt-1">If left blank, you can manually resume later.</p>
              </div>
              <button 
                type="submit" 
                disabled={isPausingStatus || !pauseData.startDate}
                className="w-full mt-2 bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50"
              >
                {isPausingStatus ? 'Pausing...' : 'Confirm Pause'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
