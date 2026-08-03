import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { CheckCircle2 } from 'lucide-react';
import FloatingReviewsCard from './FloatingReviewsCard';
import gsap from 'gsap';

export default function HeroContent() {
  const { globalSettings } = useSettings();
  const textRaw = globalSettings?.heroRotatingTexts || "Fresh Fruits\nFarm Veggies\nDaily Dairy\nHealthy Snacks\nDaily Needs";
  const words = textRaw.split('\n').filter(line => line.trim() !== '');
  const rotationInterval = globalSettings?.heroRotatingInterval || 2;
  const prefixText = globalSettings?.heroPrefixText || 'Delivering';
  const suffixText = globalSettings?.heroSuffixText || 'In 15 Minutes';
  const subtitleText = globalSettings?.heroSubtitleText || 'This year, our new summer collection will shelter you harsh elements of a world that .';
  
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
      {/* Background Line-Art Sketched Illustrations */}
      <div className="absolute top-0 left-4 w-28 h-28 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-gray-800 w-full h-full">
          <circle cx="40" cy="40" r="25" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M40 15 C 30 5, 20 20, 40 40" strokeWidth="1.5" />
          <circle cx="70" cy="65" r="18" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Tagline Badge */}
      <div ref={taglineRef} className="flex items-center gap-2 mb-4">
        {/* Double yellow bars icon */}
        <div className="flex flex-col gap-1">
          <div className="w-5 h-[3px] bg-amber-400 rounded-full"></div>
          <div className="w-3 h-[3px] bg-amber-400 rounded-full"></div>
        </div>
        <div className="text-xs lg:text-sm font-bold tracking-tight">
          <span className="text-gray-900 mr-1.5">Fresh Grocery</span>
          <span className="text-red-600 font-extrabold">Online Delivery Shop</span>
        </div>
      </div>

      {/* Main Headline */}
      <h1
        ref={titleRef}
        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.12] tracking-tight mb-5 min-h-[140px] sm:min-h-[160px] lg:min-h-[200px]"
      >
        {prefixText} <br />
        <span className="text-[#3f6212] inline-block transition-colors duration-500">
          {words[currentWord % words.length] || ''}
        </span> <br />
        {suffixText}
      </h1>

      {/* Paragraph Subtitle */}
      <p
        ref={descRef}
        className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed max-w-md mb-8"
      >
        {subtitleText}
      </p>

      {/* CTA and Features Row */}
      <div className="flex flex-wrap items-center gap-4 mb-10">
        <div ref={buttonRef}>
          <button
            type="button"
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 text-xs sm:text-sm font-extrabold px-8 py-3.5 rounded-full shadow-lg shadow-amber-300/50 hover:shadow-xl hover:shadow-amber-400/50 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shrink-0"
          >
            Shop Now
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
                  className={`absolute inset-0 flex items-center text-[11px] sm:text-xs font-bold text-slate-700 transition-all duration-500 ${
                    idx === (currentFeature % features.length)
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
