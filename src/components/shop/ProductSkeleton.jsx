import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-3 sm:p-4 shadow-sm flex flex-col justify-between overflow-hidden animate-pulse h-full">
      {/* Product Image Placeholder */}
      <div>
        <div className="h-36 sm:h-52 w-full bg-slate-200 rounded-xl sm:rounded-2xl mb-3 sm:mb-4"></div>

        {/* Rating Placeholder */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
          <div className="w-8 h-3 bg-slate-200 rounded"></div>
          <div className="w-12 h-3 bg-slate-200 rounded"></div>
        </div>

        {/* Title Placeholder */}
        <div className="w-full h-4 sm:h-5 bg-slate-200 rounded mb-2"></div>
        <div className="w-2/3 h-4 sm:h-5 bg-slate-200 rounded mb-4"></div>

        {/* Unit Placeholder */}
        <div className="w-1/3 h-3 sm:h-4 bg-slate-200 rounded mb-4"></div>
      </div>

      {/* Pricing & Add to Cart Placeholder */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-end gap-2 mb-3">
          <div className="w-16 h-5 sm:h-6 bg-slate-200 rounded"></div>
          <div className="w-12 h-3 sm:h-4 bg-slate-200 rounded"></div>
        </div>

        {/* Button Placeholder */}
        <div className="w-full h-9 sm:h-12 bg-slate-200 rounded-xl sm:rounded-2xl mt-1"></div>
      </div>
    </div>
  );
}
