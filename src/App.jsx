import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import MyOrders from './pages/dashboard/MyOrders';
import TrackOrder from './pages/dashboard/TrackOrder';
import Wishlist from './pages/dashboard/Wishlist';
import SavedAddresses from './pages/dashboard/SavedAddresses';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';
import InvoicePage from './pages/dashboard/InvoicePage';
import HelpSupport from './pages/dashboard/HelpSupport';
import ComplaintPage from './pages/ComplaintPage';
import DynamicPage from './pages/DynamicPage';
import MyComplaints from './pages/dashboard/MyComplaints';
import FloatingWhatsApp from './components/ui/FloatingWhatsApp';
import OrderNotificationListener from './components/ui/OrderNotificationListener';
import { useAuth } from './context/AuthContext';

function GlobalNotification() {
  const { currentUser } = useAuth();
  return currentUser ? <OrderNotificationListener userId={currentUser.uid} /> : null;
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/complaint" element={<ComplaintPage />} />
            <Route path="/privacy-policy" element={<DynamicPage documentId="privacyPolicy" title="Privacy Policy" />} />
            <Route path="/terms-of-service" element={<DynamicPage documentId="termsOfService" title="Terms of Service" />} />
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
          <FloatingWhatsApp />
          <GlobalNotification />
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
