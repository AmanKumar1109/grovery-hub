import React, { useRef, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, Navigation, Tag } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SavedAddresses() {
  const containerRef = useRef(null);
  const { userProfile, currentUser, deleteAddress } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = React.useState(false);

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
  }, []);

  const hasAddress = userProfile?.address?.street && userProfile?.address?.city;
  const addressType = userProfile?.addressType || 'Home';
  
  const getIcon = (type) => {
    if (type === 'Office') return Briefcase;
    if (type === 'Other') return Tag;
    return Home;
  };

  const IconComponent = getIcon(addressType);

  const fullAddressString = hasAddress
    ? [
        userProfile.address.street,
        userProfile.address.locality,
        userProfile.address.city,
        userProfile.address.state,
        userProfile.address.pincode
      ].filter(Boolean).join(', ')
    : '';

  return (
    <div ref={containerRef} className="pb-24 md:pb-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Saved Addresses</h1>
          <p className="text-slate-500 font-medium mt-1">Manage delivery locations for quick checkout</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/profile')}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-amber-300/40 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add / Update Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div 
          onClick={() => navigate('/dashboard/profile')}
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

        {hasAddress ? (
          <div className="address-card bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-600 text-white text-[10px] font-extrabold rounded-bl-2xl uppercase tracking-wider">
                Primary Delivery Address
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-slate-900">{addressType}</h3>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">
                    {userProfile?.fullName || currentUser?.displayName || 'Saiful Talukdar'} • {userProfile?.phone || '+91 98765 43210'}
                  </p>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-600 leading-relaxed mb-6">
                {fullAddressString}
              </p>
            </div>
            
            <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
              <button 
                onClick={() => navigate('/dashboard/profile')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <Edit2 className="w-4 h-4 stroke-[2]" /> Edit Details
              </button>
              <button 
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this address?')) {
                    setIsDeleting(true);
                    try {
                      await deleteAddress();
                    } catch (e) {
                      console.error("Failed to delete address", e);
                    } finally {
                      setIsDeleting(false);
                    }
                  }
                }}
                disabled={isDeleting}
                className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                title="Delete Address"
              >
                <Trash2 className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="address-card bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <MapPin className="w-10 h-10 text-amber-400 mb-2" />
            <p className="font-extrabold text-slate-900">No Address Saved Yet</p>
            <p className="text-xs text-slate-500 mb-4 mt-1">Add your delivery location to speed up checkouts.</p>
            <button 
              onClick={() => navigate('/dashboard/profile')}
              className="px-5 py-2.5 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow cursor-pointer"
            >
              Set Delivery Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
