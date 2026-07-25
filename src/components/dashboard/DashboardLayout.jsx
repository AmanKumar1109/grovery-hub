import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import CartDrawer from '../shop/CartDrawer';
import Footer from '../shop/Footer';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-300 selection:text-slate-900">
      {/* Top Website Header */}
      <Header />

      {/* Main Dashboard Content Layout */}
      <div className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex items-start gap-8">
        {/* Desktop Sticky Sidebar */}
        <Sidebar />

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation */}
      <BottomNav />

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Footer */}
      <Footer />
    </div>
  );
}
