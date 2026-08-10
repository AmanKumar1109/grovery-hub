import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import DashboardLayout from './components/dashboard/DashboardLayout';
import FloatingWhatsApp from './components/ui/FloatingWhatsApp';
import GlobalPopup from './components/ui/GlobalPopup';
import OrderNotificationListener from './components/ui/OrderNotificationListener';
import { useAuth } from './context/AuthContext';
import { useSettings } from './context/SettingsContext';
import ScrollToTop from './components/ui/ScrollToTop';

// Applies data-theme="..." on <html> — triggers CSS variable switches site-wide
function ThemeApplier() {
  const { globalSettings } = useSettings();
  useEffect(() => {
    const theme = globalSettings?.activeTheme || 'normal';
    document.documentElement.setAttribute('data-theme', theme);
  }, [globalSettings?.activeTheme]);
  return null;
}

// Intercepts ?ref= parameter and stores in localStorage
function ReferralInterceptor() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('pendingReferralCode', refCode);
    }
  }, []);
  return null;
}

// TEMPORARY MIGRATION: Fix old referral coupons
function CouponFixer() {
  useEffect(() => {
    const fixOldCoupons = async () => {
      try {
        const { collection, getDocs, updateDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        const snap = await getDocs(collection(db, 'coupons'));
        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          if (data.isReferralCoupon && data.minOrderValue !== 100) {
            await updateDoc(doc(db, 'coupons', docSnap.id), { minOrderValue: 100 });
            console.log('Fixed minOrderValue for', docSnap.id);
          }
        }
      } catch (err) {
        console.error('Migration error:', err);
      }
    };
    fixOldCoupons();
  }, []);
  return null;
}


// CatalogPage & HomePage are eagerly imported — these are the two most-visited
// pages and must open instantly without any JS-chunk download delay.
import CatalogPage from './pages/CatalogPage';
import HomePage from './pages/HomePage';

// Code Splitting (Lazy Loading) for less-visited pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const MyOrders = lazy(() => import('./pages/dashboard/MyOrders'));
const TrackOrder = lazy(() => import('./pages/dashboard/TrackOrder'));
const Wishlist = lazy(() => import('./pages/dashboard/Wishlist'));
const SavedAddresses = lazy(() => import('./pages/dashboard/SavedAddresses'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));
const InvoicePage = lazy(() => import('./pages/dashboard/InvoicePage'));
const HelpSupport = lazy(() => import('./pages/dashboard/HelpSupport'));
const ComplaintPage = lazy(() => import('./pages/ComplaintPage'));
const DynamicPage = lazy(() => import('./pages/DynamicPage'));
const MyComplaints = lazy(() => import('./pages/dashboard/MyComplaints'));
const ReferEarn = lazy(() => import('./pages/dashboard/ReferEarn'));

// Fallback loader during page transitions
const PageLoader = () => (
  <div className="flex h-[70vh] w-full items-center justify-center">
    <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
  </div>
);

function GlobalNotification() {
  const { currentUser } = useAuth();
  return currentUser ? <OrderNotificationListener userId={currentUser.uid} /> : null;
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ThemeApplier />
        <CouponFixer />
        <ReferralInterceptor />
        <CartProvider>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/p/:shortId" element={<CatalogPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/category/:categoryName" element={<CatalogPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/complaint" element={<ComplaintPage />} />
              <Route path="/cancellation-policy" element={<DynamicPage documentId="cancellationPolicy" title="Cancellation Policy" />} />
              <Route path="/disclaimer" element={<DynamicPage documentId="disclaimer" title="Disclaimer" />} />
              <Route path="/shipping-policy" element={<DynamicPage documentId="shippingPolicy" title="Shipping & Delivery" />} />
              <Route path="/privacy-policy" element={<DynamicPage documentId="privacyPolicy" title="Privacy Policy" />} />
              <Route path="/terms-of-service" element={<DynamicPage documentId="termsOfService" title="Terms and Conditions" />} />
              <Route path="/refund-policy" element={<DynamicPage documentId="refundPolicy" title="Refund & Returns Policy" />} />
              <Route path="/about-us" element={<DynamicPage documentId="aboutUs" title="About Us" />} />

              {/* Dashboard Nested Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="help" element={<HelpSupport />} />
                <Route path="track-order/:id" element={<TrackOrder />} />
                <Route path="track-order" element={<TrackOrder />} />
                <Route path="track/:id" element={<TrackOrder />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="addresses" element={<SavedAddresses />} />
                <Route path="profile" element={<Profile />} />
                <Route path="refer-earn" element={<ReferEarn />} />
                <Route path="settings" element={<Navigate to="/dashboard/help" replace />} />
                <Route path="complaints" element={<MyComplaints />} />
                <Route path="invoice/:id" element={<InvoicePage />} />
              </Route>
            </Routes>
          </Suspense>
          <FloatingWhatsApp />
          <GlobalPopup />
          <GlobalNotification />
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
