import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogOut, History, Package, User } from 'lucide-react';
import { BRAND_DATA } from '../../constants';

export default function DashboardPage({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const handleReorder = () => {
    // Basic interaction
    window.open(`https://wa.me/${BRAND_DATA.brand.whatsapp.replace(/[^0-9]/g, '')}?text=Hi,%20I'd%20like%20to%20reorder%20my%20last%20meal`, '_blank');
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
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-medium"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1"
        >
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-brand-secondary rounded-full flex items-center justify-center text-brand-primary mb-4">
              <User size={32} />
            </div>
            <h3 className="font-bold text-xl mb-1">{userData?.name}</h3>
            <p className="text-gray-500 text-sm mb-6">{userData?.phoneOrEmail}</p>

            <div className="w-full pt-6 border-t border-gray-100 mt-auto">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Current Plan</p>
              <div className="flex items-center justify-center gap-2 text-brand-dark font-bold bg-brand-secondary/50 py-3 rounded-xl border border-brand-primary/20">
                <Package size={18} /> {orders?.activePlan || 'No Active Plan'}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 h-full">
            <div className="flex items-center gap-3 mb-6">
              <History className="text-brand-primary" />
              <h2 className="text-2xl font-serif font-bold">Order History</h2>
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
                      {order.id === orders.history[0].id && (
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
    </div>
  );
}
