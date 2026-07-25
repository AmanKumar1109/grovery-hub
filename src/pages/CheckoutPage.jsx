import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CheckCircle2, ArrowRight, MapPin, CreditCard, ChevronLeft } from 'lucide-react';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function CheckoutPage() {
  const { currentUser, userProfile, addAddress } = useAuth();
  const { cartItems, cartTotal, clearCart, showToast } = useCart();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  const [addressForm, setAddressForm] = useState({
    street: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
    tag: 'Home'
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [activeAddressId, setActiveAddressId] = useState(null);

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

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
    if (cartItems.length === 0 && !isOrderConfirmed) {
      navigate('/catalog');
    }
  }, [currentUser, cartItems, isOrderConfirmed, navigate]);

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

    setIsProcessing(true);

    try {
      const orderNum = Math.floor(1000 + Math.random() * 9000);
      const orderId = `ORD-${orderNum}`;
      const timestamp = new Date().toISOString();

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
        phone: phone
      } : { street: 'Store Pickup' };

      await setDoc(doc(db, 'orders', orderId), {
        id: orderId,
        orderId: orderId,
        userId: currentUser ? currentUser.uid : 'guest',
        customerName: custName,
        customerPhone: phone,
        address: addrStr,
        deliveryAddress: addrStr,
        deliveryAddressObject: safeDeliveryAddress,
        items: cartItems.map(item => ({
          id: item.id || `ITEM-${Math.floor(Math.random() * 1000)}`,
          name: item.name || 'Grocery Item',
          qty: item.quantity || 1,
          quantity: item.quantity || 1,
          price: item.price || 0,
          image: item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'
        })),
        totalAmount: cartTotal || 0,
        status: 'Processing',
        isCurrent: true,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending (COD)',
        createdAt: timestamp,
        updatedAt: timestamp
      });

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
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <p className="text-sm font-bold text-slate-500 mb-4">Please enter your delivery details to proceed.</p>
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
                      <input type="text" name="city" value={addressForm.city} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
                      <input type="text" name="state" value={addressForm.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode *</label>
                    <input type="text" name="pincode" value={addressForm.pincode} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" />
                  </div>
                  <button type="submit" disabled={isProcessing} className="mt-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer">
                    {isProcessing ? 'Saving...' : 'Save Address'}
                  </button>
                </form>
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

              <div className="border-t border-slate-100 pt-5 space-y-3">
                <div className="flex justify-between text-sm font-bold text-slate-600">
                  <span>Subtotal</span>
                  <span className="text-slate-900">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-100">
                  <span>Total</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !hasAddress}
                className={`mt-6 w-full py-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-300/40 transition-all ${(!hasAddress || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}`}
              >
                <span>{isProcessing ? 'Processing...' : 'Place Order'}</span>
                {!isProcessing && <ArrowRight className="w-5 h-5" />}
              </button>
              
              {!hasAddress && (
                <p className="text-center text-xs font-bold text-red-500 mt-3">
                  Please save your delivery address to continue.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
