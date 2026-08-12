import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

const DEFAULT_SETTINGS = {
  supportPhone: '',
  whatsappNumber: '',
  supportEmail: '',
  instagramUrl: '',
  facebookUrl: '',
  twitterUrl: '',
  minOrderAmount: 100,
  minOrderFreeDelivery: 500,
  standardDeliveryFee: 40,
  taxPercentage: 0,
  categorySectionSubtitle: 'Explore Categories',
  categorySectionTitle: 'Shop Fresh Organic Produce',
  activeTheme: 'normal'
};

const getInitialSettingsCache = () => {
  try {
    const raw = localStorage.getItem('grocery_global_settings');
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

const getInitialBannersCache = () => {
  try {
    const raw = localStorage.getItem('grocery_banners_cache');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export function SettingsProvider({ children }) {
  const [globalSettings, setGlobalSettings] = useState(getInitialSettingsCache);
  const [banners, setBanners] = useState(getInitialBannersCache);
  const [settingsLoading, setSettingsLoading] = useState(() => {
    return !localStorage.getItem('grocery_global_settings');
  });

  useEffect(() => {
    const globalRef = doc(db, 'settings', 'global');
    const bannersRef = doc(db, 'settings', 'banners');

    const unsubscribeGlobal = onSnapshot(globalRef, (docSnap) => {
      if (docSnap.exists()) {
        const freshSettings = { ...DEFAULT_SETTINGS, ...docSnap.data() };
        setGlobalSettings(freshSettings);
        try {
          localStorage.setItem('grocery_global_settings', JSON.stringify(freshSettings));
        } catch (e) {}
      }
    });

    const unsubscribeBanners = onSnapshot(bannersRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const freshItems = data.items || [];
        setBanners(freshItems);
        try {
          localStorage.setItem('grocery_banners_cache', JSON.stringify(freshItems));
        } catch (e) {}
      } else {
        setBanners([]);
      }
      setSettingsLoading(false);
    });

    return () => {
      unsubscribeGlobal();
      unsubscribeBanners();
    };
  }, []);

  const value = {
    globalSettings,
    banners,
    settingsLoading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
