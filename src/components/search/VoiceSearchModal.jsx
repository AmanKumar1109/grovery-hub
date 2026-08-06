import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mic, MicOff, X, Loader2, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';

/**
 * VoiceSearchModal — Premium voice search UI with GSAP animations.
 * Shows animated microphone, real-time transcript, and status feedback.
 */
export default function VoiceSearchModal({
  isOpen,
  onClose,
  isListening,
  transcript,
  status,
  error,
  onStart,
  onStop,
  onRetry,
}) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const micRef = useRef(null);
  const ripple1Ref = useRef(null);
  const ripple2Ref = useRef(null);
  const ripple3Ref = useRef(null);

  // GSAP entrance animation
  useEffect(() => {
    if (!isOpen || !overlayRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(contentRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
      );
      // Stagger animate children
      gsap.fromTo(contentRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, delay: 0.1, ease: 'power2.out' }
      );
    });

    return () => ctx.revert();
  }, [isOpen]);

  // GSAP ripple animation while listening
  useEffect(() => {
    if (!isListening) return;
    const refs = [ripple1Ref, ripple2Ref, ripple3Ref];
    const timelines = [];

    refs.forEach((ref, i) => {
      if (!ref.current) return;
      const tl = gsap.timeline({ repeat: -1, delay: i * 0.4 });
      tl.fromTo(ref.current,
        { scale: 1, opacity: 0.6, borderWidth: 2 },
        { scale: 2.8, opacity: 0, borderWidth: 0, duration: 2, ease: 'power2.out' }
      );
      timelines.push(tl);
    });

    return () => timelines.forEach(tl => tl.kill());
  }, [isListening]);

  // Mic bounce when listening
  useEffect(() => {
    if (!isListening || !micRef.current) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(micRef.current, { scale: 1.1, duration: 0.8, ease: 'sine.inOut' });
    return () => tl.kill();
  }, [isListening]);

  if (!isOpen) return null;

  const statusText = {
    idle: 'Tap mic to speak',
    listening: 'Listening...',
    processing: 'Processing...',
    error: error || 'Something went wrong',
  };

  const statusColor = {
    idle: 'text-slate-500',
    listening: 'text-emerald-500',
    processing: 'text-amber-500',
    error: 'text-rose-500',
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with strong blur and subtle gradient */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl bg-gradient-to-br from-slate-900/40 to-slate-800/20"
        onClick={onClose}
      />

      {/* Premium Glassmorphic Content */}
      <div
        ref={contentRef}
        className="relative bg-white/95 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] w-full max-w-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-8 sm:p-10 flex flex-col items-center gap-7 overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-400/20 rounded-full blur-[40px] pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center relative z-10">
          <h3 className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight">Voice Search</h3>
          <p className="text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-widest">English or Hindi</p>
        </div>

        {/* Mic Button with Glowing Ripples */}
        <div className="relative flex items-center justify-center w-40 h-40 mt-2">
          {/* Ripple rings */}
          {isListening && (
            <>
              <div ref={ripple1Ref} className="absolute inset-0 rounded-full border border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] pointer-events-none" />
              <div ref={ripple2Ref} className="absolute inset-0 rounded-full border border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] pointer-events-none" />
              <div ref={ripple3Ref} className="absolute inset-0 rounded-full border border-emerald-200 pointer-events-none" />
            </>
          )}

          {/* Main mic button */}
          <button
            ref={micRef}
            onClick={isListening ? onStop : onStart}
            className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
              isListening
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_10px_30px_rgba(52,211,153,0.4)] scale-105'
                : status === 'error'
                  ? 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-[0_10px_30px_rgba(244,63,94,0.4)]'
                  : 'bg-gradient-to-br from-slate-800 to-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.3)] hover:shadow-[0_15px_40px_rgba(15,23,42,0.4)] hover:-translate-y-1'
            }`}
          >
            {status === 'processing' ? (
              <Loader2 className="w-12 h-12 text-white/90 animate-spin" />
            ) : isListening ? (
              <Mic className="w-12 h-12 text-white drop-shadow-md" />
            ) : status === 'error' ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>
        </div>

        {/* Transcript Area (Glassmorphic) */}
        {transcript && (
          <div className="w-full text-center bg-slate-50/60 backdrop-blur-sm rounded-2xl px-6 py-5 border border-slate-200/60 shadow-inner relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">You said</p>
            <p className="text-lg font-black text-slate-800 leading-tight">{transcript}</p>
          </div>
        )}

        {/* Status indicator */}
        <div className={`flex items-center justify-center gap-2.5 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 ${statusColor[status]} relative z-10`}>
          {status === 'listening' && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          )}
          {status === 'processing' && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {status === 'error' && (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span className="text-sm font-black tracking-wide">{statusText[status]}</span>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 mt-2 relative z-10">
          {status === 'error' && (
            <button
              onClick={onRetry || onStart}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 text-white text-sm font-black rounded-xl transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              Try Again
            </button>
          )}
          {/* Explicit Cancel/Exit Button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-sm font-black rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
