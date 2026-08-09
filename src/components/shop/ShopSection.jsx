import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CategoryShowcase from './CategoryShowcase';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { Search, SlidersHorizontal, Package, ArrowRight } from 'lucide-react';

export default function ShopSection() {
  const location = useLocation();
  const { products, isLoadingProducts } = useCart();
  const { globalSettings } = useSettings();
  const theme = globalSettings?.activeTheme || 'normal';
  const isIndependence = theme === 'independence-day';
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [location.search]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = useMemo(() => {
    return (products || [])
      .filter((prod) => {
        const matchesCategory =
          selectedCategory === 'all'
            ? true
            : selectedCategory === 'Trending'
            ? !!prod.isTrending
            : selectedCategory === 'BOGO' || selectedCategory === 'Buy 1 Get 1'
            ? !!prod.isBogo
            : prod.category === selectedCategory;
        const matchesSubcategory =
          selectedCategory === 'all' || selectedCategory === 'Trending' || selectedCategory === 'BOGO' || selectedCategory === 'Buy 1 Get 1'
            ? true
            : !selectedSubcategory
            ? true
            : prod.subcategory === selectedSubcategory;
        const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSubcategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [products, selectedCategory, selectedSubcategory, searchQuery, sortBy]);

  // Stable random seed per page-load session (does NOT re-shuffle on re-render)
  const randomSeedRef = useRef(Math.random());

  // Pick 8 random products — reshuffles only when filteredProducts list itself changes
  const homepageProducts = useMemo(() => {
    if (filteredProducts.length <= 8) return filteredProducts;
    // Seeded Fisher-Yates shuffle (stable per session seed)
    const arr = [...filteredProducts];
    let seed = randomSeedRef.current;
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 8);
  }, [filteredProducts]);

  return (
    <section id="shop" className="w-full px-3 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-12 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8">
        {/* Category Showcase Pills */}
        <CategoryShowcase
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          selectedSubcategory={selectedSubcategory}
          onSelectSubcategory={setSelectedSubcategory}
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
              Showing <span className="text-slate-900 font-black">{homepageProducts.length}</span> of <span className="text-slate-900 font-black">{filteredProducts.length}</span> items
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
        ) : homepageProducts.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {homepageProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Explore All Products Button */}
            <div className="flex justify-center pt-2">
              <Link
                to="/catalog"
                className={`inline-flex items-center gap-2.5 px-8 py-3.5 font-black text-xs sm:text-sm rounded-full shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group ${
                  isIndependence
                    ? 'bg-gradient-to-r from-orange-500 via-emerald-600 to-green-700 hover:from-orange-600 hover:to-green-800 text-white shadow-emerald-700/30'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-300/40 hover:shadow-amber-400/50'
                }`}
              >
                <span>Explore All Products in Catalogue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
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
              className="px-5 py-2.5 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
