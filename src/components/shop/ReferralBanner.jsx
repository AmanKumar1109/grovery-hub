import React from 'react';
import { Gift, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function ReferralBanner() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { globalSettings } = useSettings();

  const campaignActive = globalSettings?.referralCampaignActive ?? true;
  const friendRewardAmount = globalSettings?.referredUserRewardAmount || 30;

  const bannerTitle = globalSettings?.referralBannerTitle || 'Refer Friends, Earn Rewards!';
  const bannerDescRaw = globalSettings?.referralBannerDescription || 'Invite your friends to The Grocery Hub! After their first order is delivered, BOTH of you earn exciting reward coupons!';
  const bannerDesc = bannerDescRaw.replace('{friendRewardAmount}', friendRewardAmount);
  const bannerButton = globalSettings?.referralBannerButton || 'Start Earning';

  if (!campaignActive) return null;

  const handleClick = () => {
    if (currentUser) {
      navigate('/dashboard/refer-earn');
    } else {
      // Pass redirect param so they go to refer-earn after login
      navigate('/login?redirect=/dashboard/refer-earn');
    }
  };

  return (
    <section className="w-full px-4 sm:px-8 lg:px-12 py-8">
      <div 
        onClick={handleClick}
        className="w-full max-w-7xl mx-auto rounded-3xl overflow-hidden cursor-pointer group relative bg-gradient-to-r from-emerald-600 to-teal-800 shadow-xl"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-400 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(251,191,36,0.3)] group-hover:scale-110 transition-transform duration-500">
              <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-amber-950" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                {bannerTitle}
              </h2>
              <p className="text-emerald-50 text-sm sm:text-base font-medium max-w-xl">
                {bannerDesc}
              </p>
            </div>
          </div>
          
          <button className="shrink-0 bg-amber-400 hover:bg-amber-300 text-amber-950 px-8 py-3.5 rounded-2xl font-extrabold text-sm sm:text-base transition-all group-hover:-translate-y-1 flex items-center gap-2 shadow-lg">
            {bannerButton} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
