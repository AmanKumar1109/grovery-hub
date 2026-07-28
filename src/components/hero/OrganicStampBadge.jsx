import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function OrganicStampBadge() {
  const stampRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      stampRef.current,
      { scale: 0, opacity: 0, rotate: -180 },
      { scale: 1, opacity: 1, rotate: 0, duration: 1, delay: 0.8, ease: 'back.out(1.5)' }
    );
  }, []);

  return (
    <div
      ref={stampRef}
      className="absolute -bottom-6 right-6 lg:right-12 z-30 flex items-center justify-center select-none"
    >
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Rotating Circular Text */}
        <svg
          className="w-full h-full animate-spin-slow overflow-visible"
          viewBox="0 0 100 100"
        >
          <path
            id="textPath"
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="none"
          />
          <text className="text-[9.5px] font-extrabold tracking-wider uppercase fill-gray-900">
            <textPath href="#textPath" startOffset="0%">
              THE GROCERY HUB • FRESH & HYGIENIC
            </textPath>
          </text>
        </svg>

        {/* Center Orange Badge Icon */}
        <div className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 border-2 border-white">
          {/* Carrot / Leaf Icon */}
          <svg
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2c1.1 0 2 .9 2 2 0 .55-.22 1.05-.59 1.41L15 7l-2 2-1.59-1.59C10.05 7.78 9.55 8 9 8c-1.1 0-2-.9-2-2 0-.55.22-1.05.59-1.41L6 3l2-2 1.59 1.59C10.95 2.22 11.45 2 12 2zm3.5 8.5L8 18c-.8.8-1.7 1.5-2.7 2-.5.2-1 .4-1.6.5-.4.1-.7-.3-.6-.7.1-.6.3-1.1.5-1.6.5-1 1.2-1.9 2-2.7l7.5-7.5 2.4 2.5z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
