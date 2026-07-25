import React, { useRef, useEffect } from 'react';
import { ArrowLeft, Phone, MessageSquare, CheckCircle2, Map, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import gsap from 'gsap';

export default function TrackOrder() {
  const { id } = useParams();
  const containerRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.track-item', {
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.2)'
      });
      
      gsap.from('.progress-line', {
        height: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        delay: 0.2
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="pb-24 md:pb-8 space-y-6">
      <Link to="/dashboard/orders" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-extrabold text-xs transition-colors px-1">
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Left Col: Order Timeline */}
        <div className="flex-1">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Order {id || 'ORD-84321'}</h2>
                <p className="text-emerald-700 font-extrabold text-xs mt-1">Arriving today by 4:00 PM</p>
              </div>
              <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-extrabold rounded-full shadow-sm">
                Out for Delivery 🛵
              </span>
            </div>

            <div className="relative pl-8 space-y-8">
              {/* Progress Line */}
              <div className="absolute left-3 top-2 bottom-6 w-0.5 bg-slate-100"></div>
              <div className="progress-line absolute left-3 top-2 w-0.5 bg-emerald-600 z-0 h-[70%] origin-top"></div>

              {/* Step 1 */}
              <div className="track-item relative z-10">
                <div className="absolute -left-11 top-1 w-6 h-6 rounded-full bg-emerald-600 border-4 border-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">Order Placed & Verified</h4>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Today, 2:30 PM</p>
              </div>

              {/* Step 2 */}
              <div className="track-item relative z-10">
                <div className="absolute -left-11 top-1 w-6 h-6 rounded-full bg-emerald-600 border-4 border-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">Packed with Care</h4>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Today, 2:45 PM</p>
              </div>

              {/* Step 3 */}
              <div className="track-item relative z-10">
                <div className="absolute -left-[46px] top-0 w-8 h-8 rounded-full bg-amber-100 border-4 border-white flex items-center justify-center shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping absolute"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 relative"></div>
                </div>
                <h4 className="font-black text-slate-900 text-base text-amber-700">Out for Delivery</h4>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Rider is en route to your location.</p>
              </div>

              {/* Step 4 */}
              <div className="track-item relative z-10 opacity-40">
                <div className="absolute -left-11 top-1 w-6 h-6 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center"></div>
                <h4 className="font-bold text-slate-900 text-base">Delivered</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Expected: 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Rider & Map */}
        <div className="w-full md:w-80 space-y-4">
          <div className="track-item bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-900 mb-4 text-sm uppercase tracking-wider">Delivery Partner</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden border-2 border-amber-400 shadow-sm flex-shrink-0">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Rider" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-slate-900 text-base truncate">Ramesh Singh</h4>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 4.9 (1.4k deliveries)
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-amber-300/40 cursor-pointer">
                <Phone className="w-4 h-4 stroke-[2.5]" /> Call Rider
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-2xl transition-colors cursor-pointer">
                <MessageSquare className="w-4 h-4 stroke-[2.5]" /> Message
              </button>
            </div>
          </div>
          
          <div className="track-item bg-slate-900 rounded-3xl h-48 relative overflow-hidden flex items-center justify-center border border-slate-800 shadow-md">
            {/* Map Canvas Visual */}
            <Map className="w-10 h-10 text-slate-700 absolute" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-400/20 rounded-full animate-ping"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-amber-400 rounded-full border-4 border-slate-950 shadow-lg z-10 flex items-center justify-center">
              <div className="w-2 h-2 bg-slate-950 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
