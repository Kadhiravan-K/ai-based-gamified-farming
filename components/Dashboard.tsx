
import React, { useState, useEffect } from 'react';
import { Sprout, Zap, Wallet, Activity, ArrowRight, CloudRain, Sun, Wind, ShieldAlert, Sparkles, ChevronRight, Flame, CheckCircle2, Trophy } from 'lucide-react';
import { FarmerState, FarmProfile, WeatherData, AgriNotification } from '../types';
import { AreaChart, Area, ResponsiveContainer, YAxis, RadarChart, PolarGrid, PolarAngleAxis, Radar, XAxis, Tooltip } from 'recharts';
import { get7DayPredictiveAlerts } from '../services/geminiService';

interface DashboardProps {
  state: FarmerState;
  profile: FarmProfile;
  weather: WeatherData | null;
  onCompleteDaily: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, profile, weather, onCompleteDaily }) => {
  const [predictiveAlerts, setPredictiveAlerts] = useState<AgriNotification[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoadingAlerts(true);
      const alerts = await get7DayPredictiveAlerts(profile, weather || undefined);
      setPredictiveAlerts(alerts);
      setLoadingAlerts(false);
    };
    fetchAlerts();
  }, [profile, weather]);

  const getCropStats = (cropName: string) => {
    const nodes = state.iotNodes.filter(n => n.targetCrop === cropName);
    const avgMoisture = nodes.length > 0 ? Math.round(nodes.reduce((sum, n) => sum + (n.moisture || 0), 0) / nodes.length) : 0;
    const activePumps = nodes.filter(n => n.pumpActive).length;
    const cropProfit = state.finances.filter(f => f.cropName === cropName).reduce((sum, f) => sum + (f.type === 'income' ? f.amount : -f.amount), 0);
    const trendData = Array.from({ length: 12 }, (_, i) => ({
      time: i,
      value: avgMoisture + Math.sin(i) * 5 + (Math.random() * 4 - 2)
    }));
    return { avgMoisture, activePumps, cropProfit, trendData };
  };

  const soilRadarData = [
    { subject: 'Nitrogen', A: profile.soilData?.nitrogen || 60, fullMark: 100 },
    { subject: 'Phosphorus', A: profile.soilData?.phosphorus || 45, fullMark: 100 },
    { subject: 'Potassium', A: profile.soilData?.potassium || 70, fullMark: 100 },
    { subject: 'pH Balance', A: ((profile.soilData?.ph || 7) / 14) * 100, fullMark: 100 },
    { subject: 'Carbon', A: (profile.soilData?.organicCarbon || 0.5) * 100, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero OS Header */}
      <div className="bg-slate-900 rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                <span className={`w-2 h-2 rounded-full animate-pulse ${weather?.condition.includes('Rain') ? 'bg-blue-400' : 'bg-emerald-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Digital Twin Synchronized</span>
              </div>
              {state.streak && (
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full text-orange-400 animate-in slide-in-from-left-4">
                  <Flame className="w-3.5 h-3.5 fill-orange-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{state.streak.count} Day Streak</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl sm:text-6xl font-black font-outfit tracking-tighter leading-tight">
              AgriQuest <span className="text-emerald-500">Live</span>
            </h1>
            <p className="text-slate-400 max-w-md font-medium text-sm sm:text-base leading-relaxed">
              Managing <span className="text-white font-bold">{profile.crops.length} production nodes</span> in {profile.location}.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 text-center min-w-[120px]">
              <Sun className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Temp</p>
              <div className="text-2xl font-black">{weather ? Math.round(weather.temp) : '--'}°C</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 text-center min-w-[120px]">
              <CloudRain className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Precip</p>
              <div className="text-2xl font-black">{weather ? weather.precipitation : '--'}mm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Streak & Milestone Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-[2.5rem] p-8 flex items-center justify-between border transition-all ${state.streak.dailyTaskCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-5">
            <div className={`p-5 rounded-3xl transition-all ${state.streak.dailyTaskCompleted ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
              <Flame className={`w-8 h-8 ${state.streak.dailyTaskCompleted ? 'fill-white animate-bounce' : ''}`} />
            </div>
            <div>
              <h3 className="text-2xl font-black font-outfit uppercase tracking-tight">{state.streak.count} Day Fire</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {state.streak.dailyTaskCompleted ? 'Audit Complete for today!' : 'Complete your daily scan to extend!'}
              </p>
            </div>
          </div>
          {state.streak.dailyTaskCompleted ? (
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
               <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <button 
              onClick={onCompleteDaily}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl"
            >
              Verify Now
            </button>
          )}
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-5">
              <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl border border-blue-100">
                 <Trophy className="w-8 h-8" />
              </div>
              <div>
                 <h3 className="text-2xl font-black font-outfit uppercase tracking-tight">Level {Math.floor(state.score / 1000) + 1}</h3>
                 <div className="w-32 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(state.score % 1000) / 10}%` }} />
                 </div>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Seeds</p>
              <span className="text-2xl font-black text-slate-900 font-outfit">{state.score.toLocaleString()}</span>
           </div>
        </div>
      </div>

      {/* 7-Day Neural Alert Center */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                 <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-slate-900 font-outfit">Predictive Intel Center</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">7-Day Neural Forecast & Risk Matrix</p>
              </div>
           </div>
           <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border rounded-full text-[9px] font-black uppercase text-slate-500">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Grounded Intelligence
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {loadingAlerts ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 bg-slate-50 rounded-[2rem] animate-pulse" />
              ))
           ) : predictiveAlerts.length > 0 ? (
              predictiveAlerts.map((alert) => (
                <div key={alert.id} className={`p-6 rounded-[2rem] border transition-all hover:shadow-lg relative overflow-hidden group ${
                  alert.type === 'alert' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
                }`}>
                   <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                         alert.type === 'alert' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                         {alert.type}
                      </span>
                      <span className="text-[8px] font-black text-slate-400 uppercase">Neural Forecast</span>
                   </div>
                   <h4 className="font-black text-slate-900 mb-2 leading-tight">{alert.title}</h4>
                   <p className="text-xs font-medium text-slate-600 leading-relaxed mb-4">{alert.text}</p>
                   <button className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-600 group-hover:gap-4 transition-all">
                      View Mitigation <ChevronRight className="w-3 h-3" />
                   </button>
                </div>
              ))
           ) : (
              <div className="col-span-full py-10 text-center">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No immediate neural alerts detected.</p>
              </div>
           )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.crops.map((crop) => {
            const stats = getCropStats(crop.name);
            return (
              <div key={crop.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                    <Sprout className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-black text-slate-900 font-outfit leading-none">{crop.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{crop.area} {crop.unit || profile.unit}</p>
                  </div>
                </div>
                
                <div className="h-24 w-full -mx-2 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.trendData}>
                      <defs>
                        <linearGradient id={`colorValue-${crop.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill={`url(#colorValue-${crop.id})`} strokeWidth={3} />
                      <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Moisture</span>
                    <span className="text-lg font-black text-slate-900">{stats.avgMoisture}%</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Net ROI</span>
                    <span className={`text-lg font-black ${stats.cropProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      ${stats.cropProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col items-center">
          <div className="flex items-center gap-3 w-full mb-8">
            <Wind className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-black text-slate-900 font-outfit uppercase tracking-tight">Soil Radar</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={soilRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <Radar name="Soil" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] w-full text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Soil Bio-Identity</p>
             <p className="text-xs font-bold text-slate-700">Optimal chemistry for sustainable production.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
