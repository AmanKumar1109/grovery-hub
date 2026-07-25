import React, { useState, useRef, useEffect } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import EmptyState from '../../components/dashboard/EmptyState';
import gsap from 'gsap';

const initialWishlist = [
  { id: 1, name: 'Fresh Organic Farm Tomatoes', price: 45, originalPrice: 60, rating: 4.8, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300' },
  { id: 2, name: 'Artisanal Whole Wheat Bread', price: 50, originalPrice: 50, rating: 4.5, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300' },
  { id: 3, name: 'Premium Roasted Cashews 500g', price: 450, originalPrice: 550, rating: 4.9, image: 'https://images.unsplash.com/photo-1590004953392-5aba2e72269a?auto=format&fit=crop&q=80&w=300' }
];

export default function Wishlist() {
  const [wishlist, setWishlist] = useState(initialWishlist);
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
  }, []);

  const removeProduct = (id) => {
    setWishlist(wishlist.filter(p => p.id !== id));
  };

  return (
    <div ref={containerRef} className="pb-24 md:pb-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Wishlist</h1>
        <p className="text-slate-500 font-medium mt-1">Saved products ready for your next basket</p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {wishlist.map(product => (
            <div key={product.id} className="product-card bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between p-3 sm:p-4">
              <div>
                <div className="relative h-36 sm:h-48 bg-slate-100 rounded-xl sm:rounded-2xl overflow-hidden mb-3">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button 
                    onClick={() => removeProduct(product.id)}
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
                <button className="w-full py-2.5 sm:py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-[11px] sm:text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-300/40 active:scale-[0.98] cursor-pointer">
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
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
