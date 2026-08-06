import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Header from '../components/header/Header';
import Footer from '../components/shop/Footer';
import CartDrawer from '../components/shop/CartDrawer';
import ProductCard from '../components/shop/ProductCard';
import ProductSkeleton from '../components/shop/ProductSkeleton';
import { useCart } from '../context/CartContext';
import { buildSearchIndex, smartSearch } from '../utils/searchEngine';
import { Search, SlidersHorizontal, Package, Check, Filter, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react';
import SEO from '../components/seo/SEO';

export default function CatalogPage() {
  const location = useLocation();
  const { categoryName } = useParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Always show skeleton on first paint — even if products are already in memory.
  // This ensures instant navigation: page opens → skeleton shows → products appear.
  const [isMounted, setIsMounted] = useState(false);
  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const {
    toastMessage,
    products,
    isLoadingProducts,
    categoriesList,
    categoryDocs,
    loadMoreProducts,
    hasMore,
    isLoadingMore,
  } = useCart();

  const lastProcessedUrl = useRef('');

  useEffect(() => {
    const currentUrl = location.pathname + location.search;

    const searchParam = new URLSearchParams(location.search).get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery('');
    }

    if (lastProcessedUrl.current === currentUrl && categoryDocs?.length > 0) {
      return;
    }

    let cat = null;
    if (categoryName) {
      cat = decodeURIComponent(categoryName);
    } else {
      const params = new URLSearchParams(location.search);
      cat = params.get('category');
    }

    if (!cat) {
      setSelectedCategory('all');
      setSelectedSubcategory('all');
      lastProcessedUrl.current = currentUrl;
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    if (['all', 'Trending', 'BOGO', 'Buy 1 Get 1'].includes(cat)) {
      setSelectedCategory(cat);
      setSelectedSubcategory('all');
      if (cat !== 'all') setIsFilterOpen(true);
      lastProcessedUrl.current = currentUrl;
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    if (!categoryDocs || categoryDocs.length === 0) {
      setSelectedCategory(cat);
      return;
    }

    let isSub = false;
    let parentCat = null;
    for (const doc of categoryDocs) {
      if (doc.subcategories?.includes(cat)) {
        isSub = true;
        parentCat = doc.name;
        break;
      }
    }

    if (isSub) {
      setSelectedCategory(parentCat);
      setSelectedSubcategory(cat);
      setIsFilterOpen(true);
    } else {
      setSelectedCategory(cat);
      setSelectedSubcategory('all');
      if (cat !== 'all') setIsFilterOpen(true);
    }

    lastProcessedUrl.current = currentUrl;
    window.scrollTo({ top: 0, behavior: 'instant' });

  }, [location.pathname, location.search, categoryName, categoryDocs]);



  const sentinelRef = useRef(null);

  // --- Client-side lazy loading state ---
  const ITEMS_PER_PAGE = 10;
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  // Build search index asynchronously to prevent blocking the main thread on page load
  const [searchIndex, setSearchIndex] = useState([]);
  useEffect(() => {
    if (products && products.length > 0) {
      // Yield to main thread so navigation feels instant
      const timer = setTimeout(() => {
        setSearchIndex(buildSearchIndex(products));
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products || [];

    // Smart search: use fuzzy/typo/synonym/Hindi engine when there's a search query
    if (searchQuery && searchQuery.trim().length > 0) {
      const smartResults = smartSearch(searchQuery, searchIndex, 100);
      const smartIds = new Set(smartResults.map(p => p.id));
      filtered = filtered.filter(p => smartIds.has(p.id));
      // Apply smart ranking order
      const idToScore = {};
      smartResults.forEach(p => { idToScore[p.id] = p._score || 0; });
      filtered.sort((a, b) => (idToScore[b.id] || 0) - (idToScore[a.id] || 0));
    }

    // Category/subcategory/discount filters
    filtered = filtered.filter((prod) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'Trending'
            ? !!prod.isTrending
            : selectedCategory === 'BOGO' || selectedCategory === 'Buy 1 Get 1'
              ? !!prod.isBogo
              : prod.category === selectedCategory;
      const matchesSubcategory =
        selectedSubcategory === 'all'
          ? true
          : prod.subcategory === selectedSubcategory;
      const matchesDiscount = !onlyDiscounted || prod.originalPrice > prod.price;
      return matchesCategory && matchesSubcategory && matchesDiscount;
    });

    // Sort (only if no search query, since search results are already ranked)
    if (!searchQuery || searchQuery.trim().length === 0) {
      filtered = [...filtered].sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // featured: sort by the sortOrder configured in the dashboard
        return (a.sortOrder ?? 999999) - (b.sortOrder ?? 999999);
      });
    } else if (sortBy !== 'featured') {
      // If user explicitly chose a sort while searching, apply it
      filtered = [...filtered].sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
    }

    return filtered;
  }, [products, searchQuery, searchIndex, selectedCategory, selectedSubcategory, onlyDiscounted, sortBy]);

  // --- Client-side lazy loading (must be AFTER filteredProducts) ---
  // Reset displayCount whenever filters / search change so user starts fresh
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [selectedCategory, selectedSubcategory, searchQuery, onlyDiscounted, sortBy]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, displayCount),
    [filteredProducts, displayCount]
  );

  const hasMoreVisible = displayCount < filteredProducts.length;

  const loadMoreVisible = useCallback(() => {
    setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length));
  }, [filteredProducts.length]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) + (selectedSubcategory !== 'all' ? 1 : 0) + (onlyDiscounted ? 1 : 0);

  // IntersectionObserver for client-side lazy loading (display more from already-loaded products)
  // NOTE: isMounted in deps is critical — sentinel only renders after isMounted=true,
  // so observer must re-attach at that moment, otherwise it observes null and never fires.
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreVisible) {
          loadMoreVisible();
        }
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMoreVisible, loadMoreVisible, isMounted]);

  // Measure header height for sticky controls offset
  const headerContainerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (headerContainerRef.current) {
        setHeaderHeight(headerContainerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const catalogSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Shop Fresh Groceries & Essentials - The Grocery Hub",
    "url": "https://thegroceryhub.example.com/catalog"
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-300 selection:text-slate-900">
      <SEO 
        title={categoryName ? `${decodeURIComponent(categoryName)}` : "Shop Fresh Groceries & Essentials"}
        description="Browse our complete catalog of fresh organic groceries, daily essentials, and personal care products. Enjoy unbeatable prices and fast 15-minute delivery."
        url={`/catalog${categoryName ? `/${categoryName}` : ''}`}
        schema={catalogSchema}
      />
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 text-xs font-black animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Website Header - Sticky at top */}
      <div ref={headerContainerRef} className="sticky top-0 z-50">
        <Header />
      </div>

      {/* Sticky Controls Bar - sticks right below header */}
      <div
        className="sticky z-40 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/50"
        style={{ top: `${headerHeight}px` }}
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-2.5 sm:p-4 shadow-xs space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {/* Quick Search */}
              <div className="relative flex-1 sm:flex-none sm:w-96">
                <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search catalog items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all"
                />
              </div>

              {/* Filter Toggle & Sort */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer ${
                    isFilterOpen || activeFiltersCount > 0
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-300/40'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Filter className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-slate-950 text-white text-[10px] flex items-center justify-center font-black">
                      {activeFiltersCount}
                    </span>
                  )}
                  {isFilterOpen ? <ChevronUp className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> : <ChevronDown className="w-3 sm:w-3.5 h-3 sm:h-3.5" />}
                </button>

                <span className="text-xs font-extrabold text-slate-500 hidden md:inline">
                  Showing <span className="text-slate-900 font-black">{filteredProducts.length}</span> Items
                </span>

                <div className="flex items-center gap-1 sm:gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500 hidden sm:inline" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-1 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-extrabold text-slate-800 focus:outline-none focus:border-amber-400 cursor-pointer w-20 sm:w-auto truncate"
                  >
                    <option value="featured">Sort</option>
                    <option value="price-low">Low - High</option>
                    <option value="price-high">High - Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Collapsible Filter Dropdown */}
            {isFilterOpen && (
              <div className="pt-2 sm:pt-3 border-t border-slate-100 space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">
                    Filter Catalogue Products
                  </h4>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedSubcategory('all');
                        setOnlyDiscounted(false);
                      }}
                      className="text-[10px] sm:text-xs font-extrabold text-amber-600 hover:text-amber-700 underline cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Clear
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
                  {categoriesList.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSelectedSubcategory('all');
                        }}
                        className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
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

                {/* Subcategory Pills */}
                {selectedCategory !== 'all' && (() => {
                  const activeCatDoc = (categoryDocs || []).find(c => c.name === selectedCategory);
                  if (activeCatDoc && activeCatDoc.subcategories && activeCatDoc.subcategories.length > 0) {
                    return (
                      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mr-0.5 flex-shrink-0">Sub:</span>
                        <button
                          onClick={() => setSelectedSubcategory('all')}
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                            selectedSubcategory === 'all'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          All in {selectedCategory}
                        </button>
                        {activeCatDoc.subcategories.map(sub => (
                          <button
                            key={sub}
                            onClick={() => setSelectedSubcategory(sub)}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                              selectedSubcategory === sub
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Discount Toggle */}
                <div className="flex items-center gap-3 sm:gap-6 pt-0.5 sm:pt-1">
                  <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer text-[11px] sm:text-xs font-extrabold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={onlyDiscounted}
                      onChange={(e) => setOnlyDiscounted(e.target.checked)}
                      className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-md accent-amber-400 cursor-pointer"
                    />
                    <span>🔥 On Discount Only</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Catalog Content - Scrollable Products */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 space-y-4 sm:space-y-6">
        {/* Catalog Products Grid */}
        {(!isMounted || isLoadingProducts) ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(12)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Sentinel div for client-side lazy loading */}
            <div ref={sentinelRef} className="w-full h-4" aria-hidden="true" />

            {/* Loading Spinner — show while revealing next batch */}
            {hasMoreVisible && (
              <div className="flex items-center justify-center gap-2 py-6 text-slate-500 text-xs font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Loading more products...</span>
              </div>
            )}

            {!hasMoreVisible && (
              <p className="text-center text-xs font-bold text-slate-400 py-4">
                Showing all {filteredProducts.length} products
              </p>
            )}
          </>
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
