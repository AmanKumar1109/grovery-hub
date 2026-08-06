import React from 'react';
import HeroContent from './HeroContent';
import HeroVisual from './HeroVisual';
import OrganicStampBadge from './OrganicStampBadge';

export default function HeroSection() {
  return (
    <section className="relative w-full bg-white overflow-hidden">
      
      {/* NEXT LEVEL FLUID BACKGROUND (Left Side Focus) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Fluid Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] lg:w-[35vw] lg:h-[35vw] rounded-full bg-emerald-400/20 blur-[100px] mix-blend-multiply" style={{ transformOrigin: 'center center', animation: 'spin 20s linear infinite' }} />
        <div className="absolute top-[20%] left-[10%] w-[50vw] h-[50vw] lg:w-[30vw] lg:h-[30vw] rounded-full bg-lime-300/20 blur-[120px] mix-blend-multiply" style={{ transformOrigin: '20% 50%', animation: 'spin 25s linear infinite reverse' }} />
        <div className="absolute bottom-[-10%] left-[5%] w-[70vw] h-[70vw] lg:w-[40vw] lg:h-[40vw] rounded-full bg-amber-200/20 blur-[110px] mix-blend-multiply" style={{ transformOrigin: '70% 30%', animation: 'spin 30s linear infinite' }} />

        {/* Dynamic Topology SVG Lines overlay (The "line line" pattern) */}
        <div className="absolute inset-0 opacity-[0.06] mix-blend-color-burn" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'topography\' width=\'60\' height=\'60\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M0 0c15 15 30 15 45 0s30-15 45 0\' fill=\'none\' stroke=\'%23000\' stroke-width=\'1.5\'/%3E%3Cpath d=\'M0 20c15 15 30 15 45 0s30-15 45 0\' fill=\'none\' stroke=\'%23000\' stroke-width=\'1.5\'/%3E%3Cpath d=\'M0 40c15 15 30 15 45 0s30-15 45 0\' fill=\'none\' stroke=\'%23000\' stroke-width=\'1.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23topography)\'/%3E%3C/svg%3E")', backgroundSize: '120px' }}></div>
        
        {/* Fine Grain Noise Texture for premium feel */}
        <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

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
      `}</style>
    </section>
  );
}
