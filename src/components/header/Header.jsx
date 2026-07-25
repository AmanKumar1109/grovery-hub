import React from 'react';
import TopHeader from './TopHeader';
import CategoryNav from './CategoryNav';

export default function Header() {
  return (
    <header className="w-full">
      <TopHeader />
      <CategoryNav />
    </header>
  );
}
