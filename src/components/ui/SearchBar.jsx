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
    lang: 'hi-IN',
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
      <div ref={searchContainerRef} className="relative flex-1 w-full max-w-xl lg:mx-8 z-50">
        <div className={`flex items-center bg-[#f8f9fa] border rounded-full px-2 py-1 transition-all duration-300 ${
          isSearchFocused ? 'border-amber-400 ring-4 ring-amber-400/20 shadow-lg bg-white' : 'border-gray-200/80 shadow-inner hover:border-amber-300'
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
            className="w-full bg-transparent px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-bold"
          />

          {/* Voice search button */}
          {voiceSearch.isSupported && (
            <button
              type="button"
              aria-label="Voice Search"
              onClick={openVoiceModal}
              className="p-2 rounded-full hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer flex-shrink-0"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

          {/* Category selector dropdown (desktop) */}
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
            onClick={() => executeSearch()}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 p-2.5 rounded-full flex items-center justify-center shadow-md shadow-amber-300/30 transition-transform active:scale-95 ml-1 cursor-pointer"
          >
            <Search className="w-4 h-4" />
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
