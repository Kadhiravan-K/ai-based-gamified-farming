
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Sprout, Camera, X, Mic, Languages, Video, Volume2, Search, MapPin, BrainCircuit, Waves, Radio } from 'lucide-react';
import { Message, FarmProfile } from '../types';
import { getFarmingAdvice, connectLiveAdvisor, decode, decodeAudioData } from '../services/geminiService';

interface AIAdvisorProps {
  profile: FarmProfile;
  isOnline: boolean;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ profile, isOnline }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Namaste! I'm AgriBot Pro, your Digital Scientist. I fuse localized weather, soil metrics, and variety patterns to provide strategic human advice. Use "Live Field Mode" for hands-free voice assistance.` }
  ]);
  const [input, setInput] = useState('');
  const [media, setMedia] = useState<{ type: 'image' | 'video', data: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveSession = useRef<any>(null);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const startLiveMode = async () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContext.current;
    if (ctx.state === 'suspended') await ctx.resume();

    setIsLiveMode(true);
    
    liveSession.current = await connectLiveAdvisor({
      onopen: () => {
        console.log("Live linked.");
        setMessages(prev => [...prev, { role: 'model', text: "Voice Link Active. Speak freely to troubleshoot your field." }]);
      },
      onmessage: async (msg) => {
        const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audioData) {
          const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start();
        }
      },
      onerror: (e) => {
        console.error("Live Err:", e);
        setIsLiveMode(false);
      },
      onclose: () => setIsLiveMode(false),
    });
  };

  const stopLiveMode = () => {
    liveSession.current?.close();
    setIsLiveMode(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMedia({ type, data: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !media) || isTyping) return;

    const userMessage: Message = { 
      role: 'user', 
      text: input || (media ? `Analyze this ${media.type}` : ""),
      image: media?.type === 'image' ? media.data : undefined,
      video: media?.type === 'video' ? media.data : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setMedia(null);
    setIsTyping(true);

    try {
      const botMsg = await getFarmingAdvice([...messages, userMessage], profile);
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden relative">
      <div className="bg-slate-900 p-6 text-white flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg relative group overflow-hidden">
            <Bot className="w-7 h-7 text-white" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </div>
          <div>
            <h3 className="font-black text-base font-outfit uppercase tracking-tight">Digital Scientist</h3>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                {isLiveMode ? 'Multimodal Voice Active' : 'Neural Core Standby'}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={isLiveMode ? stopLiveMode : startLiveMode}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
            isLiveMode ? 'bg-red-500 text-white shadow-lg' : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isLiveMode ? <Radio className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
          {isLiveMode ? 'Disconnect' : 'Go Live'}
        </button>
      </div>

      {isLiveMode && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
           <div className="bg-emerald-600/90 backdrop-blur-xl px-6 py-3 rounded-full flex items-center gap-3 border border-emerald-400 shadow-2xl animate-bounce">
              <Waves className="w-5 h-5 text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Listening for Agri-Keywords...</span>
           </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[2rem] shadow-sm relative ${
              msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border text-slate-800 rounded-tl-none'
            }`}>
              {msg.image && <img src={msg.image} className="w-full max-h-64 object-cover rounded-2xl mb-4" alt="Plant diagnostic" />}
              <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLiveMode && (
          <div className="flex justify-center py-10">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-12 bg-emerald-500 rounded-full animate-[pulse_1s_infinite] opacity-80" />
              <div className="w-1.5 h-16 bg-emerald-400 rounded-full animate-[pulse_1.2s_infinite] opacity-90" />
              <div className="w-1.5 h-20 bg-emerald-300 rounded-full animate-[pulse_0.8s_infinite]" />
              <div className="w-1.5 h-16 bg-emerald-400 rounded-full animate-[pulse_1.5s_infinite] opacity-90" />
              <div className="w-1.5 h-12 bg-emerald-500 rounded-full animate-[pulse_1s_infinite] opacity-80" />
            </div>
          </div>
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border p-6 rounded-[2rem] flex items-center gap-4 animate-pulse">
              <BrainCircuit className="w-6 h-6 text-emerald-600" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fusing Grounded Intel...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t space-y-4">
        <div className="flex gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-slate-50 border rounded-2xl text-slate-500 hover:text-emerald-600 transition-colors">
            <Camera className="w-6 h-6" />
          </button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'image')} />
          
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything... (e.g. spray schedule for wheat)" 
            className="flex-1 px-6 py-5 bg-slate-50 border rounded-[1.5rem] outline-none text-sm font-medium focus:border-emerald-500 transition-colors"
          />

          <button onClick={handleSend} disabled={isTyping || (!input && !media)} className="bg-slate-900 text-white px-6 rounded-2xl hover:bg-emerald-600 disabled:opacity-30 transition-all shadow-lg active:scale-95">
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
