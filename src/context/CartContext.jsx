import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const CartContext = createContext(null);

export const initialProducts = [
  {
    id: 'prod-1',
    name: 'Fresh Organic Farm Tomatoes',
    category: 'Fresh Vegetables',
    price: 45,
    originalPrice: 60,
    unit: '1 kg',
    rating: 4.8,
    reviews: 142,
    badge: '25% OFF',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-2',
    name: 'Crisp Shimla Red Apples',
    category: 'Organic Fruits',
    price: 180,
    originalPrice: 220,
    unit: '1 kg',
    rating: 4.9,
    reviews: 210,
    badge: 'Trending',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-3',
    name: 'Pure Cow Milk (Fresh Daily)',
    category: 'Dairy & Eggs',
    price: 66,
    originalPrice: 70,
    unit: '1 Litre',
    rating: 4.7,
    reviews: 380,
    badge: 'Fresh Today',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-4',
    name: 'Artisanal Multigrain Wheat Bread',
    category: 'Bakery & Bread',
    price: 55,
    originalPrice: 65,
    unit: '400g Pack',
    rating: 4.6,
    reviews: 95,
    badge: 'Bestseller',
    isOrganic: false,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-5',
    name: 'Fresh Organic Spinach (Palak)',
    category: 'Fresh Vegetables',
    price: 30,
    originalPrice: 40,
    unit: '250g Bunch',
    rating: 4.8,
    reviews: 88,
    badge: 'Farm Direct',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-6',
    name: 'Fresh Cold Pressed Orange Juice',
    category: 'Beverages & Juices',
    price: 110,
    originalPrice: 130,
    unit: '500ml Bottle',
    rating: 4.9,
    reviews: 175,
    badge: '100% Pure',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-7',
    name: 'Premium Jumbo Roasted Cashews',
    category: 'Snacks & Munchies',
    price: 450,
    originalPrice: 550,
    unit: '500g Pack',
    rating: 4.9,
    reviews: 310,
    badge: '18% OFF',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1590004953392-5aba2e72269a?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-8',
    name: 'Fresh Farm Eggs (Free Range)',
    category: 'Dairy & Eggs',
    price: 85,
    originalPrice: 95,
    unit: '12 Pack',
    rating: 4.8,
    reviews: 260,
    badge: 'Organic',
    isOrganic: true,
    isHalal: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&q=80&w=400',
  },
];

export function CartProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [dbCategories, setDbCategories] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Subscribe to real-time Firestore items & categories
  useEffect(() => {
    const unsubItems = onSnapshot(collection(db, 'items'), (snap) => {
      if (!snap.empty) {
        const loaded = snap.docs
          .map((d) => {
            const data = d.data();
            const salePrice = parseFloat(data.price) || 0;
            const mrp = parseFloat(data.sellingPrice) || 0;
            const offPct = parseInt(data.offPercentage) || 0;
            // Use real MRP from admin; only fall back if missing
            const originalPrice = mrp > salePrice ? mrp : (salePrice > 0 ? salePrice : 0);
            // Auto badge: prefer stored badge, otherwise generate from off%
            const autoBadge = offPct > 0
              ? `${offPct}% OFF`
              : (data.badge || '');
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
          })
          .filter((item) => item.isVisible);
        setProducts(loaded);
      }
      setIsLoadingProducts(false);
    });

    const unsubCat = onSnapshot(collection(db, 'categories'), (snap) => {
      const loadedCats = snap.docs.map(d => d.data().name || d.id);
      setDbCategories(loadedCats);
    });

    return () => {
      unsubItems();
      unsubCat();
    };
  }, []);

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

  const addToCart = (product) => {
    if (product.inStock === false) {
      showToast(`Sorry, "${product.name}" is currently Out of Stock! ⚠️`);
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
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

