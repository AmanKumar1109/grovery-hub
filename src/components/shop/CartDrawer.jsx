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
    <div className="fixed inset-0 z-50 flex justify-end items-center sm:p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Slide-over floating panel (Modern, Unique, Non-colorful) */}
      <div className="relative w-full max-w-[420px] h-full sm:h-[calc(100vh-2rem)] bg-white/90 backdrop-blur-xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col justify-between z-10 animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border border-white/50 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[1.25rem] bg-slate-100/50 flex items-center justify-center border border-slate-200/50 shadow-sm">
              <ShoppingBag className="w-5 h-5 text-slate-900" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Basket</h3>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">{cartItems.length} items inside</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer text-slate-500 hover:text-slate-900"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6 custom-scrollbar">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className="group relative flex gap-5 items-center">
                {/* Image Container */}
                <div className="w-20 h-20 rounded-[1.25rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:shadow-md transition-all duration-300">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900 leading-tight tracking-tight pr-2">{item.name}</h4>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{item.unit}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center bg-slate-50/50"
                      title="Remove"
                    >
                      <Trash2 className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-slate-900 tracking-tight">₹{item.price * item.quantity}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-[10px] font-bold text-slate-400 line-through">₹{item.originalPrice * item.quantity}</span>
                      )}
                    </div>

                    {/* Minimalist Quantity Control */}
                    <div className="flex items-center bg-slate-900 rounded-full p-1 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.maxQuantity && item.quantity >= parseInt(item.maxQuantity, 10)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors ${
                          item.maxQuantity && item.quantity >= parseInt(item.maxQuantity, 10) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700 cursor-pointer'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center pb-10">
              <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">It's empty here</h4>
              <p className="text-sm font-medium text-slate-500 mt-2 max-w-[220px]">
                Start adding items to your basket to proceed.
              </p>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="shrink-0 bg-slate-50 p-6 border-t border-slate-200/60 rounded-b-3xl mt-2">
            
            {/* Promo Code Section (Modern Pill Shape) */}
            <div className="mb-6">
              {!appliedCoupon ? (
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={promoCodeInput}
                    onChange={e => {
                      setPromoCodeInput(e.target.value.toUpperCase());
                      setPromoError('');
                    }}
                    placeholder="Have a promo code?" 
                    className="w-full pl-9 pr-24 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 uppercase transition-all shadow-sm"
                  />
                  <button 
                    onClick={() => handleApplyPromo()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 hover:scale-[0.98] transition-all cursor-pointer shadow-sm"
                  >
                    APPLY
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-2xl p-3.5 flex items-center justify-between shadow-lg shadow-slate-900/20">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400"/>
                    </div>
                    <p className="text-sm font-bold text-white tracking-wide">{appliedCoupon.code} <span className="text-slate-400 font-medium ml-1">Applied</span></p>
                  </div>
                  <button onClick={handleRemovePromo} className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {promoError && <p className="text-[11px] font-bold text-rose-500 mt-2 px-1">{promoError}</p>}
              
              {!appliedCoupon && availableCoupons.filter(c => c.isActive).length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
                  {availableCoupons.filter(c => c.isActive).map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => handleApplyPromo(c.code)}
                      className="shrink-0 border border-slate-300 border-dashed bg-white rounded-xl px-3 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-xs font-bold text-slate-800 tracking-tight">{c.code}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Receipt Summary */}
            <div className="space-y-2.5 mb-6 px-1">
              <div className="flex justify-between items-center text-[13px] font-bold text-slate-500">
                <span>Subtotal</span>
                <span className="text-slate-900">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] font-bold text-slate-500">
                <span>Delivery</span>
                {deliveryFee === 0 ? (
                  <span className="text-slate-900 tracking-wider">FREE</span>
                ) : (
                  <span className="text-slate-900">₹{deliveryFee}</span>
                )}
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-[13px] font-bold text-slate-500">
                  <span>Discount</span>
                  <span className="text-slate-900">-₹{discountAmount}</span>
                </div>
              )}
              <div className="border-t border-slate-200/80 border-dashed my-3"></div>
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">₹{finalTotal}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <div className="relative">
              {isBelowMin && (
                <div className="absolute -top-12 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="bg-slate-900 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg">
                    Add ₹{(minOrderAmount - cartTotal).toFixed(2)} more to checkout
                  </span>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isBelowMin}
                className={`group relative w-full h-[68px] rounded-[1.25rem] overflow-hidden flex items-center transition-all duration-300 ${
                  isBelowMin 
                    ? 'bg-slate-200 cursor-not-allowed' 
                    : 'bg-slate-900 shadow-xl shadow-slate-900/20 active:scale-[0.98] cursor-pointer hover:shadow-slate-900/40'
                }`}
              >
                {/* Tech lines (Mecha vibe) */}
                {!isBelowMin && (
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute top-0 left-10 w-16 h-[1px] bg-white/30"></div>
                    <div className="absolute bottom-0 right-10 w-16 h-[1px] bg-white/30"></div>
                  </div>
                )}
                
                {/* Left Block - Price Terminal */}
                <div className={`h-full flex flex-col justify-center px-5 border-r min-w-[120px] transition-colors ${
                  isBelowMin ? 'border-slate-300 bg-slate-300/30' : 'border-slate-700/60 bg-black/30'
                }`}>
                  <span className={`text-[9px] font-mono uppercase tracking-[0.25em] mb-0.5 ${isBelowMin ? 'text-slate-500' : 'text-slate-400'}`}>Amount</span>
                  <span className={`text-lg font-black font-mono tracking-tighter ${isBelowMin ? 'text-slate-600' : 'text-white'}`}>₹{finalTotal}</span>
                </div>

                {/* Right Block - Action */}
                <div className="flex-1 flex items-center justify-between px-6">
                  <span className={`text-[13px] font-black uppercase tracking-[0.2em] ${isBelowMin ? 'text-slate-500' : 'text-white'}`}>
                    {isBelowMin ? 'Add More' : 'Checkout'}
                  </span>
                  
                  {/* Mecha Icon Block */}
                  {!isBelowMin && (
                    <div className="relative flex items-center justify-center w-9 h-9 rounded-full border border-slate-700 overflow-hidden group-hover:border-slate-500 transition-colors">
                      <div className="absolute inset-0 border-t-2 border-slate-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-spin"></div>
                      <ArrowRight className="w-4 h-4 text-white relative z-10 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </div>

                {/* Status indicators */}
                {!isBelowMin && (
                  <div className="absolute top-2.5 right-3.5 flex gap-1">
                    <div className="w-1 h-1 rounded-sm bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse"></div>
                    <div className="w-1 h-1 rounded-sm bg-slate-600"></div>
                    <div className="w-1 h-1 rounded-sm bg-slate-600"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
