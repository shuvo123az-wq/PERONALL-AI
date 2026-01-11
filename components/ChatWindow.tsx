
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
// Add missing Heart import
import { Send, Image as ImageIcon, Camera, X, Heart } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string, image?: string) => void;
  userName: string;
}

export default function ChatWindow({ messages, onSendMessage, userName }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !image) return;
    onSendMessage(input, image || undefined);
    setInput('');
    setImage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FF]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center animate-pulse">
              <Heart size={40} className="text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700">হ্যালো{userName ? `, ${userName}` : ''}!</h2>
            <p className="text-slate-500 max-w-sm">
              আমি মিত্রা। আজ আমি তোমাকে কীভাবে সাহায্য করতে পারি? তুমি চাইলে আমার সাথে বাংলায় কথা বলতে পারো।
            </p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-rose-500 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
            }`}>
              {msg.image && (
                <img src={msg.image} alt="Sent" className="rounded-lg mb-2 max-h-64 object-cover" />
              )}
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              <span className={`text-[10px] mt-1 block opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {image && (
            <div className="relative inline-block mb-2">
              <img src={image} className="h-20 w-20 object-cover rounded-lg border-2 border-rose-300" />
              <button 
                type="button" 
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-rose-200 transition-all">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-400 hover:text-rose-500 transition-colors"
            >
              <ImageIcon size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="এখানে লিখুন..."
              className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 py-1"
            />
            <button 
              disabled={!input.trim() && !image}
              className="text-rose-500 disabled:text-slate-300 hover:scale-110 transition-transform active:scale-95"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
