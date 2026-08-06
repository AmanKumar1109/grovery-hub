import React, { useEffect, useRef } from 'react';
import heroImg from '../../assets/images/hero.png';
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
    <div className="relative flex-1 min-h-[440px] sm:min-h-[480px] lg:min-h-[580px] flex items-end justify-center overflow-visible">
      {/* Tilted Dark Green Slanted Polygon Backdrop */}
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
        <img
          src={heroImg}
          fetchpriority="high"
          alt="The Grocery Hub Hero"
          className="w-auto h-[460px] sm:h-[560px] lg:h-[680px] object-contain object-bottom transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
        />
      </div>
    </div>
  );
}
