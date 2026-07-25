import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function CategoryNav() {
  const navLinks = [
    { name: 'Home', hasDropdown: true, active: true },
    { name: 'Shop', hasDropdown: true },
    { name: 'Hot Sale', hasDropdown: true },
    { name: 'Vendor', hasDropdown: true },
    { name: 'Our Blog', hasDropdown: true },
  ];

  return (
    <div className="flex items-center gap-8 px-4 sm:px-8 lg:px-12 py-3 bg-white border-b border-gray-100 w-full">
      {/* Category Dropdown Pill */}
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 font-semibold text-xs hover:bg-emerald-100 transition-colors shadow-sm"
      >
        <span>All Categories</span>
        <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
      </button>

      {/* Main Navigation Links */}
      <nav className="flex items-center gap-6">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href="#"
            className={`flex items-center gap-1 text-xs font-semibold transition-colors duration-150 ${
              link.active
                ? 'text-emerald-700 font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{link.name}</span>
            {link.hasDropdown && (
              <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
            )}
          </a>
        ))}
      </nav>
    </div>
  );
}
