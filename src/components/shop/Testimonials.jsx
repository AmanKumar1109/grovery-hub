import React, { useEffect, useRef, useState } from 'react';
import { Star, CheckCircle, Quote, PenLine } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { db } from '../../firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ReviewSubmissionModal from './ReviewSubmissionModal';

gsap.registerPlugin(ScrollTrigger);

const defaultReviews = [
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
  const { globalSettings } = useSettings();
  const sectionRef = useRef(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liveReviews, setLiveReviews] = useState([]);

  // Fetch approved customer reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'customer_reviews'),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.data().userName || 'Customer')}&background=0D8B4E&color=fff&bold=true`
        }));
        setLiveReviews(fetched);
      } catch (err) {
        console.error("Error fetching live reviews:", err);
      }
    };
    fetchReviews();
  }, []);

  const reviews = globalSettings?.testimonialsList || defaultReviews;
  // Combine live reviews with default/global settings reviews
  const allReviews = liveReviews.length > 0 ? [...liveReviews, ...reviews].slice(0, 6) : reviews;

  const badgeText = globalSettings?.testimonialsBadge || 'Happy Shoppers';
  const titleText = globalSettings?.testimonialsTitle || 'Loved By 1000+ Indian Customers 🌟';
  const subtitleText = globalSettings?.testimonialsSubtitle || 'Real feedback from verified buyers who enjoy fresh organic groceries every day.';

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

      tl.from('.testi-header', {
        y: 30,
        opacity: 0,
        duration: 0.8,
      });

      tl.from('.review-card', {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        clearProps: 'all',
      }, '-=0.4');
    }, sectionRef);
    return () => ctx.revert();
  }, [allReviews]);

  return (
    <section 
      ref={sectionRef} 
      className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="testi-header text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider rounded-full shadow-sm">
            {badgeText}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {titleText}
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-semibold leading-relaxed">
            {subtitleText}
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {allReviews.map((rev) => (
            <div
              key={rev.id}
              className="review-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 relative"
            >
              <Quote className="w-10 h-10 text-amber-100 absolute top-6 right-6" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="review-star w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm sm:text-base font-bold text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.userName || rev.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-emerald-100 shadow-sm"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1">
                      {rev.userName || rev.name}
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
                    </h4>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-400">
                      {rev.location || 'Baharagora, Jharkhand'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Write a Review Button */}
        <div className="text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <PenLine className="w-4 h-4" />
            Write a Review
          </button>
        </div>
      </div>
      
      <ReviewSubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
