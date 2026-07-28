import React, { useEffect, useRef } from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reviews = [
  {
    id: 1,
    name: 'Abhijeet Ghosh',
    location: 'Baharagora, Jharkhand',
    rating: 5,
    comment: 'Mahine bhar ka ration ab main yahi se mangwati hu. Atta, dal aur masale sab ekdum badhiya quality ke hote hain aur delivery bhi fast hai.',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=150',
    itemBought: 'Monthly Grocery Combo',
  },
  {
    id: 2,
    name: 'Aman Kumar',
    location: 'Baharagora, Jharkhand',
    rating: 5,
    comment: 'Ghar ke saare kirane ka saaman yahan asani se mil jata hai. Chawal aur tel ka price market se sasta hai aur packing bhi bohot acchi hoti hai.',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    itemBought: 'Premium Rice & Cooking Oil',
  },
  {
    id: 3,
    name: 'Aparna',
    location: 'Baharagora, Jharkhand',
    rating: 5,
    comment: 'Pehli baar online grocery order ki thi, aur experience bahut accha raha. Sabhi grocery items sahi salamat aur bilkul time par mil gaye.',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    itemBought: 'Daily Household Groceries',
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
          start: 'top 155%',
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
              Loved By 1000+ Indian Customers 🌟
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
