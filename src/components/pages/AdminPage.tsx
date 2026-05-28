import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Search, MapPin, Phone, Mail, Package, IndianRupee } from 'lucide-react';
import FoodLoader from '../ui/FoodLoader';

export default function AdminPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersSnap, paymentsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'payments'))
        ]);

        const paymentsMap: Record<string, number> = {};
        const paymentsByUser: Record<string, number> = {};
        
        paymentsSnap.forEach(doc => {
          const data = doc.data();
          if (data.paymentId) {
            paymentsMap[data.paymentId] = data.amount || 0;
          }
          if (data.userId) {
            paymentsByUser[data.userId] = (paymentsByUser[data.userId] || 0) + (data.amount || 0);
          }
        });

        const usersList: any[] = [];
        usersSnap.forEach(doc => {
          const data = doc.data();
          
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
          }

          // Fallback to total payments by user if no specific sub payment amount found
          if (amountPaid === 0 && paymentsByUser[doc.id]) {
             amountPaid = paymentsByUser[doc.id];
          }

          // Handle creation time sorting
          let time = 0;
          if (data.createdAt && data.createdAt.toMillis) {
             time = data.createdAt.toMillis();
          } else if (data.createdAt) {
             time = new Date(data.createdAt).getTime();
          }

          usersList.push({
            id: doc.id,
            name: data.name || 'Unknown',
            phone: data.phone || 'N/A',
            email: data.email || 'N/A',
            address: data.address || 'N/A',
            plan: planName,
            amount: amountPaid,
            createdAt: time
          });
        });

        // Show latest customers first
        usersList.sort((a, b) => b.createdAt - a.createdAt);
        
        setCustomers(usersList);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
               No customers found matching your search.
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
