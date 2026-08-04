import React, { useEffect, useRef } from 'react';
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
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );
      gsap.fromTo(contentRef.current,
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
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
        { scale: 1, opacity: 0.5 },
        { scale: 2.5, opacity: 0, duration: 1.8, ease: 'power2.out' }
      );
      timelines.push(tl);
    });

    return () => timelines.forEach(tl => tl.kill());
  }, [isListening]);

  // Mic bounce when listening
  useEffect(() => {
    if (!isListening || !micRef.current) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(micRef.current, { scale: 1.08, duration: 0.6, ease: 'power1.inOut' });
    return () => tl.kill();
  }, [isListening]);

  if (!isOpen) return null;

  const statusText = {
    idle: 'Tap to speak',
    listening: 'Listening...',
    processing: 'Recognizing...',
    error: error || 'Something went wrong',
  };

  const statusColor = {
    idle: 'text-slate-400',
    listening: 'text-emerald-500',
    processing: 'text-amber-500',
    error: 'text-red-500',
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 sm:p-10 flex flex-col items-center gap-6"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Voice Search</h3>
          <p className="text-xs font-bold text-slate-400 mt-1">Speak in English or Hindi</p>
        </div>

        {/* Mic Button with Ripples */}
        <div className="relative flex items-center justify-center w-36 h-36">
          {/* Ripple rings */}
          {isListening && (
            <>
              <div ref={ripple1Ref} className="absolute inset-0 rounded-full border-2 border-emerald-400 pointer-events-none" />
              <div ref={ripple2Ref} className="absolute inset-0 rounded-full border-2 border-emerald-300 pointer-events-none" />
              <div ref={ripple3Ref} className="absolute inset-0 rounded-full border-2 border-emerald-200 pointer-events-none" />
            </>
          )}

          {/* Main mic button */}
          <button
            ref={micRef}
            onClick={isListening ? onStop : onStart}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
              isListening
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-300/50'
                : status === 'error'
                  ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-300/50'
                  : 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-400/30 hover:from-emerald-500 hover:to-emerald-700 hover:shadow-emerald-300/40'
            }`}
          >
            {status === 'processing' ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : isListening ? (
              <Mic className="w-10 h-10 text-white" />
            ) : status === 'error' ? (
              <MicOff className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="w-full text-center bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">You said:</p>
            <p className="text-base font-black text-slate-800">{transcript}</p>
          </div>
        )}

        {/* Status */}
        <p className={`text-sm font-black ${statusColor[status]} flex items-center gap-2`}>
          {status === 'listening' && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          {status === 'processing' && (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          {status === 'error' && (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          {statusText[status]}
        </p>

        {/* Retry button on error */}
        {status === 'error' && (
          <button
            onClick={onRetry || onStart}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
