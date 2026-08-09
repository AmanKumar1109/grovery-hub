import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LayoutDashboard, Store } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export default function CategoryNav() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { globalSettings } = useSettings();

  const searchCategoriesRaw = globalSettings?.searchDropdownCategories || 'All Categories\nRice & Atta\nDals & Pulses\nOils & Ghee\nSpices & Masalas\nSnacks & Biscuits';
  const categories = searchCategoriesRaw.split('\n').filter(c => c.trim() !== '');

  const navLinks = [
    { name: 'Home', path: '/', exact: true },
    { name: 'Full Catalogue', path: '/catalog', icon: Store },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', path: '/dashboard/orders' },
    { name: 'Wishlist', path: '/dashboard/wishlist' },
    { name: 'Saved Addresses', path: '/dashboard/addresses' },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const theme = globalSettings?.activeTheme || 'normal';
  const isIndependence = theme === 'independence-day';

  return (
    <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 px-4 sm:px-8 lg:px-12 py-1.5 sm:py-2.5 bg-transparent w-full relative z-40">
      {/* Category Dropdown Pill */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label="Toggle Categories Dropdown"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-extrabold text-[11px] sm:text-xs transition-colors shadow-sm cursor-pointer ${
            isIndependence
              ? 'bg-[#0c5923] hover:bg-[#08421a] text-white border border-[#0c5923]'
              : 'bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          <span>All Categories</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isIndependence ? 'text-white' : 'text-emerald-600'
          } ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[60vh] overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setIsOpen(false);
                  if (cat.toLowerCase() === 'all categories') {
                    navigate('/catalog');
                  } else {
                    navigate(`/category/${encodeURIComponent(cat)}`);
                  }
                }}
                className="w-full text-left px-4 py-2.5 text-xs hover:bg-emerald-50 hover:text-emerald-700 font-bold text-slate-600 transition-colors cursor-pointer"
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.exact}
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-xs font-bold transition-all duration-150 py-1 ${isActive
                ? isIndependence ? 'text-[#0c5923] font-black border-b-2 border-[#0c5923]' : 'text-emerald-700 font-extrabold border-b-2 border-amber-400'
                : isIndependence ? 'text-[#1b4324] hover:text-[#0c5923]' : 'text-gray-600 hover:text-emerald-700'
              }`
            }
          >
            {link.icon && <link.icon className={`w-3.5 h-3.5 ${isIndependence ? 'text-[#0c5923]' : 'text-amber-500'}`} />}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
