
import React, { useState } from 'react';
import { Microscope, MapPin, RefreshCw, Sparkles, ChevronRight, Zap, Droplet, Wind, Activity, ShieldCheck, TrendingUp, Calendar, CloudRain, Sprout, Target, ArrowRight, ShieldAlert, BarChart3 } from 'lucide-react';
import { FarmProfile, SoilData, CropEntry, WeatherData } from '../types';
import { findNearbyResources, optimizeFertilizer } from '../services/geminiService';

interface SoilHubProps {
  profile: FarmProfile;
  onUpdateSoil: (cropId: string, data: SoilData) => void;
  isOnline: boolean;
  weather?: WeatherData | null;
}

const SoilHub: React.FC<SoilHubProps> = ({ profile, onUpdateSoil, isOnline, weather }) => {
  const [selectedCrop, setSelectedCrop] = useState<CropEntry | null>(profile.crops[0] || null);
  const [soilData, setSoilData] = useState<SoilData>(selectedCrop?.soilLabData || {});
  const [optimizing, setOptimizing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleCropSelect = (crop: CropEntry) => {
    setSelectedCrop(crop);
    setSoilData(crop.soilLabData || {});
  };

  const handleOptimizeFertilizer = async () => {
    if (!selectedCrop) return;
    setOptimizing(true);
    try {
      const prescription = await optimizeFertilizer(selectedCrop.name, soilData, weather || undefined);
      const updatedSoil = { ...soilData, prescription };
      setSoilData(updatedSoil);
      onUpdateSoil(selectedCrop.id, updatedSoil);
    } finally {
      setOptimizing(false);
    }
  };

  const handleLocateLabs = async () => {
    setLoading(true);
    try {
      await findNearbyResources('soil testing facilities and agricultural research centers', profile.latitude || 30.73, profile.longitude || 76.77);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!selectedCrop) return;
    setSaveStatus('saving');
    setTimeout(() => {
      onUpdateSoil(selectedCrop.id, { ...soilData, lastTested: new Date().toISOString() });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-outfit uppercase tracking-tighter">Precision Agronomy</h2>
          <p className="text-slate-500 font-bold text-sm tracking-tight">Weather-Fused Nutrient Variable Rate Prescriptions</p>
        </div>
        <button 
          onClick={handleLocateLabs}
          disabled={loading || !isOnline}
          className="w-full md:w-auto px-8 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
          Regional Lab Sourcing
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3">Farm GPS Nodes</h3>
          <div className="space-y-3">
            {profile.crops.map((crop) => (
              <button
                key={crop.id}
                onClick={() => handleCropSelect(crop)}
                className={`w-full flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${
                  selectedCrop?.id === crop.id 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl' 
                    : 'bg-white text-black border-slate-100 hover:border-emerald-200 shadow-sm'
                }`}
              >
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-tight">{crop.name}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${selectedCrop?.id === crop.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {crop.area} {profile.unit}
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 ${selectedCrop?.id === crop.id ? 'text-white' : 'text-slate-200'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {/* Chemical Reduction HUD */}
          <div className="bg-emerald-50 rounded-[3rem] p-8 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 text-center md:text-left">
              <div className="p-5 bg-emerald-600 text-white rounded-3xl shadow-lg">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 font-outfit uppercase tracking-tighter">Chemical Reduction HUD</h3>
                <p className="text-xs font-bold text-slate-500">Targeting 30% reduction in chemical nitrogen via Variable Rate Prescriptions.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Impact Index</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-emerald-700">88.4</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
               </div>
               <div className="h-10 w-px bg-slate-200" />
               <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Sustainability</p>
                  <span className="text-2xl font-black text-emerald-700">Elite</span>
               </div>
            </div>
          </div>

          {selectedCrop && (
            <div className="grid grid-cols-1 gap-8">
              {/* Variable Rate Recommendation Card */}
              <div className="bg-slate-950 rounded-[4rem] p-10 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-white/5">
                 <div className="absolute top-0 right-0 p-16 opacity-5"><Droplet className="w-64 h-64" /></div>
                 <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
                       <div className="inline-flex items-center gap-3 bg-emerald-600/10 text-emerald-400 px-6 py-3 rounded-full border border-emerald-500/20">
                          <Target className="w-5 h-5" />
                          <span className="text-[11px] font-black uppercase tracking-[0.3em]">Precision Variable Rate Engine</span>
                       </div>
                       <button 
                        onClick={handleOptimizeFertilizer}
                        disabled={optimizing}
                        className="w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-emerald-950 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 ring-4 ring-emerald-600/20"
                       >
                         {optimizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                         Fuse Localized Intel
                       </button>
                    </div>

                    {soilData.prescription ? (
                       <div className="space-y-12 animate-in zoom-in duration-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                             <div className="space-y-8">
                                <h4 className="text-4xl font-black font-outfit uppercase tracking-tighter leading-none">V-R-P Solution <br/><span className="text-emerald-500 text-sm tracking-widest opacity-80">(Variable Rate Prescription)</span></h4>
                                <div className="grid grid-cols-3 gap-5">
                                   {[
                                     { label: 'N', value: soilData.prescription.recommendedN, color: 'text-blue-400', full: 'Nitrogen' },
                                     { label: 'P', value: soilData.prescription.recommendedP, color: 'text-orange-400', full: 'Phos' },
                                     { label: 'K', value: soilData.prescription.recommendedK, color: 'text-purple-400', full: 'Potas' }
                                   ].map(item => (
                                     <div key={item.label} className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center shadow-inner group hover:bg-white/10 transition-all">
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${item.color}`}>{item.label}</p>
                                        <span className="text-3xl font-black font-outfit">{item.value}</span>
                                        <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">KG / HA</p>
                                     </div>
                                   ))}
                                </div>
                                <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[1.5rem] border border-white/5">
                                   <Calendar className="w-5 h-5 text-emerald-400" />
                                   <p className="text-xs font-bold text-slate-300"><span className="text-emerald-400 uppercase tracking-widest font-black text-[10px] block mb-1">DSS Deployment Timing</span> {soilData.prescription.timingNote}</p>
                                </div>
                             </div>

                             <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 relative overflow-hidden flex flex-col justify-center">
                                <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                   <ShieldCheck className="w-5 h-5" /> Agronomic Proof
                                </h5>
                                <p className="text-base font-medium text-slate-300 leading-relaxed italic mb-8">
                                   "{soilData.prescription.sustainabilityImpact}"
                                </p>
                                
                                {soilData.prescription.splitDoseSuggested && (
                                   <div className="p-6 bg-blue-600/10 border border-blue-500/30 rounded-3xl flex items-start gap-4 animate-bounce">
                                      <CloudRain className="w-6 h-6 text-blue-400 shrink-0" />
                                      <div>
                                         <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">Weather-Grounded Sync</p>
                                         <p className="text-[11px] font-bold text-blue-100 leading-tight">High leaching risk detected due to localized rain. Variable Rate adjusted to split-application.</p>
                                      </div>
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-[3rem]">
                          <Activity className="w-16 h-16 text-white/10 mx-auto mb-6" />
                          <p className="text-slate-500 font-bold text-sm max-w-sm mx-auto uppercase tracking-widest">Execute AI optimization to fuse soil chemistry with localized climate patterns.</p>
                       </div>
                    )}
                 </div>
              </div>

              {/* Lab Metrics Matrix */}
              <div className="bg-white rounded-[4rem] border border-slate-200 p-12 shadow-sm relative">
                <div className="flex items-center gap-5 mb-12">
                  <div className="p-5 bg-emerald-50 rounded-[2rem] text-emerald-800 border border-emerald-100 shadow-sm">
                    <Microscope className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-black font-outfit uppercase tracking-tighter">Localized Chemistry</h3>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Grounded at Coordinates: {profile.latitude?.toFixed(4)}, {profile.longitude?.toFixed(4)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-16">
                  {[
                    { label: 'Soil pH Factor', key: 'ph', step: '0.1', placeholder: 'e.g. 6.8', icon: Droplet },
                    { label: 'Nitrogen (N) - KG/HA', key: 'nitrogen', step: '1', placeholder: 'e.g. 240', icon: Wind },
                    { label: 'Phosphorus (P) - KG/HA', key: 'phosphorus', step: '1', placeholder: 'e.g. 35', icon: Sprout },
                    { label: 'Potassium (K) - KG/HA', key: 'potassium', step: '1', placeholder: 'e.g. 180', icon: Zap }
                  ].map((field) => (
                    <div key={field.key} className="space-y-4 group">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2 group-focus-within:text-emerald-600 transition-colors">
                         <field.icon className="w-3 h-3" /> {field.label}
                      </label>
                      <input 
                        type="number" step={field.step} placeholder={field.placeholder}
                        className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-lg font-black text-black focus:ring-8 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner"
                        value={(soilData as any)[field.key] || ''}
                        onChange={e => setSoilData({...soilData, [field.key]: parseFloat(e.target.value)})}
                      />
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleSave}
                  disabled={saveStatus !== 'idle'}
                  className={`w-full py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-[0.98] ${
                    saveStatus === 'saved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-950 text-white hover:bg-emerald-700'
                  }`}
                >
                  {saveStatus === 'idle' ? 'Finalize Node Calibration' : 'Uplinking Neural Profile...'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoilHub;
