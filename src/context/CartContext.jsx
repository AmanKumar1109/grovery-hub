import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, getDocs, query, limit, startAfter, where } from 'firebase/firestore';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';

const PAGE_SIZE = 8;

function optimizeImageUrl(url) {
  if (!url) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=75&fm=webp';
  if (url.includes('unsplash.com') && !url.includes('fm=webp')) {
    return `${url.split('?')[0]}?w=300&q=75&fm=webp`;
  }
  return url;
}

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
    subcategory: data.subcategory || '',
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
    isTrending: data.isTrending === true || data.isTrending === 'true' || data.badge === 'Trending',
    isBogo: data.isBogo === true || data.isBogo === 'true' || data.badge === 'Buy 1 Get 1' || data.isBOGO === true,
    recentBuyers: data.recentBuyers || 0,
    image: optimizeImageUrl(data.image),
    sortOrder: data.sortOrder ?? 999999,
    maxQuantity: data.maxQuantity
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
    isTrending: false,
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
    badge: 'Bestseller',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    isTrending: false,
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
    isTrending: false,
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
    isTrending: false,
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
    isTrending: false,
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
    isTrending: false,
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
    isTrending: false,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400',
  },
];

export function CartProvider({ children }) {
  const { currentUser, userProfile } = useAuth();
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [categoryDocs, setCategoryDocs] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Real-time Firestore sync for items & categories
  useEffect(() => {
    const unsubItems = onSnapshot(collection(db, 'items'), (snap) => {
      if (!snap.empty) {
        let loaded = snap.docs.map(transformDoc).filter(item => item.isVisible);
        loaded.sort((a, b) => a.sortOrder - b.sortOrder);
        setProducts(loaded);
      }
      setIsLoadingProducts(false);
    }, (err) => {
      console.warn('Real-time items sync notice:', err);
      setIsLoadingProducts(false);
    });

    const unsubCat = onSnapshot(collection(db, 'categories'), (snap) => {
      const loadedCats = snap.docs.map(d => d.data().name || d.id);
      const docs = snap.docs.map(d => ({
        id: d.id,
        name: d.data().name || d.id,
        subcategories: d.data().subcategories || []
      }));
      setDbCategories(loadedCats);
      setCategoryDocs(docs);
    });

    return () => {
      unsubItems();
      unsubCat();
    };
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
        setProducts(prev => {
          const combined = [...prev, ...loaded];
          combined.sort((a, b) => a.sortOrder - b.sortOrder);
          return combined;
        });
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

  const { globalSettings } = useSettings();

  // Compute dynamic categories list with product counts
  const categoriesList = useMemo(() => {
    const catCounts = {};
    let trendingCount = 0;
    let bogoCount = 0;
    products.forEach(p => {
      if (p.isTrending) trendingCount++;
      if (p.isBogo) bogoCount++;
      if (p.category) {
        catCounts[p.category] = (catCounts[p.category] || 0) + 1;
      }
    });

    const list = [];
    const pushCategory = (id, name, countOverride) => {
      if (id === 'all') {
        list.push({ id: 'all', name: 'All Products', count: `${products.length} Items` });
      } else if (id === 'Trending') {
        list.push({ id: 'Trending', name: 'Trending', count: `${trendingCount} Item${trendingCount === 1 ? '' : 's'}` });
      } else if (id === 'BOGO') {
        list.push({ id: 'BOGO', name: 'Buy 1 Get 1', count: `${bogoCount} Item${bogoCount === 1 ? '' : 's'}` });
      } else {
        const count = countOverride ?? (catCounts[id] || 0);
        list.push({ id, name, count: `${count} Item${count === 1 ? '' : 's'}` });
      }
    };

    const displayOrder = globalSettings?.categoryDisplayOrder || [];
    
    // Push categories in the exact order specified by the Admin
    displayOrder.forEach(catId => pushCategory(catId, catId));

    // For any remaining categories not explicitly ordered by Admin, push them to the end
    const allCategoryNames = Array.from(new Set([...dbCategories, ...Object.keys(catCounts)]));
    
    // If the admin order doesn't have the defaults, push them first to fallback
    if (!displayOrder.includes('all')) pushCategory('all', 'All Products');
    if (!displayOrder.includes('Trending')) pushCategory('Trending', 'Trending');
    if (!displayOrder.includes('BOGO')) pushCategory('BOGO', 'Buy 1 Get 1');

    allCategoryNames.forEach(catName => {
      if (!displayOrder.includes(catName)) {
        pushCategory(catName, catName);
      }
    });

    return list;
  }, [products, dbCategories, globalSettings?.categoryDisplayOrder]);

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
      
      let newQty = quantity;
      if (existing) {
        newQty = existing.quantity + quantity;
      }
      
      const maxQty = product.maxQuantity ? parseInt(product.maxQuantity, 10) : null;
      if (maxQty && newQty > maxQty) {
        showToast(`You can only order up to ${maxQty} of "${product.name}" ⚠️`);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: maxQty } : item
          );
        }
        return [...prev, { ...product, quantity: maxQty }];
      }

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    
    const maxQty = product.maxQuantity ? parseInt(product.maxQuantity, 10) : null;
    const existing = cartItems.find((item) => item.id === product.id);
    if (!maxQty || !existing || existing.quantity + quantity <= maxQty) {
        showToast(`Added "${product.name}" to cart! 🛒`);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            
            const maxQty = item.maxQuantity ? parseInt(item.maxQuantity, 10) : null;
            if (maxQty && newQty > maxQty) {
              showToast(`You can only order up to ${maxQty} of "${item.name}" ⚠️`);
              return { ...item, quantity: maxQty };
            }
            
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
    setAppliedCoupon(null);
    setDiscountAmount(0);
    try {
      localStorage.removeItem('grocery_cart_items');
    } catch (e) {
      console.warn(e);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Global Promo Logic
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Fetch Coupons on Mount and when currentUser changes
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        // Query 1: Fetch Global Coupons (isGlobal === true)
        const globalQuery = query(collection(db, 'coupons'), where('isGlobal', '==', true));
        const globalSnap = await getDocs(globalQuery);
        let allCoupons = globalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Query 2: Fetch Personal Coupons (userId === currentUser.uid)
        if (currentUser) {
          const personalQuery = query(collection(db, 'coupons'), where('userId', '==', currentUser.uid));
          const personalSnap = await getDocs(personalQuery);
          const personalCoupons = personalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          allCoupons = [...allCoupons, ...personalCoupons];
        }

        // Filter valid coupons locally just in case (e.g. valid date check)
        const validCoupons = allCoupons.filter(c => {
          if (!c.isActive) return false;
          if (new Date(c.validUntil) < new Date()) return false;
          if (userProfile?.usedCoupons?.includes(c.id)) return false;
          return true;
        });
        setAvailableCoupons(validCoupons);
      } catch (err) {
        console.warn("Failed to fetch coupons:", err);
      }
    };
    fetchCoupons();
  }, [currentUser, userProfile?.usedCoupons]);

  const handleApplyPromo = (codeToApply) => {
    setPromoError('');
    const code = (codeToApply || promoCodeInput).trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a valid code');
      return;
    }

    const coupon = availableCoupons.find(c => c.code === code);
    if (!coupon) {
      setPromoError('Invalid Promo Code');
      return;
    }

    if (!coupon.isActive) {
      setPromoError('This Promo Code is currently inactive');
      return;
    }

    if (coupon.isReferralCoupon && appliedCoupon && appliedCoupon.isReferralCoupon) {
      setPromoError('You can only apply one referral coupon per order');
      return;
    }

    if (cartTotal < coupon.minOrderValue) {
      setPromoError(`Minimum order value for this code is ₹${coupon.minOrderValue}`);
      return;
    }

    const expiry = new Date(coupon.validUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignore time part for expiry check
    if (expiry < today) {
      setPromoError('This Promo Code has expired');
      return;
    }

    setAppliedCoupon(coupon);
    setPromoCodeInput('');
  };

  const handleRemovePromo = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setPromoError('');
  };

  // Recalculate discount whenever cartTotal or appliedCoupon changes
  useEffect(() => {
    if (!appliedCoupon) {
      setDiscountAmount(0);
      return;
    }
    
    // If cart falls below min value, remove coupon
    if (cartTotal < appliedCoupon.minOrderValue) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      showToast(`Promo Code removed. Minimum order value is ₹${appliedCoupon.minOrderValue}`);
      return;
    }

    let discount = 0;
    if (appliedCoupon.discountType === 'flat') {
      discount = parseFloat(appliedCoupon.discountValue) || 0;
    } else if (appliedCoupon.discountType === 'percentage') {
      const pct = parseFloat(appliedCoupon.discountValue) || 0;
      discount = cartTotal * (pct / 100);
      const maxDiscount = parseFloat(appliedCoupon.maxDiscount) || 0;
      if (maxDiscount > 0 && discount > maxDiscount) {
        discount = maxDiscount;
      }
    }
    setDiscountAmount(discount);
  }, [cartTotal, appliedCoupon]);
  
  let deliveryFee = 0;
  if (cartTotal > 0 && globalSettings) {
    const minFree = globalSettings.minOrderFreeDelivery || 500;

    if (cartTotal >= minFree) {
      deliveryFee = 0;
    } else if (globalSettings.deliveryTiers && globalSettings.deliveryTiers.length > 0) {
      // Sort tiers by minAmount ascending
      const sortedTiers = [...globalSettings.deliveryTiers].sort((a, b) => (a.minAmount || 0) - (b.minAmount || 0));
      
      const matchingTier = sortedTiers.find(tier => cartTotal >= (tier.minAmount || 0) && cartTotal <= tier.maxAmount);
      if (matchingTier) {
        deliveryFee = matchingTier.fee;
      } else {
        // Fallback: find the first tier where cartTotal is less than maxAmount
        const fallbackTier = sortedTiers.find(tier => cartTotal <= tier.maxAmount);
        if (fallbackTier) {
          deliveryFee = fallbackTier.fee;
        } else {
          // If it somehow exceeds all maxAmounts but hasn't reached Free Delivery threshold
          deliveryFee = sortedTiers[sortedTiers.length - 1].fee;
        }
      }
    } else {
      // Fallback if no tiers exist but free delivery isn't reached
      deliveryFee = globalSettings.standardDeliveryFee || 40;
    }
  }

  const finalTotal = cartTotal - discountAmount + deliveryFee;

  const value = useMemo(() => ({
    products,
    categoriesList,
    categoryDocs,
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
    availableCoupons,
    promoCodeInput,
    setPromoCodeInput,
    appliedCoupon,
    setAppliedCoupon,
    promoError,
    setPromoError,
    discountAmount,
    deliveryFee,
    finalTotal,
    handleApplyPromo,
    handleRemovePromo
  }), [
    products,
    categoriesList,
    categoryDocs,
    isLoadingProducts,
    loadMoreProducts,
    hasMore,
    isLoadingMore,
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    toastMessage,
    availableCoupons,
    promoCodeInput,
    appliedCoupon,
    promoError,
    discountAmount,
    deliveryFee,
    finalTotal
  ]);

  return (
    <CartContext.Provider value={value}>
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

