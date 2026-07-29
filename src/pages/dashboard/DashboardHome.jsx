import React, { useRef, useEffect, useState } from 'react';
import { Package, Heart, ChevronRight, Clock, MapPin, Sparkles, ArrowRight, ShoppingBag, Wallet, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function DashboardHome() {
  const containerRef = useRef(null);
  const { currentUser, userProfile } = useAuth();
  const userName = (userProfile?.fullName || currentUser?.displayName || 'Customer').split(' ')[0];

  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoadingOrders(true);

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid)
    );

    const getTimeMs = (val) => {
      if (!val) return 0;
      if (typeof val === 'string') return new Date(val).getTime() || 0;
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (typeof val.seconds === 'number') return val.seconds * 1000;
      if (typeof val === 'number') return val;
      if (val instanceof Date) return val.getTime();
      return 0;
    };

    const unsub = onSnapshot(q, (snap) => {
      const loaded = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loaded.sort((a, b) => getTimeMs(b.createdAt || b.updatedAt) - getTimeMs(a.createdAt || a.updatedAt));
      setUserOrders(loaded);
      setLoadingOrders(false);
    }, (err) => {
      console.error("Error subscribing to dashboard orders:", err);
      setLoadingOrders(false);
    });

    return () => unsub();
  }, [currentUser]);

  const latestActiveOrder = userOrders.find(o => {
    const s = o.status?.toLowerCase();
    return s !== 'delivered' && s !== 'cancelled';
  });

  const totalSpent = userOrders.reduce((sum, order) => {
    if (order.status?.toLowerCase() !== 'cancelled') {
      const amt = parseFloat(order.totalAmount || order.amount || 0);
      return sum + (isNaN(amt) ? 0 : amt);
    }
    return sum;
  }, 0);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll('.stagger-item');
    if (items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(items, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'all'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="pb-24 md:pb-8 space-y-6 sm:space-y-8">
      {/* Welcome Card Banner */}
      <div className="stagger-item bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative ambient background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-400/20 rounded-full blur-2xl translate-y-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-extrabold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to your Account
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Hello, {userName}! 👋
            </h2>
            <p className="text-emerald-100 text-sm font-medium max-w-md">
              Track active deliveries, manage your saved addresses, and browse your favorite groceries.
            </p>
          </div>

          <Link
            to="/shop"
            className="self-start sm:self-center px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm rounded-full shadow-lg shadow-amber-400/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 group"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Stats Section Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        <Link
          to="/dashboard/wishlist"
          className="stagger-item bg-white/90 backdrop-blur-xl border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-pink-200 transition-all group block"
        >
          <div className="w-11 h-11 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Heart className="w-5 h-5 fill-pink-500 stroke-pink-500" />
          </div>
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Wishlist Items</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{userProfile?.wishlist?.length || 0} Saved</h3>
        </Link>

        {/* Total Orders Card */}
        <Link
          to="/dashboard/orders"
          className="stagger-item bg-white/90 backdrop-blur-xl border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-amber-200 transition-all group block"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Orders</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {loadingOrders ? '...' : `${userOrders.length}`}
          </h3>
        </Link>

        {/* Total Spent Card */}
        <Link
          to="/dashboard/orders"
          className="stagger-item bg-white/90 backdrop-blur-xl border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group block col-span-2 sm:col-span-1"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Spent</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1 truncate">
            {loadingOrders ? '...' : `₹${totalSpent.toFixed(2)}`}
          </h3>
        </Link>
      </div>

      {/* Active Orders Section */}
      <div className="stagger-item space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Delivery</h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Real-time status of your ongoing order</p>
          </div>
          <Link
            to="/dashboard/orders"
            className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60 transition-colors"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Active Order Card */}
        {latestActiveOrder ? (
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                  latestActiveOrder.status?.toLowerCase() === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/60'
                    : 'bg-amber-100 text-amber-800 border border-amber-200/60'
                }`}>
                  {latestActiveOrder.status === 'Order Received' ? 'Processing' : (latestActiveOrder.status || 'Processing')} 🚚
                </span>
                <span className="text-xs font-bold text-slate-400">#{latestActiveOrder.id}</span>
              </div>
              <span className="text-lg font-black text-slate-900">₹{(latestActiveOrder.totalAmount || 0).toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200/60">
                <img
                  src={latestActiveOrder.items?.[0]?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150'}
                  alt="Groceries"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-slate-900 truncate">
                  {latestActiveOrder.items?.[0]?.name || 'Grocery Order'} {latestActiveOrder.items?.length > 1 ? `+${latestActiveOrder.items.length - 1} more` : ''}
                </h4>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  {latestActiveOrder.items?.length || 1} items • 15-Min Express Delivery
                </p>
              </div>
            </div>

            <Link
              to={`/dashboard/track/${latestActiveOrder.id}`}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Track Live Delivery Status</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 p-8 rounded-3xl shadow-sm text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-base font-extrabold text-slate-800">No active delivery right now</h4>
            <p className="text-xs text-slate-400">Place an order to track live 15-minute doorstep delivery!</p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-sm mt-2"
            >
              Browse Grocery Store
            </Link>
          </div>
        )}
      </div>

      {/* Customer Support Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-200/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm shrink-0">
            <HelpCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Need Help with an Order or Delivery?</h4>
            <p className="text-xs text-slate-600">Lodge a complaint or chat directly on WhatsApp (+91 6207462800)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/dashboard/help"
            className="flex-1 sm:flex-initial py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all text-center"
          >
            Help & Support
          </Link>
          <Link
            to="/complaint"
            className="flex-1 sm:flex-initial py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all text-center"
          >
            Lodge Complaint
          </Link>
        </div>
      </div>
    </div>
  );
}
