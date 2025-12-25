import React from 'react';
import { Trophy, ArrowUp, ArrowDown, Users, Share2, MessageCircle, ShieldOff } from 'lucide-react';

interface CommunityProps {
  score: number;
  privacyMode: 'public' | 'private';
}

const leaderboardData = [
  { id: 1, name: 'Sanjeev Kumar', location: 'Punjab', score: 2840, change: 'up' },
  { id: 2, name: 'Priya Reddy', location: 'Andhra', score: 2650, change: 'down' },
  { id: 3, name: 'Anil Deshmukh', location: 'Maharashtra', score: 2420, change: 'up' },
  { id: 4, name: 'Lakshmi V.', location: 'Kerala', score: 2100, change: 'up' }
];

const Community: React.FC<CommunityProps> = ({ score, privacyMode }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-8 border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-2xl text-slate-800 flex items-center gap-3 font-outfit">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Village Rankings
              </h3>
              {privacyMode === 'private' && (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase border border-red-100">
                  <ShieldOff className="w-3.5 h-3.5" /> Hidden Mode
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {leaderboardData.map((farmer, i) => (
                <div key={farmer.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border hover:border-emerald-200 transition-all group">
                  <div className="flex items-center gap-5">
                    <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-white text-slate-400 border'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-lg">
                      {farmer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{farmer.name}</h4>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{farmer.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-black text-xl text-slate-800">{farmer.score.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Seeds</div>
                    </div>
                    {farmer.change === 'up' ? (
                      <ArrowUp className="w-5 h-5 text-emerald-500 bg-emerald-50 rounded-lg p-1" />
                    ) : (
                      <ArrowDown className="w-5 h-5 text-red-500 bg-red-50 rounded-lg p-1" />
                    )}
                  </div>
                </div>
              ))}
              
              {/* User Position */}
              <div className={`flex items-center justify-between p-6 rounded-2xl border-2 mt-8 transition-all ${
                privacyMode === 'private' 
                  ? 'bg-slate-100 border-slate-200 opacity-60 text-slate-600' 
                  : 'bg-emerald-600 border-emerald-500 shadow-xl shadow-emerald-100 text-white'
              }`}>
                <div className="flex items-center gap-5">
                  <span className="w-10 h-10 flex items-center justify-center font-black text-sm">
                    {privacyMode === 'private' ? '?' : '24'}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    privacyMode === 'private' ? 'bg-slate-200 text-slate-400' : 'bg-white/20 text-white'
                  }`}>
                    {privacyMode === 'private' ? <ShieldOff className="w-6 h-6" /> : 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold">{privacyMode === 'private' ? 'Private Identity' : 'You'}</h4>
                    <p className={`text-xs uppercase tracking-widest font-bold ${privacyMode === 'private' ? 'text-slate-400' : 'text-emerald-200'}`}>
                      {privacyMode === 'private' ? 'Statistics Hidden' : 'Your Farm'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-2xl">{score.toLocaleString()}</div>
                  <div className={`text-[10px] uppercase tracking-widest font-bold ${privacyMode === 'private' ? 'text-slate-400' : 'text-emerald-100'}`}>Seeds</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-8 border shadow-sm h-full">
            <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-3 font-outfit">
              <Users className="w-6 h-6 text-emerald-600" />
              Village Log
            </h3>
            <div className="space-y-8">
              {[
                { name: 'Arjun', action: 'completed Mulching Quest', time: '2h ago', private: false },
                { name: 'Anonymous', action: 'updated finance records', time: '5h ago', private: true },
                { name: 'Rahul', action: 'started "Organic Pioneer"', time: '1d ago', private: false }
              ].map((activity, i) => (
                <div key={i} className={`flex gap-5 ${activity.private ? 'opacity-50' : ''}`}>
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full z-10 relative ring-4 ring-white ${activity.private ? 'bg-slate-300' : 'bg-emerald-500'}`}></div>
                    {i !== 2 && <div className="absolute top-3 left-[5px] w-[2px] h-full bg-slate-100"></div>}
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 leading-tight">
                      <span className="font-bold text-slate-900">{activity.name}</span> {activity.action}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">{activity.time}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="text-slate-400 hover:text-emerald-600 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" /> Kudos
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;