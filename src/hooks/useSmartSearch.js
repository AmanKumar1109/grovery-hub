import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { buildSearchIndex, smartSearch, highlightMatch, getSearchSuggestions, getRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } from '../utils/searchEngine';
import { useCart } from '../context/CartContext';

/**
 * useSmartSearch — debounced, fuzzy, ranked product search hook.
 * Builds an in-memory index from CartContext products and provides
 * instant (<50ms) search results with typo correction, Hindi support, and synonyms.
 */
export default function useSmartSearch(debounceMs = 150) {
  const { products } = useCart();
  
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches());
  
  const debounceTimer = useRef(null);

  // Build search index whenever products change (memoized)
  const searchIndex = useMemo(() => {
    return buildSearchIndex(products);
  }, [products]);

  // Debounce the query input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    if (query.trim().length === 0) {
      setDebouncedQuery('');
      setResults([]);
      setSuggestions(null);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);
    
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, debounceMs]);

  // Execute search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length === 0) {
      setResults([]);
      setSuggestions(null);
      setIsSearching(false);
      return;
    }
    
    const searchResults = smartSearch(debouncedQuery, searchIndex);
    setResults(searchResults);
    
    // If no results, get suggestions
    if (searchResults.length === 0) {
      const sug = getSearchSuggestions(debouncedQuery, searchIndex);
      setSuggestions(sug);
    } else {
      setSuggestions(null);
    }
    
    setIsSearching(false);
  }, [debouncedQuery, searchIndex]);

  // Highlight helper bound to current query
  const highlight = useCallback((text) => {
    return highlightMatch(text, debouncedQuery || query);
  }, [debouncedQuery, query]);

  // Save to recent searches
  const saveToRecent = useCallback((searchTerm) => {
    const term = searchTerm || query;
    if (term.trim().length > 0) {
      addRecentSearch(term.trim());
      setRecentSearches(getRecentSearches());
    }
  }, [query]);

  // Remove from recent
  const removeRecent = useCallback((term) => {
    removeRecentSearch(term);
    setRecentSearches(getRecentSearches());
  }, []);

  // Clear all recent
  const clearAllRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Refresh recent searches list
  const refreshRecent = useCallback(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  return {
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
    hasResults: results.length > 0,
    hasQuery: query.trim().length > 0,
  };
}
