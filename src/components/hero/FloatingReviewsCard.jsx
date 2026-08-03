import React, { useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import customerAvatars from '../../assets/images/customer-avatars.png';
import userAvatar from '../../assets/images/user-avatar.png';
import gsap from 'gsap';

export default function FloatingReviewsCard() {
  const { globalSettings } = useSettings();
  const cardRef = useRef(null);

  const rawText = globalSettings?.heroReviewText || 'The Grocery Hub- Satisfied Around\n*the* Baharagora';

  const renderText = () => {
    return rawText.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\*.*?\*)/g).map((part, j) => {
          if (part.startsWith('*') && part.endsWith('*')) {
            return <span key={j} className="text-emerald-600">{part.slice(1, -1)}</span>;
          }
          return <span key={j} className="text-gray-800">{part}</span>;
        })}
        {i !== rawText.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { scale: 0.7, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: 'back.out(1.7)' }
    );
  }, []);

  return (
    <div
      ref={cardRef}
      className="inline-flex items-center gap-3.5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-gray-100 shadow-floating hover:shadow-xl transition-all duration-300"
    >
      {/* Overlapping Avatar Stack */}
      <div className="flex items-center -space-x-2.5 overflow-hidden">
        <img
          src={userAvatar}
          alt="Customer 1"
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
        />
        <img
          src={customerAvatars}
          alt="Customer 2"
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm object-left"
        />
        <img
          src={customerAvatars}
          alt="Customer 3"
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm object-right"
        />
      </div>

      {/* Review Text */}
      <div className="text-xs font-bold leading-snug text-gray-800">
        {renderText()}
      </div>
    </div>
  );
}
