import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';

// Independence Day banner content
function IndependenceDayBanner() {
  return (
    <div
      className="w-full relative overflow-hidden bg-[#080f1e] text-white py-1.5 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold border-b border-slate-800"
    >
      <div className="flex items-center justify-center gap-2">
        <span className="tracking-wide text-slate-100 font-medium">Independence Day Special Offers Available</span>
      </div>
    </div>
  );
}

// Diwali banner content
function DiwaliAnimatedDiyas() {
  const diyas = ['🪔', '✨', '🪔', '✨', '🪔', '✨', '🪔', '✨', '🪔', '✨', '🪔'];
  return (
    <div className="flex items-center gap-1">
      {diyas.map((d, i) => (
        <span
          key={i}
          className="text-sm"
          style={{
            animation: `diyaFlicker ${0.8 + (i % 3) * 0.3}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.1}s`
          }}
        >
          {d}
        </span>
      ))}
    </div>
  );
}

function DiwaliBanner() {
  return (
    <div
      className="w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #7c2d12 0%, #b45309 40%, #92400e 70%, #7c2d12 100%)',
        borderBottom: '2px solid #f59e0b'
      }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            className="absolute text-xs"
            style={{
              left: `${(i * 8.5) % 100}%`,
              top: i % 2 === 0 ? '10%' : '60%',
              animation: `starTwinkle ${1 + (i % 3) * 0.4}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.15}s`
            }}
          >
            ✦
          </span>
        ))}
      </div>

      <div className="relative py-2 px-4 flex items-center justify-center gap-4">
        <DiwaliAnimatedDiyas />
        <span
          className="text-xs sm:text-sm font-black tracking-wide"
          style={{ color: '#fef3c7', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
        >
          🪔 Shubh Deepawali! May This Diwali Bring Joy, Prosperity &amp; Light To Your Home! 🪔
        </span>
        <DiwaliAnimatedDiyas />
      </div>
    </div>
  );
}

export default function FestiveBanner() {
  const { globalSettings } = useSettings();
  const theme = globalSettings?.activeTheme || 'normal';

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (theme !== 'normal') {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [theme]);

  if (theme === 'normal') return null;

  return (
    <>
      <style>{`
        @keyframes diyaFlicker {
          0%   { opacity: 0.7; transform: scale(0.95); }
          100% { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes starTwinkle {
          0%   { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>

      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {theme === 'independence-day' && <IndependenceDayBanner />}
        {theme === 'diwali' && <DiwaliBanner />}
      </div>
    </>
  );
}
