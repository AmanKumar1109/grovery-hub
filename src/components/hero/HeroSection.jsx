import React from 'react';
import HeroContent from './HeroContent';
import HeroVisual from './HeroVisual';
import OrganicStampBadge from './OrganicStampBadge';
import { useSettings } from '../../context/SettingsContext';

export default function HeroSection() {
  const { globalSettings } = useSettings();
  const theme = globalSettings?.activeTheme || 'normal';
  const isIndependence = theme === 'independence-day';
  const isDiwali = theme === 'diwali';
  const isRaksha = theme === 'raksha-bandhan';

  return (
    <section className={`relative w-full overflow-hidden transition-colors duration-300 ${
      isIndependence ? 'bg-[#f6f5ea]' : isDiwali ? 'bg-[#2d0e06]' : isRaksha ? 'bg-[#FFF8F0]' : 'bg-white'
    }`}>
      
      {/* NEXT LEVEL FLUID BACKGROUND (Left Side Focus) */}
      {/* Normal Theme Fluid Background */}
      {!isIndependence && !isRaksha && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-60">
          {/* Animated Fluid Gradients */}
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] lg:w-[35vw] lg:h-[35vw] rounded-full bg-emerald-400/20 blur-[80px]" style={{ transformOrigin: 'center center', animation: 'spin 20s linear infinite' }} />
          <div className="absolute top-[20%] left-[10%] w-[50vw] h-[50vw] lg:w-[30vw] lg:h-[30vw] rounded-full bg-lime-300/20 blur-[90px]" style={{ transformOrigin: '20% 50%', animation: 'spin 25s linear infinite reverse' }} />
          <div className="absolute bottom-[-10%] left-[5%] w-[70vw] h-[70vw] lg:w-[40vw] lg:h-[40vw] rounded-full bg-amber-200/20 blur-[80px]" style={{ transformOrigin: '70% 30%', animation: 'spin 30s linear infinite' }} />

          {/* Dynamic Topology SVG Lines overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'topography\' width=\'60\' height=\'60\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M0 0c15 15 30 15 45 0s30-15 45 0\' fill=\'none\' stroke=\'%23000\' stroke-width=\'1.5\'/%3E%3Cpath d=\'M0 20c15 15 30 15 45 0s30-15 45 0\' fill=\'none\' stroke=\'%23000\' stroke-width=\'1.5\'/%3E%3Cpath d=\'M0 40c15 15 30 15 45 0s30-15 45 0\' fill=\'none\' stroke=\'%23000\' stroke-width=\'1.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23topography)\'/%3E%3C/svg%3E")', backgroundSize: '120px' }}></div>

          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>
      )}

      {/* 🎀 RAKSHA BANDHAN Theme Fluid Background */}
      {isRaksha && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Warm Crimson & Gold Fluid Gradient Blobs */}
          <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] lg:w-[32vw] lg:h-[32vw] rounded-full bg-rose-300/25 blur-[90px]" style={{ transformOrigin: 'center center', animation: 'spin 22s linear infinite' }} />
          <div className="absolute top-[15%] left-[15%] w-[45vw] h-[45vw] lg:w-[28vw] lg:h-[28vw] rounded-full bg-pink-200/20 blur-[80px]" style={{ transformOrigin: '30% 60%', animation: 'spin 28s linear infinite reverse' }} />
          <div className="absolute bottom-[-10%] left-[0%] w-[60vw] h-[60vw] lg:w-[35vw] lg:h-[35vw] rounded-full bg-amber-200/25 blur-[85px]" style={{ transformOrigin: '60% 40%', animation: 'spin 25s linear infinite' }} />
          <div className="absolute top-[40%] right-[10%] w-[30vw] h-[30vw] lg:w-[20vw] lg:h-[20vw] rounded-full bg-fuchsia-200/15 blur-[70px]" style={{ animation: 'spin 30s linear infinite reverse' }} />

          {/* Rotating Rakhi Mandala Watermark (Center Background) */}
          <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] lg:w-[650px] lg:h-[650px] opacity-[0.06]" style={{ animation: 'spin 40s linear infinite' }}>
            <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
              {/* Outer decorative ring */}
              <circle cx="200" cy="200" r="190" stroke="#C41E56" strokeWidth="1.5" strokeDasharray="8 4" />
              <circle cx="200" cy="200" r="175" stroke="#D4A017" strokeWidth="1" strokeDasharray="5 5" />
              {/* Middle mandala petals */}
              {[...Array(16)].map((_, i) => {
                const angle = (i * 360) / 16;
                const rad = (angle * Math.PI) / 180;
                const x = 200 + 140 * Math.cos(rad);
                const y = 200 + 140 * Math.sin(rad);
                return <circle key={`outer-${i}`} cx={x} cy={y} r="12" stroke="#C41E56" strokeWidth="1" fill="none" />;
              })}
              {/* Inner mandala petals */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 360) / 12;
                const rad = (angle * Math.PI) / 180;
                const x = 200 + 95 * Math.cos(rad);
                const y = 200 + 95 * Math.sin(rad);
                return <circle key={`inner-${i}`} cx={x} cy={y} r="8" stroke="#D4A017" strokeWidth="1.2" fill="none" />;
              })}
              {/* Center Rakhi circle */}
              <circle cx="200" cy="200" r="55" stroke="#C41E56" strokeWidth="2" />
              <circle cx="200" cy="200" r="40" stroke="#D4A017" strokeWidth="1.5" />
              <circle cx="200" cy="200" r="20" fill="#C41E56" fillOpacity="0.15" stroke="#C41E56" strokeWidth="1" />
              {/* Spokes */}
              {[...Array(24)].map((_, i) => {
                const angle = (i * 360) / 24;
                const rad = (angle * Math.PI) / 180;
                const x2 = 200 + 55 * Math.cos(rad);
                const y2 = 200 + 55 * Math.sin(rad);
                return <line key={`spoke-${i}`} x1="200" y1="200" x2={x2} y2={y2} stroke="#C41E56" strokeWidth="0.8" />;
              })}
            </svg>
          </div>

          {/* Floating Sparkle Particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${4 + (i % 3) * 3}px`,
                height: `${4 + (i % 3) * 3}px`,
                left: `${8 + i * 11}%`,
                bottom: `${10 + (i % 4) * 15}%`,
                background: i % 2 === 0 ? '#D4A017' : '#C41E56',
                opacity: 0.3,
                animation: `petalFloat ${3 + (i % 3)}s ease-in-out ${i * 0.5}s infinite`,
              }}
            />
          ))}

          {/* Mehndi-style dotted pattern overlay */}
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #C41E56 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-stretch justify-between min-h-0 lg:min-h-[600px] w-full relative z-10">
        {/* Left Column Content - Full width on Mobile, Half on Desktop */}
        <div className="w-full lg:w-auto">
          <HeroContent />
        </div>

        {/* Right Column Visual Banner - Hidden on Phone (< lg), Shown on Desktop (lg+) */}
        <div className="hidden lg:flex flex-1">
          <HeroVisual />
        </div>
      </div>

      {/* Organic Stamp Badge - Shown on Desktop */}
      <div className="hidden lg:block relative z-10">
        <OrganicStampBadge />
      </div>

      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes petalFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.3); opacity: 0.6; }
        }
      `}</style>
    </section>
  );
}
