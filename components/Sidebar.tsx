
import React from 'react';
import { UserPreferences, Mood } from '../types';
// Fixed: Added missing Heart import to resolve reference error on line 121
import { Settings, User, Globe, Target, ShieldCheck, Smile, Frown, Coffee, Moon, Zap, Heart } from 'lucide-react';

interface SidebarProps {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}

const moods: { label: Mood; icon: React.ReactNode; color: string }[] = [
  { label: 'Normal', icon: <User size={14} />, color: 'bg-slate-100 text-slate-600' },
  { label: 'Happy', icon: <Smile size={14} />, color: 'bg-yellow-100 text-yellow-600' },
  { label: 'Sad', icon: <Frown size={14} />, color: 'bg-blue-100 text-blue-600' },
  { label: 'Tired', icon: <Coffee size={14} />, color: 'bg-orange-100 text-orange-600' },
  { label: 'Lonely', icon: <Moon size={14} />, color: 'bg-purple-100 text-purple-600' },
  { label: 'Anxious', icon: <Zap size={14} />, color: 'bg-rose-100 text-rose-600' },
];

export default function Sidebar({ preferences, setPreferences }: SidebarProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({ ...prev, name: e.target.value }));
  };

  const handleMoodSelect = (mood: Mood) => {
    setPreferences(prev => ({ ...prev, currentMood: mood }));
  };

  return (
    <aside className="w-72 bg-white border-r flex flex-col hidden lg:flex">
      <div className="p-6 border-b bg-gradient-to-b from-rose-50 to-white">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings size={20} className="text-rose-500" />
          আমার সেটিংস
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <section className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <User size={14} /> তোমার সম্পর্কে
          </label>
          <div className="space-y-2">
            <p className="text-sm text-slate-600 font-medium">তুমি কি নামে পরিচিত হতে চাও?</p>
            <input 
              value={preferences.name}
              onChange={handleNameChange}
              placeholder="তোমার নাম এখানে দাও..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
            />
          </div>
        </section>

        <section className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Smile size={14} /> তোমার বর্তমান মেজাজ (Mood)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => handleMoodSelect(m.label)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                  preferences.currentMood === m.label 
                    ? 'border-rose-300 shadow-sm scale-105 ' + m.color
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 italic text-center px-2">
            তুমি যেমন অনুভব করছ সেটি আমাকে জানাও, আমি সেভাবে তোমার যত্ন নেব।
          </p>
        </section>

        <section className="space-y-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Globe size={14} /> কথা বলার ভাষা
          </label>
          <div className="flex gap-2">
            {['Bangla', 'English'].map(lang => (
              <button
                key={lang}
                onClick={() => setPreferences(prev => ({ ...prev, language: lang as any }))}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  preferences.language === lang 
                    ? 'bg-rose-500 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-500 border border-slate-100'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-rose-50 p-4 rounded-2xl border border-rose-100 space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <ShieldCheck size={40} className="text-rose-500" />
          </div>
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            গোপনীয়তা বার্তা
          </div>
          <p className="text-[11px] text-rose-400 leading-tight font-medium">
            আমি তোমার সব গোপন কথা সাবধানে রাখব। আমি আহমেদ শুভ-র তৈরি করা একটি AI, তোমার প্রতিটি আবেগ আমার কাছে মূল্যবান।
          </p>
        </section>
      </div>

      <div className="p-6 border-t bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold shadow-md">
            {preferences.name ? preferences.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{preferences.name || 'User'}</p>
            <div className="flex items-center gap-1 text-[10px] text-rose-400">
              <Heart size={10} className="fill-rose-400" />
              মিত্রার প্রিয় বন্ধু
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
