import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import gsap from 'gsap';

export default function GlobalPopup() {
  const { globalSettings, loading } = useSettings();
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !globalSettings) return;

    const isActive = globalSettings.popupActive;
    const hasSeen = sessionStorage.getItem('popupDismissed');

    if (isActive && !hasSeen) {
      // Small delay before showing
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [globalSettings, loading]);

  useEffect(() => {
    if (isVisible) {
      gsap.fromTo('.global-popup-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo('.global-popup-content', 
        { scale: 0.9, opacity: 0, y: 20 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }
      );
    }
  }, [isVisible]);

  const handleClose = () => {
    gsap.to('.global-popup-overlay', { opacity: 0, duration: 0.3 });
    gsap.to('.global-popup-content', { scale: 0.9, opacity: 0, y: 20, duration: 0.3, onComplete: () => {
      setIsVisible(false);
      sessionStorage.setItem('popupDismissed', 'true');
    }});
  };

  const handleCtaClick = () => {
    handleClose();
    if (globalSettings.popupCtaUrl) {
      if (globalSettings.popupCtaUrl.startsWith('http')) {
        window.open(globalSettings.popupCtaUrl, '_blank');
      } else {
        navigate(globalSettings.popupCtaUrl);
      }
    }
  };

  if (!isVisible || !globalSettings) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
      {/* Overlay */}
      <div 
        className="global-popup-overlay absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Content */}
      <div className="global-popup-content relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full flex flex-col z-10">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {globalSettings.popupImageUrl && (
          <div className="w-full h-48 sm:h-56 relative bg-slate-100">
            <img 
              src={globalSettings.popupImageUrl} 
              alt="Promo" 
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay to ensure close button visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent h-16 pointer-events-none" />
          </div>
        )}

        <div className="p-6 text-center space-y-4">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
            {globalSettings.popupTitle}
          </h2>
          {globalSettings.popupText && (
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              {globalSettings.popupText}
            </p>
          )}

          {globalSettings.popupCtaText && (
            <div className="pt-2">
              <button 
                onClick={handleCtaClick}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
              >
                {globalSettings.popupCtaText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
