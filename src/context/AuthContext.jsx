import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes in the background without blocking initial app render
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch extended user profile from Firestore
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

              // Save migration quietly
              setDoc(userDocRef, { addresses: data.addresses, primaryAddressId: data.primaryAddressId }, { merge: true });
            }
            if (!data.addresses) data.addresses = [];

            setUserProfile(data);
          } else {
            const initialData = {
              fullName: user.displayName || 'Grocery Member',
              email: user.email,
              phone: '',
              profileCompleted: false,
              addresses: [],
              primaryAddressId: null,
              wishlist: [],
            };
            setUserProfile(initialData);
            await setDoc(userDocRef, initialData);
          }
        } catch (err) {
          console.warn('Firestore profile fetch error:', err);
          setUserProfile((prev) => prev || {
            fullName: user.displayName || 'Grocery Member',
            email: user.email,
            phone: '',
            profileCompleted: false,
            addresses: [],
            primaryAddressId: null,
            wishlist: [],
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Firebase Sign Up with Email and Password
  const signup = async (email, password, fullName) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName && res.user) {
      await updateProfile(res.user, { displayName: fullName });
    }
    const initialData = {
      fullName: fullName || 'Grocery Member',
      email,
      phone: '',
      profileCompleted: false,
      addresses: [],
      primaryAddressId: null,
      wishlist: [],
    };
    try {
      await setDoc(doc(db, 'users', res.user.uid), initialData);
    } catch (e) {
      console.warn('Failed to save user doc to Firestore:', e);
    }
    setUserProfile(initialData);
    return res.user;
  };

  // Firebase Login with Email and Password
  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  };

  // Firebase Logout
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Complete Profile details (Name, Phone only)
  const completeProfile = async (updatedData) => {
    if (!currentUser) return;
    const newProfile = {
      ...userProfile,
      fullName: updatedData.fullName || userProfile?.fullName || currentUser.displayName || 'Grocery Member',
      phone: updatedData.phone ?? userProfile?.phone ?? '',
      profileCompleted: true,
    };

    if (updatedData.fullName && currentUser.displayName !== updatedData.fullName) {
      await updateProfile(currentUser, { displayName: updatedData.fullName });
    }

    try {
      await setDoc(doc(db, 'users', currentUser.uid), newProfile, { merge: true });
    } catch (e) {
      console.warn('Failed to update user doc in Firestore:', e);
    }

    setUserProfile(newProfile);
  };

  // Add Address
  const addAddress = async (addressData) => {
    if (!currentUser) return;

    const newAddress = {
      id: 'addr_' + Date.now(),
      ...addressData
    };

    const currentAddresses = userProfile?.addresses || [];
    const isFirstAddress = currentAddresses.length === 0;
    const newAddresses = [...currentAddresses, newAddress];

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
      setUserProfile(newProfile);
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
    // If we deleted the primary address, set a new primary if there are other addresses left
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
      setUserProfile(newProfile);
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
      setUserProfile(newProfile);
    } catch (e) {
      console.error('Failed to set primary address:', e);
    }
  };

  // Toggle wishlist item
  const toggleWishlist = async (product) => {
    if (!currentUser) return false; // Return false if not logged in

    const currentWishlist = userProfile?.wishlist || [];
    const isAlreadyWishlisted = currentWishlist.some((item) => item.id === product.id);

    const newWishlist = isAlreadyWishlisted
      ? currentWishlist.filter((item) => item.id !== product.id)
      : [...currentWishlist, product];

    const newProfile = { ...userProfile, wishlist: newWishlist };
    setUserProfile(newProfile);

    try {
      await setDoc(doc(db, 'users', currentUser.uid), { wishlist: newWishlist }, { merge: true });
      return true;
    } catch (e) {
      console.error('Failed to update wishlist in Firestore:', e);
      // Revert on error
      setUserProfile(userProfile);
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
        logout,
        completeProfile,
        addAddress,
        deleteAddress,
        setPrimaryAddress,
        toggleWishlist,
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
