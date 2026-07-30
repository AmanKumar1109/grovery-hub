import React, { useState } from 'react';
import { Phone, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfileCompletionModal() {
  const { userProfile, completeProfile } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If profile is completed AND phone exists, we don't show the modal
  if (!userProfile || (userProfile.profileCompleted && userProfile.phone)) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await completeProfile({ phone: phone.trim() });
    } catch (err) {
      console.error(err);
      setError('Failed to update phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center space-y-3 mb-6 relative z-10">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Phone className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Complete Your Profile</h2>
          <p className="text-sm font-semibold text-slate-500">
            Please provide your phone number so we can contact you regarding your orders.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
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
            disabled={loading}
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-300/40 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save & Continue</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
