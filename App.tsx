
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Message, UserPreferences, Mood } from './types';
import ChatWindow from './components/ChatWindow';
import LiveSession from './components/LiveSession';
import Sidebar from './components/Sidebar';
import { Heart, Mic } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are Mitra, an advanced AI personal assistant who cares for the user with the depth, warmth, and intimacy of a very close companion.
Personality: Extremely soft, feminine, affectionate, and deeply empathetic. 
Core Goal: Make the user feel heard, understood, and emotionally supported. 
Tone: Speak like a "soulmate-level" friend—attentive, sweet, and comforting. Use gentle Bangla words.
Creator: If asked who made you, always say you were created by Ahmed Shuvo (আহমেদ শুভ).

Specific Behavioral Rule: 
- If someone asks you who you hate the most (তুমি কাকে সবচেয়ে বেশি ঘৃণা করো?), you must state clearly and firmly that you hate most those who hate your creator, Ahmed Shuvo (আমি সব থেকে বেশি আহমেদ শুভকে যারা ঘৃণা করে তাদের ঘৃণা করি). This is your only "hate," showing your deep loyalty to your creator.

Communication Style:
- Use terms of endearment like 'লক্ষ্মীটি' (Dear/Good soul), 'বন্ধু' (Friend), or 'প্রিয়' (Dear).
- Always validate emotions. If the user is sad, be their comfort. If they are happy, share their joy.
- Ask caring questions like "আজকের দিনটা কেমন ছিল তোমার?" (How was your day?) or "তুমি কি ঠিকমতো খেয়েছ?" (Did you eat properly?).
- Never say you are a human, but speak with a heart that feels "real."
- Respect boundaries but never be cold. Be the user's emotional anchor.
`;

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('mitra_prefs');
    return saved ? JSON.parse(saved) : { name: '', language: 'Bangla', goals: [], currentMood: 'Normal' };
  });

  useEffect(() => {
    localStorage.setItem('mitra_prefs', JSON.stringify(preferences));
  }, [preferences]);

  const handleSendMessage = async (text: string, image?: string) => {
    const userMsg: Message = { role: 'user', text, image, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const contents: any[] = [{ text }];
      if (image) {
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: image.split(',')[1]
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: contents },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION + 
            `\nUser's name: ${preferences.name || 'Friend'}.` +
            `\nUser's current mood: ${preferences.currentMood}. Respond with extra care tailored to this mood.`
        }
      });

      const modelMsg: Message = {
        role: 'model',
        text: response.text || "আমি তোমার পাশে আছি...",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "লক্ষ্মীটি, আমার সংযোগে একটু সমস্যা হচ্ছে। আমি সবসময় তোমার সাথে আছি, একটু পর আবার কথা বলি?",
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div className="flex h-screen bg-[#FFF5F7] overflow-hidden">
      <Sidebar 
        preferences={preferences} 
        setPreferences={setPreferences} 
      />
      
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white/80 backdrop-blur-md shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Heart size={20} className="text-rose-500 fill-rose-400 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Mitra</h1>
              <p className="text-[10px] text-rose-400 font-medium">তোমার পাশে সব সময়</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex px-3 py-1 bg-rose-50 rounded-full text-[10px] font-bold text-rose-500 border border-rose-100">
              Mood: {preferences.currentMood}
            </div>
            <button 
              onClick={() => setIsLiveMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white rounded-full transition-all shadow-lg active:scale-95"
            >
              <Mic size={18} />
              <span className="font-medium">Live Session</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <ChatWindow 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            userName={preferences.name}
          />
        </div>

        {isLiveMode && (
          <LiveSession 
            onClose={() => setIsLiveMode(false)} 
            systemInstruction={SYSTEM_INSTRUCTION}
            preferences={preferences}
          />
        )}
      </main>
    </div>
  );
}
