
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, TrendingUp, Calendar, Zap, Droplets, Sprout, Trophy, CloudRain, Sun, Thermometer, Flame, CheckCircle2 } from 'lucide-react';
import { FarmerState, FarmProfile, WeatherData } from '../types';

interface DashboardProps {
  state: FarmerState;
  profile: FarmProfile;
  weather: WeatherData | null;
  onCompleteDaily: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, profile, weather, onCompleteDaily }) => {
  return (
    <div className="space-y-6">
      {/* Daily Streak Task */}
      <div className={`p-6 rounded-[2rem] border-2 transition-all ${state.streak.dailyTaskCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-orange-100 shadow-xl shadow-orange-500/5'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${state.streak.dailyTaskCompleted ? 'bg-emerald-600 text-white' : 'bg-orange-500 text-white animate-pulse'}`}>
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-black text-slate-800 font-outfit">Daily Field Observation</h3>
                {!state.streak.dailyTaskCompleted && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Protect Streak</span>}
              </div>
              <p className="text-sm text-slate-500 font-medium">Take a moment to inspect your {profile.crops[0]} for early signs of stress.</p>
            </div>
          </div>
          <button 
            onClick={onCompleteDaily}
            disabled={state.streak.dailyTaskCompleted}
            className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
              state.streak.dailyTaskCompleted 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-xl shadow-slate-200'
            }`}
          >
            {state.streak.dailyTaskCompleted ? <><CheckCircle2 className="w-5 h-5" /> Goal Met</> : 'I Observed Today'}
          </button>
        </div>
      </div>

      {/* Welcome & Weather Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-outfit mb-2">Greetings, {profile.location}!</h1>
            <p className="text-emerald-50 max-w-md text-sm leading-relaxed">
              Your diverse ecosystem of <span className="font-black text-white">{profile.crops.join(', ')}</span> has achieved Level {state.level}. 
              Keep up the sustainable practices to earn more community recognition.
            </p>
          </div>
          <div className="mt-auto relative z-10 flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span className="font-bold">{state.score} Seeds Earned</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-300" />
              <span className="font-bold">{state.badges.filter(b => b.unlocked).length} Achievement Unlocked</span>
            </div>
          </div>
          <LeafPattern className="absolute right-[-20px] bottom-[-20px] w-56 h-56 text-white/10 pointer-events-none" />
        </div>

        {/* Real-time Weather Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-sky-500" />
              Farm Weather
            </h3>
            <div className="px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Real-time</div>
          </div>
          
          {weather ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-4xl font-bold text-slate-800">{weather.temp}°</span>
                  <p className="text-sm font-medium text-slate-500">{weather.condition}</p>
                </div>
                <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center">
                  <Sun className="w-8 h-8 text-sky-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Humidity</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{weather.humidity}%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Rain Chance</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{weather.precipitation > 0 ? 'High' : 'Low'}</span>
                </div>
              </div>
              <p className="text-[11px] text-sky-700 font-medium leading-tight bg-sky-50 p-2 rounded-lg border border-sky-100">
                💡 <strong>Bot Tip:</strong> {weather.forecast}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
              <CloudRain className="w-8 h-8 animate-pulse" />
              <p className="text-xs font-medium">Syncing weather data...</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Impact Growth
            </h3>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Sustainability Score</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={state.history}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                />
                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 font-outfit">Your Hall of Fame</h3>
          <div className="space-y-4">
            {state.badges.map(badge => (
              <div key={badge.id} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${badge.unlocked ? 'bg-slate-50 border border-slate-100' : 'opacity-40 grayscale border border-dashed border-slate-200'}`}>
                <div className="text-2xl bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm">
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{badge.name}</h4>
                  <p className="text-[10px] text-slate-500">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LeafPattern = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M40.7,-67.2C52.7,-60.7,62.3,-50.2,71.5,-38.3C80.7,-26.4,89.5,-13.2,88.7,-0.5C87.8,12.2,77.3,24.4,68.1,36.4C58.9,48.3,51.1,60,40.1,67.8C29.1,75.6,14.5,79.5,-0.1,79.6C-14.7,79.8,-29.3,76.2,-41.8,69.1C-54.2,62,-64.4,51.3,-72.2,39.1C-80,26.8,-85.4,13.4,-84.9,0.3C-84.4,-12.8,-78,-25.6,-69.6,-36.8C-61.1,-48.1,-50.7,-57.8,-38.7,-64.3C-26.7,-70.7,-13.3,-74,0.4,-74.6C14.1,-75.3,28.7,-73.7,40.7,-67.2Z" transform="translate(100 100)" />
  </svg>
);

export default Dashboard;
