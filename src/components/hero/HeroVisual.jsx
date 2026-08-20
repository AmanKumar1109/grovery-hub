import React, { useEffect, useRef } from 'react';
import heroImg from '../../assets/images/hero.webp';
import FloatingDeliveryBadge from './FloatingDeliveryBadge';
import gsap from 'gsap';
import { useSettings } from '../../context/SettingsContext';

export default function HeroVisual() {
  const { globalSettings } = useSettings();
  const theme = globalSettings?.activeTheme || 'normal';
  const isIndependence = theme === 'independence-day';
  const isRaksha = theme === 'raksha-bandhan';

  const farmerRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      backdropRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }
    );

    gsap.fromTo(
      farmerRef.current,
      { y: 80, opacity: 0, scale: 0.92 },
      { y: 0, opacity: 1, scale: 1, duration: 1.1, delay: 0.3, ease: 'power3.out' }
    );
  }, []);

  return (
    <div className="relative flex-1 min-h-[440px] sm:min-h-[480px] lg:min-h-[580px] flex items-end justify-center overflow-visible">
      {/* Tilted Slanted Polygon Backdrop */}
      <div
        ref={backdropRef}
        className={`absolute inset-0 z-0 transition-colors duration-500 ${
          isIndependence ? 'bg-[#0a5423]' : isRaksha ? 'bg-[#9e1b47]' : 'bg-[#3b5e11]'
        }`}
        style={{
          clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 18% 100%)',
        }}
      >
        {/* Giant Vertical Watermark Typography: FREEDOM DEALS (Independence) or GROCERY (Normal) */}
        <div className="absolute right-4 top-0 bottom-0 flex items-center justify-center pointer-events-none select-none">
          <span
            className={`font-black tracking-widest leading-none uppercase ${
              isIndependence
                ? 'text-4xl sm:text-6xl lg:text-[90px] text-[#0f6d2f]/70'
                : isRaksha
                ? 'text-4xl sm:text-6xl lg:text-[90px] text-[#c4306a]/60'
                : 'text-6xl sm:text-7xl lg:text-[105px] text-[#4d7817]/50'
            }`}
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
            }}
          >
            {isIndependence ? 'FREEDOM DEALS' : isRaksha ? 'RAKHI GIFTS' : 'GROCERY'}
          </span>
        </div>
      </div>

      {/* Floating Delivery Badge overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none animate-[bounce_4s_infinite]">
        <div className="pointer-events-auto h-full w-full">
          <FloatingDeliveryBadge />
        </div>
      </div>

      {/* Hero Character Image - Slanted Overlay */}
      <div
        ref={farmerRef}
        className="relative z-10 w-full max-w-md lg:max-w-xl xl:max-w-2xl h-full flex items-end justify-center pt-6 -translate-x-10 sm:-translate-x-16 lg:-translate-x-32"
      >
        <div className="relative">
          <img
            src={heroImg}
            fetchPriority="high"
            width="600"
            height="600"
            decoding="async"
            alt="The Grocery Hub Hero"
            className="w-auto h-[460px] sm:h-[560px] lg:h-[680px] object-contain object-bottom transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
          />

          {/* Theme-specific badges on Delivery Rider */}
          {isIndependence && (
            <div className="absolute top-[48%] left-[45%] z-20 bg-white/95 px-2 py-1 rounded-md shadow-md border border-slate-200 flex items-center gap-1.5 transform -rotate-3 scale-90 sm:scale-100">
              <span className="text-xs">🇮🇳</span>
              <span className="text-[10px] font-black text-slate-800 tracking-wider uppercase">JAI HIND</span>
            </div>
          )}
          {isRaksha && (
            <div className="absolute top-[48%] left-[45%] z-20 bg-white/95 px-2 py-1 rounded-md shadow-md border border-rose-200 flex items-center gap-1.5 transform rotate-2 scale-90 sm:scale-100">
              <span className="text-xs">🎀</span>
              <span className="text-[10px] font-black text-[#C41E56] tracking-wider uppercase">RAKHI SPECIAL</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
