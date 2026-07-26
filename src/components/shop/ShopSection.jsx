import React, { useState, useEffect, useRef } from 'react';
import CategoryShowcase from './CategoryShowcase';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { useCart } from '../../context/CartContext';
import { Search, SlidersHorizontal, Package, Loader2 } from 'lucide-react';

export default function ShopSection() {
  const { products, isLoadingProducts, loadMoreProducts, hasMore, isLoadingMore } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const sentinelRef = useRef(null);

  const filteredProducts = (products || [])
    .filter((prod) => {
      const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
      const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  // IntersectionObserver — triggers loadMoreProducts when sentinel enters view
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreProducts();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMoreProducts]);

  return (
    <section id="shop" className="w-full px-3 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-12 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8">
        {/* Category Showcase Pills */}
        <CategoryShowcase
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Search & Sort Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
          {/* Quick Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search items in shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all"
            />
          </div>

          {/* Product count & Sort dropdown */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <span className="text-xs font-extrabold text-slate-500">
              Showing <span className="text-slate-900 font-black">{filteredProducts.length}</span> items
            </span>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:py-2 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="featured">Featured Items</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(8)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Sentinel — IntersectionObserver watches this to load more */}
            <div ref={sentinelRef} className="w-full h-4" aria-hidden="true" />

            {/* Loading more spinner */}
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2 py-6 text-slate-500 text-xs font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Loading more products...</span>
              </div>
            )}

            {/* End of list */}
            {!hasMore && products.length > 8 && (
              <p className="text-center text-xs font-bold text-slate-400 py-4">
                ✅ All products loaded
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-black text-slate-800">No items found</h3>
            <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
              We couldn't find any products matching "{searchQuery}" in this category. Try clearing your search!
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-5 py-2.5 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
