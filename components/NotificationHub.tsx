
import React from 'react';
import { Bell, Info, AlertTriangle, Calendar, Check, ExternalLink, RefreshCw, TrendingUp, DollarSign } from 'lucide-react';
import { AgriNotification } from '../types';

interface NotificationHubProps {
  notifications: AgriNotification[];
  onMarkRead: (id: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

const NotificationHub: React.FC<NotificationHubProps> = ({ notifications, onMarkRead, onRefresh, loading }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-outfit">Agri-Intelligence Feed</h2>
          <p className="text-slate-700 font-bold text-sm tracking-tight">Stay updated with regional alerts, events, and price spikes</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          Check for Updates
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`group bg-white rounded-3xl border-2 p-6 transition-all duration-300 relative overflow-hidden ${
              n.read ? 'border-slate-100 opacity-60' : 
              n.type === 'price_alert' ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 
              'border-emerald-100 shadow-md shadow-emerald-500/5'
            }`}
          >
            {n.type === 'price_alert' && !n.read && (
              <div className="absolute top-0 right-0 p-2 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl">
                 New Peak Found
              </div>
            )}
            
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${
                n.type === 'alert' ? 'bg-red-50 text-red-600' :
                n.type === 'event' ? 'bg-blue-50 text-blue-600' :
                n.type === 'price_alert' ? 'bg-emerald-600 text-white shadow-lg' :
                'bg-emerald-50 text-emerald-600'
              }`}>
                {n.type === 'alert' ? <AlertTriangle className="w-6 h-6" /> :
                 n.type === 'event' ? <Calendar className="w-6 h-6" /> :
                 n.type === 'price_alert' ? <TrendingUp className="w-6 h-6" /> :
                 <Info className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-black font-outfit ${n.type === 'price_alert' && !n.read ? 'text-emerald-700' : 'text-slate-900'}`}>{n.title}</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(n.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed mb-4">
                  {n.text}
                </p>
                <div className="flex gap-3">
                  {!n.read && (
                    <button 
                      onClick={() => onMarkRead(n.id)}
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${
                        n.type === 'price_alert' ? 'bg-emerald-600 text-white hover:bg-slate-900' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Mark as Seen
                    </button>
                  )}
                  {n.type === 'price_alert' && (
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-4 py-1.5 rounded-full hover:bg-emerald-600 transition-all">
                      <DollarSign className="w-3.5 h-3.5" /> Open Market Hub
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && !loading && (
          <div className="py-32 flex flex-col items-center text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <Bell className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-xl font-black text-slate-800 font-outfit">Inbox Clear</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto font-bold text-sm">
              We'll notify you when new agricultural alerts, events, or favorable market signals are detected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationHub;
