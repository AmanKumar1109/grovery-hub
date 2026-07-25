import React, { useRef, useState, useEffect } from 'react';
import { Camera, User, Mail, Phone, ShieldCheck, Check, MapPin, Home, Briefcase, Tag, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const containerRef = useRef(null);
  const { currentUser, userProfile, completeProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile || currentUser) {
      setFullName(userProfile?.fullName || currentUser?.displayName || '');
      setPhone(userProfile?.phone || '');
    }
  }, [userProfile, currentUser]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.form-group', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      setSaving(true);
      await completeProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      setMessage('Profile details saved successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const userInitial = (fullName?.[0] || currentUser?.email?.[0] || 'S').toUpperCase();

  return (
    <div ref={containerRef} className="pb-24 md:pb-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-slate-500 font-medium mt-1">Manage personal info and primary delivery preferences</p>
      </div>

      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        {/* Profile Avatar & Summary */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
              <span className="text-3xl sm:text-4xl font-black text-slate-950">{userInitial}</span>
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-slate-900">{fullName || 'Saiful Talukdar'}</h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">{currentUser?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-700 font-extrabold mt-2 text-xs">
              <ShieldCheck className="w-4 h-4" /> 
              <span>Verified Account • Gold Membership</span>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form className="space-y-6 relative z-10" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition-all font-bold text-slate-900 text-xs sm:text-sm" 
                />
              </div>
            </div>

            <div className="form-group space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider pl-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition-all font-bold text-slate-900 text-xs sm:text-sm" 
                />
              </div>
            </div>

            <div className="form-group space-y-1.5 md:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  value={currentUser?.email || ''} 
                  disabled
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 font-bold cursor-not-allowed text-xs sm:text-sm" 
                />
              </div>
            </div>
          </div>

          {/* Primary Address Section */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              Delivery Addresses
            </h3>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">Manage your addresses</p>
                <p className="text-xs text-slate-500 mt-1">Add, update, or remove delivery locations.</p>
              </div>
              <a href="/dashboard/addresses" className="px-5 py-2.5 bg-white border border-slate-200 hover:border-amber-400 text-slate-900 font-extrabold text-xs rounded-xl shadow-sm transition-all">
                Manage Addresses
              </a>
            </div>
          </div>

          <div className="form-group pt-4 flex items-center justify-end">
            <button 
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-full shadow-lg shadow-amber-400/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
