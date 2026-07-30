import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/header/Header';
import Footer from '../components/shop/Footer';
import { Shield, Loader2, FileText, ChevronRight, LockKeyhole } from 'lucide-react';

export default function termsOfServicePage() {
  const [content, setContent] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPolicy() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'termsOfService'));
        if (snap.exists()) {
          const data = snap.data();
          setContent(data.content || '');
          if (data.updatedAt) {
            setLastUpdated(data.updatedAt.toDate());
          }
        }
      } catch (err) {
        console.error('Failed to fetch Terms of Service:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPolicy();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-200 selection:text-emerald-950">
      <Header />

      <main className="flex-1 w-full pb-20">
        {/* Modern Hero Section */}
        <div className="relative pt-24 pb-36 lg:pt-32 lg:pb-48 overflow-hidden bg-slate-950">
          {/* Abstract Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[70%] rounded-full bg-emerald-600/20 blur-[120px]"></div>
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-teal-500/20 blur-[100px]"></div>
            <div className="absolute bottom-0 left-[20%] w-[60%] h-[40%] rounded-full bg-amber-500/10 blur-[80px]"></div>
            {/* Subtle dot pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')]"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-6 backdrop-blur-md">
              <LockKeyhole className="w-3.5 h-3.5" /> Security & Trust
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Our Rules & <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Agreements
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              At The Grocery Hub, we are committed to protecting your personal information. 
              Here is everything you need to know about how we manage your data.
            </p>
          </div>
        </div>

        {/* Content Container - Overlapping the Hero */}
        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 lg:-mt-32">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            
            {/* Top Bar for Last Updated */}
            <div className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100 px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                Terms of Service Document
              </div>
              {lastUpdated && (
                <div className="text-[11px] font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Last Updated: <span className="text-slate-600">{lastUpdated.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="px-6 sm:px-12 lg:px-16 py-10 sm:py-16 min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-200 rounded-full blur animate-pulse"></div>
                    <Loader2 className="relative w-10 h-10 text-emerald-500 animate-spin" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Loading Policy...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-red-50 rounded-3xl border border-red-100">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Shield className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-black text-red-700">Unable to load</h3>
                  <p className="text-sm font-medium text-red-500 max-w-xs">There was an error fetching the Terms of Service. Please try again later.</p>
                </div>
              ) : !content ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-700 mt-2">No Policy Published</h3>
                  <p className="text-sm text-slate-500">The Terms of Service document has not been published yet.</p>
                </div>
              ) : (
                <div
                  className="terms-of-service-render"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Content rendering styles */}
      <style>{`
        .terms-of-service-render {
          color: #334155;
          font-size: 1rem;
          line-height: 1.8;
        }
        
        .terms-of-service-render h1, 
        .terms-of-service-render h2, 
        .terms-of-service-render h3 {
          color: #0f172a;
          font-family: inherit;
        }

        .terms-of-service-render h1 {
          font-size: 2.25rem;
          font-weight: 900;
          letter-spacing: -0.025em;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          line-height: 1.2;
        }
        
        .terms-of-service-render h2 {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.015em;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f1f5f9;
          position: relative;
        }
        
        /* Green indicator bar under h2 */
        .terms-of-service-render h2::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 60px;
          height: 2px;
          background: #10b981;
          border-radius: 2px;
        }

        .terms-of-service-render h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .terms-of-service-render h3::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
        }

        .terms-of-service-render p {
          margin-bottom: 1.25rem;
          color: #475569;
        }

        .terms-of-service-render ul, 
        .terms-of-service-render ol {
          margin-top: 1rem;
          margin-bottom: 1.5rem;
          padding-left: 0;
          list-style: none;
        }

        .terms-of-service-render li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 0.85rem;
          color: #475569;
        }

        /* Custom list bullets */
        .terms-of-service-render ul li::before {
          content: '';
          position: absolute;
          left: 0.25rem;
          top: 0.65rem;
          width: 0.45rem;
          height: 0.45rem;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 4px #ecfdf5;
        }

        /* Custom ordered list numbers */
        .terms-of-service-render ol {
          counter-reset: policy-counter;
        }
        .terms-of-service-render ol li {
          padding-left: 2.25rem;
        }
        .terms-of-service-render ol li::before {
          counter-increment: policy-counter;
          content: counter(policy-counter);
          position: absolute;
          left: 0;
          top: 0.25rem;
          width: 1.35rem;
          height: 1.35rem;
          background-color: #ecfdf5;
          color: #059669;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .terms-of-service-render blockquote {
          position: relative;
          margin: 2rem 0;
          padding: 1.5rem 1.5rem 1.5rem 3.5rem;
          background: linear-gradient(to right, #f0fdf4, #ffffff);
          border-left: 4px solid #10b981;
          border-radius: 0 1rem 1rem 0;
          color: #065f46;
          font-style: italic;
          font-weight: 500;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }
        
        .terms-of-service-render blockquote::before {
          content: '"';
          position: absolute;
          left: 1rem;
          top: -0.5rem;
          font-size: 5rem;
          color: #a7f3d0;
          font-family: Georgia, serif;
          line-height: 1;
        }

        .terms-of-service-render a {
          color: #059669;
          text-decoration: none;
          font-weight: 700;
          position: relative;
          transition: all 0.2s ease;
        }
        
        .terms-of-service-render a::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 1.5px;
          bottom: -1px;
          left: 0;
          background-color: #059669;
          transform: scaleX(0);
          transform-origin: bottom right;
          transition: transform 0.3s ease-out;
        }
        
        .terms-of-service-render a:hover {
          color: #047857;
        }
        
        .terms-of-service-render a:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }

        .terms-of-service-render hr {
          border: none;
          height: 1px;
          background: linear-gradient(to right, transparent, #e2e8f0, transparent);
          margin: 3.5rem 0;
        }
        
        /* First element no top margin */
        .terms-of-service-render > :first-child {
          margin-top: 0;
        }
        
        /* Last element no bottom margin */
        .terms-of-service-render > :last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
