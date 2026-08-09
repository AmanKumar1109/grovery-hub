import React, { useMemo } from 'react';
import { Heart, ShoppingBag, Star, Plus, Minus, Zap, TrendingUp, Clock, Users, Flame, Gift } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity, showToast, setIsCartOpen } = useCart();
  const { currentUser, userProfile, toggleWishlist } = useAuth();
  const { globalSettings } = useSettings();

  const theme = globalSettings?.activeTheme || 'normal';
  const isIndependence = theme === 'independence-day';

  const isWishlisted = userProfile?.wishlist?.some(item => item.id === product.id) || false;

  const cartItem = cartItems.find((item) => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleFlyToCart = (e, product) => {
    // 1. Get origin rect
    const card = e.currentTarget.closest('.product-card-root');
    if (!card) {
      addToCart(product);
      return;
    }

    const img = card.querySelector('img');
    const cartIcon = document.getElementById('cart-icon-target');

    if (!img || !cartIcon) {
      addToCart(product);
      return;
    }

    const imgRect = img.getBoundingClientRect();
    const targetRect = cartIcon.getBoundingClientRect();

    // 2. Create flying clone
    const clone = img.cloneNode();
    clone.style.position = 'fixed';
    clone.style.top = `${imgRect.top}px`;
    clone.style.left = `${imgRect.left}px`;
    clone.style.width = `${imgRect.width}px`;
    clone.style.height = `${imgRect.height}px`;
    clone.style.borderRadius = '16px';
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    clone.style.transition = 'all 1.0s cubic-bezier(0.4, 0, 0.2, 1)';
    clone.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    document.body.appendChild(clone);

    // Add Cart Item early
    addToCart(product);

    // 3. Trigger animation
    requestAnimationFrame(() => {
      clone.style.top = `${targetRect.top + targetRect.height / 2 - 15}px`;
      clone.style.left = `${targetRect.left + targetRect.width / 2 - 15}px`;
      clone.style.width = '30px';
      clone.style.height = '30px';
      clone.style.opacity = '0.2';
      clone.style.transform = 'scale(0.1) rotate(90deg)';

      // Cleanup after animation and fire confetti
      setTimeout(() => {
        clone.remove();

        // Custom DOM Confetti
        for (let i = 0; i < 12; i++) {
          const particle = document.createElement('div');
          particle.style.position = 'fixed';
          particle.style.top = `${targetRect.top + 15}px`;
          particle.style.left = `${targetRect.left + 15}px`;
          particle.style.width = '6px';
          particle.style.height = '6px';
          particle.style.backgroundColor = ['#fbbf24', '#f87171', '#34d399', '#60a5fa'][Math.floor(Math.random() * 4)];
          particle.style.borderRadius = '50%';
          particle.style.zIndex = '9999';
          particle.style.pointerEvents = 'none';
          document.body.appendChild(particle);

          const angle = Math.random() * Math.PI * 2;
          const velocity = 25 + Math.random() * 45;
          const tx = Math.cos(angle) * velocity;
          const ty = Math.sin(angle) * velocity - 25;

          particle.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
          ], {
            duration: 600 + Math.random() * 400,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }).onfinish = () => particle.remove();
        }
      }, 1000);
    });
  };

  // Generate star rating display
  const fullStars = Math.floor(product.rating || 0);
  const hasHalf = (product.rating || 0) - fullStars >= 0.5;

  // Fake but consistent social proof numbers (seeded from product id)
  const socialProof = useMemo(() => {
    const hash = (product.id || '').toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return {
      recentBuyers: product.recentBuyers ? parseInt(product.recentBuyers) : 0,
      deliveryMins: 8 + (hash % 7),
      stockLeft: product.inStock === false ? 0 : 2 + (hash % 8),
    };
  }, [product.id, product.inStock, product.recentBuyers]);

  return (
    <div className={`product-card-root bg-white rounded-2xl sm:rounded-3xl border shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 flex flex-col justify-between group relative overflow-hidden hover:-translate-y-1 ${
      isIndependence
        ? 'border-orange-200/80 hover:border-emerald-500/80 shadow-orange-500/5'
        : 'border-slate-100/80 hover:border-amber-200/60'
    }`}>

      {/* Shimmer hover overlay */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent z-10 pointer-events-none" />

      {/* Product Image & Top Badges */}
      <div className="relative">
        <div className={`relative h-36 sm:h-52 w-full rounded-t-2xl sm:rounded-t-3xl overflow-hidden ${
          isIndependence
            ? 'bg-gradient-to-br from-[#fff7ed] via-[#ffffff] to-[#ecfdf5]'
            : 'bg-gradient-to-br from-slate-50 to-slate-100/50'
        }`}>
          {/* Subtle Tiranga Color Spray overlay for Independence Day theme */}
          {isIndependence && (
            <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
              <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-orange-400/30 blur-2xl" />
              <div className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full bg-emerald-500/30 blur-2xl" />
            </div>
          )}

          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out relative z-1"
          />

          {/* Dark gradient overlay at bottom of image */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          {/* Top-Left Stacked Badges (Out of Stock, BOGO, Discount) */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col items-start gap-1 z-10 pointer-events-none">
            {product.inStock === false ? (
              <span className="px-2.5 py-1 sm:px-3 sm:py-1 bg-slate-900/90 backdrop-blur-md text-white font-black text-[9px] sm:text-[11px] rounded-full shadow-md tracking-wide uppercase">
                Sold Out
              </span>
            ) : (
              <>
                {/* Buy 1 Get 1 Free Overlay Badge */}
                {Boolean(product.isBogo) && (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center gap-1 shadow-lg tracking-wide uppercase">
                    <Gift className="w-3 h-3 text-white" /> Buy 1 Get 1 Free
                  </span>
                )}

                {/* Discount Badge */}
                {product.offPercentage > 0 && (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-[9px] sm:text-[10px] rounded-full shadow-md flex items-center gap-1 tracking-wide">
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" /> {product.offPercentage}% OFF
                  </span>
                )}
              </>
            )}
          </div>

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
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-md active:scale-90 cursor-pointer hover:bg-white z-20 ${isWishlisted ? 'text-pink-600 scale-110 ring-2 ring-pink-200' : 'text-slate-400 hover:text-pink-500'
              }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${isWishlisted ? 'fill-pink-500 stroke-pink-500 scale-110' : 'group-hover:scale-110'}`} />
          </button>

          {/* Trending indicator on image bottom-right — ONLY when admin marks product.isTrending as true */}
          {Boolean(product.isTrending) && (
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2.5 py-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center gap-1 shadow-lg animate-pulse tracking-wide z-10">
              <Flame className="w-3 h-3 fill-white" /> Trending
            </div>
          )}
        </div>
        {/* Content area with padding */}
        <div className="p-3 sm:p-4 pb-0">
          {/* Star Rating Row */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center gap-px">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors ${i < fullStars
                    ? 'text-amber-400 fill-amber-400'
                    : i === fullStars && hasHalf
                      ? 'text-amber-400 fill-amber-400/50'
                      : 'text-slate-200 fill-slate-200'
                    }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-slate-700">{product.rating}</span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400">({product.reviews})</span>
          </div>

          {/* Product Name */}
          <h3 className="font-extrabold text-slate-900 text-[13px] sm:text-[15px] leading-snug mb-0.5 line-clamp-2 group-hover:text-amber-700 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Unit/Weight */}
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wide">{product.unit}</p>

          {/* Social Proof */}
          {socialProof.recentBuyers > 0 && (
            <div className="flex items-center gap-1 mt-1.5 mb-2 sm:mb-3">
              <Users className="w-3 h-3 text-violet-400" />
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">
                {socialProof.recentBuyers} people bought this recently
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 mt-auto">
        {/* Price row */}
        <div className="flex items-end gap-1.5 mb-3 flex-wrap">
          <span className="text-lg sm:text-2xl font-black text-slate-900 leading-none">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 line-through leading-none mb-0.5">
              ₹{product.originalPrice}
            </span>
          )}
          {product.offPercentage > 0 && (
            <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md leading-none mb-0.5">
              SAVE ₹{product.originalPrice - product.price}
            </span>
          )}
        </div>



        {product.inStock === false ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 sm:py-3 bg-slate-100 text-slate-400 font-extrabold text-[11px] sm:text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200 tracking-wide"
          >
            Out of Stock
          </button>
        ) : quantityInCart > 0 ? (
          <div className="flex items-center gap-2">
            <div className={`flex-1 flex items-center justify-between p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shadow-lg ${
              isIndependence
                ? 'bg-gradient-to-r from-orange-500 via-emerald-600 to-green-700 text-white shadow-emerald-700/30'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-amber-400/25'
            }`}>
              <button
                onClick={() => updateQuantity(product.id, -1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/25 hover:bg-white/40 text-white flex items-center justify-center font-black transition-all active:scale-90 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-black text-sm sm:text-base px-1 sm:px-3 tabular-nums">{quantityInCart}</span>
              <button
                onClick={() => updateQuantity(product.id, 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/25 hover:bg-white/40 text-white flex items-center justify-center font-black transition-all active:scale-90 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center rounded-xl sm:rounded-2xl shadow-lg cursor-pointer active:scale-90 transition-all"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => handleFlyToCart(e, product)}
            className={`w-full py-2.5 sm:py-3 font-extrabold text-[11px] sm:text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer tracking-wide ${
              isIndependence
                ? 'bg-gradient-to-r from-orange-500 via-emerald-600 to-green-700 hover:from-orange-600 hover:to-green-800 text-white shadow-emerald-700/25 border border-orange-400/30'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-amber-400/25'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
