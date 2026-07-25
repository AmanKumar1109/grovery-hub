import React, { useRef, useEffect } from 'react';
import { Bell, Moon, Shield, Lock, Globe, HelpCircle, Info, FileText, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

const settingGroups = [
  {
    title: 'Preferences',
    items: [
      { id: 'push-notifications', icon: Bell, label: 'Push Notifications', type: 'toggle', defaultChecked: true },
      { id: 'dark-mode', icon: Moon, label: 'Dark Mode', type: 'toggle', defaultChecked: false },
      { id: 'language', icon: Globe, label: 'Language', type: 'link', value: 'English (US)' },
    ]
  },
  {
    title: 'Security & Privacy',
    items: [
      { id: 'privacy', icon: Shield, label: 'Privacy Settings', type: 'link' },
      { id: 'password', icon: Lock, label: 'Change Password', type: 'link' },
    ]
  },
  {
    title: 'Support & Legal',
    items: [
      { id: 'help', icon: HelpCircle, label: 'Help & Support', type: 'link' },
      { id: 'about', icon: Info, label: 'About The Grocery Hub', type: 'link' },
      { id: 'terms', icon: FileText, label: 'Terms & Conditions', type: 'link' },
    ]
  }
];

export default function Settings() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.setting-group', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="pb-24 md:pb-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Manage app preferences and account security</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {settingGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="setting-group space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2">{group.title}</h3>
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isLast = itemIdx === group.items.length - 1;
                
                return (
                  <div key={item.id} className={`flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors ${!isLast ? 'border-b border-slate-100' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Icon className="w-5 h-5 stroke-[2]" />
                      </div>
                      <span className="font-extrabold text-slate-800 text-sm">{item.label}</span>
                    </div>
                    
                    {item.type === 'toggle' ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400 shadow-inner"></div>
                      </label>
                    ) : (
                      <div className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-700 transition-colors">
                        {item.value && <span className="text-xs font-extrabold text-slate-500">{item.value}</span>}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
