import React from 'react';
import { ChevronDown, LayoutDashboard, Store } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function CategoryNav() {
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/', exact: true },
    { name: 'Full Catalog', path: '/catalog', icon: Store },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', path: '/dashboard/orders' },
    { name: 'Wishlist', path: '/dashboard/wishlist' },
    { name: 'Saved Addresses', path: '/dashboard/addresses' },
  ];

  return (
    <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 px-4 sm:px-8 lg:px-12 py-2.5 bg-white border-b border-gray-100 w-full overflow-x-auto no-scrollbar">
      {/* Category Dropdown Pill */}
      <button
        type="button"
        onClick={() => navigate('/catalog')}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 font-extrabold text-xs hover:bg-emerald-100 transition-colors shadow-sm flex-shrink-0 cursor-pointer"
      >
        <span>All Categories</span>
        <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
      </button>

      {/* Main Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.exact}
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-xs font-bold transition-all duration-150 py-1 ${
                isActive
                  ? 'text-emerald-700 font-extrabold border-b-2 border-amber-400'
                  : 'text-gray-600 hover:text-emerald-700'
              }`
            }
          >
            {link.icon && <link.icon className="w-3.5 h-3.5 text-amber-500" />}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
