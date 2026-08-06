import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, MessageSquare, CheckCircle2, Map, Star, Clock, Package, Truck, Check, ClipboardList, Home } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import OrderLiveMap from '../../components/OrderLiveMap';

export default function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const unsub = onSnapshot(doc(db, 'orders', id), (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        setOrder(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error listening to order:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (order && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.track-item', {
          x: -20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out'
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [order?.status]);

  const currentStatus = order?.status || 'Order Received';

  const getStatusStepIndex = (statusStr) => {
    switch (statusStr) {
      case 'Order Received':
      case 'Pending':
        return 1;
      case 'Packing':
      case 'Preparing':
        return 2;
      case 'Out for Delivery':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getStatusStepIndex(currentStatus);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-extrabold text-sm space-y-2">
        <Package className="w-8 h-8 text-amber-500 animate-bounce mx-auto" />
        <p>Loading real-time order status...</p>
      </div>
    );
  }

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
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Order #{order?.id || id}</h2>
                <p className="text-emerald-700 font-extrabold text-xs mt-1">
                  {currentStatus === 'Delivered' ? 'Delivered successfully 🎉' : '15-Minute Express Delivery 🛵'}
                </p>
              </div>
              <span className={`px-3.5 py-1 text-xs font-extrabold rounded-full shadow-sm ${
                currentStatus === 'Delivered'
                  ? 'bg-emerald-600 text-white'
                  : currentStatus === 'Cancelled'
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-400 text-slate-950'
              }`}>
                {currentStatus}
              </span>
            </div>

            <div className="relative pt-4 pb-4 space-y-0">
              {/* Progress Line */}
              <div className="absolute left-[1.5rem] sm:left-[2rem] top-10 bottom-16 w-0.5 border-l-[2px] border-dashed border-slate-200 z-0"></div>
              <div
                className="absolute left-[1.5rem] sm:left-[2rem] top-10 w-0.5 bg-emerald-500 z-0 transition-all duration-1000 origin-top shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                style={{ height: `${((currentStep - 1) / 3) * 100}%`, width: '2px' }}
              ></div>

              {[
                { step: 1, title: 'Order Received', desc: 'Order confirmed & synced with store', icon: ClipboardList },
                { step: 2, title: 'Packed with Care', desc: 'Items checked and packaged for dispatch', icon: Package },
                { step: 3, title: 'Out for Delivery', desc: 'Express delivery executive is in route', icon: Truck },
                { step: 4, title: 'Delivered', desc: 'Handed over to customer', icon: Home }
              ].map((s, idx) => {
                const Icon = s.icon;
                const isActive = currentStep === s.step;
                const isCompleted = currentStep > s.step;
                const isFuture = currentStep < s.step;

                return (
                  <div key={s.step} className={`track-item relative z-10 flex items-start gap-4 sm:gap-6 ${isFuture ? 'opacity-60 grayscale' : ''} ${idx !== 3 ? 'pb-10 sm:pb-12' : ''}`}>
                    <div className="relative shrink-0">
                      {isActive && (
                        <span className="absolute -inset-2 sm:-inset-2.5 rounded-full bg-amber-400/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] z-0"></span>
                      )}
                      <div className={`relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg border-[3px] border-white transition-all duration-500 ${
                        isActive ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 scale-110 rotate-3 shadow-amber-400/50'
                        : isCompleted ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/40'
                        : 'bg-slate-100 text-slate-400 shadow-none'
                      }`}>
                        <Icon className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.5]" />
                        {isCompleted && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`flex-1 pt-1.5 sm:pt-3 transition-all duration-500 ${isActive ? 'translate-x-2 sm:translate-x-3' : ''}`}>
                      <h4 className={`font-black text-base sm:text-xl tracking-tight transition-colors duration-300 ${isActive ? 'text-amber-600' : isCompleted ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {s.title}
                      </h4>
                      <p className={`text-xs sm:text-sm font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-slate-600' : isCompleted ? 'text-emerald-600/80' : 'text-slate-400'}`}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
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
                <h4 className="font-black text-slate-900 text-base truncate">
                  {order?.assignedPartnerName || 'Assigned Express Partner'}
                </h4>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 4.9 (1.4k deliveries)
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              {order?.assignedPartnerPhone ? (
                <>
                  <a href={`tel:${order.assignedPartnerPhone}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-amber-300/40 cursor-pointer">
                    <Phone className="w-4 h-4 stroke-[2.5]" /> Call Partner
                  </a>
                  <a href={`sms:${order.assignedPartnerPhone}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-2xl transition-colors cursor-pointer">
                    <MessageSquare className="w-4 h-4 stroke-[2.5]" /> Message
                  </a>
                </>
              ) : (
                <>
                  <button disabled className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-400 font-extrabold text-xs rounded-2xl cursor-not-allowed">
                    <Phone className="w-4 h-4 stroke-[2.5]" /> Call Partner
                  </button>
                  <button disabled className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-400 font-extrabold text-xs rounded-2xl cursor-not-allowed">
                    <MessageSquare className="w-4 h-4 stroke-[2.5]" /> Message
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Interactive Live Map Component */}
          <div className="track-item">
            <OrderLiveMap order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}
