import React, { useEffect, useRef } from 'react';
import farmerImg from '../../assets/images/hero-farmer.png';
import FloatingDeliveryBadge from './FloatingDeliveryBadge';
import gsap from 'gsap';

export default function HeroVisual() {
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
    <div className="relative flex-1 min-h-[440px] lg:min-h-[580px] flex items-end justify-center overflow-visible">
      {/* Slanted Dark Green Polygon Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-[#3b5e11] z-0"
        style={{
          clipPath: 'polygon(35% 0, 100% 0, 100% 100%, 18% 100%)',
        }}
      >
        {/* Giant Vertical Watermark Typography: GROCERY */}
        <div className="absolute right-4 top-0 bottom-0 flex items-center justify-center pointer-events-none select-none">
          <span
            className="text-6xl sm:text-7xl lg:text-[105px] font-black tracking-widest text-[#4d7817]/50 leading-none uppercase"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
            }}
          >
            GROCERY
          </span>
        </div>
      </div>

      {/* Floating Delivery Badge overlay */}
      <FloatingDeliveryBadge />

      {/* Hero Character Image - GSAP Slide & Reveal */}
      <div
        ref={farmerRef}
        className="relative z-10 w-full max-w-md lg:max-w-lg xl:max-w-xl h-full flex items-end justify-center pt-6 -translate-x-16 sm:-translate-x-28 lg:-translate-x-36"
      >
        <img
          src={farmerImg}
          alt="The Grocery Hub Fresh Farmer"
          className="w-auto h-[480px] sm:h-[540px] lg:h-[600px] object-contain object-bottom transition-all duration-300 hover:scale-[1.02] filter drop-shadow-[0_0_2px_rgba(255,255,255,0.9)] drop-shadow-[0_25px_35px_rgba(0,0,0,0.38)]"
        />
      </div>
    </div>
  );
}
