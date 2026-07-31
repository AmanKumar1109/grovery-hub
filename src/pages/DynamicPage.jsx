import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/header/Header';
import Footer from '../components/shop/Footer';
import { Loader2, ArrowLeft, Clock, FileText, ChevronRight, Home } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function DynamicPage({ documentId, title }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [readingTime, setReadingTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when loading a new dynamic page
    window.scrollTo(0, 0);
    
    async function fetchPage() {
      setLoading(true);
      try {
        const docRef = doc(db, 'settings', documentId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const htmlContent = data.content || '';
          setContent(htmlContent);
          
          // Calculate reading time (avg 200 words per minute)
          const textOnly = htmlContent.replace(/<[^>]+>/g, ' ');
          const wordCount = textOnly.trim().split(/\s+/).length;
          setReadingTime(Math.max(1, Math.ceil(wordCount / 200)));

          if (data.updatedAt) {
            setLastUpdated(data.updatedAt.toDate());
          }
        } else {
          setContent('<div class="text-center py-10"><p class="text-slate-500 font-medium">This document has not been published yet.</p></div>');
        }
      } catch (err) {
        console.error('Failed to load page content:', err);
        setContent('<p>Failed to load content. Please try again later.</p>');
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [documentId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-emerald-200 selection:text-emerald-900">
      <Header />

      <main className="flex-1 w-full relative pb-20">
        {/* Next-Level Hero Section */}
        <div className="absolute top-0 left-0 right-0 h-[320px] bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 overflow-hidden">
          {/* Abstract Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          {/* Glowing Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] translate-y-1/2"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-emerald-100/70 mb-8 tracking-wider uppercase">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white drop-shadow-md">{title}</span>
          </nav>

          {/* Document Header Info */}
          <div className="mb-10 text-white animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 drop-shadow-lg">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-100/80">
              {lastUpdated && (
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <FileText className="w-4 h-4 text-emerald-300" />
                  <span>Last Updated: {lastUpdated.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              {readingTime > 0 && (
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>{readingTime} min read</span>
                </div>
              )}
            </div>
          </div>

          {/* Floating Content Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-900/10 border border-slate-200/60 p-6 sm:p-10 lg:p-14 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 ease-out fill-mode-both">
            {/* Subtle decorative accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400"></div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 rounded-full"></div>
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin relative z-10" />
                </div>
                <p className="text-sm font-bold text-slate-400 animate-pulse tracking-wide uppercase">Preparing Document...</p>
              </div>
            ) : (
              <div 
                className="prose prose-slate sm:prose-lg max-w-none 
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-800 
                prose-p:font-medium prose-p:text-slate-600 prose-p:leading-relaxed 
                prose-a:font-bold prose-a:text-emerald-600 hover:prose-a:text-emerald-700 prose-a:underline-offset-4
                prose-strong:text-slate-900 prose-strong:font-black
                prose-li:text-slate-600 prose-li:marker:text-emerald-500
                prose-blockquote:border-l-emerald-500 prose-blockquote:bg-emerald-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-slate-700
                prose-img:rounded-2xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
