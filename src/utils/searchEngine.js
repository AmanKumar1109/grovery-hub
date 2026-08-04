/**
 * Smart Search Engine for The Grocery Hub
 * Client-side search with fuzzy matching, typo correction, synonyms, and Hindi-English support.
 * Designed for <50ms response on 500+ products.
 */

/* ─── Typo Correction Map ─────────────────────────────────────── */
const TYPO_MAP = {
  // Vegetables & Fruits
  tamato: 'tomato', tometo: 'tomato', tamoto: 'tomato', tomoto: 'tomato', tamatar: 'tomato',
  poteto: 'potato', potatos: 'potato', potatoe: 'potato', patato: 'potato', alu: 'potato',
  onin: 'onion', onon: 'onion', oinon: 'onion', oniun: 'onion', pyaz: 'onion', pyaaz: 'onion',
  cabage: 'cabbage', cabege: 'cabbage',
  carot: 'carrot', carrot: 'carrot',
  brinjl: 'brinjal', bringal: 'brinjal',
  capsicam: 'capsicum', capsikum: 'capsicum',
  palak: 'spinach', spinnach: 'spinach',
  aple: 'apple', apel: 'apple',
  banna: 'banana', banan: 'banana',
  lemmon: 'lemon', leman: 'lemon',
  // Grains & Staples
  attaa: 'atta', attta: 'atta', aata: 'atta', aat: 'atta',
  suger: 'sugar', sugr: 'sugar', suagar: 'sugar', shugar: 'sugar',
  rie: 'rice', rce: 'rice', chawal: 'rice',
  dall: 'dal', daal: 'dal',
  maida: 'maida', mayda: 'maida',
  besan: 'besan', besin: 'besan',
  suji: 'sooji', sujee: 'sooji',
  // Dairy
  amool: 'amul', ammul: 'amul',
  panir: 'paneer', paner: 'paneer', panear: 'paneer',
  ghie: 'ghee', ghi: 'ghee',
  buter: 'butter', buttr: 'butter',
  chese: 'cheese', cheeze: 'cheese',
  dudh: 'milk', dood: 'milk',
  dahi: 'curd',
  // Beverages & Snacks
  biscut: 'biscuit', biskit: 'biscuit', biskut: 'biscuit', biscit: 'biscuit',
  choclate: 'chocolate', choclet: 'chocolate', chocolet: 'chocolate',
  cofee: 'coffee', coffe: 'coffee', kofi: 'coffee',
  jucie: 'juice', juce: 'juice',
  magi: 'maggi', meggi: 'maggi', maggie: 'maggi',
  namkin: 'namkeen', namken: 'namkeen',
  chips: 'chips', chps: 'chips',
  // Brands
  nesle: 'nestle', nestl: 'nestle',
  britania: 'britannia', britannia: 'britannia',
  forchune: 'fortune', fortun: 'fortune',
  ashirvaad: 'aashirvaad', aashirvad: 'aashirvaad', ashirvad: 'aashirvaad', ashirwad: 'aashirvaad',
  parle: 'parle', prle: 'parle', parleg: 'parle',
  amul: 'amul',
  tata: 'tata',
  // Spices
  masla: 'masala', massala: 'masala',
  haldi: 'turmeric', halidi: 'turmeric',
  jeera: 'cumin', jira: 'cumin',
  mirchi: 'chilli', mirch: 'chilli',
  // Oils
  oill: 'oil', oyl: 'oil', tel: 'oil',
  mustrd: 'mustard', musterd: 'mustard', sarso: 'mustard',
  // Personal Care & Cleaning
  detrgent: 'detergent', deterjent: 'detergent',
  sabun: 'soap', sabon: 'soap', sope: 'soap',
  sampo: 'shampoo', shampo: 'shampoo', shampu: 'shampoo',
  paste: 'toothpaste', toothpast: 'toothpaste',
  surf: 'surf',
};

/* ─── Synonym Dictionary ──────────────────────────────────────── */
const SYNONYM_MAP = {
  'cold drink': ['soft drink', 'soda', 'beverage', 'coke', 'pepsi', 'sprite', 'fanta', 'thums up', 'limca'],
  'soft drink': ['cold drink', 'soda', 'beverage'],
  'biscuit': ['cookies', 'cookie', 'biscuits'],
  'cookies': ['biscuit', 'biscuits'],
  'oil': ['cooking oil', 'edible oil', 'tel'],
  'cooking oil': ['oil', 'edible oil', 'tel'],
  'rice': ['basmati', 'chawal', 'chaawal'],
  'basmati': ['rice', 'chawal'],
  'dal': ['pulses', 'lentils', 'daal'],
  'pulses': ['dal', 'lentils', 'daal'],
  'lentils': ['dal', 'pulses'],
  'chips': ['wafers', 'namkeen', 'snacks'],
  'wafers': ['chips', 'snacks'],
  'soap': ['bath soap', 'body wash', 'sabun'],
  'bath soap': ['soap', 'body wash'],
  'shampoo': ['hair wash', 'hair care'],
  'bread': ['pav', 'loaf', 'roti', 'bun'],
  'milk': ['doodh', 'dairy'],
  'curd': ['dahi', 'yogurt', 'yoghurt'],
  'yogurt': ['curd', 'dahi', 'yoghurt'],
  'butter': ['makhan'],
  'ghee': ['clarified butter', 'desi ghee'],
  'sugar': ['cheeni', 'shakkar'],
  'salt': ['namak'],
  'flour': ['atta', 'maida', 'aata'],
  'atta': ['flour', 'wheat flour', 'aata'],
  'maida': ['refined flour', 'all purpose flour'],
  'noodles': ['maggi', 'pasta', 'instant noodles'],
  'maggi': ['noodles', 'instant noodles'],
  'tea': ['chai', 'green tea', 'tea leaves'],
  'chai': ['tea', 'tea leaves'],
  'coffee': ['kaapi', 'instant coffee'],
  'egg': ['eggs', 'anda', 'ande'],
  'eggs': ['egg', 'anda', 'ande'],
  'juice': ['ras', 'fruit juice'],
  'jam': ['jelly', 'preserve', 'marmalade'],
  'ketchup': ['sauce', 'tomato sauce', 'tomato ketchup'],
  'sauce': ['ketchup', 'tomato sauce'],
  'pickle': ['achar', 'achaar'],
  'papad': ['papaddum', 'papadum', 'appalam'],
  'detergent': ['washing powder', 'surf', 'tide'],
  'toothpaste': ['dental cream', 'tooth paste'],
  'diaper': ['nappy', 'diapers'],
};

/* ─── Hindi-English Bilingual Map ─────────────────────────────── */
const HINDI_MAP = {
  // Vegetables
  tamatar: 'tomato', टमाटर: 'tomato',
  aloo: 'potato', आलू: 'potato', aaloo: 'potato',
  pyaaz: 'onion', प्याज: 'onion', pyaz: 'onion', piyaz: 'onion',
  dhaniya: 'coriander', धनिया: 'coriander', dhania: 'coriander',
  mirchi: 'chilli', मिर्ची: 'chilli', mirch: 'chilli', hari_mirch: 'green chilli',
  palak: 'spinach', पालक: 'spinach',
  gobhi: 'cauliflower', गोभी: 'cauliflower', gobi: 'cauliflower', phool_gobhi: 'cauliflower',
  baingan: 'brinjal', बैंगन: 'brinjal', baigan: 'brinjal',
  bhindi: 'okra', भिंडी: 'okra', bhindee: 'okra',
  lauki: 'bottle gourd', लौकी: 'bottle gourd',
  tori: 'ridge gourd', तोरी: 'ridge gourd', torai: 'ridge gourd',
  karela: 'bitter gourd', करेला: 'bitter gourd',
  matar: 'peas', मटर: 'peas', mattar: 'peas',
  shimla_mirch: 'capsicum', शिमला_मिर्च: 'capsicum',
  adrak: 'ginger', अदरक: 'ginger',
  lahsun: 'garlic', लहसुन: 'garlic', lehsun: 'garlic',
  // Fruits
  seb: 'apple', सेब: 'apple',
  kela: 'banana', केला: 'banana',
  aam: 'mango', आम: 'mango',
  angur: 'grapes', अंगूर: 'grapes', angoor: 'grapes',
  santra: 'orange', संतरा: 'orange',
  nimbu: 'lemon', नींबू: 'lemon', nimboo: 'lemon',
  // Dairy
  doodh: 'milk', दूध: 'milk', dudh: 'milk',
  dahi: 'curd', दही: 'curd',
  paneer: 'paneer', पनीर: 'paneer',
  makhan: 'butter', मक्खन: 'butter',
  // Grains & Staples
  chawal: 'rice', चावल: 'rice', chaawal: 'rice',
  atta: 'atta', आटा: 'atta', aata: 'atta',
  cheeni: 'sugar', चीनी: 'sugar', chini: 'sugar',
  namak: 'salt', नमक: 'salt',
  tel: 'oil', तेल: 'oil',
  // Spices
  haldi: 'turmeric', हल्दी: 'turmeric',
  jeera: 'cumin', जीरा: 'cumin', zeera: 'cumin',
  lal_mirch: 'red chilli', लाल_मिर्च: 'red chilli',
  dhania_powder: 'coriander powder',
  garam_masala: 'garam masala', गरम_मसाला: 'garam masala',
  // Pulses
  chana: 'chickpea', चना: 'chickpea', channa: 'chickpea',
  rajma: 'kidney beans', राजमा: 'kidney beans',
  moong: 'moong dal', मूंग: 'moong dal', moong_dal: 'moong dal',
  masoor: 'masoor dal', मसूर: 'masoor dal',
  arhar: 'toor dal', अरहर: 'toor dal', toor: 'toor dal',
  urad: 'urad dal', उड़द: 'urad dal',
  // Other
  roti: 'bread', रोटी: 'bread',
  sabzi: 'vegetables', सब्ज़ी: 'vegetables', sabji: 'vegetables',
  anda: 'egg', अंडा: 'egg', ande: 'eggs',
  machli: 'fish', मछली: 'fish',
  gosht: 'meat', गोश्त: 'meat', murga: 'chicken', मुर्गा: 'chicken',
  chai: 'tea', चाय: 'tea',
  pani: 'water', पानी: 'water',
  shakkar: 'sugar', शक्कर: 'sugar',
  besan: 'gram flour', बेसन: 'gram flour',
  sooji: 'semolina', सूजी: 'semolina', suji: 'semolina', rava: 'semolina',
  dalchini: 'cinnamon', दालचीनी: 'cinnamon',
  elaichi: 'cardamom', इलायची: 'cardamom', ilaichi: 'cardamom',
  laung: 'cloves', लौंग: 'cloves',
  ajwain: 'carom seeds', अजवाइन: 'carom seeds',
  methi: 'fenugreek', मेथी: 'fenugreek',
  sarson: 'mustard', सरसों: 'mustard',
  rai: 'mustard seeds', राई: 'mustard seeds',
  saunf: 'fennel', सौंफ: 'fennel',
};

/* ─── Soundex Phonetic Algorithm ─────────────────────────────── */
function soundex(s) {
  const a = s.toLowerCase().split('');
  const f = a.shift();
  let r = '', codes = { a:'', e:'', i:'', o:'', u:'', b:1, f:1, p:1, v:1, c:2, g:2, j:2, k:2, q:2, s:2, x:2, z:2, d:3, t:3, l:4, m:5, n:5, r:6 };
  r = f + a.map(v => codes[v] ? codes[v] : codes[v] === 0 ? 0 : '').filter((v, i, a) => ((i === 0) ? v !== codes[f] : v !== a[i - 1])).join('');
  return (r + '000').slice(0, 4).toUpperCase();
}

/* ─── Levenshtein Distance (edit distance) ────────────────────── */
function levenshtein(a, b) {
  const la = a.length, lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;
  
  // Optimization: use single-row DP
  let prev = new Array(lb + 1);
  let curr = new Array(lb + 1);
  
  for (let j = 0; j <= lb; j++) prev[j] = j;
  
  for (let i = 1; i <= la; i++) {
    curr[0] = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,      // deletion
        curr[j - 1] + 1,  // insertion
        prev[j - 1] + cost // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[lb];
}

/* ─── Bigram Similarity (Dice coefficient) ────────────────────── */
function bigrams(str) {
  const s = str.toLowerCase();
  const pairs = new Set();
  for (let i = 0; i < s.length - 1; i++) {
    pairs.add(s[i] + s[i + 1]);
  }
  return pairs;
}

function bigramSimilarity(a, b) {
  if (!a || !b) return 0;
  const ba = bigrams(a);
  const bb = bigrams(b);
  if (ba.size === 0 && bb.size === 0) return 1;
  if (ba.size === 0 || bb.size === 0) return 0;
  let intersection = 0;
  for (const bg of ba) {
    if (bb.has(bg)) intersection++;
  }
  return (2 * intersection) / (ba.size + bb.size);
}

/* ─── Normalize query: apply typo correction + Hindi translation ── */
function normalizeQuery(raw) {
  const q = raw.toLowerCase().trim();
  
  // Check typo map (whole query)
  if (TYPO_MAP[q]) return TYPO_MAP[q];
  
  // Check Hindi map (whole query)
  const hindiKey = q.replace(/\s+/g, '_');
  if (HINDI_MAP[q]) return HINDI_MAP[q];
  if (HINDI_MAP[hindiKey]) return HINDI_MAP[hindiKey];
  
  // Check word-by-word
  const words = q.split(/\s+/);
  const normalized = words.map(w => {
    if (TYPO_MAP[w]) return TYPO_MAP[w];
    if (HINDI_MAP[w]) return HINDI_MAP[w];
    const wKey = w.replace(/\s+/g, '_');
    if (HINDI_MAP[wKey]) return HINDI_MAP[wKey];
    return w;
  });
  
  return normalized.join(' ');
}

/* ─── Get synonyms for a term ─────────────────────────────────── */
function getSynonyms(term) {
  const t = term.toLowerCase();
  const results = new Set();
  
  if (SYNONYM_MAP[t]) {
    SYNONYM_MAP[t].forEach(s => results.add(s));
  }
  
  // Also check if the term appears as a synonym value
  for (const [key, syns] of Object.entries(SYNONYM_MAP)) {
    if (syns.includes(t)) {
      results.add(key);
      syns.forEach(s => results.add(s));
    }
  }
  
  results.delete(t);
  return Array.from(results);
}

/* ─── Tokenize product for indexing ───────────────────────────── */
function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F\s]/g, ' ')  // keep Hindi chars
    .split(/\s+/)
    .filter(t => t.length > 0);
}

/* ─── Build Search Index ──────────────────────────────────────── */
export function buildSearchIndex(products) {
  if (!products || products.length === 0) return [];
  
  return products.map(product => {
    const nameTokens = tokenize(product.name);
    const categoryTokens = tokenize(product.category);
    const subcategoryTokens = tokenize(product.subcategory);
    const allTokens = [...nameTokens, ...categoryTokens, ...subcategoryTokens];
    const soundexTokens = allTokens.filter(t => t.length > 2).map(soundex);
    const nameLower = (product.name || '').toLowerCase();
    const categoryLower = (product.category || '').toLowerCase();
    
    return {
      product,
      nameTokens,
      categoryTokens,
      allTokens,
      soundexTokens,
      nameLower,
      categoryLower,
      // Pre-compute for fast access
      inStock: product.inStock !== false,
      hasDiscount: product.originalPrice > product.price,
      popularity: (product.recentBuyers || 0) + (product.reviews || 0),
    };
  });
}

/* ─── Search Function (main export) ───────────────────────────── */
export function smartSearch(query, searchIndex, maxResults = 30) {
  if (!query || !searchIndex || searchIndex.length === 0) return [];
  
  const rawQuery = query.trim().toLowerCase();
  if (rawQuery.length === 0) return [];
  
  // Normalize: fix typos + translate Hindi
  const normalized = normalizeQuery(rawQuery);
  const queryTokens = tokenize(normalized);
  
  // Get synonyms for the normalized query
  const synonymTerms = getSynonyms(normalized);
  // Also get synonyms for individual tokens
  queryTokens.forEach(t => {
    getSynonyms(t).forEach(s => synonymTerms.push(s));
  });
  
  const scored = [];
  
  for (const entry of searchIndex) {
    let score = 0;
    let matchType = 'none';
    
    // 1. EXACT NAME MATCH (highest priority)
    if (entry.nameLower === normalized) {
      score = 1000;
      matchType = 'exact';
    }
    // 2. NAME STARTS WITH query
    else if (entry.nameLower.startsWith(normalized)) {
      score = 800;
      matchType = 'prefix';
    }
    // 3. NAME CONTAINS query
    else if (entry.nameLower.includes(normalized)) {
      score = 600;
      matchType = 'contains';
    }
    // 4. ANY TOKEN starts with any query token
    else if (queryTokens.some(qt => entry.allTokens.some(et => et.startsWith(qt)))) {
      score = 500;
      matchType = 'token-prefix';
    }
    // 5. ANY TOKEN contains any query token
    else if (queryTokens.some(qt => entry.allTokens.some(et => et.includes(qt)))) {
      score = 400;
      matchType = 'token-contains';
    }
    // 6. CATEGORY MATCH
    else if (entry.categoryLower.includes(normalized) || queryTokens.some(qt => entry.categoryLower.includes(qt))) {
      score = 350;
      matchType = 'category';
    }
    // 7. SYNONYM MATCH
    else if (synonymTerms.some(syn => entry.nameLower.includes(syn) || entry.categoryLower.includes(syn))) {
      score = 300;
      matchType = 'synonym';
    }
    // 7.5 SOUNDEX PHONETIC MATCH
    else if (queryTokens.filter(qt => qt.length > 2).some(qt => entry.soundexTokens.includes(soundex(qt)))) {
      score = 250;
      matchType = 'phonetic';
    }
    // 8. FUZZY MATCH (Levenshtein on each token)
    else {
      let bestFuzzy = 0;
      for (const qt of queryTokens) {
        if (qt.length < 2) continue;
        for (const et of entry.nameTokens) {
          if (et.length < 2) continue;
          // Only compute for tokens of similar length (optimization)
          if (Math.abs(qt.length - et.length) > 3) continue;
          
          const distance = levenshtein(qt, et);
          const maxLen = Math.max(qt.length, et.length);
          const threshold = maxLen <= 4 ? 1 : maxLen <= 6 ? 2 : 3;
          
          if (distance <= threshold) {
            const similarity = 1 - (distance / maxLen);
            bestFuzzy = Math.max(bestFuzzy, similarity);
          }
        }
      }
      
      if (bestFuzzy > 0) {
        score = 100 + (bestFuzzy * 100);
        matchType = 'fuzzy';
      }
    }
    
    // 9. BIGRAM SIMILARITY as a last resort
    if (score === 0 && rawQuery.length >= 3) {
      const sim = bigramSimilarity(rawQuery, entry.nameLower);
      if (sim >= 0.4) {
        score = 50 + (sim * 50);
        matchType = 'bigram';
      }
    }
    
    if (score > 0) {
      // Boost factors
      if (entry.inStock) score += 20;
      if (entry.hasDiscount) score += 10;
      score += Math.min(entry.popularity * 0.1, 30); // cap popularity boost
      
      scored.push({
        ...entry.product,
        _score: score,
        _matchType: matchType,
      });
    }
  }
  
  // Sort by score descending
  scored.sort((a, b) => b._score - a._score);
  
  return scored.slice(0, maxResults);
}

/* ─── Highlight matching text ─────────────────────────────────── */
export function highlightMatch(text, query) {
  if (!text || !query) return text;
  
  const normalized = normalizeQuery(query.toLowerCase().trim());
  const tokens = tokenize(normalized);
  
  // Also add raw query tokens
  const rawTokens = tokenize(query.toLowerCase().trim());
  const allTokens = [...new Set([...tokens, ...rawTokens])].filter(t => t.length >= 2);
  
  if (allTokens.length === 0) return text;
  
  // Escape regex special chars and build pattern
  const escaped = allTokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  
  return text.replace(pattern, '<mark class="bg-amber-200/60 text-amber-900 rounded-sm px-0.5">$1</mark>');
}

/* ─── Get search suggestions (for "no results" fallback) ──────── */
export function getSearchSuggestions(query, searchIndex) {
  const normalized = normalizeQuery(query.toLowerCase().trim());
  const suggestions = {
    correctedQuery: normalized !== query.toLowerCase().trim() ? normalized : null,
    similarProducts: [],
    relatedCategories: [],
  };
  
  // Get categories from the index
  const categorySet = new Set();
  for (const entry of searchIndex) {
    if (entry.product.category) categorySet.add(entry.product.category);
  }
  
  // Find related categories
  const queryTokens = tokenize(normalized);
  for (const cat of categorySet) {
    const catLower = cat.toLowerCase();
    if (queryTokens.some(qt => catLower.includes(qt) || bigramSimilarity(qt, catLower) > 0.3)) {
      suggestions.relatedCategories.push(cat);
    }
  }
  
  // Find loosely similar products (lower threshold)
  for (const entry of searchIndex) {
    const sim = bigramSimilarity(normalized, entry.nameLower);
    if (sim > 0.2) {
      suggestions.similarProducts.push({ ...entry.product, _similarity: sim });
    }
  }
  suggestions.similarProducts.sort((a, b) => b._similarity - a._similarity);
  suggestions.similarProducts = suggestions.similarProducts.slice(0, 6);
  
  return suggestions;
}

/* ─── Recent Searches (localStorage) ──────────────────────────── */
const RECENT_KEY = 'tgh_recent_searches';
const MAX_RECENT = 10;

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query) {
  if (!query || query.trim().length === 0) return;
  const trimmed = query.trim();
  const current = getRecentSearches().filter(s => s.toLowerCase() !== trimmed.toLowerCase());
  current.unshift(trimmed);
  const limited = current.slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(limited));
  } catch { /* ignore */ }
}

export function removeRecentSearch(query) {
  const current = getRecentSearches().filter(s => s !== query);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(current));
  } catch { /* ignore */ }
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch { /* ignore */ }
}
