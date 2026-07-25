import React, { useState, useRef, useEffect } from 'react';
import { Package, Clock, CheckCircle2, XCircle, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/dashboard/EmptyState';
import OrderSkeleton from '../../components/dashboard/OrderSkeleton';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function MyOrders() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const containerRef = useRef(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedOrders = [];
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() });
      });
      
      const getTimeMs = (val) => {
        if (!val) return 0;
        if (typeof val === 'string') return new Date(val).getTime() || 0;
        if (typeof val.toMillis === 'function') return val.toMillis();
        if (typeof val.seconds === 'number') return val.seconds * 1000;
        if (typeof val === 'number') return val;
        if (val instanceof Date) return val.getTime();
        return 0;
      };

      fetchedOrders.sort((a, b) => getTimeMs(b.createdAt || b.updatedAt) - getTimeMs(a.createdAt || a.updatedAt));

      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error subscribing to orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCancelOrder = async (orderId) => {
    setCancellingOrderId(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'cancelled' });
      // No need to update local state since onSnapshot will handle it automatically
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancellingOrderId(null);
      setOrderToCancel(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    let date;
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.order-card');
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(cards, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      });
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab, orders.length, loading]);

  const filteredOrders = orders.filter(order => {
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
        {loading ? (
          <div>
            {[...Array(3)].map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            
            // Extract some display data from the real order
            const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
            const orderAmount = order.totalAmount || order.amount || 0; // fallback to .amount for older data
            const orderDate = formatDate(order.createdAt);
            const orderImage = order.items?.[0]?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150';
            
            return (
              <div key={order.id} className="order-card bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${statusConfig.bg} ${statusConfig.color}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs font-bold text-slate-400">{orderDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">₹{orderAmount.toFixed(2)}</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200/60">
                    <img src={orderImage} alt="Order items" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-slate-900 line-clamp-1">
                      {order.items?.length > 1 ? `${order.items[0].name} and ${order.items.length - 1} more items` : order.items?.[0]?.name || 'Grocery Essentials'}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 mt-1">{itemCount} Items • Payment Verified</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <>
                      <Link 
                        to={`/dashboard/track-order/${order.id}`} 
                        className="flex-1 min-w-[140px] py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-md shadow-amber-300/40 flex items-center justify-center gap-2"
                      >
                        <Clock className="w-4 h-4 stroke-[2.5]" />
                        <span>Track Live Delivery</span>
                      </Link>
                      <button 
                        onClick={() => setOrderToCancel(order.id)}
                        disabled={cancellingOrderId === order.id}
                        className="flex-1 min-w-[130px] py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {cancellingOrderId === order.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Cancelling...</span>
                          </>
                        ) : "Cancel Order"}
                      </button>
                    </>
                  )}
                  {order.status === 'Delivered' && (
                    <button className="flex-1 min-w-[130px] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer">
                      Reorder Items
                    </button>
                  )}
                  <button className="flex-1 min-w-[130px] py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-colors cursor-pointer">
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

      {/* Cancel Order Confirmation Popup */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-5 mx-auto">
              <XCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Cancel Order?</h3>
            <p className="text-sm font-semibold text-slate-500 text-center mb-6 px-2">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setOrderToCancel(null)}
                disabled={cancellingOrderId}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
              >
                No, Keep it
              </button>
              <button 
                onClick={() => handleCancelOrder(orderToCancel)}
                disabled={cancellingOrderId}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cancellingOrderId ? (
                  <><Loader2 className="w-4 h-4 animate-spin"/> Cancelling...</>
                ) : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
