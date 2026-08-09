import React from 'react';
import Header from '../components/header/Header';
import HeroSection from '../components/hero/HeroSection';
import ShopSection from '../components/shop/ShopSection';
import PromoBanners from '../components/shop/PromoBanners';
import WhyShopFromUs from '../components/shop/WhyShopFromUs';
import TrustFeatures from '../components/shop/TrustFeatures';
import Testimonials from '../components/shop/Testimonials';
import Footer from '../components/shop/Footer';
import CartDrawer from '../components/shop/CartDrawer';
import { useCart } from '../context/CartContext';
import { Check } from 'lucide-react';
import SEO from '../components/seo/SEO';
import FestiveBanner from '../components/ui/FestiveBanner';

export default function HomePage() {
  const { toastMessage } = useCart();

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "The Grocery Hub",
    "url": "https://thegroceryhub.example.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://thegroceryhub.example.com/catalog?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-300 selection:text-slate-900">
      <SEO 
        title="Fresh Organic Groceries in 15 Minutes"
        description="Shop fresh organic groceries, daily essentials, and personal care products online. Unbeatable prices with lightning-fast 15-minute delivery."
        url="/"
        schema={homeSchema}
      />
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
        {/* Festive Banner — visible only when Independence Day or Diwali theme is active */}
        <FestiveBanner />

        {/* Navigation Header */}
        <Header />

        {/* Hero Section */}
        <HeroSection />

        {/* Shop Items Section (Below Hero Section) */}
        <ShopSection />

        {/* Promotional Deal Banners */}
        <PromoBanners />

        {/* Why Shop From The Grocery Hub */}
        <WhyShopFromUs />

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
