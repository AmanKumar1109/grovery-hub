import React from 'react';
import TopHeader from './TopHeader';
import CategoryNav from './CategoryNav';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">
      <TopHeader />
      <CategoryNav />
    </header>
  );
}
