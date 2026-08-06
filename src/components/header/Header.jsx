import React from 'react';
import TopHeader from './TopHeader';
import CategoryNav from './CategoryNav';
import SearchBar from '../ui/SearchBar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full shadow-md bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 transition-all duration-300">
      {/* Animated Glowing Mesh Background for Header */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute top-[-50%] left-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-400/30 blur-[60px]" style={{ transformOrigin: 'center center', animation: 'spin 15s linear infinite' }} />
        <div className="absolute top-[-20%] right-[5%] w-[300px] h-[300px] rounded-full bg-amber-400/30 blur-[50px]" style={{ transformOrigin: '20% 50%', animation: 'spin 20s linear infinite reverse' }} />
        <div className="absolute bottom-[-50%] left-[30%] w-[350px] h-[350px] rounded-full bg-lime-400/20 blur-[60px] animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="relative z-10">
        <TopHeader />
        {/* Mobile Search Bar - visible only on small screens */}
        <div className="lg:hidden px-4 pb-3 pt-1">
          <SearchBar />
        </div>
        <CategoryNav />
      </div>
      
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}
