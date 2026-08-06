import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingBag, Heart, ChevronDown, LayoutDashboard, ShoppingCart, User, MapPin, LogOut, Menu, X, Home, Store, LogIn, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../ui/SearchBar';
import userAvatar from '../../assets/images/user-avatar.png';
import logoImg from '../../assets/images/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import gsap from 'gsap';

const UrgencyBanner = () => {
  const { globalSettings } = useSettings();
  const isActive = globalSettings?.isUrgencyBannerActive ?? true;
  const bannerTextRaw = globalSettings?.urgencyBannerText || 'High Demand | Order in next {timer} to get it by {time}';
  const rotationInterval = globalSettings?.urgencyBannerInterval || 3;

  const bannerLines = bannerTextRaw.split('\n').filter(line => line.trim() !== '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59);
  const [deliveryTime, setDeliveryTime] = useState('');

  // Rotation Timer
  useEffect(() => {
    if (bannerLines.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % bannerLines.length);
    }, rotationInterval * 1000);
    return () => clearInterval(interval);
  }, [bannerLines.length, rotationInterval]);

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 15 * 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Delivery Time Calculation
  useEffect(() => {
    const dt = new Date(Date.now() + 15 * 60000);
    setDeliveryTime(dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const timerString = `${mins}:${secs}`;

  if (!isActive || bannerLines.length === 0) return null;

  const activeLine = bannerLines[currentIndex % bannerLines.length] || '';

  const renderText = () => {
    if (!activeLine) return null;
    const parts = activeLine.split(/(\{timer\}|\{time\})/g);
    return parts.map((part, index) => {
      if (part === '{timer}') {
        return <span key={index} className="bg-slate-800 text-white px-1.5 py-0.5 rounded shadow-sm border border-slate-700 font-black font-mono tracking-wider animate-pulse mx-1">{timerString}</span>;
      }
      if (part === '{time}') {
        return <span key={index} className="text-emerald-400 font-black mx-1">{deliveryTime}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="w-full bg-slate-950 text-slate-200 text-[10px] sm:text-[11px] font-bold py-1.5 px-2 flex items-center justify-center gap-1 sm:gap-2 overflow-hidden relative shadow-inner z-50">
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
      </span>

      <span className="tracking-wide relative z-10 flex items-center flex-wrap justify-center gap-0.5">
        {renderText()}
      </span>
    </div>
  );
};

export default function TopHeader() {
  const headerRef = useRef(null);
  const brandTextRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { currentUser, userProfile, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
    
    if (brandTextRef.current) {
      gsap.to(brandTextRef.current, {
        y: -3,
        rotation: 2,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut'
      });
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const userName = userProfile?.fullName || currentUser?.displayName || 'Grocery Member';

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop Items', path: '/#shop', icon: Store },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', path: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Wishlist', path: '/dashboard/wishlist', icon: Heart },
    { name: 'Saved Addresses', path: '/dashboard/addresses', icon: MapPin },
    { name: 'Profile Details', path: '/dashboard/profile', icon: User },
    { name: 'Help & Support', path: '/dashboard/help', icon: HelpCircle },
  ];

  return (
    <header
      ref={headerRef}
      className="relative z-[60] w-full flex flex-col transition-all duration-300"
    >
      <UrgencyBanner />
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-2.5 sm:py-4 border-b border-slate-200/30 bg-transparent w-full">
        {/* Left: 3-Lines Hamburger Menu Button (Mobile/Tablet) & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle Mobile Menu"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-amber-400 text-slate-800 hover:text-slate-950 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer select-none group">
            <img src={logoImg} fetchpriority="high" alt="The Grocery Hub logo" className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 object-contain shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
            <div className="flex flex-col leading-none ml-0.5">
              <span 
                className="text-[9px] sm:text-[11px] lg:text-xs text-amber-500 -rotate-3 transform -mb-0.5 sm:-mb-1 ml-0.5 drop-shadow-sm"
                style={{ fontFamily: "'Pacifico', cursive" }}
              >
                The
              </span>
              <span 
                className="text-lg sm:text-2xl lg:text-[1.75rem] font-extrabold tracking-tight whitespace-nowrap flex items-center gap-0.5 sm:gap-1" 
                style={{ fontFamily: "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif", letterSpacing: '-0.03em' }}
              >
                <span 
                  ref={brandTextRef}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600"
                  style={{ WebkitTextStroke: '0.3px rgba(16,185,129,0.15)' }}
                >
                  Grocery
                </span>
                <span 
                  className="text-slate-800"
                  style={{ WebkitTextStroke: '0.2px rgba(15,23,42,0.1)' }}
                >
                  Hub
                </span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden lg:block flex-1 max-w-xl mx-6">
          <SearchBar />
        </div>

        {/* Right: Action Items & User Profile / Login */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notification Bell Portal Target */}
          <div id="notification-bell-portal-target" className="flex-shrink-0"></div>

          {/* Shopping Cart Button */}
          <button
            type="button"
            id="cart-icon-target"
            aria-label="Shopping Cart"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full bg-gray-100/80 hover:bg-amber-100 text-gray-700 hover:text-amber-800 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce shadow-amber-400/50">
                {cartCount}
              </span>
            )}
          </button>

          {/* Wishlist Heart Button (Desktop) */}
          <Link
            to="/dashboard/wishlist"
            aria-label="Wishlist"
            className="hidden sm:flex p-2.5 rounded-full bg-gray-100/80 hover:bg-pink-100 text-gray-700 hover:text-pink-600 transition-colors"
          >
            <Heart className="w-5 h-5" />
          </Link>

          {/* Conditional Render: User Account Profile Dropdown IF LOGGED IN, else Login/Sign Up Button */}
          {currentUser ? (
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 cursor-pointer group focus:outline-none"
              >
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-amber-400 shadow-sm group-hover:border-amber-500 transition-colors flex-shrink-0"
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-[11px] text-gray-400 font-medium leading-none">
                    Welcome!
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs font-bold text-gray-800 group-hover:text-amber-600 transition-colors truncate max-w-[110px]">
                      {userName}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                  </div>
                </div>
              </button>

              {/* Interactive Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
                    <p className="text-sm font-extrabold text-slate-900 truncate">{userName}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-amber-500" />
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      My Orders
                    </Link>
                    <Link
                      to="/dashboard/wishlist"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-pink-500" />
                      Wishlist
                    </Link>
                    <Link
                      to="/dashboard/addresses"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-amber-600" />
                      Saved Addresses
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      Profile Details
                    </Link>
                    <Link
                      to="/dashboard/help"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                      Help & Support
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-full shadow-md shadow-amber-300/40 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Login / Sign Up</span>
            </Link>
          )}
        </div>

        {/* Full Screen React Portal for Mobile Menu Drawer */}
        {mobileMenuOpen &&
          createPortal(
            <div className="fixed inset-0 z-[100] flex">
              {/* Backdrop overlay */}
              <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              ></div>

              {/* Mobile Drawer Panel */}
              <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300 overflow-y-auto">
                <div className="space-y-6">
                  {/* Mobile Menu Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <img src={logoImg} loading="lazy" alt="The Grocery Hub Menu" className="w-9 h-9 object-contain shadow-sm" />
                      <span className="font-extrabold text-slate-900 text-sm">Navigation Menu</span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mobile Search Input */}
                  <div className="w-full">
                    <SearchBar />
                  </div>

                  {/* Navigation Items */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">
                      Quick Navigation
                    </p>
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.name}
                          to={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-extrabold text-xs text-slate-700 hover:bg-amber-400 hover:text-slate-950 transition-all"
                        >
                          <Icon className="w-4 h-4 text-amber-500 stroke-[2.2]" />
                          <span>{link.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Account Footer */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  {currentUser ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                        <img src={userAvatar} loading="lazy" alt={`Avatar of ${userName}`} className="w-10 h-10 rounded-full object-cover border border-amber-400 shadow-xs" />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">{userName}</p>
                          <p className="text-[10px] text-emerald-700 font-extrabold">Verified Member 🌿</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-extrabold text-xs text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout Account
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-md cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 stroke-[2.5]" />
                      <span>Login / Sign Up</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </header>
  );
}
