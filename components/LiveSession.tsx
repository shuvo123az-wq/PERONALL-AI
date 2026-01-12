
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, encode, decodeAudioData } from '../utils/audio';
import { UserPreferences } from '../types';
// Fixed: Removed non-existent 'Waveform' export from 'lucide-react'
import { Mic, MicOff, X, Volume2 } from 'lucide-react';

interface LiveSessionProps {
  onClose: () => void;
  systemInstruction: string;
  preferences: UserPreferences;
}

export default function LiveSession({ onClose, systemInstruction, preferences }: LiveSessionProps) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    // Initializing GoogleGenAI inside useEffect to ensure it uses the latest process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const startSession = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              setIsActive(true);
              const source = audioContextRef.current!.createMediaStreamSource(stream);
              const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
                
                const pcmBlob = {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };
                
                // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`
                sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextRef.current!.destination);
              setIsListening(true);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.outputTranscription) {
                setTranscription(prev => prev + ' ' + message.serverContent?.outputTranscription?.text);
              }
              
              const audioBase64 = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audioBase64 && outputAudioContextRef.current) {
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                
                source.onended = () => sourcesRef.current.delete(source);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
              }

              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
              }

              if (message.serverContent?.turnComplete) {
                setTranscription('');
              }
            },
            onerror: (e) => console.error('Live API Error:', e),
            onclose: () => setIsActive(false),
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              // 'Zephyr' is selected for a clearer, sweeter, and more melodic female voice quality.
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: systemInstruction + `\nSpeak with a very sweet, soft, and human-like melodic tone. User's name is ${preferences.name || 'Friend'}.`,
            outputAudioTranscription: {},
          },
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error('Failed to start live session:', err);
        onClose();
      }
    };

    startSession();

    return () => {
      sessionRef.current?.close();
      audioContextRef.current?.close();
      outputAudioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-rose-500/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-in fade-in zoom-in duration-300">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X size={24} />
      </button>

      <div className="relative mb-12">
        <div className={`w-40 h-40 rounded-full bg-white/20 flex items-center justify-center transition-all duration-500 ${isListening ? 'scale-110 shadow-[0_0_50px_rgba(255,255,255,0.4)]' : ''}`}>
          <div className={`w-32 h-32 rounded-full bg-white flex items-center justify-center`}>
            {isActive ? (
              <div className="flex gap-1 items-center">
                {[1, 2, 3, 4, 5].map(i => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-rose-400 rounded-full animate-bounce" 
                    style={{ 
                      height: `${Math.random() * 40 + 20}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            ) : (
              <Mic size={48} className="text-rose-500 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-2">মিত্রা শুনছেন...</h2>
      <p className="text-white/80 text-lg max-w-md text-center">
        {isActive ? 'সাচ্ছন্দে কথা বলুন, আমি আপনার সাথে আছি।' : 'সংযোগ করা হচ্ছে...'}
      </p>

      {transcription && (
        <div className="mt-8 px-6 py-3 bg-white/10 rounded-xl max-w-xl text-center">
          <p className="italic text-white/90">{transcription}</p>
        </div>
      )}

      <div className="mt-auto flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="p-4 rounded-full bg-white/10">
            <Volume2 size={24} />
          </div>
          <span className="text-xs font-medium">অডিও</span>
        </div>
        
        <button 
          onClick={onClose}
          className="px-10 py-4 bg-white text-rose-500 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
        >
          সেশন শেষ করুন
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="p-4 rounded-full bg-white/10">
            <MicOff size={24} />
          </div>
          <span className="text-xs font-medium">মিউট</span>
        </div>
      </div>
    </div>
  );
}
