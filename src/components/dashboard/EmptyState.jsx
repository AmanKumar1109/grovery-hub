import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, description, actionText, actionLink }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white/60 backdrop-blur-xl border border-slate-100 rounded-3xl h-full min-h-[300px]">
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50">
        <Icon className="w-10 h-10 text-emerald-500 stroke-[1.5]" />
      </div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 font-medium mb-8 max-w-sm">{description}</p>
      {actionText && actionLink && (
        <Link 
          to={actionLink} 
          className="px-8 py-3 bg-[#facc15] hover:bg-[#eab308] text-slate-950 font-extrabold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
