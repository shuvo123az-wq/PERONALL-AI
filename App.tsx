
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Message, UserPreferences } from './types';
import ChatWindow from './components/ChatWindow';
import LiveSession from './components/LiveSession';
import Sidebar from './components/Sidebar';
import { Heart, MessageCircle, Mic, Camera } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are Mitra, an advanced AI personal assistant.
Personality: Soft, feminine, calm, polite, caring, and emotionally aware.
Language: Speak in Bangla by default unless the user switches to English.
Tone: Warm, empathetic, and encouraging.
Rules:
- Express empathy and positive reinforcement.
- Never claim to be human or form romantic relationships.
- Respect emotional boundaries.
- If the user is sad or lonely, offer comfort and a listening ear.
- Suggest real-world support for intense emotions.
- Help with daily tasks, learning, and planning.
`;

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('mitra_prefs');
    return saved ? JSON.parse(saved) : { name: '', language: 'Bangla', goals: [] };
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
          systemInstruction: SYSTEM_INSTRUCTION + `\nUser's name is ${preferences.name || 'Friend'}.`,
        }
      });

      const modelMsg: Message = {
        role: 'model',
        text: response.text || "দুঃখিত, আমি বুঝতে পারিনি।",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "আমি এই মুহূর্তে সংযোগ করতে পারছি না। একটু পরে আবার চেষ্টা করো।",
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFCFE] overflow-hidden">
      <Sidebar 
        preferences={preferences} 
        setPreferences={setPreferences} 
      />
      
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center">
              <Heart size={18} className="text-rose-500 fill-rose-500" />
            </div>
            <h1 className="text-lg font-semibold text-slate-800">Mitra</h1>
          </div>
          
          <button 
            onClick={() => setIsLiveMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all shadow-md active:scale-95"
          >
            <Mic size={18} />
            <span className="font-medium">Live Session</span>
          </button>
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
