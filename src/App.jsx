import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import DashboardLayout from './components/dashboard/DashboardLayout';
import FloatingWhatsApp from './components/ui/FloatingWhatsApp';
import GlobalPopup from './components/ui/GlobalPopup';
import OrderNotificationListener from './components/ui/OrderNotificationListener';
import { useAuth } from './context/AuthContext';
import ScrollToTop from './components/ui/ScrollToTop';

// Code Splitting (Lazy Loading) for Performance
const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
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
        <CartProvider>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
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
