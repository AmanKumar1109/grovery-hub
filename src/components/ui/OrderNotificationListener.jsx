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
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div ref={panelRef} className="w-full max-w-sm h-full bg-slate-50 shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="bg-emerald-600 text-white p-5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 fill-white/20" />
                <h2 className="text-lg font-black tracking-wide">Notifications</h2>
              </div>
              <button onClick={() => setIsPanelOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {allNotifications.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                  <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-500">No notifications yet</p>
                  <p className="text-xs text-slate-400 mt-1">We'll notify you when your order updates</p>
                </div>
              ) : (
                allNotifications.map((notif) => (
                  <div key={notif.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400"></div>
                    <div className="flex items-center justify-between mb-2 pl-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Package className="w-3 h-3" /> Order #{notif.id.slice(0,8)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed pl-2 whitespace-pre-line">
                      {notif.message}
                    </p>
                  </div>
                ))
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
