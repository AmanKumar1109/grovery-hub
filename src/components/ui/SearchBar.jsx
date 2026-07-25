import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export default function SearchBar() {
  const [category, setCategory] = useState('All Categories');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categories = [
    'All Categories',
    'Fresh Vegetables',
    'Organic Fruits',
    'Dairy & Eggs',
    'Bakery & Snacks',
    'Beverages',
  ];

  return (
    <div className="relative flex-1 max-w-xl mx-4 lg:mx-8">
      <div className="flex items-center bg-[#f8f9fa] border border-gray-200/80 rounded-full px-2 py-1 shadow-inner focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all duration-200">
        <input
          type="text"
          placeholder="Search For Products..."
          className="w-full bg-transparent px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none font-medium"
        />

        {/* Category selector dropdown inside search bar */}
        <div className="relative flex items-center">
          <div className="h-5 w-[1px] bg-gray-200 mx-1"></div>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 whitespace-nowrap focus:outline-none"
          >
            <span>{category}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-11 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors ${
                    category === cat ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-gray-600'
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
          className="bg-[#1e293b] hover:bg-[#0f172a] text-white p-2.5 rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-95 ml-1"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
