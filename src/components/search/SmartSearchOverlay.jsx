import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Star, Clock, X, Sparkles, ArrowRight, Package, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import gsap from 'gsap';

/**
 * SmartSearchOverlay — Blinkit-inspired search dropdown with live results,
 * recent searches, trending items, popular products, and no-results suggestions.
 */
export default function SmartSearchOverlay({
  isOpen,
  query,
  results,
  suggestions,
  isSearching,
  hasQuery,
  recentSearches,
  highlight,
  onSearch,
  onRemoveRecent,
  onClearAllRecent,
  onClose,
}) {
  const navigate = useNavigate();
  const { products, cartItems, addToCart, updateQuantity } = useCart();
  const { globalSettings } = useSettings();
  const overlayRef = useRef(null);

  // Trending searches from admin settings
  const trendingRaw = globalSettings?.searchTrendingSearches || 'Fresh Milk\nRed Onions\nWhole Wheat Bread\nOrganic Eggs';
  const trendingSearches = trendingRaw.split('\n').filter(t => t.trim() !== '');

  // Popular products
  let popularProducts = [];
  const popularNamesRaw = globalSettings?.searchPopularProducts;
  if (popularNamesRaw && products?.length > 0) {
    const names = popularNamesRaw.split('\n').filter(p => p.trim() !== '');
    names.forEach(name => {
      const match = products.find(p => p.name.toLowerCase() === name.toLowerCase());
      if (match) popularProducts.push(match);
    });
  }
  if (popularProducts.length === 0) {
    popularProducts = products?.length > 0 ? products.filter(p => p.inStock).slice(0, 4) : [];
  }

  // GSAP entrance
  useEffect(() => {
    if (!isOpen || !overlayRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProductClick = (product) => {
    onSearch(product.name);
  };

  const handleSearchClick = (term) => {
    onSearch(term);
  };

  // ─── LIVE SEARCH RESULTS ─────────────────────────
  if (hasQuery && results.length > 0) {
    return (
      <div
        ref={overlayRef}
        className="absolute left-0 right-0 top-[110%] mt-1 bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[60] max-h-[70vh] overflow-y-auto custom-scrollbar"
      >
        {/* Results header */}
        <div className="px-4 sm:px-5 pt-4 pb-2 flex items-center justify-between">
          <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {results.length} result{results.length > 1 ? 's' : ''} found
          </h4>
          <button
            onClick={() => onSearch(query)}
            className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Results list */}
        <div className="px-3 sm:px-4 pb-3">
          {results.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-amber-50/60 transition-all cursor-pointer group text-left"
            >
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="w-12 h-12 rounded-xl object-cover bg-slate-100 group-hover:scale-105 transition-transform shadow-sm flex-shrink-0"
              />
              <div className="flex-1 min-w-0" onClick={() => handleProductClick(product)}>
                <h5
                  className="text-xs font-extrabold text-slate-800 group-hover:text-amber-700 transition-colors line-clamp-1"
                  dangerouslySetInnerHTML={{ __html: highlight(product.name) }}
                />
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-black text-emerald-600">₹{product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-[10px] font-bold text-slate-400 line-through">₹{product.originalPrice}</span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400">· {product.unit}</span>
                </div>
              </div>
              
              {/* Add to Cart Button Inline */}
              <div className="flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                {(() => {
                  const cartItem = cartItems.find((item) => item.id === product.id);
                  const quantityInCart = cartItem ? cartItem.quantity : 0;
                  
                  if (!product.inStock) {
                    return <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-full">Out of Stock</span>;
                  }
                  
                  if (quantityInCart === 0) {
                    return (
                      <button
                        onClick={() => addToCart(product)}
                        className="px-3 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 font-extrabold text-[10px] rounded-lg transition-colors border border-emerald-200 uppercase"
                      >
                        ADD
                      </button>
                    );
                  }
                  
                  return (
                    <div className="flex items-center justify-between bg-emerald-600 text-white rounded-lg h-7 w-20 px-1 shadow-sm border border-emerald-700">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="p-1 hover:bg-emerald-500 rounded-md transition-colors"
                      >
                        <Minus className="w-3 h-3 stroke-[3]" />
                      </button>
                      <span className="text-[11px] font-black">{quantityInCart}</span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="p-1 hover:bg-emerald-500 rounded-md transition-colors"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* See all results button */}
        {results.length > 8 && (
          <div className="px-4 pb-4">
            <button
              onClick={() => onSearch(query)}
              className="w-full py-2.5 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              See all {results.length} results <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── NO RESULTS ──────────────────────────────────
  if (hasQuery && results.length === 0 && !isSearching) {
    return (
      <div
        ref={overlayRef}
        className="absolute left-0 right-0 top-[110%] mt-1 bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[60]"
      >
        <div className="p-6 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-black text-slate-800">No results for "{query}"</h4>
          
          {suggestions?.correctedQuery && (
            <p className="text-xs font-bold text-slate-500 mt-1">
              Did you mean{' '}
              <button
                onClick={() => onSearch(suggestions.correctedQuery)}
                className="text-amber-600 hover:text-amber-700 underline cursor-pointer font-black"
              >
                {suggestions.correctedQuery}
              </button>
              ?
            </p>
          )}
        </div>

        {/* Similar products */}
        {suggestions?.similarProducts?.length > 0 && (
          <div className="px-4 sm:px-5 pb-4 border-t border-slate-50">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mt-3 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Similar Products
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.similarProducts.slice(0, 4).map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => handleProductClick(prod)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-amber-50/60 transition-all cursor-pointer group text-left"
                >
                  <img src={prod.image} alt={prod.name} loading="lazy" className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-extrabold text-slate-700 line-clamp-1">{prod.name}</h5>
                    <span className="text-[10px] font-black text-emerald-600">₹{prod.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Related categories */}
        {suggestions?.relatedCategories?.length > 0 && (
          <div className="px-4 sm:px-5 pb-4 border-t border-slate-50">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mt-3 mb-2">Browse Categories</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.relatedCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { onClose(); navigate(`/category/${encodeURIComponent(cat)}`); }}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── LOADING STATE ───────────────────────────────
  if (isSearching) {
    return (
      <div
        ref={overlayRef}
        className="absolute left-0 right-0 top-[110%] mt-1 bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[60] p-6"
      >
        <div className="flex flex-col items-center gap-3">
          {/* Shimmer skeleton */}
          {[1, 2, 3].map(i => (
            <div key={i} className="w-full flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                <div className="h-2.5 bg-slate-50 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── DEFAULT STATE (Recent + Trending + Popular) ──
  return (
    <div
      ref={overlayRef}
      className="absolute left-0 right-0 top-[110%] mt-1 bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[60] max-h-[70vh] overflow-y-auto custom-scrollbar"
    >
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="p-4 sm:p-5 border-b border-slate-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Recent Searches
            </h4>
            <button
              onClick={onClearAllRecent}
              className="text-[10px] font-black text-red-400 hover:text-red-500 cursor-pointer"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <div
                key={term}
                className="flex items-center gap-1 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-600 hover:text-amber-700 text-xs font-bold pl-3 pr-1.5 py-1.5 rounded-full transition-all group"
              >
                <button onClick={() => handleSearchClick(term)} className="cursor-pointer">
                  {term}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveRecent(term); }}
                  className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Searches */}
      <div className="p-4 sm:p-5 border-b border-slate-50">
        <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Trending Right Now
        </h4>
        <div className="flex flex-wrap gap-2">
          {trendingSearches.map((term, i) => (
            <button
              key={i}
              onClick={() => handleSearchClick(term)}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-600 hover:text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer hover:shadow-sm"
            >
              <Search className="w-3 h-3 text-slate-400" /> {term}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <div className="p-4 sm:p-5 bg-slate-50/50">
          <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-3">
            <Star className="w-3.5 h-3.5 text-emerald-500" /> Popular Products
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {popularProducts.map((prod) => (
              <button
                key={prod.id}
                onClick={() => handleProductClick(prod)}
                className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group text-left"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  loading="lazy"
                  className="w-12 h-12 rounded-xl object-cover bg-slate-100 group-hover:scale-105 transition-transform shadow-sm flex-shrink-0"
                />
                <div>
                  <h5 className="text-xs font-extrabold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-1">{prod.name}</h5>
                  <p className="text-[11px] font-black text-emerald-600 mt-0.5">₹{prod.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
