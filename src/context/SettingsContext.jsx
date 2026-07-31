import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [globalSettings, setGlobalSettings] = useState({
    supportPhone: '',
    whatsappNumber: '',
    supportEmail: '',
    instagramUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    minOrderFreeDelivery: 500,
    standardDeliveryFee: 40,
    taxPercentage: 0
  });
  
  const [banners, setBanners] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    // We will use onSnapshot to listen for live updates!
    const globalRef = doc(db, 'settings', 'global');
    const bannersRef = doc(db, 'settings', 'banners');

    const unsubscribeGlobal = onSnapshot(globalRef, (docSnap) => {
      if (docSnap.exists()) {
        setGlobalSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    });

    const unsubscribeBanners = onSnapshot(bannersRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBanners(data.items || []);
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
