import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { CheckCircle2, ArrowRight, MapPin, CreditCard, ChevronLeft, Tag, X, AlertTriangle, ShieldAlert, Navigation } from 'lucide-react';
import { collection, addDoc, doc, setDoc, serverTimestamp, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { checkAddressServiceability } from '../utils/locationUtils';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import LocationPickerModal from '../components/LocationPickerModal';

export default function CheckoutPage() {
  const { currentUser, userProfile, addAddress } = useAuth();
  const { globalSettings } = useSettings();
  const { 
    cartItems, 
    cartTotal, 
    finalTotal, 
    deliveryFee,
    availableCoupons, promoCodeInput, setPromoCodeInput,
    appliedCoupon, promoError, setPromoError,
    discountAmount, handleApplyPromo, handleRemovePromo,
    showToast, clearCart
  } = useCart();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    street: '',
    locality: '',
    city: 'Baharagora',
    state: 'Jharkhand',
    pincode: '832101',
    tag: 'Home',
    lat: null,
    lng: null
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [activeAddressId, setActiveAddressId] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationPickerModal, setShowLocationPickerModal] = useState(false);

  const handleConfirmLocationFromModal = (locationData) => {
    setAddressForm(prev => ({
      ...prev,
      street: locationData.street || prev.street,
      locality: locationData.locality || prev.locality,
      city: locationData.city || prev.city,
      state: locationData.state || prev.state,
      pincode: locationData.pincode || prev.pincode,
      lat: locationData.lat,
      lng: locationData.lng,
      location: locationData.location,
      addressDetails: locationData.addressDetails
    }));
    setShowAddressForm(true);
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser');
      return;
    }
    
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const maps = await loadGoogleMaps();
          const geocoder = new maps.Geocoder();
          
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const addressComponents = results[0].address_components;
              let city = '';
              let state = 'Jharkhand';
              let pincode = '';
              let streetParts = [];
              let localityParts = [];
              
              addressComponents.forEach(component => {
                const types = component.types;
                if (types.includes('locality')) city = component.long_name;
                else if (types.includes('administrative_area_level_1')) state = component.long_name;
                else if (types.includes('postal_code')) pincode = component.long_name;
                
                if (types.includes('neighborhood') || types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('sublocality_level_2') || types.includes('point_of_interest') || types.includes('landmark')) {
                  if (!localityParts.includes(component.long_name)) localityParts.push(component.long_name);
                }
                
                if (types.includes('route') || types.includes('street_number') || types.includes('premise')) {
                  streetParts.push(component.long_name);
                }
              });
              
              street = streetParts.join(', ');
              locality = localityParts.join(', ');
              
              // Fallback to formatted address if street is entirely empty
              if (!street) {
                const parts = results[0].formatted_address.split(',');
                street = parts[0] + (parts[1] && !parts[1].includes(city) ? ', ' + parts[1] : '');
              }
              
              if (!city) city = 'Baharagora';
              if (!pincode) pincode = '832101';
              
              setAddressForm(prev => ({
                ...prev,
                street: street || prev.street,
                locality: locality || prev.locality,
                city: city || prev.city,
                state: state || prev.state,
                pincode: pincode || prev.pincode,
                lat: latitude,
                lng: longitude
              }));
              showToast('Location fetched successfully!');
            } else {
              showToast('Could not fetch address for this location.');
            }
            setIsLocating(false);
          });
        } catch (error) {
          console.error("Google Maps API Error:", error);
          showToast('Failed to load Google Maps for address conversion.');
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === 1) showToast('Location permission denied. Please enable it in your browser.');
        else showToast('Could not fetch your location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (userProfile?.addresses && userProfile.addresses.length > 0) {
      if (!activeAddressId) {
        setActiveAddressId(userProfile.addresses[0].id);
      }
    } else {
      setShowAddressForm(true);
    }
  }, [userProfile, activeAddressId]);

  const addresses = userProfile?.addresses || [];
  const activeAddress = addresses.find(a => a.id === activeAddressId) || addresses[0];
  const hasAddress = Boolean(activeAddress);

  // Baharagora 5 KM Delivery Radius Check
  const serviceability = checkAddressServiceability(activeAddress || addressForm);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
    const minOrderAmount = globalSettings?.minOrderAmount || 100;
    if (cartItems.length === 0 && !isOrderConfirmed) {
      navigate('/catalog');
    } else if (cartTotal > 0 && cartTotal < minOrderAmount && !isOrderConfirmed) {
      showToast(`Minimum order amount is ₹${minOrderAmount}. Please add more items.`);
      navigate('/catalog');
    }
  }, [currentUser, cartItems, cartTotal, isOrderConfirmed, navigate, globalSettings?.minOrderAmount, showToast]);

  const handleInputChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.pincode) {
      showToast('Please fill out all required address fields.');
      return;
    }

    setIsProcessing(true);
    const newId = await addAddress(addressForm);
    setIsProcessing(false);
    if (newId) {
      setActiveAddressId(newId);
      showToast('Address saved successfully!');
    }
  };

  const handlePlaceOrder = async () => {
    if (!hasAddress || isProcessing) {
      if (!hasAddress) showToast('Please provide a delivery address first.');
      return;
    }

    // STRICT 5 KM BAHARAGORA RADIUS CHECK
    if (!serviceability.isServiceable) {
      showToast(serviceability.reason || 'Sorry! Delivery unavailable outside 5 km of Baharagora.');
      return;
    }

    setIsProcessing(true);

    try {
      const orderNum = Math.floor(1000 + Math.random() * 9000);
      const orderId = `ORD-${orderNum}`;
      const now = new Date();
      const timestamp = now.toISOString();
      const formattedTime = now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const phone = (activeAddress && activeAddress.phone) || (userProfile && userProfile.phone) || (currentUser && currentUser.phoneNumber) || '+91 9876543210';
      const custName = (userProfile && userProfile.fullName) || (currentUser && (currentUser.displayName || currentUser.email)) || (activeAddress && activeAddress.name) || 'Customer';
      const addrStr = activeAddress
        ? `${activeAddress.street || ''}, ${activeAddress.locality ? activeAddress.locality + ', ' : ''}${activeAddress.city || ''} ${activeAddress.pincode || ''}`.replace(/,\s*,/g, ',').trim()
        : 'Store Pickup';

      const safeDeliveryAddress = activeAddress ? {
        id: activeAddress.id || 'ADDR-1',
        street: activeAddress.street || '',
        locality: activeAddress.locality || '',
        city: activeAddress.city || '',
        state: activeAddress.state || '',
        pincode: activeAddress.pincode || '',
        tag: activeAddress.tag || activeAddress.type || 'Home',
        phone: phone,
        lat: activeAddress.lat || null,
        lng: activeAddress.lng || null
      } : { street: 'Store Pickup' };

      const orderData = {
        id: orderId,
        orderId: orderId,
        userId: currentUser ? currentUser.uid : 'guest',
        customerName: custName,
        customerPhone: phone,
        address: addrStr,
        deliveryAddress: addrStr,
        deliveryAddressObject: safeDeliveryAddress,
        lat: activeAddress?.lat || null,
        lng: activeAddress?.lng || null,
        items: cartItems.map(item => ({
          id: item.id || `ITEM-${Math.floor(Math.random() * 1000)}`,
          name: item.name || 'Grocery Item',
          qty: item.quantity || 1,
          quantity: item.quantity || 1,
          price: item.price || 0,
          image: item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'
        })),
        totalAmount: finalTotal > 0 ? finalTotal : 0,
        subTotal: cartTotal || 0,
        deliveryFee: deliveryFee || 0,
        discountAmount: discountAmount || 0,
        couponApplied: appliedCoupon ? appliedCoupon.code : null,
        status: 'Order Received',
        isCurrent: true,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending (COD)',
        orderTime: formattedTime,
        createdAt: timestamp,
        updatedAt: timestamp,
        // Delivery OTP Verification
        deliveryOtp: String(Math.floor(100000 + Math.random() * 900000)),
        deliveryOtpVerified: false,
        riderOtpVerified: false,
        adminOtpVerified: false,
        otpFailedAttempts: 0
      };

      const sanitizedOrderData = JSON.parse(JSON.stringify(orderData, (k, v) => v === undefined ? null : v));

      await setDoc(doc(db, 'orders', orderId), sanitizedOrderData);

      // Update recent buyers count for each item
      for (const item of cartItems) {
        if (item.id) {
          try {
            const prodRef = doc(db, 'items', item.id);
            await updateDoc(prodRef, {
              recentBuyers: increment(item.quantity || 1)
            });
          } catch (err) {
            console.error("Error updating recent buyers for item:", err);
          }
        }
      }

      clearCart();
      setIsProcessing(false);
      setIsOrderConfirmed(true);
    } catch (error) {
      console.error("Error creating order: ", error);
      showToast('Failed to place order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isOrderConfirmed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Order Confirmed!</h2>
          <p className="text-slate-500 font-medium mb-8">
            Thank you for shopping with Grovery. Your fresh groceries will be delivered to your address soon!
          </p>
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all cursor-pointer"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Shopping
        </button>

        <h1 className="text-3xl font-black text-slate-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Address and Payment */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery Address Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Delivery Address</h2>
              </div>

              {hasAddress && activeAddress ? (
                <div className="space-y-4">
                  <div className="p-5 border-2 border-emerald-500 bg-emerald-50/30 rounded-2xl relative">
                    <div className="absolute top-5 right-5 text-emerald-500">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-700 text-[10px] font-black rounded-md">{activeAddress.type}</span>
                      <h3 className="font-extrabold text-slate-900">{userProfile?.fullName}</h3>
                    </div>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed max-w-[80%]">
                      {activeAddress.street}, {activeAddress.locality && `${activeAddress.locality}, `}
                      {activeAddress.city}, {activeAddress.state}, {activeAddress.pincode}
                    </p>
                  </div>

                  {/* 5 KM Baharagora Radius Unserviceable Warning Banner */}
                  {!serviceability.isServiceable && (
                    <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-2 font-black text-sm text-rose-700">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>OUT OF 5 KM DELIVERY RADIUS ZONE</span>
                      </div>
                      <p className="text-xs font-bold text-rose-700 leading-relaxed">
                        {serviceability.reason}
                      </p>
                      <p className="text-[11px] font-medium text-rose-600 pt-1">
                        📍 Store Location: Main Market, Baharagora (832301). We only deliver orders within 5 km of Baharagora Hub.
                      </p>
                    </div>
                  )}
                  
                  {addresses.length > 1 && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-slate-500 mb-2">Or select another address:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {addresses.map(addr => (
                          <div 
                            key={addr.id}
                            onClick={() => setActiveAddressId(addr.id)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              activeAddressId === addr.id ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <h4 className="text-xs font-extrabold text-slate-900">{addr.type}</h4>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{addr.street}, {addr.city}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={() => navigate('/dashboard/addresses')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    + Manage Addresses
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!addressForm.lat ? (
                    <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-4">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <MapPin className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">Where should we deliver?</h3>
                      <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">Please select your exact delivery location on the map to continue.</p>
                      <button 
                        type="button" 
                        onClick={() => setShowLocationPickerModal(true)}
                        className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>🎯 Select Exact Delivery Point</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveAddress} className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4">
                        <p className="text-sm font-bold text-slate-500">Please enter your delivery details to proceed.</p>
                        <button 
                          type="button" 
                          onClick={() => setShowLocationPickerModal(true)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>🎯 Edit Map Location</span>
                        </button>
                      </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                      <input type="text" name="name" value={addressForm.name || ''} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" placeholder="Your Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone *</label>
                      <input type="tel" name="phone" value={addressForm.phone || ''} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" placeholder="Mobile Number" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Street Address *</label>
                    <input type="text" name="street" value={addressForm.street} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" placeholder="House/Flat No., Building Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Locality / Area</label>
                    <input type="text" name="locality" value={addressForm.locality} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" placeholder="E.g., Sector 62, Koramangala" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
                      <input type="text" name="city" value={addressForm.city} readOnly className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
                      <input type="text" name="state" value={addressForm.state} readOnly className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode *</label>
                    <input type="text" name="pincode" value={addressForm.pincode} readOnly className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed" />
                  </div>
                  <button type="submit" disabled={isProcessing} className="mt-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer">
                    {isProcessing ? 'Saving...' : 'Save Address'}
                  </button>
                </form>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Payment Method</h2>
              </div>
              
              <div className="p-5 border-2 border-amber-400 bg-amber-50/30 rounded-2xl relative cursor-pointer">
                <div className="absolute top-5 right-5 text-amber-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 mb-1">Cash on Delivery (COD)</h3>
                <p className="text-sm font-bold text-slate-600">Pay with cash or UPI when your order arrives.</p>
              </div>
              
              <div className="mt-4 p-4 border border-slate-200 bg-slate-50 rounded-xl opacity-60">
                <h3 className="font-extrabold text-slate-900 mb-1">Online Payment</h3>
                <p className="text-sm font-bold text-slate-500">Currently unavailable for this region.</p>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs font-bold text-slate-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Section */}
              <div className="border-t border-slate-100 pt-5 pb-2">
                {!appliedCoupon ? (
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-1.5"><Tag className="w-4 h-4 text-emerald-500"/> Apply Promo Code</h3>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={promoCodeInput}
                        onChange={e => {
                          setPromoCodeInput(e.target.value.toUpperCase());
                          setPromoError('');
                        }}
                        placeholder="Enter code here" 
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                      />
                      <button 
                        onClick={() => handleApplyPromo()}
                        className="px-4 py-2 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && <p className="text-xs font-bold text-rose-500 mt-2">{promoError}</p>}
                    
                    {/* List available coupons */}
                    {availableCoupons.filter(c => c.isActive).length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {availableCoupons.filter(c => c.isActive).map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => handleApplyPromo(c.code)}
                            className="shrink-0 border border-emerald-200 bg-emerald-50/50 rounded-lg px-3 py-2 cursor-pointer hover:bg-emerald-50 transition-colors"
                          >
                            <p className="text-xs font-black text-emerald-700">{c.code}</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">Min ₹{c.minOrderValue}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Code Applied</p>
                      <p className="text-sm font-black text-slate-900">{appliedCoupon.code}</p>
                    </div>
                    <button onClick={handleRemovePromo} className="text-slate-400 hover:text-rose-500 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-3">
                <div className="flex justify-between text-sm font-bold text-slate-600">
                  <span>Subtotal</span>
                  <span className="text-slate-900">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-600">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "text-emerald-600 font-black" : "text-slate-900"}>
                    {deliveryFee === 0 ? "FREE" : `+₹${deliveryFee}`}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm font-bold text-emerald-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-100">
                  <span>Total</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !hasAddress || !serviceability.isServiceable}
                className={`mt-6 w-full py-4 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all ${
                  !serviceability.isServiceable
                    ? 'bg-rose-100 text-rose-700 border-2 border-rose-300 opacity-80 cursor-not-allowed'
                    : (!hasAddress || isProcessing)
                    ? 'bg-amber-400 opacity-50 cursor-not-allowed text-slate-950'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-lg shadow-amber-300/40 cursor-pointer hover:-translate-y-0.5'
                }`}
              >
                <span>
                  {isProcessing
                    ? 'Processing...'
                    : !serviceability.isServiceable
                    ? '🚫 Delivery Unavailable (Out of 5 KM Zone)'
                    : 'Place Order'}
                </span>
                {!isProcessing && serviceability.isServiceable && <ArrowRight className="w-5 h-5" />}
              </button>

              {!serviceability.isServiceable && (
                <p className="text-center text-xs font-extrabold text-rose-600 mt-3">
                  ⚠️ This address (Bistupur / Jamshedpur / Out of range) is outside our 5 km Baharagora delivery zone!
                </p>
              )}
              
              {!hasAddress && (
                <p className="text-center text-xs font-bold text-red-500 mt-3">
                  Please save your delivery address to continue.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <LocationPickerModal
        isOpen={showLocationPickerModal}
        onClose={() => setShowLocationPickerModal(false)}
        onConfirm={handleConfirmLocationFromModal}
        initialLocation={addressForm}
      />
    </div>
  );
}
