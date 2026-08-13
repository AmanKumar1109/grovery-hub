import React, { useRef, useEffect } from 'react';
import { Heart, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import EmptyState from '../../components/dashboard/EmptyState';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Wishlist() {
  const { userProfile, toggleWishlist } = useAuth();
  const { addToCart, cartItems, updateQuantity, setIsCartOpen } = useCart();
  
  const wishlist = userProfile?.wishlist || [];
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.product-card', {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.5)',
        clearProps: 'all'
      });
    }, containerRef);

    return () => ctx.revert();
  }, [wishlist.length]);

  return (
    <div ref={containerRef} className="pb-24 md:pb-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Wishlist</h1>
        <p className="text-slate-500 font-medium mt-1">Saved products ready for your next basket</p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {wishlist.map(product => {
            const cartItem = cartItems.find((item) => item.id === product.id);
            const quantityInCart = cartItem ? cartItem.quantity : 0;
            const maxQty = product.maxQuantity ? parseInt(product.maxQuantity, 10) : null;
            const isMaxReached = maxQty !== null && quantityInCart >= maxQty;
            return (
              <div key={product.id} className="product-card bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between p-3 sm:p-4">
                <div>
                  <div className="relative h-36 sm:h-48 bg-slate-100 rounded-xl sm:rounded-2xl overflow-hidden mb-3">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button 
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-pink-600 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-pink-500 stroke-pink-500" />
                    </button>
                    {product.originalPrice > product.price && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-extrabold rounded-full shadow-md">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-extrabold text-slate-700">{product.rating}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-base mb-1.5 line-clamp-1">{product.name}</h3>
                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="text-base sm:text-xl font-black text-emerald-700">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {quantityInCart > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center justify-between bg-amber-400 text-slate-950 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shadow-md shadow-amber-300/30">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 flex items-center justify-center font-black transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-black text-xs sm:text-sm px-1 sm:px-3 truncate">{quantityInCart}</span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          disabled={isMaxReached}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-950/10 text-slate-950 flex items-center justify-center font-black transition-colors ${
                            isMaxReached ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-950/20 cursor-pointer'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button 
                        onClick={() => setIsCartOpen(true)}
                        className="w-9 h-9 sm:w-11 sm:h-11 bg-slate-900 text-white flex items-center justify-center rounded-xl sm:rounded-2xl shadow-md cursor-pointer hover:bg-slate-800 active:scale-95 transition-all"
                        title="View Cart"
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full py-2.5 sm:py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-[11px] sm:text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-300/40 active:scale-[0.98] cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          icon={Heart}
          title="Your wishlist is empty"
          description="Save items you like in your wishlist to add them to your cart later."
          actionText="Explore Fresh Products"
          actionLink="/"
        />
      )}
    </div>
  );
}
