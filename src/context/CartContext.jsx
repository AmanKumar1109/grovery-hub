import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, getDocs, query, limit, startAfter } from 'firebase/firestore';

const PAGE_SIZE = 8;

// Shared doc transformer
function transformDoc(d) {
  const data = d.data();
  const salePrice = parseFloat(data.price) || 0;
  const mrp = parseFloat(data.sellingPrice) || 0;
  const offPct = parseInt(data.offPercentage) || 0;
  const originalPrice = mrp > salePrice ? mrp : (salePrice > 0 ? salePrice : 0);
  const autoBadge = offPct > 0 ? `${offPct}% OFF` : (data.badge || '');
  return {
    id: d.id,
    name: data.name || 'Grocery Item',
    category: data.category || 'General',
    price: salePrice,
    originalPrice,
    offPercentage: offPct,
    unit: data.unit || '1 Pack',
    rating: parseFloat(data.rating) || 4.8,
    reviews: data.reviews || 120,
    badge: autoBadge,
    isOrganic: data.isOrganic !== undefined ? data.isOrganic : true,
    isHalal: data.isHalal !== undefined ? data.isHalal : true,
    inStock: data.inStock !== false,
    isVisible: data.isVisible !== false,
    image: data.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80'
  };
}

const CartContext = createContext(null);

export const initialProducts = [
  {
    id: 'prod-1',
    name: 'Premium Basmati Rice',
    category: 'Rice & Atta',
    price: 145,
    originalPrice: 160,
    unit: '1 kg',
    rating: 4.8,
    reviews: 142,
    badge: '25% OFF',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-2',
    name: 'Whole Wheat Chakki Atta',
    category: 'Rice & Atta',
    price: 450,
    originalPrice: 520,
    unit: '10 kg',
    rating: 4.9,
    reviews: 210,
    badge: 'Trending',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-3',
    name: 'Toor Dal (Arhar)',
    category: 'Dals & Pulses',
    price: 160,
    originalPrice: 180,
    unit: '1 kg',
    rating: 4.7,
    reviews: 380,
    badge: 'Fresh Stock',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1585994273299-4a9492161f5c?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-4',
    name: 'Pure Mustard Oil',
    category: 'Oils & Ghee',
    price: 185,
    originalPrice: 200,
    unit: '1 Litre',
    rating: 4.6,
    reviews: 95,
    badge: 'Bestseller',
    isOrganic: false,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-5',
    name: 'Desi Cow Ghee',
    category: 'Oils & Ghee',
    price: 590,
    originalPrice: 650,
    unit: '1 Litre',
    rating: 4.8,
    reviews: 88,
    badge: 'Pure',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1644310574706-e7587ea0b205?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-6',
    name: 'Turmeric Powder (Haldi)',
    category: 'Spices & Masalas',
    price: 55,
    originalPrice: 65,
    unit: '250g',
    rating: 4.9,
    reviews: 175,
    badge: '100% Pure',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1613134909187-578d53018ea6?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-7',
    name: 'Garam Masala Blend',
    category: 'Spices & Masalas',
    price: 120,
    originalPrice: 150,
    unit: '200g',
    rating: 4.9,
    reviews: 310,
    badge: '20% OFF',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-8',
    name: 'Digestive Biscuits',
    category: 'Snacks & Biscuits',
    price: 45,
    originalPrice: 50,
    unit: '250g Pack',
    rating: 4.8,
    reviews: 260,
    badge: 'Crunchy',
    isOrganic: false,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=400',
  },
];

export function CartProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initial paginated fetch + real-time categories
  useEffect(() => {
    const fetchFirst = async () => {
      try {
        const q = query(collection(db, 'items'), limit(PAGE_SIZE));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const loaded = snap.docs.map(transformDoc).filter(item => item.isVisible);
          setProducts(loaded.length > 0 ? loaded : []);
          setLastDoc(snap.docs[snap.docs.length - 1]);
          setHasMore(snap.docs.length === PAGE_SIZE);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.warn('Firebase fetch failed:', err);
        setHasMore(false);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchFirst();

    // Real-time categories (small collection, fine to stream)
    const unsubCat = onSnapshot(collection(db, 'categories'), (snap) => {
      const loadedCats = snap.docs.map(d => d.data().name || d.id);
      setDbCategories(loadedCats);
    });

    return () => unsubCat();
  }, []);

  // Load next page — called by IntersectionObserver in ShopSection
  const loadMoreProducts = useCallback(async () => {
    if (!hasMore || isLoadingMore || !lastDoc) return;
    setIsLoadingMore(true);
    try {
      const q = query(collection(db, 'items'), startAfter(lastDoc), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const loaded = snap.docs.map(transformDoc).filter(item => item.isVisible);
        setProducts(prev => [...prev, ...loaded]);
        setLastDoc(snap.docs[snap.docs.length - 1]);
        setHasMore(snap.docs.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Load more error:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, lastDoc]);

  // Compute dynamic categories list with product counts
  const categoriesList = useMemo(() => {
    const catCounts = {};
    products.forEach(p => {
      if (p.category) {
        catCounts[p.category] = (catCounts[p.category] || 0) + 1;
      }
    });

    const allCategoryNames = Array.from(new Set([...dbCategories, ...Object.keys(catCounts)]));

    const list = [
      { id: 'all', name: 'All Products', count: `${products.length} Items` }
    ];

    allCategoryNames.forEach(catName => {
      const count = catCounts[catName] || 0;
      list.push({
        id: catName,
        name: catName,
        count: `${count} Item${count === 1 ? '' : 's'}`
      });
    });

    return list;
  }, [products, dbCategories]);

  // Ultra-fast state management with localStorage persistence (starts empty by default)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('grocery_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Persist cart to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem('grocery_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to persist cart items to localStorage:', e);
    }
  }, [cartItems]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const addToCart = (product, quantity = 1) => {
    if (product.inStock === false) {
      showToast(`Sorry, "${product.name}" is currently Out of Stock! ⚠️`);
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    showToast(`Added "${product.name}" to cart! 🛒`);
  };

  const updateQuantity = (productId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('grocery_cart_items');
    } catch (e) {
      console.warn(e);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        products,
        categoriesList,
        isLoadingProducts,
        loadMoreProducts,
        hasMore,
        isLoadingMore,
        cartItems,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        showToast,
        toastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

