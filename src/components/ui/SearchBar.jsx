import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Mic } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import useSmartSearch from '../../hooks/useSmartSearch';
import useVoiceSearch from '../../hooks/useVoiceSearch';
import SmartSearchOverlay from '../search/SmartSearchOverlay';
import VoiceSearchModal from '../search/VoiceSearchModal';

export default function SearchBar() {
  const navigate = useNavigate();
  const { globalSettings } = useSettings();

  const [category, setCategory] = useState('All Categories');
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Smart Search hook
  const {
    query,
    setQuery,
    results,
    suggestions,
    isSearching,
    highlight,
    recentSearches,
    saveToRecent,
    removeRecent,
    clearAllRecent,
    refreshRecent,
    hasResults,
    hasQuery,
  } = useSmartSearch(150);

  // Execute search — navigate to catalog with query
  const executeSearch = useCallback((searchTerm) => {
    const term = searchTerm || query;
    if (!term.trim()) return;
    saveToRecent(term);
    setIsSearchFocused(false);
    setIsCatDropdownOpen(false);
    navigate(`/catalog?search=${encodeURIComponent(term.trim())}`);
  }, [query, saveToRecent, navigate]);

  // Voice Search hook
  const voiceSearch = useVoiceSearch({
    onResult: (transcript) => {
      setQuery(transcript);
      setIsVoiceModalOpen(false);
      // Small delay to let user see the transcript, then search
      setTimeout(() => {
        executeSearch(transcript);
      }, 400);
    },
    lang: 'en-IN',
  });

  // Close overlays when clicking outside
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

  // Refresh recent searches when overlay opens
  useEffect(() => {
    if (isSearchFocused) refreshRecent();
  }, [isSearchFocused, refreshRecent]);

  // ─── Typewriter Placeholder Effect ─────────────
  const searchPlaceholdersRaw = globalSettings?.searchPlaceholder || 'Search for groceries...\nSearch for fresh fruits...\nSearch for dairy products...';
  const placeholders = searchPlaceholdersRaw.split('\n').filter(p => p.trim() !== '');
  const placeholderIntervalSeconds = parseFloat(globalSettings?.searchPlaceholderInterval) || 3;

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (placeholders.length === 0) return;
    const currentWord = placeholders[currentPlaceholderIndex] || 'Search...';
    let typingSpeed = isDeleting ? 25 : 50;

    if (!isDeleting && typewriterText === currentWord) {
      const timeout = setTimeout(() => setIsDeleting(true), placeholderIntervalSeconds * 1000);
      return () => clearTimeout(timeout);
    } else if (isDeleting && typewriterText === '') {
      setIsDeleting(false);
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
      return;
    }

    const timeout = setTimeout(() => {
      setTypewriterText(prev => {
        if (isDeleting) return currentWord.substring(0, prev.length - 1);
        return currentWord.substring(0, prev.length + 1);
      });
    }, typingSpeed);
    return () => clearTimeout(timeout);
  }, [typewriterText, isDeleting, currentPlaceholderIndex, placeholders, placeholderIntervalSeconds]);

  // ─── Categories Dropdown ───────────────────────
  const searchCategoriesRaw = globalSettings?.searchDropdownCategories || 'All Categories\nRice & Atta\nDals & Pulses\nOils & Ghee\nSpices & Masalas\nSnacks & Biscuits';
  const categories = searchCategoriesRaw.split('\n').filter(c => c.trim() !== '');

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [searchCategoriesRaw]);

  // Voice modal handlers
  const openVoiceModal = () => {
    setIsSearchFocused(false);
    setIsVoiceModalOpen(true);
    voiceSearch.startListening();
  };

  const closeVoiceModal = () => {
    voiceSearch.stopListening();
    setIsVoiceModalOpen(false);
  };

  return (
    <>
      <style>
        {`
          @keyframes spinFluid {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
          
          .gemini-border-smoke {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 200%;
            padding-bottom: 200%;
            background: conic-gradient(from 0deg, transparent 0%, rgba(52, 211, 153, 0.8) 25%, rgba(251, 191, 36, 0.8) 50%, rgba(249, 115, 22, 0.8) 75%, transparent 100%);
            animation: spinFluid 4s linear infinite;
            filter: blur(12px);
            z-index: -1;
            pointer-events: none;
          }
          
          .gemini-container {
            overflow: hidden;
            border-radius: 9999px;
            position: absolute;
            inset: -3px; /* border thickness */
            z-index: -1;
            opacity: 0.4;
            transition: opacity 0.5s ease;
          }
          .group:focus-within .gemini-container {
            opacity: 1;
          }
        `}
      </style>
      <div ref={searchContainerRef} className="relative flex-1 w-full max-w-2xl lg:mx-8 z-50 group">
        
        {/* Gemini Smokey Flowing Border */}
        <div className="gemini-container">
          <div className="gemini-border-smoke"></div>
        </div>

        {/* Main Search Bar Container */}
        <div className={`relative flex items-center bg-white rounded-full px-1.5 py-1 transition-all duration-500 ease-out border-2 ${isSearchFocused ? 'shadow-2xl scale-[1.02] border-transparent' : 'shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-white/50'
          }`}>
          <input
            ref={inputRef}
            type="text"
            placeholder={typewriterText || 'Search...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') executeSearch();
              if (e.key === 'Escape') { setIsSearchFocused(false); inputRef.current?.blur(); }
            }}
            aria-label="Search products"
            aria-expanded={isSearchFocused}
            aria-autocomplete="list"
            className="w-full bg-transparent px-4 py-1.5 text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none font-semibold tracking-wide"
          />

          {/* Voice search button */}
          {voiceSearch.isSupported && (
            <button
              type="button"
              aria-label="Voice Search"
              onClick={openVoiceModal}
              className={`p-2 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 ${isSearchFocused
                  ? 'bg-emerald-50/80 text-emerald-600 hover:bg-emerald-100 hover:shadow-md hover:scale-105'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
            >
              <Mic className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Category selector dropdown (desktop) */}
          <div className="relative flex items-center hidden sm:flex ml-1">
            <div className="h-5 w-[1.5px] bg-slate-200/80 mx-1.5 rounded-full"></div>
            <button
              type="button"
              onClick={() => { setIsCatDropdownOpen(!isCatDropdownOpen); setIsSearchFocused(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[12.5px] font-bold text-slate-500 hover:text-slate-800 whitespace-nowrap transition-colors focus:outline-none cursor-pointer rounded-xl hover:bg-slate-50"
            >
              <span className="truncate max-w-[110px]">{category}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isCatDropdownOpen ? 'rotate-180 text-amber-500' : ''}`} />
            </button>

            {isCatDropdownOpen && (
              <div className="absolute right-0 top-11 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-slate-100/80 py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-h-[320px] overflow-y-auto custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setIsCatDropdownOpen(false);
                      if (cat.toLowerCase() === 'all categories') {
                        navigate('/catalog');
                      } else {
                        navigate(`/category/${encodeURIComponent(cat)}`);
                      }
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 ${category === cat
                        ? 'text-amber-600 bg-amber-50/70 border-l-2 border-amber-500'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:pl-5'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search button (Premium Gradient) */}
          <button
            type="button"
            aria-label="Search"
            onClick={() => executeSearch()}
            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white p-2.5 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95 ml-1.5 cursor-pointer"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Smart Search Overlay (replaces old dropdown) */}
        <SmartSearchOverlay
          isOpen={isSearchFocused}
          query={query}
          results={results}
          suggestions={suggestions}
          isSearching={isSearching}
          hasQuery={hasQuery}
          recentSearches={recentSearches}
          highlight={highlight}
          onSearch={executeSearch}
          onRemoveRecent={removeRecent}
          onClearAllRecent={clearAllRecent}
          onClose={() => setIsSearchFocused(false)}
        />
      </div>

      {/* Voice Search Modal (portal-level) */}
      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={closeVoiceModal}
        isListening={voiceSearch.isListening}
        transcript={voiceSearch.transcript}
        status={voiceSearch.status}
        error={voiceSearch.error}
        onStart={voiceSearch.startListening}
        onStop={voiceSearch.stopListening}
        onRetry={() => { voiceSearch.resetVoice(); voiceSearch.startListening(); }}
      />
    </>
  );
}
