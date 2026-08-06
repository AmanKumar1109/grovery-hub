import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Bell, X, Package, Clock } from 'lucide-react';

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
      className="relative p-2.5 rounded-full bg-gray-100/80 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800 transition-colors cursor-pointer flex items-center justify-center"
      title="Notifications"
    >
      <Bell className="w-5 h-5 stroke-[2]" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white transform translate-x-1/4 -translate-y-1/4">
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
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
          
          {/* Main Panel Container (True Glassmorphism) */}
          <div ref={panelRef} className="relative w-full max-w-md h-full bg-white/70 backdrop-blur-2xl shadow-[-20px_0_40px_rgba(0,0,0,0.1)] border-l border-white/60 flex flex-col animate-in slide-in-from-right-full duration-500 ease-out overflow-hidden">
            
            {/* Ambient Animated Auroras (Trapped inside the panel) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
              <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[40%] bg-emerald-400/20 blur-[80px] rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
              <div className="absolute bottom-[20%] right-[-20%] w-[100%] h-[50%] bg-amber-400/15 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[40%] bg-orange-500/10 blur-[80px] rounded-full animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
            </div>

            {/* Premium Header */}
            <div className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-white/40 bg-white/40 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-white to-slate-50 flex items-center justify-center border border-white shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-50"></div>
                  <Bell className="w-5 h-5 text-emerald-500 fill-emerald-500/20 relative z-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent tracking-tight">Notifications</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Stay updated</p>
                </div>
              </div>
              <button onClick={() => setIsPanelOpen(false)} className="p-2.5 bg-white/60 hover:bg-white hover:scale-110 active:scale-95 shadow-sm border border-white/50 rounded-full transition-all cursor-pointer text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
              {allNotifications.length === 0 ? (
                <div className="text-center py-24 opacity-90 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="relative w-32 h-32 mx-auto bg-gradient-to-tr from-slate-100 to-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 border border-white">
                    <div className="absolute inset-0 rounded-full bg-emerald-100 blur-xl opacity-50"></div>
                    <Bell className="w-12 h-12 text-slate-300 relative z-10" />
                  </div>
                  <p className="text-xl font-black text-slate-800 tracking-tight">You're all caught up!</p>
                  <p className="text-xs font-bold text-slate-500 mt-2 max-w-[200px] mx-auto leading-relaxed">No new updates right now. We'll notify you here.</p>
                </div>
              ) : (
                allNotifications.map((notif, index) => {
                  const isNew = new Date(notif.timestamp).getTime() > lastSeenTime;
                  return (
                    <div 
                      key={notif.id} 
                      className={`relative p-5 rounded-[1.5rem] transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-6 group cursor-default ${
                        isNew 
                          ? 'bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.15)] hover:-translate-y-1' 
                          : 'bg-white/40 backdrop-blur-sm border border-white/40 shadow-sm hover:bg-white/60 hover:shadow-md hover:-translate-y-0.5'
                      }`}
                      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
                    >
                      {/* Glassmorphic Inner Highlight */}
                      <div className="absolute inset-0 rounded-[1.5rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] pointer-events-none"></div>

                      {/* New Status Indicator Glow */}
                      {isNew && (
                        <>
                          <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.8)] z-10"></div>
                          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none"></div>
                        </>
                      )}

                      {/* Left Gradient Border Line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isNew ? 'bg-gradient-to-b from-amber-400 via-orange-400 to-rose-400' : 'bg-gradient-to-b from-emerald-400 to-teal-500 opacity-50'}`}></div>
                      
                      <div className="pl-3 relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 ${isNew ? 'text-orange-500' : 'text-slate-500'}`}>
                            <div className={`p-1 rounded-md ${isNew ? 'bg-orange-100' : 'bg-slate-100'}`}>
                              <Package className={`w-3.5 h-3.5 ${isNew ? 'text-orange-500' : 'text-slate-400'}`} />
                            </div>
                            Order #{notif.id.slice(0,8)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mr-4 bg-slate-50/80 px-2 py-1 rounded-full border border-slate-100/50">
                            <Clock className="w-3 h-3" /> {formatTime(notif.timestamp)}
                          </span>
                        </div>
                        <p className={`text-[13.5px] font-bold leading-relaxed whitespace-pre-line ${isNew ? 'text-slate-800' : 'text-slate-600'}`}>
                          {notif.message}
                        </p>
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
        <div className="fixed top-5 right-5 z-[10000] bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-4 max-w-sm transition-all duration-300">
          <div className="text-2xl mt-0.5">🔔</div>
          <div className="flex-1">
            <h4 className="font-extrabold text-sm mb-1 text-emerald-400">New Update</h4>
            <p className="text-xs text-slate-200 font-medium leading-relaxed whitespace-pre-line">{notification}</p>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
