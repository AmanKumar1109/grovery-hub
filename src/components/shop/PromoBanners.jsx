import React, { useEffect, useRef } from 'react';
import { ArrowRight, Zap, Leaf, Award } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSettings } from '../../context/SettingsContext';

gsap.registerPlugin(ScrollTrigger);

export default function PromoBanners() {
  const sectionRef = useRef(null);
  const { globalSettings } = useSettings();

  const defaultBanners = [
    { label: 'Daily Harvest', title: 'Organic Summer \\n Fruits Festival', subtitle: 'Flat 30% OFF on all fresh fruit baskets', buttonText: 'Shop Fruits', link: '#shop' },
    { label: 'Best Value Box', title: 'Organic Farm \\n Veggie Combo Box', subtitle: 'Hand-picked 7 essential veggies @ ₹199', buttonText: 'Claim Offer', link: '#shop' },
    { label: 'Instant Express', title: 'Superfast 15 Mins \\n Doorstep Delivery', subtitle: 'Zero delivery fee on orders over ₹199', buttonText: 'Order Now', link: '#shop' }
  ];
  
  const bannersData = globalSettings?.promoBanners || defaultBanners;

  const renderTitle = (titleText) => {
    if (!titleText) return '';
    const parts = titleText.split('\\n');
    return parts.map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i !== parts.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const banners = sectionRef.current.querySelectorAll('.promo-banner');

      gsap.fromTo(
        banners,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 155%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full px-4 sm:px-8 lg:px-12 py-8 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Banner 1: Organic Summer Fruits */}
        <div className="promo-banner bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl p-6 text-slate-950 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px] group">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>

          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-950 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              <Leaf className="w-3 h-3 text-amber-400" /> {bannersData[0]?.label || 'Daily Harvest'}
            </span>
            <h3 className="text-2xl font-black tracking-tight leading-tight">
              {renderTitle(bannersData[0]?.title || 'Organic Summer \\n Fruits Festival')}
            </h3>
            <p className="text-xs font-bold text-slate-900/80">{bannersData[0]?.subtitle || 'Flat 30% OFF on all fresh fruit baskets'}</p>
          </div>

          <a
            href={bannersData[0]?.link || '#shop'}
            className="relative z-10 inline-flex items-center gap-2 self-start px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-full transition-all shadow-md group-hover:translate-x-1"
          >
            <span>{bannersData[0]?.buttonText || 'Shop Fruits'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Banner 2: Farm Fresh Veggies Combo */}
        <div className="promo-banner bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px] group">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-400/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>

          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              <Award className="w-3 h-3" /> {bannersData[1]?.label || 'Best Value Box'}
            </span>
            <h3 className="text-2xl font-black tracking-tight leading-tight text-white">
              {renderTitle(bannersData[1]?.title || 'Organic Farm \\n Veggie Combo Box')}
            </h3>
            <p className="text-xs font-medium text-emerald-100">{bannersData[1]?.subtitle || 'Hand-picked 7 essential veggies @ ₹199'}</p>
          </div>

          <a
            href={bannersData[1]?.link || '#shop'}
            className="relative z-10 inline-flex items-center gap-2 self-start px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-full transition-all shadow-md group-hover:translate-x-1"
          >
            <span>{bannersData[1]?.buttonText || 'Claim Offer'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Banner 3: Superfast 15 Min Delivery */}
        <div className="promo-banner bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px] group border border-slate-800">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-500/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>

          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-white" /> {bannersData[2]?.label || 'Instant Express'}
            </span>
            <h3 className="text-2xl font-black tracking-tight leading-tight text-white">
              {renderTitle(bannersData[2]?.title || 'Superfast 15 Mins \\n Doorstep Delivery')}
            </h3>
            <p className="text-xs font-medium text-slate-400">{bannersData[2]?.subtitle || 'Zero delivery fee on orders over ₹199'}</p>
          </div>

          <a
            href={bannersData[2]?.link || '#shop'}
            className="relative z-10 inline-flex items-center gap-2 self-start px-5 py-2.5 bg-white hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-full transition-all shadow-md group-hover:translate-x-1"
          >
            <span>{bannersData[2]?.buttonText || 'Order Now'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
