import React from 'react';
import TopHeader from './TopHeader';
import CategoryNav from './CategoryNav';
import SearchBar from '../ui/SearchBar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full shadow-sm bg-white">
      <TopHeader />
      {/* Mobile Search Bar - visible only on small screens */}
      <div className="lg:hidden px-4 pb-3 pt-1">
        <SearchBar />
      </div>
      <CategoryNav />
    </header>
  );
}
