import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
        {/* Top Newsletter & Brand Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-3xl p-8 text-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Get Fresh Daily Deals & Organic Offers! 🌿
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-900/80">
              Subscribe to get instant 20% discount coupon on your first order.
            </p>
          </div>

          <div className="w-full md:w-auto flex items-center bg-slate-950 rounded-full p-1.5 shadow-lg">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="bg-transparent px-4 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none w-full md:w-64"
            />
            <button
              type="button"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-5 py-2.5 rounded-full font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Subscribe</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pt-4">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
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
              Your premier online shop for 100% Halal certified, farm-fresh organic vegetables, fruits, dairy, and everyday household essentials delivered in 15 minutes.
            </p>

            <div className="space-y-2 text-xs font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>42 Organic Way, Green Park Zone, Mumbai 400001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>+91 1800-456-7890 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>support@groceryhub.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Account & Shop</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li><a href="#shop" className="hover:text-amber-400 transition-colors">Shop Items</a></li>
              <li><Link to="/dashboard" className="hover:text-amber-400 transition-colors">User Dashboard</Link></li>
              <li><Link to="/dashboard/orders" className="hover:text-amber-400 transition-colors">My Orders</Link></li>
              <li><Link to="/dashboard/wishlist" className="hover:text-amber-400 transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/dashboard/addresses" className="hover:text-amber-400 transition-colors">Saved Addresses</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li><a href="#shop" className="hover:text-amber-400 transition-colors">Fresh Vegetables</a></li>
              <li><a href="#shop" className="hover:text-amber-400 transition-colors">Organic Fruits</a></li>
              <li><a href="#shop" className="hover:text-amber-400 transition-colors">Dairy & Fresh Milk</a></li>
              <li><a href="#shop" className="hover:text-amber-400 transition-colors">Bakery & Breads</a></li>
              <li><a href="#shop" className="hover:text-amber-400 transition-colors">Halal Chicken & Meat</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Customer Support</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li><Link to="/dashboard/settings" className="hover:text-amber-400 transition-colors">Help Center & FAQ</Link></li>
              <li><a href="#shop" className="hover:text-amber-400 transition-colors">15-Min Delivery Policy</a></li>
              <li><a href="#shop" className="hover:text-amber-400 transition-colors">Organic Certifications</a></li>
              <li><a href="#shop" className="hover:text-amber-400 transition-colors">Refund & Returns</a></li>
              <li><a href="#shop" className="hover:text-amber-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>© {new Date().getFullYear()} The Grocery Hub. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for Organic & Halal Grocery Shoppers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
