
import React, { useEffect, useState } from 'react';
import { Cpu, Droplets, Power, Activity, Thermometer, RefreshCcw, Clock, Settings2, ShieldCheck, Microscope, Zap } from 'lucide-react';
import { IoTState } from '../types';

interface IoTControlProps {
  state: IoTState;
  onUpdate: (updates: Partial<IoTState>) => void;
}

const IoTControl: React.FC<IoTControlProps> = ({ state, onUpdate }) => {
  // Simulator Logic for soil dynamics
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Process Pump State based on Mode
      if (state.mode === 'sensor') {
        if (state.moisture < state.threshold && !state.pumpActive) {
          onUpdate({ pumpActive: true });
        } else if (state.moisture > (state.threshold + 30) && state.pumpActive) {
          onUpdate({ pumpActive: false });
        }
      }

      // 2. Process Physics Simulation
      if (state.pumpActive) {
        onUpdate({ 
          moisture: Math.min(100, state.moisture + 0.8),
          nutrients: {
            n: Math.max(0, state.nutrients.n - 0.05), // Leaching simulation
            p: state.nutrients.p,
            k: state.nutrients.k
          }
        });
      } else {
        onUpdate({ moisture: Math.max(0, state.moisture - 0.2) });
      }
      
      // Slight ph drift simulation
      if (Math.random() > 0.95) {
        onUpdate({ ph: state.ph + (Math.random() - 0.5) * 0.1 });
      }

    }, 4000);
    return () => clearInterval(interval);
  }, [state.pumpActive, state.moisture, state.mode, state.threshold, state.ph, state.nutrients]);

  const moistureColor = state.moisture < state.threshold ? 'text-red-400' : state.moisture > 75 ? 'text-blue-400' : 'text-emerald-400';
  const phStatus = state.ph < 6.0 ? 'Acidic' : state.ph > 7.5 ? 'Alkaline' : 'Optimal';
  const phColor = phStatus === 'Optimal' ? 'text-emerald-400' : 'text-orange-400';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sensor Cockpit */}
        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white font-outfit">Live Soil Feed</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Node: {state.mode.toUpperCase()}_AGRI_PRO</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Field Secure</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Moisture</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black ${moistureColor}`}>{Math.round(state.moisture)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${state.moisture < state.threshold ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${state.moisture}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Microscope className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Soil pH</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black ${phColor}`}>{state.ph.toFixed(1)}</span>
                </div>
                <p className={`text-[10px] font-bold uppercase tracking-tight ${phColor}`}>{phStatus}</p>
              </div>
            </div>

            {/* Nutrients NPK */}
            <div className="grid grid-cols-3 gap-4 mb-8 pt-8 border-t border-slate-800">
              {Object.entries(state.nutrients).map(([key, val]) => (
                <div key={key} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                  <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">{key} Level</span>
                  <span className="text-xl font-bold text-white">{Math.round(val as number)}</span>
                  <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(val as number)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] text-slate-400 font-bold uppercase">Decision Model Sync'd</span>
              </div>
              <span className="text-[10px] text-slate-600 font-medium">{new Date(state.lastReading).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Automation Hub */}
        <div className="bg-white rounded-[2rem] border p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-800 font-outfit">Resource Hub</h3>
            <Settings2 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            {(['manual', 'timer', 'sensor'] as const).map((m) => (
              <button
                key={m}
                onClick={() => onUpdate({ mode: m })}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${state.mode === m ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {state.mode === 'manual' && (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${state.pumpActive ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border'}`}>
                    <Power className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Irrigation Valve</h4>
                    <p className="text-xs text-slate-500">Manual Direct Control</p>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdate({ pumpActive: !state.pumpActive })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${state.pumpActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${state.pumpActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            )}

            {state.mode === 'timer' && (
              <div className="space-y-4">
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <div className="flex items-center gap-3 text-blue-700 mb-4">
                    <Clock className="w-5 h-5" />
                    <h4 className="font-bold">Cyclic Watering</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase">Frequency (Hrs)</label>
                      <input 
                        type="number" 
                        value={state.frequency}
                        onChange={(e) => onUpdate({ frequency: Number(e.target.value) })}
                        className="w-full bg-white border-none rounded-xl px-3 py-2 text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase">Duration (Min)</label>
                      <input 
                        type="number"
                        value={state.duration}
                        onChange={(e) => onUpdate({ duration: Number(e.target.value) })}
                        className="w-full bg-white border-none rounded-xl px-3 py-2 text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state.mode === 'sensor' && (
              <div className="space-y-4">
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <div className="flex items-center gap-3 text-emerald-700 mb-4">
                    <Zap className="w-5 h-5" />
                    <h4 className="font-bold">ML Logic Engine</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-emerald-600">
                      <span>Threshold: {state.threshold}% Moisture</span>
                    </div>
                    <input 
                      type="range"
                      min="10"
                      max="60"
                      value={state.threshold}
                      onChange={(e) => onUpdate({ threshold: Number(e.target.value) })}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-900 rounded-2xl flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Auto-Hydrator:</span>
                  <span className={`text-xs font-black uppercase tracking-widest ${state.pumpActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {state.pumpActive ? 'Watering' : 'Optimized'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTControl;
