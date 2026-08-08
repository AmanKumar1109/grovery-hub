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

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
              welcomeEmailSent: true
            };
            setUserProfile(initialData);
            await setDoc(userDocRef, initialData);
            await sendWelcomeEmail(user.email, user.displayName || 'Grocery Member');
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
  const signup = async (email, password, fullName, phone = '') => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName && res.user) {
      await updateProfile(res.user, { displayName: fullName });
    }
    const initialData = {
      fullName: fullName || 'Grocery Member',
      email,
      phone: phone,
      profileCompleted: !!phone,
      addresses: [],
      primaryAddressId: null,
      wishlist: [],
      welcomeEmailSent: true
    };
    try {
      await setDoc(doc(db, 'users', res.user.uid), initialData);
      await sendWelcomeEmail(email, fullName);
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

    setUserProfile(newProfile);
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
        loginWithGoogle,
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
