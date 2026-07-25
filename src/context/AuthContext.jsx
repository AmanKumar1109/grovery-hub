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
            setUserProfile(userDocSnap.data());
          } else {
            const initialData = {
              fullName: user.displayName || 'Grocery Member',
              email: user.email,
              phone: '',
              profileCompleted: false,
              addressType: 'Home',
              address: { street: '', locality: '', city: '', state: '', pincode: '' },
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
            addressType: 'Home',
            address: { street: '', locality: '', city: '', state: '', pincode: '' },
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
      addressType: 'Home',
      address: { street: '', locality: '', city: '', state: '', pincode: '' },
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

  // Complete Profile & Address details
  const completeProfile = async (updatedData) => {
    if (!currentUser) return;
    const newProfile = {
      ...userProfile,
      fullName: updatedData.fullName || userProfile?.fullName || currentUser.displayName || 'Grocery Member',
      phone: updatedData.phone ?? userProfile?.phone ?? '',
      addressType: updatedData.addressType || userProfile?.addressType || 'Home',
      address: {
        street: updatedData.street ?? userProfile?.address?.street ?? '',
        locality: updatedData.locality ?? userProfile?.address?.locality ?? '',
        city: updatedData.city ?? userProfile?.address?.city ?? '',
        state: updatedData.state ?? userProfile?.address?.state ?? '',
        pincode: updatedData.pincode ?? userProfile?.address?.pincode ?? '',
      },
      profileCompleted: Boolean(updatedData.street && updatedData.city),
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

  // Delete primary address
  const deleteAddress = async () => {
    if (!currentUser) return;
    const newProfile = {
      ...userProfile,
      address: { street: '', locality: '', city: '', state: '', pincode: '' },
      profileCompleted: false,
    };
    try {
      await setDoc(doc(db, 'users', currentUser.uid), newProfile, { merge: true });
    } catch (e) {
      console.warn('Failed to delete address in Firestore:', e);
    }
    setUserProfile(newProfile);
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
        deleteAddress,
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
