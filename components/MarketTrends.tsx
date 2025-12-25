
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus, Calendar, Loader2, Sparkles, AlertTriangle, ExternalLink, ArrowRightCircle, Target, Zap } from 'lucide-react';
import { FarmProfile, MarketTrend } from '../types';
import { getMarketPulse } from '../services/geminiService';

interface MarketTrendsProps {
  profile: FarmProfile;
  isOnline: boolean;
}

const MarketTrends: React.FC<MarketTrendsProps> = ({ profile, isOnline }) => {
  const [pulse, setPulse] = useState<MarketTrend | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOnline) refreshPulse();
  }, [isOnline]);

  const refreshPulse = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketPulse(profile);
      setPulse(data);
    } catch (err) {
      setError("Market intelligence currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Real-time Ticker Header */}
      <div className="bg-slate-900 overflow-hidden py-3 px-6 rounded-2xl flex items-center gap-4 group">
        <div className="flex items-center gap-2 whitespace-nowrap animate-pulse">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Market Feed</span>
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap">
           <p className="text-white text-[11px] font-bold font-mono tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">
             {pulse ? `${pulse.cropName} Index @ ${pulse.currentPrice} | Signal: ${pulse.sellingSignal} | Rating: ${pulse.priceRating}` : 'Initializing Real-time Ticker...'}
           </p>
        </div>
        <button onClick={refreshPulse} disabled={loading} className="text-emerald-400 hover:text-white transition-all">
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-outfit">Market Pulse Hub</h2>
          <p className="text-sm text-slate-500 font-bold">Search-grounded trading signals & strategic alerts</p>
        </div>
      </div>

      {loading && !pulse && (
        <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Querying Global Exchanges...</p>
        </div>
      )}

      {pulse && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Today's Price Logic */}
          <div className="bg-white p-8 rounded-[3rem] border shadow-sm relative overflow-hidden group">
            <div className="absolute top-6 right-8">
               <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                 pulse.priceRating === 'Peak' || pulse.priceRating === 'Excellent' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                 pulse.priceRating === 'Poor' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-600 border-slate-200'
               }`}>
                 Today: {pulse.priceRating}
               </div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Spot Price (Today)</span>
            <div className="flex items-baseline gap-2 mb-6">
               <span className="text-6xl font-black text-slate-900 font-outfit">${pulse.currentPrice}</span>
               <span className="text-sm font-black text-slate-400 uppercase">/ UNIT</span>
            </div>
            <div className={`flex items-center gap-3 p-4 rounded-2xl ${pulse.priceTrend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
               {pulse.priceTrend === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
               <span className="text-xs font-black uppercase tracking-tight">Market Momentum: {pulse.priceTrend}</span>
            </div>
          </div>

          {/* Strategic Selling Oracle */}
          <div className={`p-8 rounded-[3rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden ${
             pulse.sellingSignal === 'Sell' ? 'bg-emerald-600' : pulse.sellingSignal === 'Hold' ? 'bg-slate-900' : 'bg-orange-600'
          }`}>
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <Target className="w-6 h-6 text-white/50" />
                 <h3 className="font-black text-xl font-outfit uppercase tracking-tight">Trading Signal</h3>
               </div>
               <div className="mb-8">
                  <h4 className="text-6xl font-black font-outfit mb-2">{pulse.sellingSignal}</h4>
                  <p className="text-white/70 text-sm font-bold leading-relaxed">{pulse.demandForecast}</p>
               </div>
             </div>
             <div className="bg-white/10 p-4 rounded-2xl relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">AI Logic Recommendation</p>
                <p className="text-xs font-bold leading-tight">{pulse.suggestedAction}</p>
             </div>
             <Zap className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10" />
          </div>

          {/* Sources and Context */}
          <div className="bg-white border rounded-[3rem] p-8 shadow-sm flex flex-col">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> Market Data Grounding
            </h4>
            <div className="space-y-4 flex-1">
              {pulse.sources && pulse.sources.length > 0 ? pulse.sources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="block p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
                  <p className="text-xs font-black text-slate-900 group-hover:text-emerald-700 line-clamp-1 mb-1">{s.title}</p>
                  <p className="text-[9px] font-mono text-slate-400 truncate">{s.uri}</p>
                </a>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                   <AlertTriangle className="w-8 h-8 text-slate-200 mb-2" />
                   <p className="text-[10px] font-black text-slate-400 uppercase">Live search sourcing disabled.</p>
                </div>
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 italic">Price estimates are based on current search-grounded market indexes for {profile.location}. Always verify with local mandis before final sale.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketTrends;
