
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Sprout, Camera, X, Mic, Languages, Video, Volume2, Search, MapPin } from 'lucide-react';
import { Message, FarmProfile } from '../types';
import { getFarmingAdvice, generateSpeech, transcribeAudio, findNearbyResources } from '../services/geminiService';

interface AIAdvisorProps {
  profile: FarmProfile;
  isOnline: boolean;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ profile, isOnline }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Namaste! I'm AgriBot Pro. I can analyze images, videos, and find nearby resources. How can I help with your ${profile.crops[0]} today?` }
  ]);
  const [input, setInput] = useState('');
  const [media, setMedia] = useState<{ type: 'image' | 'video', data: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMedia({ type, data: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];
    mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const text = await transcribeAudio(base64);
        if (text) setInput(text);
      };
      reader.readAsDataURL(blob);
    };
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const playResponse = async (text: string, id: number) => {
    setIsPlaying(id.toString());
    const audioData = await generateSpeech(text);
    if (audioData) {
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audio.onended = () => setIsPlaying(null);
      audio.play();
    } else {
      setIsPlaying(null);
    }
  };

  const handleNearbySearch = async () => {
    if (!input.trim()) return;
    setIsTyping(true);
    const userMsg: Message = { role: 'user', text: `Find nearby: ${input}` };
    setMessages(prev => [...prev, userMsg]);
    
    // Default coords if location fails
    const lat = 30.7333; 
    const lon = 76.7794;
    
    const result = await findNearbyResources(input, lat, lon);
    setMessages(prev => [...prev, { role: 'model', text: result }]);
    setIsTyping(false);
    setInput('');
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

    const botMsg = await getFarmingAdvice([...messages, userMessage], profile);
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm font-outfit">AgriBot Pro Intelligence</h3>
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Thinking Mode Active</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><Languages className="w-5 h-5" /></button>
          <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><Sparkles className="w-5 h-5 text-yellow-400" /></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm relative group ${
              msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border text-slate-800 rounded-tl-none'
            }`}>
              {msg.image && <img src={msg.image} className="w-full max-h-48 object-cover rounded-xl mb-3 border border-white/20" />}
              {msg.video && <video src={msg.video} controls className="w-full max-h-48 rounded-xl mb-3" />}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              
              {msg.role === 'model' && (
                <button 
                  onClick={() => playResponse(msg.text, i)}
                  className={`mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isPlaying === i.toString() ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'}`}
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlaying === i.toString() ? 'animate-bounce' : ''}`} />
                  {isPlaying === i.toString() ? 'Speaking...' : 'Listen to Advice'}
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border p-4 rounded-2xl flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Reasoning in progress</span>
                <span className="text-[10px] text-emerald-500 font-bold">Exploring scientific literature...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {media && (
        <div className="px-4 py-2 bg-emerald-50 border-t flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg border flex items-center justify-center">
              {media.type === 'image' ? <Camera className="w-5 h-5 text-emerald-500" /> : <Video className="w-5 h-5 text-emerald-500" />}
            </div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Media Attached</span>
          </div>
          <button onClick={() => setMedia(null)} className="p-1 hover:bg-emerald-100 rounded-full text-emerald-600"><X className="w-5 h-5" /></button>
        </div>
      )}

      <div className="p-4 bg-white border-t space-y-3">
        <div className="flex gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-50 border rounded-2xl text-slate-500 hover:text-emerald-600">
            <Camera className="w-6 h-6" />
          </button>
          <button onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            input.onchange = (e) => handleFileUpload(e as any, 'video');
            input.click();
          }} className="p-3 bg-slate-50 border rounded-2xl text-slate-500 hover:text-emerald-600">
            <Video className="w-6 h-6" />
          </button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'image')} />
          
          <div className="flex-1 relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or use voice..." 
              className="w-full px-4 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none pr-12 text-sm"
            />
            <button 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white scale-110 shadow-lg' : 'text-slate-400 hover:text-emerald-600'}`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          <button onClick={handleSend} disabled={isTyping} className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg hover:bg-emerald-700 disabled:opacity-50">
            <Send className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleNearbySearch} className="flex-1 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase flex items-center justify-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
            <MapPin className="w-3 h-3" /> Find Nearby Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
