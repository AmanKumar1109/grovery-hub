import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Leaf,
  Truck,
  ShieldCheck,
  BadgePercent,
  HeartHandshake,
  Clock,
  Sparkles,
  ChevronRight,
  Apple,
  Carrot,
  Cherry,
  Star,
  Package,
  Award,
  ThumbsUp,
  Zap,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSettings } from '../../context/SettingsContext';

gsap.registerPlugin(ScrollTrigger);

/* ─── Icon Map (for dynamic icon from admin) ────────────────── */
const ICON_MAP = {
  Leaf,
  Truck,
  ShieldCheck,
  BadgePercent,
  HeartHandshake,
  Clock,
  Sparkles,
  Star,
  Package,
  Award,
  ThumbsUp,
  Zap,
};

/* ─── Color Theme Map ────────────────────────────────────────── */
const COLOR_THEMES = {
  emerald: {
    gradient: 'from-emerald-500 to-emerald-700',
    bgLight: 'bg-emerald-50',
    iconBg: 'bg-emerald-500',
    borderAccent: 'border-emerald-200',
    hoverGlow: 'hover:shadow-emerald-200/50',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    iconBg: 'bg-amber-500',
    borderAccent: 'border-amber-200',
    hoverGlow: 'hover:shadow-amber-200/50',
  },
  rose: {
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    iconBg: 'bg-rose-500',
    borderAccent: 'border-rose-200',
    hoverGlow: 'hover:shadow-rose-200/50',
  },
  sky: {
    gradient: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50',
    iconBg: 'bg-sky-500',
    borderAccent: 'border-sky-200',
    hoverGlow: 'hover:shadow-sky-200/50',
  },
  violet: {
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    iconBg: 'bg-violet-500',
    borderAccent: 'border-violet-200',
    hoverGlow: 'hover:shadow-violet-200/50',
  },
  teal: {
    gradient: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50',
    iconBg: 'bg-teal-500',
    borderAccent: 'border-teal-200',
    hoverGlow: 'hover:shadow-teal-200/50',
  },
  orange: {
    gradient: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-50',
    iconBg: 'bg-orange-500',
    borderAccent: 'border-orange-200',
    hoverGlow: 'hover:shadow-orange-200/50',
  },
  indigo: {
    gradient: 'from-indigo-500 to-blue-700',
    bgLight: 'bg-indigo-50',
    iconBg: 'bg-indigo-500',
    borderAccent: 'border-indigo-200',
    hoverGlow: 'hover:shadow-indigo-200/50',
  },
};

/* ─── Default Data (fallbacks) ───────────────────────────────── */
const defaultStats = [
  { value: 1500, suffix: '+', label: 'Happy Customers' },
  { value: 15, suffix: ' Min', label: 'Express Delivery' },
  { value: 100, suffix: '%', label: 'Organic & Fresh' },
  { value: 500, suffix: '+', label: 'Products Available' },
];

const defaultFeatures = [
  { title: 'Farm Fresh Quality', description: 'Seedhi khet se aapke ghar tak — har sabzi aur fruit 100% organic aur chemical-free hota hai.', iconName: 'Leaf', colorTheme: 'emerald' },
  { title: '15-Min Superfast Delivery', description: 'Order karte hi 15 minute mein delivery! Baharagora ke har mohalle mein lightning-fast service.', iconName: 'Truck', colorTheme: 'amber' },
  { title: 'Sabse Sasta Price Guarantee', description: 'Direct farm sourcing ka fayda — market se kam rate pe milega har samaan, with daily offers aur deals.', iconName: 'BadgePercent', colorTheme: 'rose' },
  { title: '100% Safe & Secure', description: 'Certified products, secure payments aur tamper-proof packaging. Aapka trust hi hamari pehchaan hai.', iconName: 'ShieldCheck', colorTheme: 'sky' },
  { title: 'No-Questions Returns', description: 'Product pasand nahi aaya? Koi baat nahi! Instant refund ya replacement — bina koi sawal ke.', iconName: 'HeartHandshake', colorTheme: 'violet' },
  { title: 'Open 7 Days a Week', description: 'Subah se raat tak, Monday se Sunday — jab chaaho tab order karo. Hum hamesha available hain!', iconName: 'Clock', colorTheme: 'teal' },
];

/* ─── Animated Counter Hook ──────────────────────────────────── */
function useCountUp(end, duration = 2000, trigger = false) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        ref.current = requestAnimationFrame(step);
      }
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [end, duration, trigger]);

  return count;
}

/* ─── Floating Decorative Elements ───────────────────────────── */
function FloatingElements() {
  return (
    <>
      {/* Top-left decorative blob */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none floating-blob-1" />
      {/* Bottom-right decorative blob */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none floating-blob-2" />
      {/* Center subtle blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-100/20 to-amber-100/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating grocery icons */}
      <div className="absolute top-16 right-[15%] floating-icon-1 pointer-events-none hidden lg:block">
        <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200/40 rotate-12">
          <Apple className="w-5 h-5 text-amber-600" />
        </div>
      </div>
      <div className="absolute bottom-20 left-[10%] floating-icon-2 pointer-events-none hidden lg:block">
        <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/40 -rotate-12">
          <Carrot className="w-5 h-5 text-emerald-600" />
        </div>
      </div>
      <div className="absolute top-1/3 left-[5%] floating-icon-3 pointer-events-none hidden lg:block">
        <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200/40 rotate-6">
          <Cherry className="w-4 h-4 text-rose-500" />
        </div>
      </div>
    </>
  );
}

/* ─── Single Stat Counter ────────────────────────────────────── */
function StatCounter({ stat, animated, index }) {
  const count = useCountUp(stat.value || 0, 1500 + index * 300, animated);
  const colors = ['text-amber-500', 'text-emerald-500', 'text-amber-500', 'text-emerald-500'];

  return (
    <div className="stat-card relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/60 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl" />
      <div className="relative z-10">
        <p className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${colors[index % colors.length]}`}>
          {count.toLocaleString()}
          <span className="text-lg sm:text-xl">{stat.suffix}</span>
        </p>
        <p className="text-[10px] sm:text-xs font-extrabold text-slate-500 mt-1 uppercase tracking-wider">
          {stat.label}
        </p>
      </div>
    </div>
  );
}

/* ─── Stats Counter Bar ──────────────────────────────────────── */
function StatsBar({ stats, animated }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => (
        <StatCounter key={idx} stat={stat} animated={animated} index={idx} />
      ))}
    </div>
  );
}

/* ─── Feature Card ───────────────────────────────────────────── */
function FeatureCard({ feature, index }) {
  const Icon = ICON_MAP[feature.iconName] || Leaf;
  const theme = COLOR_THEMES[feature.colorTheme] || COLOR_THEMES.emerald;

  return (
    <div
      className={`feature-card group relative ${theme.bgLight} rounded-2xl sm:rounded-3xl p-5 sm:p-7 border ${theme.borderAccent} shadow-xs ${theme.hoverGlow} hover:shadow-xl hover:-translate-y-2 transition-all duration-400 overflow-hidden cursor-default`}
    >
      {/* Background gradient on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 rounded-2xl sm:rounded-3xl`}
      />

      {/* Animated corner accent */}
      <div
        className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${theme.gradient} opacity-10 rounded-full group-hover:scale-150 group-hover:opacity-20 transition-all duration-500`}
      />

      <div className="relative z-10 space-y-3 sm:space-y-4">
        {/* Icon with gradient background */}
        <div className="flex items-center gap-3">
          <div
            className={`feature-icon w-11 h-11 sm:w-14 sm:h-14 ${theme.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
          >
            <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest">
            0{index + 1}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 tracking-tight leading-snug">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-[11px] sm:text-xs font-medium text-slate-600 leading-relaxed">
          {feature.description}
        </p>

        {/* Learn more link */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-slate-400 group-hover:text-slate-700 transition-colors">
          <span>Explore</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function WhyShopFromUs() {
  const sectionRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const { globalSettings } = useSettings();

  // Read all data from admin settings (with fallbacks)
  const badgeText = globalSettings?.whyShopBadge || 'Why Choose Us';
  const titleText = globalSettings?.whyShopTitle || 'Why Shop From The Grocery Hub?';
  const subtitleText = globalSettings?.whyShopSubtitle || 'Baharagora ka sabse bharosemand grocery partner — fresh quality, fastest delivery, aur best prices ke saath har din aapke ghar tak.';
  const ctaText = globalSettings?.whyShopCtaText || 'Start Shopping Now';
  const ctaLink = globalSettings?.whyShopCtaLink || '#shop';
  const trustLineText = globalSettings?.whyShopTrustLine || '1,500+ customers trust us daily';
  const stats = globalSettings?.whyShopStats || defaultStats;
  const features = globalSettings?.whyShopFeatures || defaultFeatures;

  // Parse title to highlight "The Grocery Hub" portion
  const titleParts = useMemo(() => {
    const highlightKeyword = 'The Grocery Hub';
    const idx = titleText.indexOf(highlightKeyword);
    if (idx === -1) return { before: titleText, highlight: '', after: '' };
    return {
      before: titleText.slice(0, idx),
      highlight: highlightKeyword,
      after: titleText.slice(idx + highlightKeyword.length),
    };
  }, [titleText]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── Floating blob animations ── */
      gsap.to('.floating-blob-1', {
        x: 30,
        y: 20,
        duration: 6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to('.floating-blob-2', {
        x: -25,
        y: -30,
        duration: 7,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      /* ── Floating icon animations ── */
      gsap.to('.floating-icon-1', {
        y: -15,
        rotation: 5,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to('.floating-icon-2', {
        y: 12,
        rotation: -8,
        duration: 3.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to('.floating-icon-3', {
        y: -10,
        rotation: 10,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      /* ── Section header animation ── */
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      headerTl
        .fromTo(
          '.wsu-badge',
          { y: -20, opacity: 0, scale: 0.8 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
        )
        .fromTo(
          '.wsu-title',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          '-=0.2'
        )
        .fromTo(
          '.wsu-subtitle',
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
          '-=0.3'
        );

      /* ── Stats cards animation ── */
      ScrollTrigger.create({
        trigger: '.stats-section',
        start: 'top 85%',
        onEnter: () => setStatsAnimated(true),
      });

      gsap.fromTo(
        '.stat-card',
        { y: 30, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '.stats-section',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      /* ── Feature cards animation ── */
      gsap.fromTo(
        '.feature-card',
        { y: 45, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      /* ── Feature icons pop-in ── */
      gsap.fromTo(
        '.feature-icon',
        { scale: 0, rotation: -20 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.45,
          ease: 'back.out(2)',
          stagger: 0.1,
          delay: 0.2,
          scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      /* ── Bottom CTA animation ── */
      gsap.fromTo(
        '.wsu-cta',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.wsu-cta',
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full px-4 sm:px-8 lg:px-12 py-14 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-emerald-50/30 to-white overflow-hidden"
    >
      <FloatingElements />

      <div className="relative z-10 max-w-7xl mx-auto space-y-10 sm:space-y-14">
        {/* ── Section Header ── */}
        <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
          <div className="wsu-badge inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-widest shadow-xs border border-emerald-200/60">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {badgeText}
          </div>

          <h2 className="wsu-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {titleParts.highlight ? (
              <>
                {titleParts.before}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                    {titleParts.highlight}
                  </span>
                  <span className="absolute -bottom-1 left-0 w-full h-2 sm:h-2.5 bg-amber-300/50 rounded-full -rotate-1" />
                </span>
                {titleParts.after}
              </>
            ) : (
              titleText
            )}
          </h2>

          <p className="wsu-subtitle text-xs sm:text-sm font-medium text-slate-500 leading-relaxed max-w-lg mx-auto">
            {subtitleText}
          </p>
        </div>

        {/* ── Stats Counter Bar ── */}
        {stats.length > 0 && (
          <div className="stats-section">
            <StatsBar stats={stats} animated={statsAnimated} />
          </div>
        )}

        {/* ── Features Grid ── */}
        {features.length > 0 && (
          <div className="features-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} index={idx} />
            ))}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="wsu-cta flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-2">
          <a
            href={ctaLink}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs sm:text-sm rounded-full shadow-lg shadow-emerald-300/40 hover:shadow-emerald-400/50 hover:-translate-y-0.5 active:translate-y-0 transition-all group"
          >
            <Leaf className="w-4 h-4" />
            <span>{ctaText}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-[9px] font-black text-amber-800">
                A
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-[9px] font-black text-emerald-800">
                R
              </div>
              <div className="w-7 h-7 rounded-full bg-rose-200 border-2 border-white flex items-center justify-center text-[9px] font-black text-rose-800">
                P
              </div>
            </div>
            <span>{trustLineText}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
