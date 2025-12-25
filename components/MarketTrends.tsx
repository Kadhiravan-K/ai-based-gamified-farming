
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus, Calendar, Loader2, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-outfit">Market Pulse</h2>
          <p className="text-sm text-slate-500">Live search-grounded insights for your crops</p>
        </div>
        <button 
          onClick={refreshPulse}
          disabled={loading || !isOnline}
          className="p-3 bg-white border rounded-2xl text-emerald-600 shadow-sm disabled:opacity-50 hover:bg-emerald-50 transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        </button>
      </div>

      {pulse && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Price</span>
                <div className={`p-2 rounded-xl ${pulse.priceTrend === 'up' ? 'bg-emerald-50 text-emerald-600' : pulse.priceTrend === 'down' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                  {pulse.priceTrend === 'up' ? <TrendingUp className="w-4 h-4" /> : pulse.priceTrend === 'down' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-slate-900">${pulse.currentPrice}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">{pulse.cropName} Trends</p>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg font-outfit">Regional Forecast</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-300 italic">"{pulse.demandForecast}"</p>
            </div>

            <div className="bg-emerald-600 p-8 rounded-[2rem] shadow-xl text-white">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-5 h-5" />
                <h3 className="font-bold text-lg font-outfit">Strategic Action</h3>
              </div>
              <h4 className="text-2xl font-black mb-2">{pulse.suggestedAction}</h4>
              <p className="text-xs font-bold uppercase text-emerald-100">Grounded in Live Data</p>
            </div>
          </div>

          {pulse.sources && pulse.sources.length > 0 && (
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" /> Sources & Grounding
              </h4>
              <div className="flex flex-wrap gap-3">
                {pulse.sources.map((s, i) => (
                  <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-all truncate max-w-xs">
                    {s.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MarketTrends;
