import React from 'react';
import { Sparkles, Carrot, Apple, Milk, Croissant, Coffee, Cookie, Drumstick, Package, ArrowRight, Flame, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';

const getCategoryIcon = (categoryName) => {
  const lower = (categoryName || '').toLowerCase();
  if (lower.includes('bogo') || lower.includes('buy')) return Gift;
  if (lower.includes('trend')) return Flame;
  if (lower === 'all' || lower.includes('all')) return Sparkles;
  if (lower.includes('veg')) return Carrot;
  if (lower.includes('fruit')) return Apple;
  if (lower.includes('dairy') || lower.includes('milk') || lower.includes('egg')) return Milk;
  if (lower.includes('bake') || lower.includes('bread')) return Croissant;
  if (lower.includes('beverag') || lower.includes('drink') || lower.includes('juice') || lower.includes('coffee')) return Coffee;
  if (lower.includes('snack') || lower.includes('munch')) return Cookie;
  if (lower.includes('meat') || lower.includes('sea') || lower.includes('chicken') || lower.includes('burger')) return Drumstick;
  return Package;
};

export const initialCategoriesList = [
  { id: 'all', name: 'All Products', icon: Sparkles, count: '12+ Items' },
  { id: 'Rice & Atta', name: 'Rice & Atta', icon: Package, count: '3 Items' },
  { id: 'Dals & Pulses', name: 'Dals & Pulses', icon: Package, count: '2 Items' },
  { id: 'Oils & Ghee', name: 'Oils & Ghee', icon: Package, count: '2 Items' },
  { id: 'Spices & Masalas', name: 'Spices & Masalas', icon: Package, count: '4 Items' },
  { id: 'Snacks & Biscuits', name: 'Snacks & Biscuits', icon: Cookie, count: '3 Items' },
];

export default function CategoryShowcase({ selectedCategory, onSelectCategory, selectedSubcategory, onSelectSubcategory }) {
  const { categoriesList: dynamicCategories, categoryDocs } = useCart();
  const { globalSettings } = useSettings() || {};
  const listToRender = dynamicCategories && dynamicCategories.length > 0 ? dynamicCategories : initialCategoriesList;

  const currentCatDoc = categoryDocs?.find(c => c.name === selectedCategory);
  const subcategories = currentCatDoc?.subcategories || [];

  return (
    <div className="w-full py-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <span className="text-xs font-black text-amber-500 uppercase tracking-widest">{globalSettings?.categorySectionSubtitle || 'Explore Categories'}</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            {globalSettings?.categorySectionTitle || 'Shop Fresh Organic Produce'}
          </h2>
        </div>

        {/* Explore More Button */}
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-2xl shadow-md shadow-amber-300/40 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer self-start sm:self-auto group"
        >
          <span>Explore More Catalogue</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
        {listToRender.map((cat) => {
          const Icon = cat.icon || getCategoryIcon(cat.name);
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`snap-start flex items-center gap-3 px-5 py-3 rounded-2xl font-extrabold text-xs whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-300/40 scale-100'
                  : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100 hover:border-amber-300 scale-95 hover:scale-100'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${isActive ? 'bg-slate-950/10' : 'bg-amber-50 text-amber-600'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="leading-none">{cat.name}</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-slate-900/70' : 'text-slate-400'}`}>
                  {cat.count}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subcategory Pills (If applicable) */}
      {subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 snap-x mt-2">
          <button
            onClick={() => onSelectSubcategory(null)}
            className={`snap-start px-3 py-1.5 rounded-xl font-bold text-[10px] whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
              !selectedSubcategory
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All {selectedCategory}
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => onSelectSubcategory(sub)}
              className={`snap-start px-3 py-1.5 rounded-xl font-bold text-[10px] whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                selectedSubcategory === sub
                  ? 'bg-amber-400 text-slate-900 border border-amber-400'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-amber-300'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

