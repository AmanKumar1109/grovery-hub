import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { MessageSquareWarning, Clock, CheckCircle2, ChevronRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyComplaints() {
  const { currentUser, userProfile } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    let unsubUser = () => {};
    let unsubPhone = () => {};
    const docsMap = new Map();

    const updateState = () => {
      const allDocs = Array.from(docsMap.values());
      setComplaints(allDocs.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
        const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
        return timeB - timeA;
      }));
      setIsLoading(false);
    };

    try {
      // Listen by userId
      const qUser = query(
        collection(db, 'complaints'),
        where('userId', '==', currentUser.uid)
      );
      unsubUser = onSnapshot(qUser, (snap) => {
        snap.docs.forEach(doc => {
          docsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        updateState();
      }, (err) => {
        console.error("Error listening to user complaints:", err);
      });

      // Also listen by phone number (for older complaints before userId was added)
      if (userProfile?.phone) {
        const qPhone = query(
          collection(db, 'complaints'),
          where('phone', '==', userProfile.phone)
        );
        unsubPhone = onSnapshot(qPhone, (snap) => {
          snap.docs.forEach(doc => {
            docsMap.set(doc.id, { id: doc.id, ...doc.data() });
          });
          updateState();
        }, (err) => {
          console.error("Error listening to phone complaints:", err);
        });
      } else {
        // if no phone, at least we will trigger a state update once if qUser was empty
        setTimeout(updateState, 500); 
      }
    } catch (err) {
      console.error("Error setting up complaint listeners:", err);
      setIsLoading(false);
    }

    return () => {
      unsubUser();
      unsubPhone();
    };
  }, [currentUser, userProfile]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">My Complaints</h1>
        <Link 
          to="/complaint"
          className="px-4 py-2 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors"
        >
          + New Complaint
        </Link>
      </div>

      {complaints.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquareWarning className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mb-2">No Complaints Yet</h2>
          <p className="text-sm font-bold text-slate-500 max-w-sm mx-auto">
            You haven't lodged any complaints. If you face any issues, feel free to report them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map(comp => (
            <div key={comp.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${comp.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
              
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md tracking-widest uppercase">
                      ID: {comp.id.slice(0,6)}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {comp.createdAt?.toDate().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-1">{comp.issueType || 'General Issue'}</h3>
                  <p className="text-sm font-semibold text-slate-600 line-clamp-2 leading-relaxed">
                    "{comp.description}"
                  </p>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 min-w-[120px]">
                  {comp.status === 'resolved' ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-extrabold">Resolved</span>
                    </div>
                  ) : comp.status === 'in_progress' ? (
                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                      <MessageCircle className="w-4 h-4 animate-pulse" />
                      <span className="text-xs font-extrabold">In Progress</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-extrabold">Pending</span>
                    </div>
                  )}
                </div>
              </div>

              {comp.adminReply && (
                <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    <MessageCircle className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-wider mb-1">Response from Support</h4>
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{comp.adminReply}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
