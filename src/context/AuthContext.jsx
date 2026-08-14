import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';

const AuthContext = createContext(null);

// Synchronous LocalStorage Persistence for Instant 0ms App Loading
const getUserProfileStorageKey = (uid) => `grocery_user_profile_${uid}`;
const LAST_AUTH_UID_KEY = 'grocery_last_auth_uid';

const getInitialAuthCache = () => {
  try {
    const lastUid = localStorage.getItem(LAST_AUTH_UID_KEY);
    if (lastUid) {
      const raw = localStorage.getItem(getUserProfileStorageKey(lastUid));
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Initial auth cache parse error:', e);
  }
  return null;
};

const getCachedProfile = (uid) => {
  if (!uid) return null;
  try {
    const raw = localStorage.getItem(getUserProfileStorageKey(uid));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Failed to parse cached user profile:', e);
    return null;
  }
};

const setCachedProfile = (uid, profile) => {
  if (!uid || !profile) return;
  try {
    localStorage.setItem(LAST_AUTH_UID_KEY, uid);
    localStorage.setItem(getUserProfileStorageKey(uid), JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save user profile to localStorage:', e);
  }
};

const removeCachedProfile = (uid) => {
  try {
    localStorage.removeItem(LAST_AUTH_UID_KEY);
    if (uid) {
      localStorage.removeItem(getUserProfileStorageKey(uid));
    }
  } catch (e) {
    console.warn('Failed to remove user profile from localStorage:', e);
  }
};

export function AuthProvider({ children }) {
  const initialCachedProfile = getInitialAuthCache();
  const [currentUser, setCurrentUser] = useState(auth.currentUser || null);
  const [userProfile, setUserProfile] = useState(initialCachedProfile);
  // Set loading to false immediately if we have cached profile or Firebase user synchronously
  const [loading, setLoading] = useState(!initialCachedProfile && !auth.currentUser);

  const updateLocalAndStateProfile = (uid, newProfile) => {
    setUserProfile(newProfile);
    if (uid && newProfile) {
      setCachedProfile(uid, newProfile);
    }
  };

  const sendWelcomeEmail = async (userEmail, userName) => {
    try {
      const notifDoc = await getDoc(doc(db, 'settings', 'notifications'));
      let template = null;
      if (notifDoc.exists()) {
        template = notifDoc.data().templates?.Welcome;
      }
      if (template) {
        const rawBody = template.body || '';
        const replacedBody = rawBody
          .replace(/\[Customer Name\]/g, userName || 'Customer')
          .replace(/\[Email\]/g, userEmail);

        const emailSubject = template.subject || 'Welcome!';
        const replacedHtmlBody = replacedBody.replace(/\n/g, '<br>');

        const htmlWithWrapper = `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>body{font-family:'Inter',sans-serif;background-color:#f4fdf8;margin:0;padding:0;color:#334155;line-height:1.6;}.container{max-width:600px;margin:40px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);border:1px solid #e2e8f0;}.header{background:linear-gradient(135deg, #059669 0%, #10b981 100%);padding:30px 20px;text-align:center;}.header h1{color:#ffffff;margin:0;font-size:28px;font-weight:800;}.content{padding:40px 30px;font-size:16px;}.content p{margin-top:0;margin-bottom:20px;}.highlight{background:#ecfdf5;padding:15px 20px;border-radius:12px;border-left:4px solid #10b981;margin-bottom:20px;}.footer{background:#f8fafc;padding:20px;text-align:center;font-size:13px;color:#64748b;border-top:1px solid #f1f5f9;}</style>
</head><body><div class="container"><div class="header"><h1>The Grocery Hub 🛒</h1></div><div class="content">${replacedHtmlBody}</div><div class="footer"><p>Thank you for shopping with us!<br><strong>The Grocery Hub</strong> - Fresh • Quality • Trust</p></div></div></body></html>`;

        await addDoc(collection(db, 'mail'), {
          to: userEmail,
          from: '"The Grocery Hub" <ghoshabhijit1295@gmail.com>',
          message: {
            subject: emailSubject,
            html: htmlWithWrapper
          }
        });
      }
    } catch (e) {
      console.warn("Failed to send welcome email:", e);
    }
  };

  // Listen to Firebase auth state changes with instant 0ms localStorage cache
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // 1. Load cached user profile instantly (0ms delay)
        const cached = getCachedProfile(user.uid);
        if (cached) {
          setUserProfile(cached);
          setLoading(false);
        }

        // 2. Fetch fresh user profile from Firestore in background
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();

            // Migration: If user has old single address but no addresses array
            if (data.address && data.address.street && (!data.addresses || data.addresses.length === 0)) {
              const defaultAddr = {
                id: 'migrated-default-' + Date.now(),
                type: data.addressType || 'Home',
                ...data.address
              };
              data.addresses = [defaultAddr];
              data.primaryAddressId = defaultAddr.id;

              setDoc(userDocRef, { addresses: data.addresses, primaryAddressId: data.primaryAddressId }, { merge: true });
            }
            // Migration: Generate referral code if missing for legacy users
            if (!data.myReferralCode) {
              const baseName = (data.fullName || 'USER').split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'GH';
              const randomDigits = Math.floor(100 + Math.random() * 900);
              const myReferralCode = `${baseName}${randomDigits}${user.uid.substring(0, 3).toUpperCase()}`;
              data.myReferralCode = myReferralCode;
              setDoc(userDocRef, { myReferralCode }, { merge: true });
            }

            if (!data.addresses) data.addresses = [];

            updateLocalAndStateProfile(user.uid, data);
          } else {
            const pendingReferralCode = localStorage.getItem('pendingReferralCode') || null;
            const baseName = (user.displayName || 'USER').split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'GH';
            const randomDigits = Math.floor(100 + Math.random() * 900);
            const myReferralCode = `${baseName}${randomDigits}${user.uid.substring(0, 3).toUpperCase()}`;

            const initialData = {
              fullName: user.displayName || 'Grocery Member',
              email: user.email,
              phone: '',
              profileCompleted: false,
              addresses: [],
              primaryAddressId: null,
              wishlist: [],
              welcomeEmailSent: true,
              referredByCode: pendingReferralCode,
              myReferralCode: myReferralCode
            };
            updateLocalAndStateProfile(user.uid, initialData);
            await setDoc(userDocRef, initialData);
            if (pendingReferralCode) {
              localStorage.removeItem('pendingReferralCode');
            }
            await sendWelcomeEmail(user.email, user.displayName || 'Grocery Member');
          }
        } catch (err) {
          console.warn('Firestore profile fetch error:', err);
          if (!cached) {
            const fallbackData = {
              fullName: user.displayName || 'Grocery Member',
              email: user.email,
              phone: '',
              profileCompleted: false,
              addresses: [],
              primaryAddressId: null,
              wishlist: [],
            };
            updateLocalAndStateProfile(user.uid, fallbackData);
          }
        }
      } else {
        removeCachedProfile(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Firebase Sign Up with Email and Password
  const signup = async (email, password, fullName, phone = '') => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName && res.user) {
      await updateProfile(res.user, { displayName: fullName });
    }
    const pendingReferralCode = localStorage.getItem('pendingReferralCode') || null;
    const initialData = {
      fullName: fullName || 'Grocery Member',
      email,
      phone: phone,
      profileCompleted: !!phone,
      addresses: [],
      primaryAddressId: null,
      wishlist: [],
      welcomeEmailSent: true,
      referredByCode: pendingReferralCode
    };
    try {
      await setDoc(doc(db, 'users', res.user.uid), initialData);
      if (pendingReferralCode) {
        localStorage.removeItem('pendingReferralCode');
      }
      await sendWelcomeEmail(email, fullName);
    } catch (e) {
      console.warn('Failed to save user doc to Firestore:', e);
    }
    updateLocalAndStateProfile(res.user.uid, initialData);
    return res.user;
  };

  // Firebase Login with Email and Password
  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  };

  // Firebase Logout with instant 0ms localStorage wipe & home page redirect
  const logout = async () => {
    try {
      localStorage.removeItem(LAST_AUTH_UID_KEY);
      if (currentUser?.uid) {
        localStorage.removeItem(getUserProfileStorageKey(currentUser.uid));
      }
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('grocery_user_profile_') || key.startsWith('addressSkipped_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to wipe localStorage on logout:', e);
    }

    setCurrentUser(null);
    setUserProfile(null);

    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }

    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
  };


  // Firebase Google Login
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    return res.user;
  };

  // Complete Profile details (Name, Phone only)
  const completeProfile = async (updatedData) => {
    if (!currentUser) return;
    const newPhone = updatedData.phone ?? userProfile?.phone ?? '';
    const newProfile = {
      ...userProfile,
      fullName: updatedData.fullName || userProfile?.fullName || currentUser.displayName || 'Grocery Member',
      phone: newPhone,
      profileCompleted: !!newPhone,
    };

    if (updatedData.fullName && currentUser.displayName !== updatedData.fullName) {
      await updateProfile(currentUser, { displayName: updatedData.fullName });
    }

    try {
      await setDoc(doc(db, 'users', currentUser.uid), newProfile, { merge: true });
    } catch (e) {
      console.warn('Failed to update user doc in Firestore:', e);
    }

    updateLocalAndStateProfile(currentUser.uid, newProfile);
  };

  // Refresh User Profile from Firestore (useful after checkout)
  const refreshUserProfile = async () => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (!data.addresses) data.addresses = [];
        updateLocalAndStateProfile(currentUser.uid, data);
      }
    } catch (e) {
      console.error('Failed to refresh user profile:', e);
    }
  };

  // Update Profile Photo
  const updateProfilePhoto = async (photoURL) => {
    if (!currentUser) return;
    try {
      await updateProfile(currentUser, { photoURL });
      const newProfile = { ...userProfile, photoURL };
      await setDoc(doc(db, 'users', currentUser.uid), { photoURL }, { merge: true });
      updateLocalAndStateProfile(currentUser.uid, newProfile);
      return true;
    } catch (e) {
      console.error('Failed to update profile photo:', e);
      return false;
    }
  };

  // Add Address
  const addAddress = async (addressData) => {
    if (!currentUser) return;

    const newAddress = {
      id: 'addr_' + Date.now(),
      ...addressData
    };

    const sanitizedNewAddress = JSON.parse(JSON.stringify(newAddress, (k, v) => v === undefined ? null : v));

    const currentAddresses = userProfile?.addresses || [];
    const isFirstAddress = currentAddresses.length === 0;
    const newAddresses = [...currentAddresses, sanitizedNewAddress];

    const newProfile = {
      ...userProfile,
      addresses: newAddresses,
      primaryAddressId: isFirstAddress ? newAddress.id : userProfile.primaryAddressId,
    };

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        addresses: newProfile.addresses,
        primaryAddressId: newProfile.primaryAddressId
      }, { merge: true });
      updateLocalAndStateProfile(currentUser.uid, newProfile);
      return newAddress.id;
    } catch (e) {
      console.error('Failed to add address:', e);
      return null;
    }
  };

  // Delete Address
  const deleteAddress = async (addressId) => {
    if (!currentUser || !addressId) return;

    const currentAddresses = userProfile?.addresses || [];
    const newAddresses = currentAddresses.filter(a => a.id !== addressId);

    let newPrimaryId = userProfile.primaryAddressId;
    if (newPrimaryId === addressId) {
      newPrimaryId = newAddresses.length > 0 ? newAddresses[0].id : null;
    }

    const newProfile = {
      ...userProfile,
      addresses: newAddresses,
      primaryAddressId: newPrimaryId,
    };

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        addresses: newAddresses,
        primaryAddressId: newPrimaryId
      }, { merge: true });
      updateLocalAndStateProfile(currentUser.uid, newProfile);
    } catch (e) {
      console.error('Failed to delete address:', e);
    }
  };

  // Set Primary Address
  const setPrimaryAddress = async (addressId) => {
    if (!currentUser || !addressId) return;

    const newProfile = {
      ...userProfile,
      primaryAddressId: addressId
    };

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        primaryAddressId: addressId
      }, { merge: true });
      updateLocalAndStateProfile(currentUser.uid, newProfile);
    } catch (e) {
      console.error('Failed to set primary address:', e);
    }
  };

  // Toggle wishlist item
  const toggleWishlist = async (product) => {
    if (!currentUser) return false;

    const currentWishlist = userProfile?.wishlist || [];
    const isAlreadyWishlisted = currentWishlist.some((item) => item.id === product.id);

    const newWishlist = isAlreadyWishlisted
      ? currentWishlist.filter((item) => item.id !== product.id)
      : [...currentWishlist, product];

    const sanitizedWishlist = JSON.parse(JSON.stringify(newWishlist, (k, v) => v === undefined ? null : v));
    
    const newProfile = { ...userProfile, wishlist: sanitizedWishlist };
    updateLocalAndStateProfile(currentUser.uid, newProfile);

    try {
      await setDoc(doc(db, 'users', currentUser.uid), { wishlist: sanitizedWishlist }, { merge: true });
      return true;
    } catch (e) {
      console.error('Failed to update wishlist in Firestore:', e);
      updateLocalAndStateProfile(currentUser.uid, userProfile);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        completeProfile,
        updateProfilePhoto,
        addAddress,
        deleteAddress,
        setPrimaryAddress,
        toggleWishlist,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
