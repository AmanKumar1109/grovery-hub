import React from 'react';
import HeroContent from './HeroContent';
import HeroVisual from './HeroVisual';
import OrganicStampBadge from './OrganicStampBadge';

export default function HeroSection() {
  return (
    <section className="relative w-full bg-gradient-to-r from-white via-emerald-50/20 to-transparent overflow-hidden">
      <div className="flex flex-col lg:flex-row items-stretch justify-between min-h-0 lg:min-h-[600px] w-full">
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
      <div className="hidden lg:block">
        <OrganicStampBadge />
      </div>
    </section>
  );
}
