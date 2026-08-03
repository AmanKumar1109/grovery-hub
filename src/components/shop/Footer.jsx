import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, ChevronDown } from 'lucide-react';

const Instagram = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const Twitter = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const Facebook = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const Youtube = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
);

const Linkedin = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSettings } from '../../context/SettingsContext';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const { globalSettings } = useSettings();
  const footerRef = useRef(null);
  const [openAccordion, setOpenAccordion] = useState(null);

  const footerTitle = globalSettings?.footerTitle || 'Get Fresh Groceries in 15 Minutes!';
  const footerEmoji = globalSettings?.footerEmoji || '🚀';
  const footerSubtitle = globalSettings?.footerSubtitle || 'Shop online for superfast delivery of everyday essentials.';
  const brandDesc = globalSettings?.footerBrandDescription || 'Your premier online shop for farm-fresh vegetables, fruits, dairy, and everyday household essentials delivered in 15 minutes.';

  const defaultFooterCols = [
    {
      id: 'col1',
      title: 'Account & Shop',
      links: [
        { id: 1, label: 'Shop Items', url: '#shop' },
        { id: 2, label: 'User Dashboard', url: '/dashboard' },
        { id: 3, label: 'My Orders', url: '/dashboard/orders' },
        { id: 4, label: 'Saved Wishlist', url: '/dashboard/wishlist' },
        { id: 5, label: 'Saved Addresses', url: '/dashboard/addresses' }
      ]
    },
    {
      id: 'col2',
      title: 'Categories',
      links: [
        { id: 1, label: 'Dairy & Fresh Milk', url: '/?category=Dairy & Fresh Milk#shop' },
        { id: 2, label: 'Bakery & Breads', url: '/?category=Bakery & Breads#shop' },
        { id: 3, label: 'Rice, Atta & Dals', url: '/?category=Rice, Atta & Dals#shop' },
        { id: 4, label: 'Oils, Ghee & Masalas', url: '/?category=Oils, Ghee & Masalas#shop' },
        { id: 5, label: 'Snacks & Beverages', url: '/?category=Snacks & Beverages#shop' }
      ]
    },
    {
      id: 'col3',
      title: 'Customer Support',
      links: [
        { id: 1, label: 'Lodge a Complaint', url: '/complaint' },
        { id: 2, label: 'Help Center & FAQ', url: '/dashboard/help' },
        { id: 3, label: '15-Min Delivery Policy', url: '#shop' },
        { id: 4, label: 'Quality Standards', url: '#shop' },
        { id: 5, label: 'About Us', url: '/about-us' },
        { id: 6, label: 'Refund & Returns Policy', url: '/refund-policy' },
        { id: 7, label: 'Cancellation Policy', url: '/cancellation-policy' },
        { id: 8, label: 'Disclaimer', url: '/disclaimer' },
        { id: 9, label: 'Shipping & Delivery Policy', url: '/shipping-policy' },
        { id: 10, label: 'Terms and Conditions', url: '/terms-of-service' },
        { id: 11, label: 'Privacy Policy', url: '/privacy-policy' }
      ]
    }
  ];

  const footerColumns = globalSettings?.footerColumns || defaultFooterCols;

  const toggleAccordion = (section) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 155%',
          toggleActions: 'play none none none',
        },
      });

      // Promo banner slides up
      tl.fromTo(
        '.footer-promo',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      );

      // Brand column fades in from left
      tl.fromTo(
        '.footer-brand',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.55 },
        '-=0.3'
      );

      // Link columns stagger in from bottom
      tl.fromTo(
        '.footer-col',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        '-=0.25'
      );

      // Bottom bar fades in last
      tl.fromTo(
        '.footer-bottom',
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        '-=0.1'
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative w-full bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-900 overflow-hidden">
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
        {/* Top Promotional Banner */}
        <div className="footer-promo bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-3xl p-8 text-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight flex flex-wrap items-center justify-center md:justify-start gap-1">
              {footerTitle} <span className="inline-block animate-bounce">{footerEmoji}</span>
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-900/80">
              {footerSubtitle}
            </p>
          </div>

          <div className="w-full md:w-auto flex items-center justify-center">
            <Link
              to="/dashboard"
              className="bg-slate-950 hover:bg-slate-900 text-white px-8 py-3 rounded-full font-black text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
            >
              <span>Explore Shop</span>
            </Link>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pt-4">
          {/* Brand Info */}
          <div className="footer-brand lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 select-none">
              <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-slate-950 fill-current" viewBox="0 0 24 24">
                  <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zm-9-1a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" />
                </svg>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                The <span className="text-emerald-500">Grocery</span> Hub
              </span>
            </div>

            <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-sm">
              {brandDesc}
            </p>

            <div className="space-y-2 text-xs font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>Dadu complex, Near Shitla Mandir, Baharagora, 832101</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>{globalSettings?.supportPhone || '6207462800'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>{globalSettings?.supportEmail || 'thegroceryhub2025@gmail.com'}</span>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2">
              {globalSettings?.instagramUrl && (
                <a href={globalSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-amber-400 hover:text-slate-950 transition-all duration-300 hover:scale-110 shadow-lg">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {globalSettings?.twitterUrl && (
                <a href={globalSettings.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-amber-400 hover:text-slate-950 transition-all duration-300 hover:scale-110 shadow-lg">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {globalSettings?.facebookUrl && (
                <a href={globalSettings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-amber-400 hover:text-slate-950 transition-all duration-300 hover:scale-110 shadow-lg">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {globalSettings?.youtubeUrl && (
                <a href={globalSettings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-amber-400 hover:text-slate-950 transition-all duration-300 hover:scale-110 shadow-lg">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {globalSettings?.linkedinUrl && (
                <a href={globalSettings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-amber-400 hover:text-slate-950 transition-all duration-300 hover:scale-110 shadow-lg">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Navigation Columns */}
          {footerColumns.map((col, idx) => (
            <div key={col.id || idx} className="footer-col border-b border-slate-800/50 md:border-none pb-4 md:pb-0">
              <button onClick={() => toggleAccordion(col.id || idx)} className="w-full flex items-center justify-between md:cursor-default md:pointer-events-none group focus:outline-none">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">{col.title}</h4>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform md:hidden ${openAccordion === (col.id || idx) ? 'rotate-180' : ''}`} />
              </button>
              <ul className={`mt-3 space-y-2 text-xs font-semibold text-slate-400 overflow-hidden md:!block ${openAccordion === (col.id || idx) ? 'block' : 'hidden'}`}>
                {col.links?.map((link, linkIdx) => (
                  <li key={link.id || linkIdx}>
                    {(link.url?.startsWith('http') || link.url?.startsWith('#')) ? (
                      <a href={link.url} className="inline-block hover:text-amber-400 hover:translate-x-1.5 transition-all duration-300">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.url} className="inline-block hover:text-amber-400 hover:translate-x-1.5 transition-all duration-300">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 text-xs font-semibold text-slate-500">
          <p className="order-3 md:order-1 mt-4 md:mt-0">© {new Date().getFullYear()} The Grocery Hub. All rights reserved.</p>
          
          {/* Live Delivery Status */}
          <div className="order-1 md:order-2 flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-bold">Live - Delivering in your area</span>
          </div>

          <div className="order-2 md:order-3 flex items-center gap-2">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for Everyday Grocery Shoppers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
