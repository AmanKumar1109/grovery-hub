import React from 'react';
import { Phone } from 'lucide-react';

export default function FloatingCall() {
  // Same number as WhatsApp for consistency, or generic number.
  const phoneNumber = '+916207462800'; 

  return (
    <a
      href={`tel:${phoneNumber}`}
      className="fixed bottom-40 right-4 sm:bottom-24 sm:right-8 z-[9998] flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-500 text-white p-2.5 sm:p-3 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_25px_rgba(79,70,229,0.5)] hover:-translate-y-1 transition-all duration-300 animate-[bounce_4s_infinite] group cursor-pointer"
      style={{ animationDelay: '1s' }}
      aria-label="Call us"
    >
      <div className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
        {/* Pulsing rings behind the phone icon */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-white/50 opacity-75 animate-ping"></span>
        <Phone className="w-5 h-5 sm:w-6 sm:h-6 fill-current relative z-10 group-hover:rotate-12 transition-transform duration-300" />
      </div>
    </a>
  );
}
