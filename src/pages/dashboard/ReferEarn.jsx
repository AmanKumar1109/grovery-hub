import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { Copy, Share2, Gift, Users, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function ReferEarn() {
  const { currentUser, userProfile } = useAuth();
  const { globalSettings } = useSettings();
  
  const rewardAmount = globalSettings?.referrerRewardAmount || 30;
  const friendRewardAmount = globalSettings?.referredUserRewardAmount || 30;
  const minOrderValue = globalSettings?.referralMinOrderValue || 299;
  const campaignActive = globalSettings?.referralCampaignActive ?? true;

  const [activeTab, setActiveTab] = useState('overview');
  const [referrals, setReferrals] = useState([]);
  const [userCoupons, setUserCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [friendNames, setFriendNames] = useState({});

  const referralCode = userProfile?.myReferralCode || 'PENDING';
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  useEffect(() => {
    if (!currentUser) return;
    
    // Listen to referrals
    const qRef = query(collection(db, 'referrals'), where('referrerId', '==', currentUser.uid));
    const unsubRef = onSnapshot(qRef, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReferrals(data);
      setLoading(false);
    });

    const qCoupons = query(collection(db, 'coupons'), where('userId', '==', currentUser.uid));
    const unsubCoupons = onSnapshot(qCoupons, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserCoupons(data);
    });

    return () => {
      unsubRef();
      unsubCoupons();
    };
  }, [currentUser]);

  useEffect(() => {
    if (referrals.length === 0) return;
    
    const fetchNames = async () => {
      const names = { ...friendNames };
      let changed = false;
      
      for (const ref of referrals) {
        if (!names[ref.referredUserId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', ref.referredUserId));
            if (userDoc.exists() && userDoc.data().fullName) {
              names[ref.referredUserId] = userDoc.data().fullName;
            } else {
              names[ref.referredUserId] = `Friend #${ref.referredUserId.substring(0, 4)}`;
            }
            changed = true;
          } catch (err) {
            console.error("Error fetching friend name:", err);
            names[ref.referredUserId] = `Friend #${ref.referredUserId.substring(0, 4)}`;
            changed = true;
          }
        }
      }
      
      if (changed) {
        setFriendNames(names);
      }
    };
    
    fetchNames();
  }, [referrals]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The Grocery Hub',
          text: `Use my code ${referralCode} to get ₹${friendRewardAmount} OFF your first order!`,
          url: referralLink,
        });
      } catch (err) {
        console.warn('Share error', err);
      }
    } else {
      handleCopy();
    }
  };

  const stats = {
    total: referrals.length,
    successful: referrals.filter(r => r.status === 'REWARDED').length,
    pending: referrals.filter(r => r.status === 'REGISTERED').length,
    notQualified: referrals.filter(r => r.status === 'NOT_QUALIFIED' || r.status === 'CANCELLED').length
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-300" />
            <h1 className="text-2xl font-black tracking-tight">Refer & Earn</h1>
          </div>
          
          {!campaignActive ? (
            <div className="bg-amber-500/20 border border-amber-400/50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
              <p className="text-amber-50 font-medium text-sm">
                Our referral campaign is currently paused. Check back later for exciting rewards!
              </p>
            </div>
          ) : (
            <>
              <p className="text-emerald-50 max-w-md font-medium text-sm">
                Your friend gets ₹{friendRewardAmount} OFF on their first ₹{minOrderValue}+ order. After their order is successfully delivered, you unlock a Coupon worth ₹{rewardAmount} OFF!
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-2 px-4 flex items-center justify-between w-full sm:w-auto">
                  <span className="font-mono font-bold tracking-wider mr-4">{referralCode}</span>
                  <button onClick={handleCopy} className="text-emerald-200 hover:text-white transition-colors cursor-pointer text-xs font-bold uppercase flex items-center gap-1">
                    {copySuccess ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copySuccess ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <button onClick={handleShare} className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-amber-950 px-6 py-3 rounded-2xl font-extrabold text-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                  <Share2 className="w-4 h-4" /> Share Link
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['overview', 'referrals', 'rewards'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab === 'overview' ? 'Overview' : tab === 'referrals' ? 'My Referrals' : 'My Rewards'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (() => {
        const activeCouponsCount = userCoupons.filter(coupon => 
          !userProfile?.usedCoupons?.includes(coupon.id) && coupon.isActive !== false
        ).length;
        return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Referrals</p>
              <p className="text-2xl font-black text-slate-800">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Successful</p>
              <p className="text-2xl font-black text-slate-800">{stats.successful}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-black text-slate-800">{stats.pending}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <Gift className="w-6 h-6 text-violet-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Rewards</p>
              <p className="text-2xl font-black text-slate-800">{activeCouponsCount} Coupons</p>
            </div>
          </div>
        </div>
      )})()}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {referrals.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center">
              <Users className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-sm font-bold text-slate-400">No referrals yet</p>
              <p className="text-xs text-slate-400 mt-1">Share your link to start earning!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {referrals.map(ref => (
                <div key={ref.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      {friendNames[ref.referredUserId] || `Friend #${ref.referredUserId.substring(0,4)}`}
                      {ref.status === 'REWARDED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      {ref.status === 'NOT_QUALIFIED' && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                      {ref.status === 'REGISTERED' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">
                      Joined {new Date(ref.createdAt?.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      ref.status === 'REWARDED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      ref.status === 'NOT_QUALIFIED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {ref.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'rewards' && (() => {
        const activeCouponsCount = userCoupons.filter(coupon => 
          !userProfile?.usedCoupons?.includes(coupon.id) && coupon.isActive !== false
        ).length;

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-slate-800">Your Coupons</h3>
              <span className="text-xs font-bold text-emerald-600">{activeCouponsCount} Available</span>
            </div>

          {userCoupons.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-10 text-center flex flex-col items-center">
              <Gift className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-sm font-bold text-slate-400">No Coupons yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...userCoupons].sort((a, b) => {
                const aUsed = userProfile?.usedCoupons?.includes(a.id) || a.isActive === false;
                const bUsed = userProfile?.usedCoupons?.includes(b.id) || b.isActive === false;
                if (aUsed && !bUsed) return 1;
                if (!aUsed && bUsed) return -1;
                return 0;
              }).map(coupon => {
                const isUsed = userProfile?.usedCoupons?.includes(coupon.id) || coupon.isActive === false;
                return (
                  <div key={coupon.id} className={`bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden ${isUsed ? 'opacity-60' : ''}`}>
                    <div className={`absolute top-0 left-0 w-2 h-full ${isUsed ? 'bg-slate-400' : 'bg-emerald-500'}`}></div>
                    <div className="pl-2">
                      <div className="flex items-center gap-2">
                        <p className={`font-black text-lg tracking-wider font-mono ${isUsed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{coupon.code}</p>
                        {isUsed && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase tracking-wider">Used</span>
                        )}
                      </div>
                      <p className={`text-sm font-semibold mt-1 ${isUsed ? 'text-slate-400' : 'text-emerald-600'}`}>
                        {coupon.discountType === 'flat' ? `₹${coupon.discountValue} OFF` : `${coupon.discountValue}% OFF`}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">
                        Min. Order: ₹{coupon.minOrderValue} &bull; Valid till: {new Date(coupon.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
