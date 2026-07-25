import React from 'react';
import Header from '../components/header/Header';
import HeroSection from '../components/hero/HeroSection';

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Full width container without side paddings */}
      <main className="w-full bg-white overflow-hidden relative shadow-sm">
        {/* Navigation Header */}
        <Header />

        {/* Hero Section */}
        <HeroSection />
      </main>
    </div>
  );
}
