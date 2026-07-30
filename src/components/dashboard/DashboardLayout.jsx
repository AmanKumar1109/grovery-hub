import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import CartDrawer from '../shop/CartDrawer';
import Footer from '../shop/Footer';
import ProfileCompletionModal from './ProfileCompletionModal';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-300 selection:text-slate-900 print:bg-white">
      {/* Top Website Header */}
      <div className="print:hidden">
        <Header />
      </div>

      {/* Main Dashboard Content Layout */}
      <div className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex items-start gap-8 print:p-0 print:m-0 print:max-w-none print:block">
        {/* Desktop Sticky Sidebar */}
        <div className="print:hidden hidden lg:block">
          <Sidebar />
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full min-w-0 print:w-full print:m-0 print:p-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation */}
      <div className="print:hidden">
        <BottomNav />
      </div>

      {/* Slide-over Cart Drawer */}
      <div className="print:hidden">
        <CartDrawer />
      </div>

      {/* Footer */}
      <div className="print:hidden">
        <Footer />
      </div>

      {/* Profile Completion Overlay */}
      <ProfileCompletionModal />
    </div>
  );
}
