import React from 'react';
import HeroContent from './HeroContent';
import HeroVisual from './HeroVisual';
import OrganicStampBadge from './OrganicStampBadge';

export default function HeroSection() {
  return (
    <section className="relative w-full bg-gradient-to-r from-white via-emerald-50/20 to-transparent overflow-hidden">
      <div className="flex flex-col lg:flex-row items-stretch justify-between min-h-[520px] lg:min-h-[600px] w-full">
        {/* Left Column Content */}
        <HeroContent />

        {/* Right Column Visual Banner */}
        <HeroVisual />
      </div>

      {/* Organic Stamp Badge positioned at bottom right */}
      <OrganicStampBadge />
    </section>
  );
}
