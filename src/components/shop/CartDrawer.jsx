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
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Slide-over panel (Glassmorphic) */}
      <div className="relative w-full max-w-md h-full bg-white/70 backdrop-blur-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.15)] flex flex-col justify-between z-10 animate-in slide-in-from-right-full duration-500 ease-out border-l border-white/60 overflow-hidden">
        
        {/* Ambient Animated Auroras (Trapped inside the panel) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-20%] w-[120%] h-[30%] bg-emerald-400/15 blur-[80px] rounded-full animate-pulse" style={{ animationDuration: '5s' }}></div>
          <div className="absolute bottom-[30%] left-[-20%] w-[100%] h-[40%] bg-amber-400/10 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }}></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[90%] h-[30%] bg-orange-500/10 blur-[80px] rounded-full animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
        </div>

        {/* Premium Header */}
        <div className="relative z-10 px-6 py-5 border-b border-white/40 bg-white/40 backdrop-blur-md shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center border border-white/50 shadow-[0_4px_15px_rgba(245,158,11,0.3)]">
              <div className="absolute inset-0 rounded-full bg-amber-200/50 animate-ping opacity-50"></div>
              <ShoppingBag className="w-5 h-5 text-slate-900 relative z-10" />
            </div>
            <div>
              <h3 className="text-xl font-black bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">Your Basket</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{cartItems.length} items</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2.5 bg-white/60 hover:bg-white hover:scale-110 active:scale-95 shadow-sm border border-white/50 rounded-full transition-all cursor-pointer text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <div
                key={item.id}
                className="relative flex items-center gap-4 p-3 rounded-[1.5rem] border border-white/60 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="absolute inset-0 rounded-[1.5rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] pointer-events-none"></div>
                
                <div className="relative w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                <div className="flex-1 min-w-0 z-10">
                  <h4 className="text-[13px] font-black text-slate-800 truncate">{item.name}</h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{item.unit}</p>
                  <p className="text-sm font-black text-emerald-600 mt-1.5 flex items-center gap-1.5 flex-wrap">
                    ₹{item.price * item.quantity}{' '}
                    <span className="text-[10px] font-bold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded border border-slate-100">
                      ₹{item.price} each
                      {item.originalPrice > item.price && (
                        <span className="ml-1 line-through text-slate-300">₹{item.originalPrice}</span>
                      )}
                    </span>
                    {item.offPercentage > 0 && (
                      <span className="text-[9px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md shadow-sm">
                        {item.offPercentage}% off
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3 z-10">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center gap-1 bg-slate-50/80 border border-slate-200/60 rounded-xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 font-extrabold flex items-center justify-center transition-all cursor-pointer shadow-sm border border-slate-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black w-6 text-center text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 font-extrabold flex items-center justify-center transition-all cursor-pointer shadow-sm border border-slate-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="relative w-32 h-32 mx-auto bg-gradient-to-tr from-slate-100 to-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 border border-white">
                <div className="absolute inset-0 rounded-full bg-amber-100 blur-xl opacity-50"></div>
                <ShoppingBag className="w-12 h-12 text-slate-300 relative z-10" />
              </div>
              <h4 className="text-xl font-black text-slate-800 tracking-tight">Your basket is empty</h4>
              <p className="text-xs font-bold text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                Explore our fresh organic groceries and add your favorite items to your basket!
              </p>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="relative z-10 p-5 border-t border-white/50 bg-white/70 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] space-y-4">
            
            {/* Promo Code Section */}
            <div className="pb-3 border-b border-slate-200/60">
              {!appliedCoupon ? (
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-500"/> Promo Code
                  </h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={promoCodeInput}
                      onChange={e => {
                        setPromoCodeInput(e.target.value.toUpperCase());
                        setPromoError('');
                      }}
                      placeholder="Enter code" 
                      className="flex-1 px-4 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 uppercase transition-all shadow-sm"
                    />
                    <button 
                      onClick={() => handleApplyPromo()}
                      className="px-5 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1">{promoError}</p>}
                  
                  {availableCoupons.filter(c => c.isActive).length > 0 && (
                    <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {availableCoupons.filter(c => c.isActive).map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => handleApplyPromo(c.code)}
                          className="shrink-0 border border-emerald-200 bg-emerald-50/80 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-emerald-100 transition-colors shadow-sm"
                        >
                          <p className="text-[10px] font-black tracking-wider text-emerald-700">{c.code}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-xl p-3 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1 mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5"/> Applied Successfully
                    </p>
                    <p className="text-sm font-black text-slate-800">{appliedCoupon.code}</p>
                  </div>
                  <button onClick={handleRemovePromo} className="text-slate-400 hover:text-rose-500 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 text-[13px] font-bold text-slate-500">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-slate-800 font-black">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Charge</span>
                {deliveryFee === 0 ? (
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md tracking-wider">FREE 🌿</span>
                ) : (
                  <span className="text-slate-800 font-black">+₹{deliveryFee}</span>
                )}
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-emerald-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span className="font-black">-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-black text-slate-900 pt-3 border-t border-slate-200/60">
                <span>Total Amount</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">₹{finalTotal}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {isBelowMin && (
                <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200/60 rounded-2xl p-4 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                    <ShoppingBag className="w-20 h-20" />
                  </div>
                  <div className="flex items-start gap-3.5 relative z-10">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(244,63,94,0.15)] border border-rose-100">
                      <ShoppingBag className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                        Add items worth <span className="text-rose-600 font-black text-[13px] bg-rose-100/50 px-1 rounded">₹{(minOrderAmount - cartTotal).toFixed(2)}</span> more to place order.
                      </p>
                      
                      <div className="w-full bg-rose-100 h-1.5 rounded-full mt-3 overflow-hidden shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-rose-400 to-rose-600 h-full rounded-full transition-all duration-1000 ease-out relative"
                          style={{ width: `${Math.min((cartTotal / minOrderAmount) * 100, 100)}%` }}
                        >
                          <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]"></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">
                          Total: ₹{cartTotal}
                        </span>
                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">
                          Goal: ₹{minOrderAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckout}
                className={`relative w-full py-4 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden ${
                  isBelowMin 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                    : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white shadow-[0_10px_25px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_35px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:translate-y-0 cursor-pointer border border-emerald-300/50 group'
                }`}
              >
                {!isBelowMin && <div className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>}
                <span className="relative z-10">Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes progress {
            0% { background-position: 1rem 0; }
            100% { background-position: 0 0; }
          }
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
}
