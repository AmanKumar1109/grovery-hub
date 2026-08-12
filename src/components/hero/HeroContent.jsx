import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import FloatingReviewsCard from './FloatingReviewsCard';
import gsap from 'gsap';
import timeImage from '../../assets/images/time.webp';

export default function HeroContent() {
  const { globalSettings } = useSettings();
  const theme = globalSettings?.activeTheme || 'normal';
  const isIndependence = theme === 'independence-day';
  const isDiwali = theme === 'diwali';

  const textRaw = globalSettings?.heroRotatingTexts || "Fresh Fruits\nFarm Veggies\nDaily Dairy\nHealthy Snacks\nDaily Needs";
  const words = textRaw.split('\n').filter(line => line.trim() !== '');
  const rotationInterval = globalSettings?.heroRotatingInterval || 2;
  const prefixText = globalSettings?.heroPrefixText || 'Delivering';
  const suffixText = globalSettings?.heroSuffixText || 'In 15 Minutes';
  const subtitleText = globalSettings?.heroSubtitleText || 'Shop quality groceries, household essentials, snacks, beverages & personal care products-all at unbeatable prices.';

  const featureRaw = globalSettings?.heroFeatureTexts || 'Genuine Product\nFast Delivery\nSecure Payment\nBest Prices';
  const features = featureRaw.split('\n').filter(line => line.trim() !== '');
  const featureInterval = globalSettings?.heroFeatureInterval || 3;

  const taglineRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const buttonRef = useRef(null);
  const featureRef = useRef(null);

  const [currentWord, setCurrentWord] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, rotationInterval * 1000);
    return () => clearInterval(interval);
  }, [words.length, rotationInterval]);

  useEffect(() => {
    if (features.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, featureInterval * 1000);
    return () => clearInterval(interval);
  }, [features.length, featureInterval]);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(taglineRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.2 })
      .fromTo(titleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.4')
      .fromTo(descRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
      .fromTo(buttonRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.2')
      .fromTo(featureRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3');
  }, []);

  return (
    <div className="relative z-10 flex flex-col justify-center px-6 lg:px-16 pt-8 pb-12 lg:py-16 max-w-xl">
      {/* Background Indian Flag & Ashoka Chakra Watermark for Independence Day Theme */}
      {isIndependence ? (
        <div className="absolute top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] lg:w-[520px] lg:h-[520px] opacity-[0.14] pointer-events-none z-0">
          <svg viewBox="0 0 300 300" fill="none" className="w-full h-full">
            {/* Soft Tricolor Spray Rings */}
            <circle cx="150" cy="150" r="140" fill="none" stroke="#FF9933" strokeWidth="3" strokeDasharray="6 6" />
            <circle cx="150" cy="150" r="125" fill="none" stroke="#138808" strokeWidth="3" strokeDasharray="8 8" />

            {/* Ashoka Chakra Center */}
            <circle cx="150" cy="150" r="75" stroke="#000080" strokeWidth="2.5" />
            <circle cx="150" cy="150" r="12" fill="#000080" fillOpacity="0.2" stroke="#000080" strokeWidth="1" />
            {[...Array(24)].map((_, i) => {
              const angle = (i * 360) / 24;
              const rad = (angle * Math.PI) / 180;
              const x2 = 150 + 75 * Math.cos(rad);
              const y2 = 150 + 75 * Math.sin(rad);
              return <line key={i} x1="150" y1="150" x2={x2} y2={y2} stroke="#000080" strokeWidth="1.8" />;
            })}
          </svg>
        </div>
      ) : (
        <div className="absolute top-0 left-4 w-28 h-28 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-gray-800 w-full h-full">
            <circle cx="40" cy="40" r="25" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M40 15 C 30 5, 20 20, 40 40" strokeWidth="1.5" />
            <circle cx="70" cy="65" r="18" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      {/* Tagline Badge */}
      <div ref={taglineRef} className="flex items-center gap-2 mb-4">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-[3px] bg-amber-500 rounded-full"></div>
          <div className="w-3 h-[3px] bg-amber-500 rounded-full"></div>
        </div>
        <div className="text-xs lg:text-sm font-bold tracking-tight">
          <span className="text-gray-900 mr-1.5">Fresh Grocery</span>
          <span className="text-red-600 font-extrabold">Online Delivery Shop</span>
        </div>
      </div>

      {/* Main Headline */}
      <div className="relative w-full">
        {isIndependence ? (
          <h1
            ref={titleRef}
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-5 min-h-[140px] sm:min-h-[160px] lg:min-h-[190px] relative z-10"
          >
            <span className="text-[#f25c05]">Happy 80th</span> <br />
            <span className="text-[#0c7a2b] inline-flex items-center gap-3 transition-colors duration-500">
              Independence Day 
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" 
                alt="Indian Flag" 
                className="w-12 sm:w-16 h-auto drop-shadow-lg rounded-sm"
                style={{ animation: 'flagWave 1.5s ease-in-out infinite', transformOrigin: 'bottom left' }} 
              />
              <style>{`
                @keyframes flagWave {
                  0%, 100% { transform: rotate(-4deg) translateY(0); }
                  50% { transform: rotate(8deg) translateY(-4px); }
                }
              `}</style>
            </span> <br />
            <span className="text-[#112918] text-3xl sm:text-4xl font-extrabold mt-2 inline-block">Celebrating 79 Years of Freedom!</span>
          </h1>
        ) : (
          <h1
            ref={titleRef}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.12] tracking-tight mb-5 min-h-[140px] sm:min-h-[160px] lg:min-h-[200px] relative z-10"
          >
            {prefixText} <br />
            <span className="text-[#3f6212] inline-block transition-colors duration-500">
              {words[currentWord % words.length] || ''}
            </span> <br />
            {suffixText}
          </h1>
        )}

        {/* Celebrating Freedom Badge (Independence Day) or Floating Time Icon */}
        {isIndependence ? (
          <div className="absolute right-0 top-[15%] translate-x-2 sm:translate-x-12 lg:translate-x-32 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-slate-200/80">
            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
              ⏱️
            </div>
            <span className="text-xs font-black text-slate-800 leading-tight">
              Celebrating Freedom <br />
              <span className="text-emerald-700 font-extrabold">with Fast Delivery!</span>
            </span>
          </div>
        ) : (
          <div className="absolute right-0 top-[5%] sm:top-[10%] lg:top-[5%] translate-x-4 sm:translate-x-20 lg:translate-x-48 z-20 pointer-events-none">
            <img
              src={timeImage}
              alt="Fast Delivery"
              className="w-24 h-24 sm:w-32 sm:h-32 lg:w-60 lg:h-60 object-contain drop-shadow-xl opacity-100 animate-pulse"
              style={{ animationDuration: '3s' }}
            />
          </div>
        )}
      </div>

      {/* Paragraph Subtitle */}
      <p
        ref={descRef}
        className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed max-w-md mb-8"
      >
        {isIndependence 
          ? "The Grocery Hub celebrates freedom with you! Shop your favorite groceries, snacks, and daily essentials with our special Independence Day offers."
          : subtitleText}
      </p>

      {/* CTA and Buttons */}
      <div className="flex flex-wrap items-center gap-4 mb-10">
        {isIndependence ? (
          <>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('shop');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm sm:text-base font-extrabold px-8 py-3 rounded-full shadow-lg shadow-emerald-700/30 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              Shop Now
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('shop');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white text-sm sm:text-base font-extrabold px-6 py-3 rounded-full shadow-lg shadow-emerald-700/20 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              <span className="text-lg"></span>
              best Quality
            </button>
          </>
        ) : (
          <>
            <div ref={buttonRef} className="relative group inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-amber-500 rounded-full blur-md opacity-40 group-hover:opacity-70 transition duration-300"></div>

              <button
                type="button"
                className="relative flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-gray-900 text-sm sm:text-base font-extrabold pl-2 pr-7 sm:pr-9 py-2 sm:py-2.5 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0.5 transition-all duration-300 shrink-0 border border-amber-300/30"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.15)] transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 drop-shadow-sm" strokeWidth={2} fill="currentColor" />
                </div>
                <span className="tracking-wide pr-2">Shop Now</span>
              </button>
            </div>

            {/* Features Banner */}
            <div ref={featureRef}>
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/50 overflow-hidden">
                <div className="w-6 h-6 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="relative h-5 flex items-center min-w-[120px]">
                  {features.map((feature, idx) => (
                    <span
                      key={idx}
                      className={`absolute inset-0 flex items-center text-[11px] sm:text-xs font-bold text-slate-700 transition-all duration-500 ${idx === (currentFeature % features.length)
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-3'
                        }`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Floating Reviews Card */}
      <div className="mt-auto pt-2">
        <FloatingReviewsCard />
      </div>

      {/* Bottom Background Sketched Bicycle Line Art */}
      <div className="absolute -bottom-4 right-10 w-32 h-20 opacity-10 pointer-events-none hidden sm:block">
        <svg viewBox="0 0 100 60" fill="none" stroke="currentColor" className="text-gray-700 w-full h-full">
          <circle cx="25" cy="40" r="15" strokeWidth="1.5" />
          <circle cx="75" cy="40" r="15" strokeWidth="1.5" />
          <path d="M25 40 L45 40 L60 20 L75 40 M45 40 L55 20 M35 20 L55 20" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
