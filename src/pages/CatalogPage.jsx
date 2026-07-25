import React, { useState } from 'react';
import Header from '../components/header/Header';
import Footer from '../components/shop/Footer';
import CartDrawer from '../components/shop/CartDrawer';
import ProductCard from '../components/shop/ProductCard';
import { initialProducts, useCart } from '../context/CartContext';
import { categoriesList } from '../components/shop/CategoryShowcase';
import { Search, SlidersHorizontal, Package, Check, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [onlyHalal, setOnlyHalal] = useState(false);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toastMessage } = useCart();

  const filteredProducts = initialProducts
    .filter((prod) => {
      const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
      const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOrganic = !onlyOrganic || prod.isOrganic;
      const matchesHalal = !onlyHalal || prod.isHalal;
      const matchesDiscount = !onlyDiscounted || (prod.originalPrice > prod.price);
      return matchesCategory && matchesSearch && matchesOrganic && matchesHalal && matchesDiscount;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (onlyOrganic ? 1 : 0) +
    (onlyHalal ? 1 : 0) +
    (onlyDiscounted ? 1 : 0);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-300 selection:text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 text-xs font-black animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Website Header */}
      <Header />

      {/* Main Catalog Content Area */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 space-y-5 sm:space-y-6">
        {/* Controls Bar: Search, Toggle Filter Dropdown, and Sort Dropdown */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Quick Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all"
              />
            </div>

            {/* Filter Toggle Button & Sort Selector */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              {/* Collapsible Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  isFilterOpen || activeFiltersCount > 0
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-300/40'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-slate-950 text-white text-[10px] flex items-center justify-center font-black">
                    {activeFiltersCount}
                  </span>
                )}
                {isFilterOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {/* Items Counter */}
              <span className="text-xs font-extrabold text-slate-500 hidden md:inline">
                <span className="text-slate-900 font-black">{filteredProducts.length}</span> Items
              </span>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500 hidden sm:inline" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="featured">Featured Catalog</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Collapsible Filter Dropdown Card */}
          {isFilterOpen && (
            <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Filter Catalog Products
                </h4>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setOnlyOrganic(false);
                      setOnlyHalal(false);
                      setOnlyDiscounted(false);
                    }}
                    className="text-xs font-extrabold text-amber-600 hover:text-amber-700 underline cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Clear Filters
                  </button>
                )}
              </div>

              {/* Category Pills inside Dropdown */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {categoriesList.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                        isActive
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat.name} ({cat.count})
                    </button>
                  );
                })}
              </div>

              {/* Checkbox Toggles */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={onlyOrganic}
                    onChange={(e) => setOnlyOrganic(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-amber-400 cursor-pointer"
                  />
                  <span>🌿 100% Organic Certified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={onlyHalal}
                    onChange={(e) => setOnlyHalal(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-amber-400 cursor-pointer"
                  />
                  <span>✨ Halal Certified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={onlyDiscounted}
                    onChange={(e) => setOnlyDiscounted(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-amber-400 cursor-pointer"
                  />
                  <span>🔥 On Discount Only</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Catalog Products Grid: 2 columns on Mobile (grid-cols-2), 3 on Tablet, 4 on Desktop */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-black text-slate-800">No items found</h3>
            <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
              No catalog items match your selected filters. Try clearing your search or filters!
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setOnlyOrganic(false);
                setOnlyHalal(false);
                setOnlyDiscounted(false);
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Cart Drawer & Footer */}
      <CartDrawer />
      <Footer />
    </div>
  );
}
