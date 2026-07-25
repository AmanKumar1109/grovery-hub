import React, { useRef, useEffect } from 'react';
import { Package, Heart, ChevronRight, Clock, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';

export default function DashboardHome() {
  const containerRef = useRef(null);
  const { currentUser, userProfile } = useAuth();
  const userName = (userProfile?.fullName || currentUser?.displayName || 'Saiful Talukdar').split(' ')[0];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.stagger-item', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
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
              Track active deliveries, manage your saved addresses, and browse your favorite organic groceries.
            </p>
          </div>

          <Link
            to="/"
            className="self-start sm:self-center px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm rounded-full shadow-lg shadow-amber-400/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 group"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Wishlist Card */}
        <Link
          to="/dashboard/wishlist"
          className="stagger-item bg-white/90 backdrop-blur-xl border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-pink-200 transition-all group block"
        >
          <div className="w-11 h-11 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Heart className="w-5 h-5 fill-pink-500 stroke-pink-500" />
          </div>
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Wishlist Items</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">3 Saved</h3>
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
          <h3 className="text-2xl font-black text-slate-900 mt-1">3 Orders</h3>
        </Link>

        {/* Delivery Address Card */}
        <Link
          to="/dashboard/addresses"
          className="stagger-item bg-white/90 backdrop-blur-xl border border-slate-200/80 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group block col-span-2 sm:col-span-1"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Primary Location</p>
          <h3 className="text-sm font-black text-slate-900 mt-1 truncate">
            {userProfile?.address?.city || 'Mumbai'}, {userProfile?.address?.state || 'MH'}
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
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full border border-emerald-200/60">
                Out for Delivery 🚚
              </span>
              <span className="text-xs font-bold text-slate-400">#ORD-84321</span>
            </div>
            <span className="text-lg font-black text-slate-900">₹450.00</span>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200/60">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150"
                alt="Fresh Groceries"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-slate-900 truncate">Fresh Farm Vegetables & Organic Fruits</h4>
              <p className="text-xs font-bold text-slate-500 mt-1">5 items • Delivery expected by 4:00 PM</p>
            </div>
          </div>

          <Link
            to="/dashboard/track-order/ORD-84321"
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold rounded-2xl transition-all shadow-md shadow-amber-300/30"
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            Track Live Delivery
          </Link>
        </div>
      </div>
    </div>
  );
}
