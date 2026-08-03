import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, TrendingUp, Clock, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';

export default function SearchBar() {
  const { products } = useCart();
  const navigate = useNavigate();
  const [category, setCategory] = useState('All Categories');
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchContainerRef = useRef(null);

  const handleSearch = (query = searchQuery) => {
    if (!query.trim()) return;
    setIsSearchFocused(false);
    setIsCatDropdownOpen(false);
    navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
  };

  // Close smart search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { globalSettings } = useSettings();

  // 1. Placeholder Typewriter Effect
  const searchPlaceholdersRaw = globalSettings?.searchPlaceholder || 'Search for groceries...\nSearch for fresh fruits...\nSearch for dairy products...';
  const placeholders = searchPlaceholdersRaw.split('\n').filter(p => p.trim() !== '');
  const placeholderIntervalSeconds = parseFloat(globalSettings?.searchPlaceholderInterval) || 3;

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (placeholders.length === 0) return;
    
    const currentWord = placeholders[currentPlaceholderIndex] || 'Search...';
    let typingSpeed = 50; // ms per character
    
    if (isDeleting) {
      typingSpeed = 25; // faster deleting
    }

    if (!isDeleting && typewriterText === currentWord) {
      // Pause at the end of the word
      const timeout = setTimeout(() => setIsDeleting(true), placeholderIntervalSeconds * 1000);
      return () => clearTimeout(timeout);
    } else if (isDeleting && typewriterText === '') {
      // Move to next word
      setIsDeleting(false);
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
      return;
    }

    const timeout = setTimeout(() => {
      setTypewriterText(prev => {
        if (isDeleting) {
          return currentWord.substring(0, prev.length - 1);
        } else {
          return currentWord.substring(0, prev.length + 1);
        }
      });
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typewriterText, isDeleting, currentPlaceholderIndex, placeholders, placeholderIntervalSeconds]);

  // 2. Categories Dropdown
  const searchCategoriesRaw = globalSettings?.searchDropdownCategories || 'All Categories\nRice & Atta\nDals & Pulses\nOils & Ghee\nSpices & Masalas\nSnacks & Biscuits';
  const categories = searchCategoriesRaw.split('\n').filter(c => c.trim() !== '');

  // Default selected category is the first one
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [searchCategoriesRaw]);

  // 3. Trending Searches
  const trendingRaw = globalSettings?.searchTrendingSearches || 'Fresh Milk\nRed Onions\nWhole Wheat Bread\nOrganic Eggs';
  const trendingSearches = trendingRaw.split('\n').filter(t => t.trim() !== '');

  // 4. Popular Products
  let popularProducts = [];
  const popularNamesRaw = globalSettings?.searchPopularProducts;
  if (popularNamesRaw && products?.length > 0) {
    const names = popularNamesRaw.split('\n').filter(p => p.trim() !== '');
    names.forEach(name => {
      const match = products.find(p => p.name.toLowerCase() === name.toLowerCase());
      if (match) popularProducts.push(match);
    });
  }

  // Fallback if no valid matches or not set
  if (popularProducts.length === 0) {
    popularProducts = products?.length > 0
      ? products.slice(0, 4)
      : [
          { name: "Organic Whole Milk", price: "65", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&q=80" },
          { name: "Fresh Red Onions", price: "45", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=100&h=100&fit=crop&q=80" },
          { name: "Farm Brown Eggs", price: "85", image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=100&h=100&fit=crop&q=80" },
        ];
  }

  return (
    <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-4 lg:mx-8 z-50">
      <div className={`flex items-center bg-[#f8f9fa] border rounded-full px-2 py-1 transition-all duration-300 ${isSearchFocused ? 'border-amber-400 ring-4 ring-amber-400/20 shadow-lg bg-white' : 'border-gray-200/80 shadow-inner hover:border-amber-300'}`}>
        <input
          type="text"
          placeholder={typewriterText || 'Search...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="w-full bg-transparent px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-bold"
        />

        {/* Category selector dropdown inside search bar */}
        <div className="relative flex items-center hidden sm:flex">
          <div className="h-5 w-[1px] bg-gray-200 mx-1"></div>
          <button
            type="button"
            onClick={() => { setIsCatDropdownOpen(!isCatDropdownOpen); setIsSearchFocused(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 whitespace-nowrap focus:outline-none cursor-pointer"
          >
            <span className="truncate max-w-[100px]">{category}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCatDropdownOpen && (
            <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[300px] overflow-y-auto custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setIsCatDropdownOpen(false);
                    // Navigate to the category page
                    if (cat.toLowerCase() === 'all categories') {
                      navigate('/catalog');
                    } else {
                      navigate(`/category/${encodeURIComponent(cat)}`);
                    }
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs hover:bg-amber-50 hover:text-amber-700 font-bold transition-colors cursor-pointer ${
                    category === cat ? 'text-amber-600 bg-amber-50/50' : 'text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          type="button"
          aria-label="Search"
          onClick={() => handleSearch()}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 p-2.5 rounded-full flex items-center justify-center shadow-md shadow-amber-300/30 transition-transform active:scale-95 ml-1 cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Smart Visual Search Dropdown Overlay */}
      {isSearchFocused && (
        <div className="absolute left-0 right-0 top-[110%] mt-2 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* Trending Searches */}
          <div className="p-4 sm:p-5 border-b border-slate-50">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Trending Right Now
            </h4>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSearch(term)}
                  className="flex items-center gap-1.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-600 hover:text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer hover:shadow-sm"
                >
                  <Search className="w-3 h-3 text-slate-400" /> {term}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Products with Thumbnails */}
          <div className="p-4 sm:p-5 bg-slate-50/50">
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-3">
              <Star className="w-3.5 h-3.5 text-emerald-500" /> Popular Products
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {popularProducts.map((prod, i) => (
                <div 
                  key={i} 
                  onClick={() => handleSearch(prod.name)}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 group-hover:scale-105 transition-transform shadow-sm" />
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-1">{prod.name}</h5>
                    <p className="text-[11px] font-black text-emerald-600 mt-0.5">₹{prod.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
