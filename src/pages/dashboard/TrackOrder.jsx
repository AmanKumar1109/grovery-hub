import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, MessageSquare, CheckCircle2, Map, Star, Clock, Package, Truck, Check } from 'lucide-react';
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
                  {currentStatus === 'Delivered' ? 'Delivered successfully 🎉' : 'Guaranteed 15-Minute Express Delivery 🛵'}
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

            <div className="relative pl-8 space-y-8">
              {/* Progress Line */}
              <div className="absolute left-3 top-2 bottom-6 w-0.5 bg-slate-100"></div>
              <div
                className="absolute left-3 top-2 w-0.5 bg-emerald-600 z-0 transition-all duration-700 origin-top"
                style={{ height: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>

              {/* Step 1: Order Placed */}
              <div className="track-item relative z-10">
                <div className={`absolute -left-11 top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                  currentStep >= 1 ? 'bg-emerald-600' : 'bg-slate-200'
                }`}>
                  <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">Order Received</h4>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Order confirmed & synced with store</p>
              </div>

              {/* Step 2: Packing */}
              <div className={`track-item relative z-10 ${currentStep < 2 ? 'opacity-50' : ''}`}>
                <div className={`absolute -left-11 top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                  currentStep >= 2 ? 'bg-emerald-600' : 'bg-slate-200'
                }`}>
                  <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">Packed with Care</h4>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Items checked and packaged for dispatch</p>
              </div>

              {/* Step 3: Out for Delivery */}
              <div className={`track-item relative z-10 ${currentStep < 3 ? 'opacity-50' : ''}`}>
                <div className={`absolute -left-11 top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                  currentStep >= 3 ? 'bg-emerald-600' : 'bg-slate-200'
                }`}>
                  <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">Out for Delivery</h4>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Express delivery executive is en route</p>
              </div>

              {/* Step 4: Delivered */}
              <div className={`track-item relative z-10 ${currentStep < 4 ? 'opacity-40' : ''}`}>
                <div className={`absolute -left-11 top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${
                  currentStep >= 4 ? 'bg-emerald-600' : 'bg-slate-200'
                }`}>
                  {currentStep >= 4 && <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />}
                </div>
                <h4 className="font-bold text-slate-900 text-base">Delivered</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Handed over to customer</p>
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
