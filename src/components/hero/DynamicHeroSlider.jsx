import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DynamicHeroSlider() {
  const { banners, settingsLoading } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000); // Auto-slide every 4 seconds

    return () => clearInterval(interval);
  }, [banners]);

  if (settingsLoading || !banners || banners.length === 0) {
    return null; // Return nothing if no banners, falling back to other sections
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  return (
    <section className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[480px] bg-slate-100 overflow-hidden group">
      {/* Slides */}
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="min-w-full h-full relative shrink-0 cursor-pointer">
            {banner.link ? (
              // If there's a link, wrap it in an anchor or Link depending on if it's internal
              banner.link.startsWith('/') ? (
                <Link to={banner.link} className="block w-full h-full">
                  <img src={banner.image} alt="Promo Banner" className="w-full h-full object-cover" />
                </Link>
              ) : (
                <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  <img src={banner.image} alt="Promo Banner" className="w-full h-full object-cover" />
                </a>
              )
            ) : (
              // No link
              <img src={banner.image} alt="Promo Banner" className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows (Visible on hover on desktop) */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur rounded-full flex items-center justify-center text-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 hidden sm:flex"
          >
            <ChevronLeft className="w-6 h-6 pr-0.5" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur rounded-full flex items-center justify-center text-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 hidden sm:flex"
          >
            <ChevronRight className="w-6 h-6 pl-0.5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-emerald-500' : 'w-2 bg-white/60 hover:bg-white/90'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
