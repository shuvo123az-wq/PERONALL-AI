
import React from 'react';
import { UserPreferences } from '../types';
import { Settings, User, Globe, Target, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}

export default function Sidebar({ preferences, setPreferences }: SidebarProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({ ...prev, name: e.target.value }));
  };

  return (
    <aside className="w-72 bg-white border-r flex flex-col hidden lg:flex">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings size={20} className="text-rose-500" />
          সেটিংস
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <section className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <User size={14} /> প্রোফাইল
          </label>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">আপনার নাম:</p>
            <input 
              value={preferences.name}
              onChange={handleNameChange}
              placeholder="আপনার নাম লিখুন..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </section>

        <section className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Globe size={14} /> ভাষা
          </label>
          <div className="flex gap-2">
            {['Bangla', 'English'].map(lang => (
              <button
                key={lang}
                onClick={() => setPreferences(prev => ({ ...prev, language: lang as any }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  preferences.language === lang 
                    ? 'bg-rose-100 text-rose-600 border border-rose-200' 
                    : 'bg-slate-50 text-slate-500 border border-slate-100'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Target size={14} /> লক্ষ্য ও উদ্দেশ্য
          </label>
          <div className="space-y-2">
            {['মানসিক শান্তি', 'শেখা', 'উৎপাদনশীলতা'].map(goal => (
              <div key={goal} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700">
                <input type="checkbox" className="rounded border-slate-300 text-rose-500 focus:ring-rose-500" />
                {goal}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-rose-50 p-4 rounded-xl border border-rose-100 space-y-2">
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
            <ShieldCheck size={16} /> গোপনীয়তা ও সুরক্ষা
          </div>
          <p className="text-[11px] text-rose-400 leading-tight">
            আপনার তথ্য সুরক্ষিত আছে। মিত্রা একটি AI সহকারী, মানুষ নয়। এটি মানসিক সাপোর্টের জন্য ব্যবহার করা যেতে পারে তবে পেশাদার চিকিৎসার বিকল্প নয়।
          </p>
        </section>
      </div>

      <div className="p-6 border-t bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold">
            {preferences.name ? preferences.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{preferences.name || 'User'}</p>
            <p className="text-xs text-slate-500">ফ্রি মেম্বার</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
