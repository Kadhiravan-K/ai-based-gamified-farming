
import React, { useState } from 'react';
import { CheckCircle2, Clock, Star, RefreshCw, Camera, CloudOff, Plus, Trash2, Edit3, X, Sparkles, BrainCircuit, ShieldCheck, Map, ArrowRight } from 'lucide-react';
import { Quest } from '../types';

interface QuestsProps {
  quests: Quest[];
  onComplete: (points: number) => void;
  loading: boolean;
  onRefresh: () => void;
  onQuestAction: (quest: Quest, action: 'add' | 'delete') => void;
}

const Quests: React.FC<QuestsProps> = ({ quests, onComplete, loading, onRefresh, onQuestAction }) => {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [newQuest, setNewQuest] = useState({ title: '', description: '', difficulty: 'Easy' as any });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const pointsMap = { 'Easy': 50, 'Medium': 150, 'Hard': 300 };
    const quest: Quest = {
      id: Math.random().toString(36).substr(2, 9),
      title: newQuest.title,
      description: newQuest.description,
      difficulty: newQuest.difficulty,
      points: pointsMap[newQuest.difficulty as keyof typeof pointsMap],
      category: 'Custom',
      status: 'available',
      isCustom: true,
      isOfflineReady: true
    };
    onQuestAction(quest, 'add');
    setIsCreating(false);
    setNewQuest({ title: '', description: '', difficulty: 'Easy' });
  };

  const handleComplete = (id: string, points: number) => {
    if (completedIds.has(id)) return;
    setCompletedIds(prev => new Set(prev).add(id));
    onComplete(points);
  };

  const roadMap = [
    { title: "NDLM Integration", desc: "Direct link to National Digital Livestock Mission.", status: "Phase 1" },
    { title: "TFLite Edge Migration", desc: "Move model inference fully client-side.", status: "Phase 2" },
    { title: "Carbon Credit Tokenization", desc: "Calculate sequestration via blockchain.", status: "Phase 3" }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 bg-white rounded-[2.5rem] border border-emerald-50 shadow-xl shadow-emerald-500/5">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-black text-slate-800 font-outfit">AgriBot is Reasoning...</p>
          <p className="text-sm text-slate-500 max-w-xs mx-auto px-4 font-medium">
            Analyzing soil data, localized weather patterns, and crop synergy to generate optimal sustainable missions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-outfit">Mission Hub</h2>
          <p className="text-slate-500 font-medium text-sm">Actionable challenges and customized farm targets</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onRefresh}
            className="flex-1 md:flex-none px-6 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" /> 
            AI Generate Quests
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex-1 md:flex-none px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> 
            Create Custom
          </button>
        </div>
      </div>

      {/* Strategic Roadmap HUD */}
      <section className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
         <div className="relative z-10">
            <h3 className="text-xl font-black font-outfit uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Map className="w-6 h-6 text-emerald-500" /> Strategic Roadmap
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {roadMap.map((item, i) => (
                 <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 block">{item.status}</span>
                    <h4 className="font-black text-sm mb-2">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
         <ArrowRight className="absolute -bottom-10 -right-10 w-48 h-48 opacity-5 text-emerald-500" />
      </section>

      {isCreating && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800 font-outfit">New Custom Quest</h3>
              <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Quest Title</label>
                <input 
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium"
                  placeholder="e.g. Install Solar Irrigation"
                  value={newQuest.title}
                  onChange={e => setNewQuest({...newQuest, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Brief Description</label>
                <textarea 
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none h-32 font-medium"
                  placeholder="What needs to be done to earn the Seeds?"
                  value={newQuest.description}
                  onChange={e => setNewQuest({...newQuest, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['Easy', 'Medium', 'Hard'].map(diff => (
                  <button 
                    key={diff}
                    type="button"
                    onClick={() => setNewQuest({...newQuest, difficulty: diff as any})}
                    className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                      newQuest.difficulty === diff 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                        : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">
                Publish Mission
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quests.map((quest) => {
          const isDone = completedIds.has(quest.id) || quest.status === 'completed';
          return (
            <div 
              key={quest.id} 
              className={`group bg-white rounded-[2rem] p-8 border-2 transition-all duration-300 relative overflow-hidden flex flex-col ${
                isDone 
                  ? 'border-emerald-100 bg-emerald-50/20 opacity-80' 
                  : 'border-white shadow-sm hover:shadow-xl hover:border-emerald-500/10'
              }`}
            >
              {quest.isCustom && !isDone && (
                <button 
                  onClick={() => onQuestAction(quest, 'delete')}
                  className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              <div className="flex items-start justify-between mb-6">
                <div className="flex flex-wrap gap-2">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    quest.difficulty === 'Easy' ? 'bg-blue-100 text-blue-700' :
                    quest.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {quest.difficulty}
                  </div>
                  {!quest.isCustom ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 uppercase tracking-widest">
                      <BrainCircuit className="w-3 h-3" />
                      AgriBot Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest">
                      Farmer Custom
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-black bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-100">
                  <Star className="w-4 h-4 fill-emerald-600" />
                  {quest.points} Seeds
                </div>
              </div>

              <h3 className={`text-xl font-black mb-3 font-outfit ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                {quest.title}
              </h3>
              <p className={`text-sm mb-8 leading-relaxed font-medium ${isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                {quest.description}
              </p>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Clock className="w-4 h-4" />
                  <span>{isDone ? 'Claimed' : quest.category || 'Environmental'}</span>
                </div>
                {isDone ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                    <ShieldCheck className="w-6 h-6" /> Mission Completed
                  </div>
                ) : (
                  <button 
                    onClick={() => handleComplete(quest.id, quest.points)}
                    className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95 text-xs uppercase tracking-widest"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {quests.length === 0 && !loading && (
        <div className="py-32 flex flex-col items-center text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <CloudOff className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 font-outfit">Empty Mission Queue</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">
            Use the "AI Generate Quests" button to receive science-guided challenges for your farm.
          </p>
        </div>
      )}
    </div>
  );
};

export default Quests;
