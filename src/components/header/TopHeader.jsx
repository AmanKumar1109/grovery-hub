import React, { useEffect, useRef } from 'react';
import { ShoppingBag, Heart, ChevronDown } from 'lucide-react';
import SearchBar from '../ui/SearchBar';
import userAvatar from '../../assets/images/user-avatar.png';
import gsap from 'gsap';

export default function TopHeader() {
  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
  }, []);

  return (
    <div
      ref={headerRef}
      className="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-4 border-b border-gray-100 bg-white w-full"
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5 cursor-pointer select-none group">
        <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-md shadow-amber-200 group-hover:scale-105 transition-transform duration-200">
          <svg
            className="w-6 h-6 text-white fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zm-9-1a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" />
          </svg>
        </div>
        <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
          The <span className="text-emerald-700">Grocery</span> Hub
        </span>
      </div>

      {/* Search Bar */}
      <SearchBar />

      {/* Action Items & User Profile */}
      <div className="flex items-center gap-4">
        {/* Shopping Cart Button */}
        <button
          type="button"
          aria-label="Shopping Cart"
          className="relative p-2.5 rounded-full bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 transition-colors"
        >
          <ShoppingBag className="w-5 h-5 text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            0
          </span>
        </button>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          aria-label="Wishlist"
          className="p-2.5 rounded-full bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 transition-colors"
        >
          <Heart className="w-5 h-5 text-gray-700" />
        </button>

        {/* User Account Info */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <img
            src={userAvatar}
            alt="Saiful Talukdar"
            className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 shadow-sm"
          />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[11px] text-gray-400 font-medium leading-none">
              Welcome!
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-bold text-gray-800 group-hover:text-amber-600 transition-colors">
                Saiful Talukdar
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
