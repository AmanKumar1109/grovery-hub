import React, { useState, useRef, useEffect } from 'react';
import { Package, Clock, CheckCircle2, XCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/dashboard/EmptyState';
import gsap from 'gsap';

const mockOrders = [
  { id: 'ORD-84321', status: 'active', date: 'Today, 2:30 PM', items: 5, amount: 450, expected: 'Today, 4:00 PM', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150' },
  { id: 'ORD-84319', status: 'delivered', date: 'Yesterday, 10:15 AM', items: 12, amount: 1240, deliveredAt: 'Yesterday, 11:30 AM', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=150' },
  { id: 'ORD-84290', status: 'cancelled', date: 'Mon, 18 Jul', items: 3, amount: 210, cancelledReason: 'Items out of stock', image: 'https://images.unsplash.com/photo-1596199050105-6d5d32222916?auto=format&fit=crop&q=80&w=150' }
];

export default function MyOrders() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.order-card', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      });
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab]);

  const filteredOrders = mockOrders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusConfig = (status) => {
    switch(status) {
      case 'active': return { color: 'text-amber-700', bg: 'bg-amber-100/80 border border-amber-300', icon: Clock, label: 'In Delivery' };
      case 'delivered': return { color: 'text-emerald-700', bg: 'bg-emerald-100/80 border border-emerald-300', icon: CheckCircle2, label: 'Delivered' };
      case 'cancelled': return { color: 'text-red-700', bg: 'bg-red-100/80 border border-red-300', icon: XCircle, label: 'Cancelled' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-100', icon: Package, label: status };
    }
  };

  return (
    <div ref={containerRef} className="pb-24 md:pb-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-slate-500 font-medium mt-1">Track live packages and view your purchase history</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search orders by ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all w-full sm:w-64"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 snap-x">
        {['all', 'active', 'delivered', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`snap-start px-5 py-2.5 rounded-full text-xs font-extrabold capitalize whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === tab 
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-300/40 scale-100' 
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 scale-95 hover:scale-100'
            }`}
          >
            {tab === 'all' ? 'All Orders' : tab}
          </button>
        ))}
      </div>

      {/* Order Cards List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={order.id} className="order-card bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${statusConfig.bg} ${statusConfig.color}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{order.id}</p>
                      <p className="text-xs font-bold text-slate-400">{order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">₹{order.amount.toFixed(2)}</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200/60">
                    <img src={order.image} alt="Order items" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-slate-900 line-clamp-1">Fresh Farm Produce & Grocery Essentials</h4>
                    <p className="text-xs font-bold text-slate-500 mt-1">{order.items} Items • Payment Verified</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {order.status === 'active' && (
                    <Link 
                      to={`/dashboard/track-order/${order.id}`} 
                      className="flex-1 min-w-[130px] py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-emerald-600/20"
                    >
                      Track Delivery
                    </Link>
                  )}
                  {order.status === 'delivered' && (
                    <button className="flex-1 min-w-[130px] py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 text-center font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-amber-400/30 cursor-pointer">
                      Reorder Now
                    </button>
                  )}
                  <button className="flex-1 min-w-[130px] py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center font-bold text-xs rounded-2xl transition-colors cursor-pointer">
                    View Invoice
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState 
            icon={Package}
            title="No orders found"
            description={`No ${activeTab !== 'all' ? activeTab : ''} orders matched your request.`}
            actionText="Browse Grocery Shop"
            actionLink="/"
          />
        )}
      </div>
    </div>
  );
}
