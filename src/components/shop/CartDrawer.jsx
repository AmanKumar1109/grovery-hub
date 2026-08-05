import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, CheckCircle2, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
export default function CartDrawer() {
  const { 
    isCartOpen, setIsCartOpen, cartItems, cartTotal, updateQuantity, removeFromCart, clearCart, showToast,
    availableCoupons, promoCodeInput, setPromoCodeInput, appliedCoupon, promoError, setPromoError,
    discountAmount, deliveryFee, finalTotal, handleApplyPromo, handleRemovePromo 
  } = useCart();
  const { currentUser, userProfile } = useAuth();
  const { globalSettings } = useSettings();
  const navigate = useNavigate();

  if (!isCartOpen) {
    return null;
  }

  const minOrderAmount = globalSettings?.minOrderAmount || 100;
  const isBelowMin = cartTotal > 0 && cartTotal < minOrderAmount;

  const handleCheckout = () => {
    if (isBelowMin) {
      showToast(`Minimum order amount is ₹${minOrderAmount}. Please add more items.`);
      return;
    }
    if (!currentUser) {
      showToast('Please sign in to complete your checkout!');
      navigate('/login');
      setIsCartOpen(false);
      return;
    }
    
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Your Basket</h3>
              <p className="text-xs font-bold text-slate-500">{cartItems.length} items selected</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-2xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200/60 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-900 truncate">{item.name}</h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">{item.unit}</p>
                  <p className="text-sm font-black text-emerald-700 mt-1 flex items-center gap-1.5 flex-wrap">
                    ₹{item.price * item.quantity}{' '}
                    <span className="text-[11px] font-normal text-slate-400">
                      (₹{item.price} each
                      {item.originalPrice > item.price && (
                        <span className="ml-1 line-through text-slate-300">₹{item.originalPrice}</span>
                      )}
                      )
                    </span>
                    {item.offPercentage > 0 && (
                      <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                        {item.offPercentage}% off
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-amber-400 text-slate-900 font-extrabold flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-black w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-amber-400 text-slate-900 font-extrabold flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-slate-800">Your basket is empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore our fresh organic groceries and add your favorite items to your basket!
              </p>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-white space-y-3 shadow-lg">
            
            {/* Promo Code Section */}
            <div className="pb-2 border-b border-slate-100">
              {!appliedCoupon ? (
                <div>
                  <h3 className="text-[11px] font-extrabold text-slate-900 mb-2 flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-emerald-500"/> Apply Promo Code</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={promoCodeInput}
                      onChange={e => {
                        setPromoCodeInput(e.target.value.toUpperCase());
                        setPromoError('');
                      }}
                      placeholder="Enter code" 
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                    />
                    <button 
                      onClick={() => handleApplyPromo()}
                      className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-[10px] font-bold text-rose-500 mt-1">{promoError}</p>}
                  
                  {availableCoupons.filter(c => c.isActive).length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {availableCoupons.filter(c => c.isActive).map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => handleApplyPromo(c.code)}
                          className="shrink-0 border border-emerald-200 bg-emerald-50/50 rounded-md px-2 py-1 cursor-pointer hover:bg-emerald-50 transition-colors"
                        >
                          <p className="text-[10px] font-black text-emerald-700">{c.code}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Code Applied</p>
                    <p className="text-xs font-black text-slate-900">{appliedCoupon.code}</p>
                  </div>
                  <button onClick={handleRemovePromo} className="text-slate-400 hover:text-rose-500 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-xs font-bold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900 font-extrabold">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 font-extrabold">FREE 🌿</span>
                ) : (
                  <span className="text-slate-900 font-extrabold">+₹{deliveryFee}</span>
                )}
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span className="font-extrabold">-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Amount</span>
                <span className="text-emerald-700">₹{finalTotal}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className={`w-full py-3.5 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all ${
                  isBelowMin 
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-lg shadow-amber-300/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {isBelowMin && (
                <p className="text-[10px] text-rose-500 font-bold text-center">
                  Add ₹{(minOrderAmount - cartTotal).toFixed(2)} more to reach minimum order (₹{minOrderAmount})
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
