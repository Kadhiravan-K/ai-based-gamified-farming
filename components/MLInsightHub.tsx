
import React, { useState } from 'react';
import { BrainCircuit, TrendingUp, RefreshCw, Zap, Microscope, PlayCircle, ShieldCheck, Sparkles, Film } from 'lucide-react';
import { MLPrediction, FarmProfile, IoTNode, WeatherData, AIAlgorithmType } from '../types';
import { runMLDiagnostic, generateFutureSight } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MLInsightHubProps {
  profile: FarmProfile;
  nodes: IoTNode[];
  weather: WeatherData | null;
  predictions: MLPrediction[];
  onNewPrediction: (p: MLPrediction) => void;
}

const ALGORITHMS: { id: AIAlgorithmType, name: string, icon: any, desc: string }[] = [
  { id: 'CNN', name: 'ConvNet (CNN)', icon: Microscope, desc: 'Visual health patterns' },
  { id: 'RNN', name: 'Recurrent (RNN)', icon: RefreshCw, desc: 'Temporal sensor logic' },
  { id: 'LSTM', name: 'LSTM Memory', icon: TrendingUp, desc: 'Climate shift trends' },
  { id: 'Random Forest', name: 'Random Forest', icon: BrainCircuit, desc: 'Risk ensemble' },
];

const MLInsightHub: React.FC<MLInsightHubProps> = ({ profile, nodes, weather, predictions, onNewPrediction }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(profile.crops[0]?.id || '');
  const [selectedAlgo, setSelectedAlgo] = useState<AIAlgorithmType>('RNN');
  const [videoLoading, setVideoLoading] = useState(false);

  const latestPrediction = predictions.find(p => p.cropId === activeTab) || null;
  const currentCrop = profile.crops.find(c => c.id === activeTab);

  const handleRunDiagnostic = async () => {
    if (!currentCrop) return;
    setLoading(activeTab);
    try {
      const cropNodes = nodes.filter(n => n.targetCrop === currentCrop.name);
      const prediction = await runMLDiagnostic(currentCrop, cropNodes, selectedAlgo, weather || undefined);
      onNewPrediction(prediction);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateVideo = async () => {
    if (!latestPrediction || !currentCrop) return;
    setVideoLoading(true);
    try {
      const videoUrl = await generateFutureSight(currentCrop.name, latestPrediction.confidenceScore);
      if (videoUrl) {
        onNewPrediction({ ...latestPrediction, futureSightVideoUrl: videoUrl });
      }
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-outfit flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-emerald-600" /> Neural Hub
          </h2>
          <p className="text-slate-500 font-bold text-sm">Predictive yield analytics & machine learning.</p>
        </div>
        <button 
          onClick={handleRunDiagnostic} 
          disabled={!!loading || !currentCrop} 
          className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Run Neural Inference'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Arch Model</h3>
             <div className="space-y-3">
               {ALGORITHMS.map(algo => (
                 <button key={algo.id} onClick={() => setSelectedAlgo(algo.id)} className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${selectedAlgo === algo.id ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-100'}`}>
                   <div className={`p-2.5 rounded-xl ${selectedAlgo === algo.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}><algo.icon className="w-4 h-4" /></div>
                   <div className="text-left"><p className="text-xs font-black">{algo.name}</p></div>
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {latestPrediction ? (
            <div className="space-y-8">
              <div className="bg-white rounded-[3rem] p-10 border shadow-sm relative overflow-hidden">
                <div className="flex items-baseline gap-3 mb-10">
                    <span className="text-8xl font-black text-slate-900 font-outfit">{latestPrediction.yieldForecast}</span>
                    <span className="text-xl font-black text-slate-400 uppercase">KG / EST. YIELD</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(latestPrediction.riskFactors).map(([label, val]) => (
                    <div key={label} className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{label.replace(/([A-Z])/g, ' $1')}</p>
                       <span className="text-3xl font-black text-slate-900">{Math.round(val)}%</span>
                       <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4 overflow-hidden">
                          <div className="h-full bg-emerald-600 transition-all duration-1000" style={{ width: `${val}%` }} />
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Veo Future Sight Card */}
              <div className="bg-slate-900 rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10"><Film className="w-48 h-48" /></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                   <div className="flex-1 space-y-6">
                      <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20">
                         <Sparkles className="w-4 h-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Veo Harvest Oracle</span>
                      </div>
                      <h3 className="text-4xl font-black font-outfit leading-tight">Future Sight Visualization</h3>
                      <p className="text-slate-400 font-medium">Generate a high-fidelity AI simulation of your field at harvest peak based on current neural health metrics.</p>
                      
                      {latestPrediction.futureSightVideoUrl ? (
                         <video src={latestPrediction.futureSightVideoUrl} controls autoPlay className="w-full rounded-[2rem] border border-white/10 shadow-2xl" />
                      ) : (
                        <button 
                          onClick={handleGenerateVideo}
                          disabled={videoLoading}
                          className="px-8 py-4 bg-emerald-600 rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:text-emerald-900 transition-all flex items-center gap-3"
                        >
                          {videoLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                          {videoLoading ? 'Rendering Harvest...' : 'Simulate Harvest Video'}
                        </button>
                      )}
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-200">
               <Zap className="w-16 h-16 text-slate-200 mx-auto mb-6" />
               <h3 className="text-2xl font-black text-slate-800 font-outfit uppercase">Inference Pipeline Ready</h3>
               <p className="text-slate-500 mt-2 font-bold text-sm">Select a plot and execute neural analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MLInsightHub;
