import React, { useState, useEffect } from 'react';
import { Phone, Check, AlertCircle, MapPin, Navigation, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LocationPickerModal from '../LocationPickerModal';

export default function ProfileCompletionModal() {
  const { userProfile, completeProfile, addAddress } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  
  const [showLocationPickerModal, setShowLocationPickerModal] = useState(false);

  useEffect(() => {
    if (userProfile?.email) {
      setIsSkipped(localStorage.getItem(`addressSkipped_${userProfile.email}`) === 'true');
    }
  }, [userProfile?.email]);

  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    street: '',
    locality: '',
    city: 'Baharagora',
    state: 'Jharkhand',
    pincode: '832101',
    lat: null,
    lng: null
  });

  const hasPhone = !!userProfile?.phone;
  const hasAddress = userProfile?.addresses && userProfile.addresses.length > 0;
  
  if (!userProfile || (hasPhone && (hasAddress || isSkipped))) return null;

  const currentStep = !hasPhone ? 1 : 2;

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }
    try {
      setPhoneLoading(true);
      setError('');
      await completeProfile({ phone: phone.trim() });
    } catch (err) {
      console.error(err);
      setError('Failed to update phone number.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.pincode) {
      setError('Please fill out all required address fields.');
      return;
    }
    
    try {
      setAddressLoading(true);
      setError('');
      await addAddress({
        name: userProfile.fullName || 'User',
        phone: userProfile.phone || '',
        ...addressForm,
        type: addressForm.type || 'Home'
      });
    } catch (err) {
      console.error(err);
      setError('Failed to save address.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSkip = () => {
    if (userProfile?.email) {
      localStorage.setItem(`addressSkipped_${userProfile.email}`, 'true');
      setIsSkipped(true);
    }
  };

  const handleInputChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleConfirmLocationFromModal = (locationData) => {
    setAddressForm(prev => ({
      ...prev,
      street: locationData.street || prev.street,
      locality: locationData.locality || prev.locality,
      city: locationData.city || prev.city,
      state: locationData.state || prev.state,
      pincode: locationData.pincode || prev.pincode,
      type: locationData.type || prev.type || 'Home',
      lat: locationData.lat,
      lng: locationData.lng
    }));
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-200">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        
        {currentStep === 1 && (
          <>
            <div className="text-center space-y-3 mb-6 relative z-10">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Phone className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Welcome! 👋</h2>
              <p className="text-sm font-semibold text-slate-500">
                Let's get started. Please provide your phone number to secure your account.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handlePhoneSubmit} className="space-y-5 relative z-10">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 pl-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phoneLoading}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-300/40 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {phoneLoading ? 'Saving...' : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Next Step</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {currentStep === 2 && (
          <>
            <button 
              onClick={handleSkip}
              className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-700 text-xs font-bold flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
            >
              Skip <X className="w-3 h-3" />
            </button>
            <div className="text-center space-y-3 mb-6 mt-4 relative z-10">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Delivery Address</h2>
              <p className="text-sm font-semibold text-slate-500">
                Where should we deliver your groceries?
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {!addressForm.lat && !addressForm.manualMode ? (
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-3 relative z-10">
                <p className="text-xs font-bold text-slate-500">Select your exact delivery location on the map to continue.</p>
                <button 
                  type="button" 
                  onClick={() => setShowLocationPickerModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black shadow-md shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>🎯 Select Exact Delivery Point</span>
                </button>
              </div>
            ) : (
            <form onSubmit={handleAddressSubmit} className="space-y-4 relative z-10">
              <div className="flex flex-col items-start gap-2 mb-2">
                <p className="text-xs font-bold text-slate-500">Please enter your delivery details to proceed.</p>
                <button 
                  type="button" 
                  onClick={() => setShowLocationPickerModal(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black shadow-md shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>🎯 {addressForm.lat ? 'Edit Map Location' : 'Select on Map'}</span>
                </button>
              </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                    <input type="text" name="name" value={addressForm.name || ''} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" placeholder="Your Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone *</label>
                    <input type="tel" name="phone" value={addressForm.phone || ''} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" placeholder="Mobile Number" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Street Address / House No. *</label>
                  <input type="text" name="street" value={addressForm.street} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" placeholder="House/Flat No., Building Name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Locality / Area</label>
                  <input type="text" name="locality" value={addressForm.locality} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" placeholder="E.g., Sector 62, Koramangala" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
                    <input type="text" name="city" value={addressForm.city} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode *</label>
                    <input type="text" name="pincode" value={addressForm.pincode} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed" readOnly />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-600 mb-2 block">Address Label</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Home', 'Office', 'Other'].map((type) => {
                      const isActive = addressForm.type === type || (!addressForm.type && type === 'Home');
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAddressForm({...addressForm, type})}
                          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-extrabold text-xs transition-all cursor-pointer ${
                            isActive ? 'border-amber-400 bg-amber-50 text-slate-950 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addressLoading}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-2"
                >
                  {addressLoading ? 'Saving...' : 'Save Address'}
                </button>
              </form>
            )}
          </>
        )}
      </div>

      <LocationPickerModal
        isOpen={showLocationPickerModal}
        onClose={() => setShowLocationPickerModal(false)}
        onConfirm={handleConfirmLocationFromModal}
      />
    </div>
  );
}
