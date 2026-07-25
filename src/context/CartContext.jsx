import React, { createContext, useContext, useState } from 'react';

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
    image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-9',
    name: 'Organic Cavendish Bananas',
    category: 'Organic Fruits',
    price: 50,
    originalPrice: 60,
    unit: '1 Dozen',
    rating: 4.7,
    reviews: 190,
    badge: 'Sweet & Fresh',
    isOrganic: true,
    isHalal: true,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-10',
    name: 'Fresh Tender Chicken Breast (Skinless)',
    category: 'Meat & Seafood',
    price: 280,
    originalPrice: 320,
    unit: '500g Pack',
    rating: 4.9,
    reviews: 410,
    badge: 'Halal Certified',
    isOrganic: false,
    isHalal: true,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-11',
    name: 'Himalayan Organic Honey',
    category: 'Snacks & Munchies',
    price: 299,
    originalPrice: 350,
    unit: '500g Glass Jar',
    rating: 4.9,
    reviews: 145,
    badge: 'Raw & Unrefined',
    isOrganic: true,
    isHalal: true,
    image: 'https://images.unsplash.com/photo-1587049352847-81a56d773cae?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'prod-12',
    name: 'Organic Green Bell Peppers (Capsicum)',
    category: 'Fresh Vegetables',
    price: 40,
    originalPrice: 50,
    unit: '500g',
    rating: 4.6,
    reviews: 78,
    badge: 'Crunchy Fresh',
    isOrganic: true,
    isHalal: true,
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&q=80&w=400',
  },
];

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([
    { ...initialProducts[0], quantity: 1 },
    { ...initialProducts[2], quantity: 1 },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const addToCart = (product) => {
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

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
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
