import React from 'react';
import Header from '../components/header/Header';
import HeroSection from '../components/hero/HeroSection';
import ShopSection from '../components/shop/ShopSection';
import PromoBanners from '../components/shop/PromoBanners';
import TrustFeatures from '../components/shop/TrustFeatures';
import Testimonials from '../components/shop/Testimonials';
import Footer from '../components/shop/Footer';
import CartDrawer from '../components/shop/CartDrawer';
import { useCart } from '../context/CartContext';
import { Check } from 'lucide-react';

export default function HomePage() {
  const { toastMessage } = useCart();

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-300 selection:text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 text-xs font-black animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full bg-white relative">
        {/* Navigation Header */}
        <Header />

        {/* Hero Section */}
        <HeroSection />

        {/* Shop Items Section (Below Hero Section) */}
        <ShopSection />

        {/* Promotional Deal Banners */}
        <PromoBanners />

        {/* Trust Features & Guarantees */}
        <TrustFeatures />

        {/* Customer Testimonials & Ratings */}
        <Testimonials />

        {/* Website Footer */}
        <Footer />
      </main>

      {/* Interactive Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
