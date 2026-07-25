import React, { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import scooterImg from '../../assets/images/delivery-scooter.png';
import gsap from 'gsap';

export default function FloatingDeliveryBadge() {
  const badgeRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      badgeRef.current,
      { scale: 0.5, opacity: 0, x: -30 },
      { scale: 1, opacity: 1, x: 0, duration: 0.9, delay: 0.7, ease: 'back.out(2)' }
    );
  }, []);

  return (
    <div
      ref={badgeRef}
      className="absolute left-[8%] sm:left-[10%] lg:left-[14%] top-[55%] z-30 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 pr-5 shadow-floating border border-gray-100/80 flex items-center gap-3 transition-transform hover:scale-105 duration-300"
    >
      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center p-1 border border-teal-100/50">
        <img
          src={scooterImg}
          alt="Fast Delivery Scooter"
          className="w-8 h-8 object-contain"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-900 leading-tight">
          Fast Delivery
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-semibold text-gray-500">
            4.5 <span className="text-gray-400">(10k Review)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
