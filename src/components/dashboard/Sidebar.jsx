import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, MapPin, User, LogOut, Store, HelpCircle, MessageSquareWarning, Gift } from 'lucide-react';
import userAvatar from '../../assets/images/user-avatar.png';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/', label: 'Back to Shop', icon: Store, exact: true },
  { path: '/dashboard/orders', label: 'My Orders', icon: ShoppingBag },
  { path: '/dashboard/refer-earn', label: 'Refer & Earn', icon: Gift },
  { path: '/dashboard/complaints', label: 'My Complaints', icon: MessageSquareWarning },
  { path: '/dashboard/help', label: 'Help & Support', icon: HelpCircle },
  { path: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { path: '/dashboard/addresses', label: 'Saved Addresses', icon: MapPin },
  { path: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const { currentUser, userProfile, logout } = useAuth();
  const userName = userProfile?.fullName || currentUser?.displayName || 'User';
  const displayPhoto = userProfile?.photoURL || currentUser?.photoURL || userAvatar;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-3xl p-5 sticky top-8 z-20 flex-shrink-0">
      {/* Profile Summary Card */}
      <div className="flex items-center gap-3.5 mb-8 p-3 bg-gradient-to-br from-amber-50 to-emerald-50/50 rounded-2xl border border-amber-200/60 shadow-sm">
        <img
          src={displayPhoto}
          alt={userName}
          className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-sm flex-shrink-0"
        />
        <div className="min-w-0">
          <h3 className="font-extrabold text-slate-900 text-sm truncate">{userName}</h3>
          <p className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block mt-0.5">
            Gold Member 🌿
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-2xl font-extrabold text-xs tracking-wide transition-all duration-200 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-300/40 translate-x-1'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
              }`
            }
          >
            <item.icon className="w-4 h-4 stroke-[2.2]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 stroke-[2.2]" />
          Logout Account
        </button>
      </div>
    </aside>
  );
}
