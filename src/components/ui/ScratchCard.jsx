import React, { useState, useRef, useEffect } from 'react';
import { functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import gsap from 'gsap';
import { Loader2, Gift, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ScratchCard({ card }) {
  const [isRevealed, setIsRevealed] = useState(card.status === 'SCRATCHED' || card.status === 'COUPON_GENERATED');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useCart();
  
  const containerRef = useRef(null);
  const overlayRef = useRef(null);

  const handleReveal = async () => {
    if (isRevealed || isProcessing || card.status !== 'AVAILABLE') return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // Call secure backend function
      const scratchCardUnlock = httpsCallable(functions, 'scratchCardUnlock');
      const result = await scratchCardUnlock({ scratchCardId: card.id });
      
      const { status, couponId, rewardAmount } = result.data;
      
      if (status === 'success' || status === 'already_scratched') {
        // Animate overlay away
        gsap.to(overlayRef.current, {
          scale: 1.1,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => setIsRevealed(true)
        });
        
        gsap.fromTo(containerRef.current, 
          { scale: 0.95 }, 
          { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }
        );

        if (status === 'success') {
          showToast(`🎉 You unlocked a ₹${rewardAmount} OFF coupon!`);
        }
      } else {
        throw new Error('Failed to unlock');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (card.status === 'EXPIRED') {
    return (
      <div className="relative aspect-[1.6] rounded-3xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-6 text-center opacity-70">
        <Gift className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Expired</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative aspect-[1.6] rounded-3xl overflow-hidden cursor-pointer shadow-sm transition-shadow hover:shadow-md ${isRevealed ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-100'}`}
      onClick={handleReveal}
    >
      {/* Revealed State (Underneath) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3 shadow-inner">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Coupon Unlocked</p>
        <h4 className="text-3xl font-black text-slate-900">₹{card.rewardAmount} OFF</h4>
      </div>

      {/* Unrevealed Overlay (On Top) */}
      {!isRevealed && (
        <div 
          ref={overlayRef}
          className="absolute inset-0 z-10 bg-gradient-to-br from-amber-400 to-amber-500 flex flex-col items-center justify-center p-6 text-center text-amber-950"
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-bold uppercase tracking-wider">Unlocking...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 transform transition-transform hover:scale-105">
              <Gift className="w-10 h-10 mb-1 drop-shadow-sm" />
              <p className="text-sm font-black uppercase tracking-wider drop-shadow-sm">Tap to Reveal</p>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Mystery Reward</p>
            </div>
          )}
          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-50 text-red-700 text-[10px] font-bold p-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
