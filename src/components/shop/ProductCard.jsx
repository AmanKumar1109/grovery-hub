import React from 'react';
import { Heart, ShoppingBag, Star, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity, showToast, setIsCartOpen } = useCart();
  const { currentUser, userProfile, toggleWishlist } = useAuth();
  
  const isWishlisted = userProfile?.wishlist?.some(item => item.id === product.id) || false;

  const cartItem = cartItems.find((item) => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-3 sm:p-4 shadow-sm hover:shadow-xl hover:border-amber-200/80 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
      {/* Product Image & Top Badges */}
      <div>
        <div className="relative h-36 sm:h-52 w-full bg-slate-50 rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 border border-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Discount / Stock Badge */}
          {product.inStock === false ? (
            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 bg-rose-600 text-white font-black text-[9px] sm:text-[11px] rounded-full shadow-md">
              Out of Stock
            </span>
          ) : product.badge ? (
            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 bg-amber-400 text-slate-950 font-black text-[9px] sm:text-[11px] rounded-full shadow-md">
              {product.badge}
            </span>
          ) : null}

          {/* Wishlist Heart Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!currentUser) {
                showToast('Please sign in to save items to your wishlist!');
                return;
              }
              toggleWishlist(product);
            }}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer ${
              isWishlisted ? 'text-pink-600 scale-110' : 'text-slate-400 hover:text-pink-500'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-pink-500 stroke-pink-500' : ''}`} />
          </button>
        </div>

        {/* Rating & Title */}
        <div className="flex items-center gap-1 mb-1">
          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-[11px] sm:text-xs font-black text-slate-800">{product.rating}</span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">({product.reviews})</span>
        </div>

        <h3 className="font-extrabold text-slate-900 text-xs sm:text-base leading-snug mb-1 line-clamp-2 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>

        <p className="text-[11px] sm:text-xs font-bold text-slate-400 mb-2 sm:mb-3">{product.unit}</p>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="text-base sm:text-xl font-black text-emerald-700">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {product.inStock === false ? (
          <button
            type="button"
            disabled
            className="w-full py-2 sm:py-3 bg-slate-200 text-slate-500 font-extrabold text-[11px] sm:text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 cursor-not-allowed opacity-75"
          >
            Out of Stock
          </button>
        ) : quantityInCart > 0 ? (
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
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 flex items-center justify-center font-black transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-9 h-9 sm:w-11 sm:h-11 bg-slate-900 text-white flex items-center justify-center rounded-xl sm:rounded-2xl shadow-md cursor-pointer hover:bg-slate-800 active:scale-95 transition-all"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => addToCart(product)}
            className="w-full py-2 sm:py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-[11px] sm:text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-300/30 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add
          </button>
        )}
      </div>
    </div>
  );
}
