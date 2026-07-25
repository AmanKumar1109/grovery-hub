import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, User, MoreHorizontal, MapPin, Settings, LogOut, X, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';

const mainNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/', label: 'Shop Home', icon: Store, exact: true },
  { path: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/dashboard/profile', label: 'Profile', icon: User },
];

const moreItems = [
  { path: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { path: '/dashboard/addresses', label: 'Addresses', icon: MapPin },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const bgRef = useRef(null);
  const { logout } = useAuth();

  useEffect(() => {
    if (isDrawerOpen) {
      gsap.fromTo(bgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(drawerRef.current, { y: '100%' }, { y: '0%', duration: 0.4, ease: 'power3.out' });
    }
  }, [isDrawerOpen]);

  const closeDrawer = () => {
    gsap.to(bgRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(drawerRef.current, { y: '100%', duration: 0.3, ease: 'power3.in', onComplete: () => setIsDrawerOpen(false) });
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-40 pb-safe">
        <div className="flex items-center justify-around px-2 py-2.5">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-slate-950 font-extrabold bg-amber-400 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-800 font-bold'
                }`
              }
            >
              <item.icon className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 font-bold transition-all"
          >
            <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>

      {/* GSAP Animated Drawer */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end flex-col">
          <div
            ref={bgRef}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={closeDrawer}
          ></div>
          <div
            ref={drawerRef}
            className="relative bg-white rounded-t-3xl p-6 pb-12 shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Dashboard Options</h3>
              <button onClick={closeDrawer} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {moreItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    `flex items-center gap-4 p-4 rounded-2xl font-extrabold transition-all ${
                      isActive ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 stroke-[2.5]" />
                  {item.label}
                </NavLink>
              ))}
              <div className="h-px bg-slate-100 my-2"></div>
              <button
                onClick={() => {
                  closeDrawer();
                  logout();
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-left"
              >
                <LogOut className="w-5 h-5 stroke-[2.5]" />
                Logout Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
