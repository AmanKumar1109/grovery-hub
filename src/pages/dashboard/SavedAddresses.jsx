import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Home, Briefcase, Navigation, Tag, CheckCircle2, X } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SavedAddresses() {
  const containerRef = useRef(null);
  const { userProfile, addAddress, deleteAddress, setPrimaryAddress } = useAuth();
  const navigate = useNavigate();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [addressForm, setAddressForm] = useState({
    street: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home'
  });

  const addresses = userProfile?.addresses || [];
  const primaryId = userProfile?.primaryAddressId;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.address-card', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      });
    }, containerRef);

    return () => ctx.revert();
  }, [addresses.length, showAddForm]);

  const getIcon = (type) => {
    if (type === 'Office') return Briefcase;
    if (type === 'Other') return Tag;
    return Home;
  };

  const handleInputChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.pincode) {
      alert("Please fill out street, city, and pincode");
      return;
    }
    
    setIsProcessing(true);
    await addAddress(addressForm);
    setIsProcessing(false);
    
    setShowAddForm(false);
    setAddressForm({ street: '', locality: '', city: '', state: '', pincode: '', type: 'Home' });
  };

  return (
    <div ref={containerRef} className="pb-24 md:pb-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Saved Addresses</h1>
          <p className="text-slate-500 font-medium mt-1">Manage delivery locations for quick checkout</p>
        </div>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-amber-300/40 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add New Address
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="address-card bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-900">Add New Address</h2>
            <button onClick={() => setShowAddForm(false)} className="p-2 bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Street Address *</label>
              <input type="text" name="street" value={addressForm.street} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" placeholder="House/Flat No., Building Name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Locality / Area</label>
              <input type="text" name="locality" value={addressForm.locality} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" placeholder="E.g., Sector 62, Koramangala" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
                <input type="text" name="city" value={addressForm.city} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
                <input type="text" name="state" value={addressForm.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode *</label>
              <input type="text" name="pincode" value={addressForm.pincode} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 transition-all" />
            </div>
            
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-600 mb-2 block">Address Label</label>
              <div className="grid grid-cols-3 gap-3">
                {['Home', 'Office', 'Other'].map((type) => {
                  const Icon = type === 'Home' ? Home : type === 'Office' ? Briefcase : Tag;
                  const isActive = addressForm.type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressForm({...addressForm, type})}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-extrabold text-xs transition-all cursor-pointer ${
                        isActive ? 'border-amber-400 bg-amber-50 text-slate-950 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-amber-600" /> {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={isProcessing} className="mt-4 w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer">
              {isProcessing ? 'Saving...' : 'Save Address'}
            </button>
          </form>
        </div>
      )}

      {!showAddForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div 
            onClick={() => setShowAddForm(true)}
            className="address-card flex items-center justify-center h-full min-h-[220px] bg-amber-50/50 hover:bg-amber-50 border-2 border-dashed border-amber-300 rounded-3xl cursor-pointer transition-colors group p-6"
          >
            <div className="text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                <Navigation className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className="font-extrabold text-slate-900 text-sm">Add New Address</p>
              <p className="text-xs text-slate-500 mt-1">Configure drop-off location</p>
            </div>
          </div>

          {addresses.map((address) => {
            const IconComponent = getIcon(address.type);
            const isPrimary = address.id === primaryId;
            const fullAddressString = [address.street, address.locality, address.city, address.state, address.pincode].filter(Boolean).join(', ');

            return (
              <div key={address.id} className={`address-card bg-white/90 backdrop-blur-xl border ${isPrimary ? 'border-emerald-400 shadow-md' : 'border-slate-200/80 shadow-sm'} rounded-3xl p-6 transition-all relative overflow-hidden flex flex-col justify-between`}>
                <div>
                  {isPrimary && (
                    <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-600 text-white text-[10px] font-extrabold rounded-bl-2xl uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Primary Address
                    </div>
                  )}
                  <div className="flex items-start gap-4 mb-4 mt-2">
                    <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-slate-900">{address.type}</h3>
                      <p className="text-xs font-bold text-slate-600 mt-0.5">
                        {userProfile?.fullName || 'Saiful Talukdar'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed mb-6">
                    {fullAddressString}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  {!isPrimary && (
                    <button 
                      onClick={() => setPrimaryAddress(address.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Set as Primary
                    </button>
                  )}
                  <button 
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this address?')) {
                        await deleteAddress(address.id);
                      }
                    }}
                    className={`flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors cursor-pointer ${isPrimary ? 'w-full' : ''}`}
                    title="Delete Address"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2]" /> {isPrimary && <span className="text-xs font-extrabold ml-1">Delete Address</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
