import React, { useState, useRef, useEffect } from 'react';
import { Package, Clock, CheckCircle2, XCircle, Search, Loader2, AlertCircle, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/dashboard/EmptyState';
import OrderSkeleton from '../../components/dashboard/OrderSkeleton';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function MyOrders() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [userCancelReason, setUserCancelReason] = useState('Ordered by mistake');
  const [userCustomCancelReason, setUserCustomCancelReason] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const containerRef = useRef(null);
  const { currentUser } = useAuth();
  const { addToCart, setIsCartOpen, showToast } = useCart();

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
      const finalReason = userCancelReason === 'Other' ? (userCustomCancelReason.trim() || 'No reason provided') : userCancelReason;
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { 
        status: 'cancelled',
        cancelReason: `Cancelled by Customer: ${finalReason}`
      });
      // No need to update local state since onSnapshot will handle it automatically
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancellingOrderId(null);
      setOrderToCancel(null);
      setUserCancelReason('Ordered by mistake');
      setUserCustomCancelReason('');
    }
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) {
      showToast("No items found in this order.");
      return;
    }
    
    order.items.forEach(item => {
      addToCart(item, item.quantity || 1);
    });
    
    setIsCartOpen(true);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredOrders = orders.filter(order => {
    const status = order.status?.toLowerCase() || '';
    let matchesTab = false;
    
    if (activeTab === 'all') {
      matchesTab = true;
    } else if (activeTab === 'active') {
      matchesTab = status !== 'delivered' && status !== 'cancelled';
    } else if (activeTab === 'delivered') {
      matchesTab = status === 'delivered';
    } else if (activeTab === 'cancelled') {
      matchesTab = status === 'cancelled';
    }

    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusConfig = (rawStatus) => {
    const status = rawStatus?.toLowerCase() || '';
    if (status === 'delivered') return { color: 'text-emerald-700', bg: 'bg-emerald-100/80 border border-emerald-300', icon: CheckCircle2, label: 'Delivered' };
    if (status === 'cancelled') return { color: 'text-red-700', bg: 'bg-red-100/80 border border-red-300', icon: XCircle, label: 'Cancelled' };
    
    const displayStatus = rawStatus === 'Order Received' ? 'Processing' : (rawStatus || 'Processing');
    return { color: 'text-amber-700', bg: 'bg-amber-100/80 border border-amber-300', icon: Clock, label: displayStatus };
  };

  return (
    <div className="relative min-h-screen">
      {/* Ambient Auroras */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-300/20 blur-[100px] rounded-full mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-amber-300/20 blur-[120px] rounded-full mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] bg-blue-300/20 blur-[120px] rounded-full mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>
      
      <div ref={containerRef} className="relative z-10 pb-24 md:pb-8 space-y-6">
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
            className={`relative snap-start px-6 py-3 rounded-[1.25rem] text-xs font-black capitalize whitespace-nowrap transition-all duration-300 overflow-hidden ${
              activeTab === tab 
                ? 'text-slate-900 shadow-lg shadow-amber-500/20 scale-100' 
                : 'bg-white/50 backdrop-blur-md text-slate-500 border border-white/60 hover:bg-white/80 scale-95 hover:scale-100'
            }`}
          >
            {activeTab === tab && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-400"></div>
            )}
            <span className="relative z-10">{tab === 'all' ? 'All Orders' : tab}</span>
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
            const isCancelled = order.status?.toLowerCase() === 'cancelled';
            
            // Extract some display data from the real order
            const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
            const orderAmount = order.totalAmount || order.amount || 0; // fallback to .amount for older data
            const orderDate = formatDate(order.createdAt);
            const orderImage = order.items?.[0]?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150';
            
            const orderTimeMs = order.createdAt ? (
              typeof order.createdAt.toMillis === 'function' ? order.createdAt.toMillis() :
              typeof order.createdAt.seconds === 'number' ? order.createdAt.seconds * 1000 :
              typeof order.createdAt === 'string' ? new Date(order.createdAt).getTime() :
              typeof order.createdAt === 'number' ? order.createdAt :
              order.createdAt instanceof Date ? order.createdAt.getTime() : currentTime
            ) : currentTime;
            
            const timeElapsed = currentTime - orderTimeMs;
            const timeRemaining = Math.max(0, 5 * 60 * 1000 - timeElapsed);
            const isCancelable = timeRemaining > 0;
            
            const formatTime = (ms) => {
              const totalSeconds = Math.floor(ms / 1000);
              const minutes = Math.floor(totalSeconds / 60);
              const seconds = totalSeconds % 60;
              return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            };

            
            return (
              <div key={order.id} className={`group relative order-card backdrop-blur-2xl border rounded-[2rem] p-5 sm:p-7 transition-all duration-500 overflow-hidden ${
                  isCancelled 
                    ? 'bg-red-50/40 border-red-200/50 grayscale-[0.5] opacity-75' 
                    : 'bg-white/60 border-white/80 hover:bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1'
                }`}>
                
                {/* Shimmer Effect */}
                {!isCancelled && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                )}
                
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-200/50">
                    <div className="flex items-center gap-3.5">
                      <div className={`p-3 rounded-2xl ${statusConfig.bg} ${statusConfig.color} shadow-inner`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{orderDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">₹{orderAmount.toFixed(2)}</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${statusConfig.bg} ${statusConfig.color}`}>
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

                {/* Next Morning Delivery Badge */}
                {order.isNextMorningDelivery && !isCancelled && (
                  <div className="flex items-center gap-2.5 mb-5 px-3.5 py-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl shadow-sm">
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <span className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">Next Morning Delivery (9 AM - 12 PM)</span>
                  </div>
                )}

                {/* Delivery OTP Section - Only for active orders */}
                {!isCancelled && order.status !== 'Delivered' && order.deliveryOtp && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60">
                    <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider mb-1.5">
                      🔐 Delivery OTP
                    </p>
                    <p className="text-2xl font-black text-slate-900 tracking-[0.3em] font-mono">
                      {order.deliveryOtp}
                    </p>
                    <p className="text-[10px] font-bold text-amber-600/80 mt-1.5">
                      Share this OTP only after receiving your order.
                    </p>
                  </div>
                )}

                {isCancelled && order.cancelReason && (
                  <div className="mb-2 mt-4 p-3 rounded-2xl bg-slate-900/5 border border-slate-900/10 flex items-start gap-3">
                    <div className="p-1.5 bg-red-100 text-red-600 rounded-lg shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Cancellation Reason</p>
                      <p className="text-xs font-bold text-slate-500 mt-0.5 leading-relaxed">{order.cancelReason}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-4 pt-5 border-t border-slate-100/80">
                  {!isCancelled && order.status !== 'Delivered' && (
                    <>
                      <Link 
                        to={`/dashboard/track-order/${order.id}`} 
                        className="flex-1 min-w-[140px] py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-md shadow-amber-300/40 flex items-center justify-center gap-2"
                      >
                        <Clock className="w-4 h-4 stroke-[2.5]" />
                        <span>Track Live Delivery</span>
                      </Link>
                      {isCancelable ? (
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
                          ) : (
                            <>
                              <span>Cancel Order</span>
                              <span className="px-1.5 py-0.5 bg-red-200/80 text-red-800 rounded-md text-[10px] font-black tabular-nums tracking-tight border border-red-300/50">
                                {formatTime(timeRemaining)}
                              </span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div 
                          className="flex-1 min-w-[130px] py-3 bg-slate-100 text-slate-400 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed"
                          title="Cancellation period of 5 minutes has passed"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancellation Time Expired</span>
                        </div>
                      )}
                    </>
                  )}
                  {(isCancelled || order.status === 'Delivered') && (
                    <button 
                      onClick={() => handleReorder(order)}
                      className={`flex-1 min-w-[130px] py-3 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md cursor-pointer ${
                        isCancelled 
                          ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/20' 
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      }`}
                    >
                      Reorder Items
                    </button>
                  )}
                  <Link 
                    to={`/dashboard/invoice/${order.id}`}
                    className="flex-1 min-w-[130px] py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-colors cursor-pointer text-center block flex items-center justify-center"
                  >
                    View Invoice
                  </Link>
                </div>
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

            <div className="mb-6 space-y-3">
              <label className="block text-xs font-bold text-slate-700">Why are you cancelling?</label>
              <select 
                value={userCancelReason}
                onChange={(e) => setUserCancelReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Forgot to apply a coupon">Forgot to apply a coupon</option>
                <option value="Change of mind">Change of mind</option>
                <option value="Other">Other</option>
              </select>

              {userCancelReason === 'Other' && (
                <textarea 
                  placeholder="Please specify your reason..."
                  value={userCustomCancelReason}
                  onChange={(e) => setUserCustomCancelReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-amber-500 outline-none resize-none h-20"
                ></textarea>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setOrderToCancel(null);
                  setUserCancelReason('Ordered by mistake');
                  setUserCustomCancelReason('');
                }}
                disabled={cancellingOrderId}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
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
    </div>
  );
}
