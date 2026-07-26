import React, { useEffect, useRef } from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reviews = [
  {
    id: 1,
    name: 'Aisha Rahman',
    location: 'Green Park, Mumbai',
    rating: 5,
    comment: 'The vegetables arrived in 12 minutes! Incredibly fresh organic spinach and tomatoes. Highly recommended!',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    itemBought: 'Fresh Organic Farm Vegetables',
  },
  {
    id: 2,
    name: 'Rahul Sharma',
    location: 'Andheri West, Mumbai',
    rating: 5,
    comment: 'Best price on fresh milk and free range eggs. The app dashboard makes order tracking so smooth!',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    itemBought: 'Daily Dairy & Bakery Combo',
  },
  {
    id: 3,
    name: 'Priya Nair',
    location: 'Bandra, Mumbai',
    rating: 5,
    comment: '100% Halal certified chicken and organic fruits delivered with zero hassle. Truly premium service!',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    itemBought: 'Fresh Halal Chicken & Fruit Basket',
  },
];

export default function Testimonials() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });

      // Section heading
      tl.fromTo(
        '.testimonials-heading',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55 }
      );

      // Subtitle
      tl.fromTo(
        '.testimonials-subtitle',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45 },
        '-=0.25'
      );

      // Review cards stagger
      tl.fromTo(
        '.review-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.12 },
        '-=0.2'
      );

      // Stars pop in
      tl.fromTo(
        '.review-star',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.7)', stagger: 0.03 },
        '-=0.3'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full px-4 sm:px-8 lg:px-12 py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="testimonials-heading">
            <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Happy Shoppers</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Loved By 25,000+ Customers 🌟
            </h2>
          </div>
          <p className="testimonials-subtitle text-xs sm:text-sm font-medium text-slate-500">
            Real feedback from verified buyers who enjoy fresh organic groceries every day.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="review-card bg-slate-50/80 rounded-3xl p-6 border border-slate-200/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
            >
              <Quote className="w-8 h-8 text-amber-300 absolute top-4 right-4 opacity-50" />

              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="review-star w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-10 h-10 rounded-full object-cover border border-amber-300 shadow-xs"
                  />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                      {rev.name}
                      {rev.verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />}
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-400">{rev.location}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-full">
                  Verified Purchase
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
