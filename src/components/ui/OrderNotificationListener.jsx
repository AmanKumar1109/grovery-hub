import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Bell, X, Package, Clock, Activity } from 'lucide-react';

export default function OrderNotificationListener({ userId }) {
  const [lastNotificationTime, setLastNotificationTime] = useState(
    localStorage.getItem('lastGreetingTimestamp') || null
  );

  const [notification, setNotification] = useState(null);
  const [allNotifications, setAllNotifications] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [lastSeenTime, setLastSeenTime] = useState(
    parseInt(localStorage.getItem('notificationLastSeen')) || 0
  );
  const [portalTarget, setPortalTarget] = useState(null);
  const panelRef = useRef(null);

  const unreadCount = allNotifications.filter(
    (n) => new Date(n.timestamp).getTime() > lastSeenTime
  ).length;

  // robust portal target locator
  useEffect(() => {
    const checkTarget = () => {
      const el = document.getElementById('notification-bell-portal-target');
      if (el !== portalTarget) {
        setPortalTarget(el);
      }
    };
    
    checkTarget();
    
    const observer = new MutationObserver(checkTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, [portalTarget]);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sound function
  const playPingSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);

      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, 'orders'), where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const currentNotifications = [];
      snapshot.forEach(doc => {
        const orderData = doc.data();
        if (orderData.greetingMessage && orderData.greetingTimestamp) {
          currentNotifications.push({
            id: doc.id,
            message: orderData.greetingMessage,
            timestamp: orderData.greetingTimestamp,
            status: orderData.status
          });
        }
      });
      
      currentNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAllNotifications(currentNotifications);

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const orderData = change.doc.data();
          if (orderData.greetingMessage && orderData.greetingTimestamp) {
            if (lastNotificationTime !== orderData.greetingTimestamp) {
              
              setNotification(orderData.greetingMessage);
              playPingSound();

              setLastNotificationTime(orderData.greetingTimestamp);
              localStorage.setItem('lastGreetingTimestamp', orderData.greetingTimestamp);

              setTimeout(() => {
                setNotification(null);
              }, 6000);
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [userId, lastNotificationTime]);

  const handleOpenPanel = () => {
    setIsPanelOpen(true);
    const now = Date.now();
    setLastSeenTime(now);
    localStorage.setItem('notificationLastSeen', now.toString());
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const bellButton = (
    <button 
      onClick={handleOpenPanel}
      className="relative p-2.5 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-800 hover:text-black transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-slate-300"
      title="Notifications"
    >
      <Bell className="w-5 h-5 stroke-[2]" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white shadow-sm ring-2 ring-white transform translate-x-1/4 -translate-y-1/4">
          {unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* 1. Portal for Bell Button to TopHeader */}
      {portalTarget && createPortal(bellButton, portalTarget)}

      {/* 2. Notification Center Side Panel */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end items-center sm:p-4">
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsPanelOpen(false)}
          ></div>

          {/* Main Panel Container (Modern Floating Island) */}
          <div ref={panelRef} className="relative w-full max-w-[420px] h-full sm:h-[calc(100vh-2rem)] bg-white/90 backdrop-blur-xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 flex flex-col animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-6 flex items-center justify-between z-10 shrink-0 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1.25rem] bg-slate-100/50 flex items-center justify-center border border-slate-200/50 shadow-sm">
                  <Activity className="w-5 h-5 text-slate-900" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Notifications</h3>
                  <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-slate-400 mt-1.5">Stay updated</p>
                </div>
              </div>
              <button onClick={() => setIsPanelOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer text-slate-500 hover:text-slate-900">
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* List */}
            <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar bg-white/50">
              {allNotifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center pb-10">
                  <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Bell className="w-10 h-10 text-slate-300" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">No updates yet</h4>
                  <p className="text-sm font-medium text-slate-500 mt-2 max-w-[220px]">
                    We'll notify you here once there's an update.
                  </p>
                </div>
              ) : (
                allNotifications.map((notif, index) => {
                  const isNew = new Date(notif.timestamp).getTime() > lastSeenTime;
                  return (
                    <div 
                      key={notif.id} 
                      className={`relative p-5 rounded-[1.25rem] transition-all duration-300 border ${
                        isNew 
                          ? 'bg-slate-900 border-slate-800 shadow-xl shadow-slate-900/20' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 shrink-0 w-9 h-9 rounded-full flex items-center justify-center border ${isNew ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <Package className={`w-4 h-4 ${isNew ? 'text-slate-300' : 'text-slate-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-[11px] font-mono font-bold uppercase tracking-widest ${isNew ? 'text-slate-400' : 'text-slate-500'}`}>
                              Order #{notif.id.slice(0,8)}
                            </span>
                            <span className={`text-[11px] font-bold font-mono flex items-center gap-1 ${isNew ? 'text-emerald-400' : 'text-slate-400'}`}>
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(notif.timestamp)}
                            </span>
                          </div>
                          <p className={`text-[13px] font-bold leading-relaxed whitespace-pre-line ${isNew ? 'text-white' : 'text-slate-700'}`}>
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Auto-dismissing Toast Popup (Top Right) */}
      {notification && (
        <div className="fixed top-5 right-5 z-[10000] bg-slate-900 text-white px-5 py-4 rounded-[1.25rem] shadow-2xl border border-slate-700 flex items-start gap-4 max-w-sm transition-all duration-300">
          <div className="text-2xl mt-0.5">🔔</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-[11px] uppercase tracking-widest mb-1 text-emerald-400 font-mono">Incoming Update</h4>
            <p className="text-[13px] font-bold text-slate-200 leading-relaxed whitespace-pre-line">{notification}</p>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
