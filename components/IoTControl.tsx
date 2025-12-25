
import React, { useEffect, useState } from 'react';
import { Cpu, Droplets, Power, Activity, Microscope, Zap, Plus, Trash2, X, Wand2, Link, BrainCircuit } from 'lucide-react';
import { IoTNode, FarmProfile, WeatherData } from '../types';

interface IoTControlProps {
  nodes: IoTNode[];
  onUpdate: (nodeId: string, updates: Partial<IoTNode>) => void;
  onAdd: (node: IoTNode) => void;
  onRemove: (nodeId: string) => void;
  profile: FarmProfile;
  weather: WeatherData | null;
}

const CROP_MOISTURE_REQUIREMENTS: Record<string, { min: number, max: number }> = {
  'rice': { min: 60, max: 90 },
  'wheat': { min: 40, max: 65 },
  'corn': { min: 50, max: 70 },
  'maize': { min: 50, max: 70 },
  'cotton': { min: 40, max: 60 },
  'soybean': { min: 50, max: 75 },
  'sugarcane': { min: 65, max: 95 },
  'tomato': { min: 55, max: 75 },
  'potato': { min: 50, max: 70 },
};

const IoTControl: React.FC<IoTControlProps> = ({ nodes, onUpdate, onAdd, onRemove, profile, weather }) => {
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNode, setNewNode] = useState<Partial<IoTNode>>({ name: '', type: 'integrated', targetCrop: profile.crops[0]?.name || '' });

  useEffect(() => {
    const interval = setInterval(() => {
      nodes.forEach(node => {
        if (node.status === 'offline') return;
        let updates: Partial<IoTNode> = {};
        let shouldUpdate = false;

        const isRaining = weather?.condition.toLowerCase().includes('rain') || weather?.condition.toLowerCase().includes('drizzle');

        // Logic for auto-pumps
        if (node.mode === 'sensor' || node.mode === 'ml_optimized') {
          const effectiveThreshold = node.mode === 'ml_optimized' ? node.threshold + 5 : node.threshold;
          const sensorNode = node.type === 'integrated' ? node : nodes.find(n => n.id === node.linkedSensorId);
          if (sensorNode && sensorNode.moisture !== undefined) {
            if (sensorNode.moisture < effectiveThreshold && !node.pumpActive) {
              updates.pumpActive = true;
              shouldUpdate = true;
            } else if (sensorNode.moisture > (effectiveThreshold + 20) && node.pumpActive) {
              updates.pumpActive = false;
              shouldUpdate = true;
            }
          }
        }

        // Moisture Physics
        if (node.type === 'sensor' || node.type === 'integrated') {
          const isBeingWatered = node.pumpActive || nodes.some(n => n.type === 'pump' && n.linkedSensorId === node.id && n.pumpActive);
          const moistureGain = isBeingWatered ? 1.5 : (isRaining ? 0.8 : 0);
          const moistureLoss = isRaining ? 0.1 : 0.3; // Evaporation slowed by rain

          updates.moisture = Math.min(100, Math.max(0, (node.moisture || 0) + moistureGain - moistureLoss));
          shouldUpdate = true;
        }

        if (shouldUpdate) onUpdate(node.id, updates);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [nodes, onUpdate, weather]);

  const handleAddNodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const node: IoTNode = {
      id: `node-${Date.now()}`,
      name: newNode.name || 'Field Node',
      type: newNode.type as any || 'integrated',
      targetCrop: newNode.targetCrop,
      status: 'online',
      lastReading: new Date().toISOString(),
      mode: 'manual',
      threshold: 30,
      duration: 15,
      frequency: 6,
      ...(newNode.type === 'pump' ? { pumpActive: false, linkedSensorId: '' } : { 
        moisture: 45, ph: 6.8, nutrients: { n: 50, p: 50, k: 50 },
        pumpActive: newNode.type === 'integrated' ? false : undefined
      })
    };
    onAdd(node);
    setIsAddingNode(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-outfit">Field Network</h2>
          <p className="text-slate-700 font-bold text-sm tracking-tight">Active link to {nodes.length} IoT units.</p>
        </div>
        <button onClick={() => setIsAddingNode(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl">
          <Plus className="w-5 h-5" /> Deploy Node
        </button>
      </div>

      {isAddingNode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 font-outfit">Deploy Hardware</h3>
              <button onClick={() => setIsAddingNode(false)} className="p-2 text-slate-400 hover:text-black transition-all"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddNodeSubmit} className="space-y-6">
              <input required className="w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-2xl outline-none font-black" placeholder="Node Name" value={newNode.name} onChange={e => setNewNode({...newNode, name: e.target.value})} />
              <div className="grid grid-cols-3 gap-3">
                {['integrated', 'sensor', 'pump'].map(t => (
                  <button key={t} type="button" onClick={() => setNewNode({...newNode, type: t as any})} className={`py-3 rounded-xl font-black text-[10px] uppercase border-2 ${newNode.type === t ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all">Confirm Deployment</button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        {nodes.map(node => (
          <div key={node.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="bg-slate-900 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${node.pumpActive ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-slate-800 border-slate-700'}`}>
                   {node.type === 'pump' ? <Zap className="w-6 h-6" /> : <Activity className="w-6 h-6 text-emerald-400" />}
                </div>
                <div>
                  <h3 className="text-xl font-black font-outfit uppercase tracking-tight">{node.name}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned: {node.targetCrop}</p>
                </div>
              </div>
              <button onClick={() => onRemove(node.id)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 bg-slate-50/20">
              {node.type !== 'pump' && (
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between mb-4">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Soil Moisture</span>
                       <span className="text-2xl font-black text-slate-900">{Math.round(node.moisture || 0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${node.moisture}%` }} />
                    </div>
                  </div>
                  {node.nutrients && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nutrient Analysis</span>
                       {Object.entries(node.nutrients).map(([key, val]) => (
                         <div key={key} className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase text-slate-800">{key} Index</span>
                            <span className="text-xs font-black text-emerald-700">{Math.round(val)}%</span>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              )}
              {node.type !== 'sensor' && (
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
                    {['manual', 'timer', 'sensor', 'ml_optimized'].map(m => (
                      <button key={m} onClick={() => onUpdate(node.id, { mode: m as any })} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${node.mode === m ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500'}`}>
                        {m.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${node.pumpActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                           <Droplets className="w-6 h-6" />
                        </div>
                        <h4 className="font-black text-slate-900 uppercase">Hydro Actuator</h4>
                     </div>
                     <button onClick={() => onUpdate(node.id, { pumpActive: !node.pumpActive })} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${node.pumpActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${node.pumpActive ? 'translate-x-7' : 'translate-x-1'}`} />
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IoTControl;
