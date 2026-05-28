import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Search, MapPin, Phone, Mail, Package, IndianRupee, AlertCircle } from 'lucide-react';
import FoodLoader from '../ui/FoodLoader';

export default function AdminPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    console.log('Setting up real-time listener for Firestore data...');
    
    const usersCol = collection(db, 'users');
    const paymentsCol = collection(db, 'payments');
    
    // We will listen to users and payments
    let unsubscribeUsers: () => void;
    let unsubscribePayments: () => void;
    
    let currentUsers: any[] = [];
    let currentPayments: any[] = [];
    
    const processCustomers = (users: any[], payments: any[]) => {
      try {
        const paymentsMap: Record<string, number> = {};
        const paymentsByUser: Record<string, number> = {};
        
        payments.forEach(data => {
          if (data.paymentId) {
            paymentsMap[data.paymentId] = data.amount || 0;
          }
          if (data.userId) {
            paymentsByUser[data.userId] = (paymentsByUser[data.userId] || 0) + (data.amount || 0);
          }
        });

        const usersList: any[] = [];
        users.forEach(data => {
          let planName = 'No active plan';
          let amountPaid = 0;

          if (data.subscription && data.subscription.planName) {
             planName = data.subscription.planName;
             if (data.subscription.paymentId && paymentsMap[data.subscription.paymentId]) {
                 amountPaid = paymentsMap[data.subscription.paymentId];
             }
          } else if (data.subscriptions && data.subscriptions.length > 0) {
             const latestSub = data.subscriptions[data.subscriptions.length - 1];
             planName = latestSub.planName || 'Unknown Plan';
             if (latestSub.paymentId && paymentsMap[latestSub.paymentId]) {
                 amountPaid = paymentsMap[latestSub.paymentId];
             }
          } else if (data.selectedPlan) {
             planName = data.selectedPlan;
          } else if (data.planName) {
             planName = data.planName;
          } else if (data.plan) {
             planName = data.plan;
          }

          // Fallback to total payments by user if no specific sub payment amount found
          if (amountPaid === 0 && paymentsByUser[data.id]) {
             amountPaid = paymentsByUser[data.id];
          }

          let time = 0;
          if (data.createdAt && typeof data.createdAt.toMillis === 'function') {
             time = data.createdAt.toMillis();
          } else if (data.createdAt && typeof data.createdAt === 'number') {
             time = data.createdAt;
          } else if (data.createdAt) {
             const parsed = new Date(data.createdAt).getTime();
             if (!isNaN(parsed)) time = parsed;
          } else if (data.timestamp) {
             time = data.timestamp;
          }

          let fullAddress = [data.address, data.landmark, data.city].filter(Boolean).join(', ');
          if (!fullAddress) fullAddress = 'N/A';

          usersList.push({
            id: data.id,
            name: data.name || data.displayName || data.fullName || 'Unknown',
            phone: data.phone || data.phoneNumber || data.mobile || data.phoneOrEmail || 'N/A',
            email: data.email || 'N/A',
            address: fullAddress,
            plan: planName,
            amount: amountPaid || data.amount || data.paidAmount || data.amountPaid || 0,
            createdAt: time || Date.now()
          });
        });

        usersList.sort((a, b) => b.createdAt - a.createdAt);
        console.log('Processed customers:', usersList);
        setCustomers(usersList);
      } catch (err: any) {
        console.error('Error processing data:', err);
        setError('Error processing data display');
      }
    };

    try {
        unsubscribeUsers = onSnapshot(usersCol, (snap) => {
            currentUsers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            processCustomers(currentUsers, currentPayments);
            setLoading(false);
        }, (err) => {
            console.error('Users fetch error:', err);
            setError(err.message || 'Failed to fetch users. Check Firebase permissions.');
            setLoading(false);
        });
        
        unsubscribePayments = onSnapshot(paymentsCol, (snap) => {
            currentPayments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            processCustomers(currentUsers, currentPayments);
        }, (err) => {
            console.error('Payments fetch error:', err);
        });

    } catch (e: any) {
        console.error("Firestore init error", e);
        setError("Failed to connect to Firebase.");
        setLoading(false);
    }
    
    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribePayments) unsubscribePayments();
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const lowerSearch = searchTerm.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(lowerSearch) ||
      c.phone.includes(lowerSearch) ||
      c.email.toLowerCase().includes(lowerSearch) ||
      c.plan.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, customers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FoodLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage all your customers and subscriptions</p>
          </div>
          
          <div className="relative max-w-md w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Customer List */}
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl flex items-center gap-3">
             <AlertCircle size={24} className="text-red-500 shrink-0" />
             <div>
                <h3 className="font-bold text-red-800">Connection Error</h3>
                <p>{error}</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map(customer => (
              <div key={customer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{customer.name}</h3>
                  <div className="flex items-center text-sm text-brand-primary mt-1 gap-1 font-medium">
                    <Package size={14} />
                    {customer.plan}
                  </div>
                </div>
                {customer.amount > 0 && (
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <IndianRupee size={14} />
                    {customer.amount}
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-start gap-3 text-gray-600 text-sm">
                  <Phone size={16} className="mt-0.5 text-gray-400 shrink-0" />
                  <span>{customer.phone}</span>
                </div>
                
                <div className="flex items-start gap-3 text-gray-600 text-sm">
                  <Mail size={16} className="mt-0.5 text-gray-400 shrink-0" />
                  <span className="break-all">{customer.email}</span>
                </div>

                <div className="flex items-start gap-3 text-gray-600 text-sm">
                  <MapPin size={16} className="mt-0.5 text-gray-400 shrink-0" />
                  <span>{customer.address}</span>
                </div>
              </div>

            </div>
          ))}
          
          {filteredCustomers.length === 0 && (
             <div className="col-span-full py-20 text-center text-gray-500">
               {searchTerm ? 'No customers found matching your search.' : 'No customer data available'}
             </div>
          )}
        </div>
        )}

      </div>
    </div>
  );
}
