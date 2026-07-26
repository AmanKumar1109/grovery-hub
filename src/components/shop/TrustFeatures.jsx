import React, { useEffect, useRef } from 'react';
import { Truck, ShieldCheck, Tag, RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const trustFeatures = [
  {
    icon: Truck,
    title: '15-Min Express Delivery',
    description: 'Lightning fast doorstep delivery guaranteed across all local zones.',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
  {
    icon: ShieldCheck,
    title: '100% Quality Guaranteed',
    description: 'Certified farm fresh produce inspected daily for quality and purity.',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    icon: Tag,
    title: 'Best Price Guaranteed',
    description: 'Direct farm sourcing ensures the lowest market rates and daily offers.',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
  {
    icon: RefreshCw,
    title: 'Hassle-Free Returns',
    description: '100% refund policy if you are not satisfied with any delivered product.',
    badgeColor: 'bg-slate-100 text-slate-800',
  },
];

export default function TrustFeatures() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = sectionRef.current.querySelectorAll('.trust-card');

      gsap.fromTo(
        cards,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 180%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Icons pop in after the card reveals
      const icons = sectionRef.current.querySelectorAll('.trust-icon');
      gsap.fromTo(
        icons,
        { scale: 0.5, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: 'back.out(1.7)',
          stagger: 0.1,
          delay: 0.25,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 160%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full px-4 sm:px-8 lg:px-12 py-10 bg-slate-50 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trustFeatures.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="trust-card bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div className={`trust-icon w-12 h-12 rounded-2xl ${feat.badgeColor} flex items-center justify-center`}>
                <Icon className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="text-base font-black text-slate-900">{feat.title}</h4>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">{feat.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
