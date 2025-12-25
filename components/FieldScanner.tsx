
import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, AlertTriangle, X, CheckCircle2, ScanLine, Layers, Activity, Zap, Eye, Waves, Ruler, Scale, Heart } from 'lucide-react';
import { FarmProfile, CropDiagnostic, LivestockDiagnostic } from '../types';
import { analyzeCropHealth, analyzeLivestockBiometrics } from '../services/geminiService';

interface FieldScannerProps {
  profile: FarmProfile;
  onSaveDiagnostic: (d: CropDiagnostic) => void;
  onSaveLivestock: (d: LivestockDiagnostic) => void;
  cropHistory: CropDiagnostic[];
  livestockHistory: LivestockDiagnostic[];
}

type ScanMode = 'Plant' | 'Livestock';
type SpectralLens = 'RGB' | 'NDVI' | 'Thermal' | 'Pathogen';

const FieldScanner: React.FC<FieldScannerProps> = ({ profile, onSaveDiagnostic, onSaveLivestock }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mode, setMode] = useState<ScanMode>('Plant');
  const [cropResult, setCropResult] = useState<CropDiagnostic | null>(null);
  const [liveResult, setLiveResult] = useState<LivestockDiagnostic | null>(null);
  const [activeLens, setActiveLens] = useState<SpectralLens>('RGB');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    setCropResult(null);
    setLiveResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access failed", err);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      stopCamera();
      runAnalysis(imageData);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  const runAnalysis = async (image: string) => {
    setIsAnalyzing(true);
    try {
      if (mode === 'Plant') {
        const diag = await analyzeCropHealth(image, profile);
        setCropResult(diag);
        onSaveDiagnostic(diag);
      } else {
        const diag = await analyzeLivestockBiometrics(image);
        setLiveResult(diag);
        onSaveLivestock(diag);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getLensStyle = (lens: SpectralLens) => {
    switch(lens) {
      case 'NDVI': return 'filter contrast-[1.8] brightness-[1.1] grayscale sepia-[0.3] hue-rotate-[100deg] saturate-[3]';
      case 'Thermal': return 'filter invert-[0.9] sepia-[1] hue-rotate-[190deg] saturate-[4] brightness-[1.1]';
      case 'Pathogen': return 'filter saturate-[3] contrast-[1.5] brightness-[1.1] sepia-[0.1]';
      default: return '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-outfit uppercase tracking-tight">Spectral HUD</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Edge-AI Diagnostic Vision</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {(['Plant', 'Livestock'] as ScanMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === m ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {!isCameraOpen && !isAnalyzing && !cropResult && !liveResult && (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-12 text-center group hover:border-emerald-500 transition-all cursor-pointer" onClick={startCamera}>
           <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
              {mode === 'Plant' ? <ScanLine className="w-12 h-12 text-emerald-600" /> : <Scale className="w-12 h-12 text-emerald-600" />}
           </div>
           <h3 className="text-xl font-black text-slate-800 font-outfit uppercase tracking-tight">System Ready</h3>
           <p className="text-slate-400 mt-3 mb-10 max-w-sm mx-auto font-bold text-xs leading-relaxed">
             Deploy {mode === 'Plant' ? 'CNN Pathogen Classifiers' : 'Biometric Extraction Models'} locally to your phone.
           </p>
           <button className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all">
             Start Edge-AI Pipeline
           </button>
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
           <video ref={videoRef} autoPlay playsInline className={`flex-1 object-cover transition-all duration-700 ${mode === 'Plant' ? getLensStyle(activeLens) : ''}`} />
           
           <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {mode === 'Plant' ? (
                <div className="w-72 h-72 border-2 border-emerald-500/20 rounded-full relative">
                  <div className="absolute inset-0 border-4 border-emerald-500/5 rounded-full animate-ping" />
                  <div className="absolute top-1/2 left-0 w-full h-px bg-emerald-500/50 shadow-[0_0_20px_#10b981] animate-pulse" />
                </div>
              ) : (
                <div className="w-80 h-48 border-2 border-white/40 rounded-xl relative">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 bg-black/60 px-3 py-1 rounded text-[10px] text-white font-black uppercase">Align Animal Side-View</div>
                </div>
              )}
           </div>

           <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
              <button onClick={stopCamera} className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl text-white hover:bg-red-500 transition-all border border-white/10"><X className="w-6 h-6" /></button>
              <div className="flex flex-col items-center">
                 <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-1">{mode} Core Active</span>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest font-mono">Neural_Synapse_ON</span>
                 </div>
              </div>
              <div className="w-12 h-12" />
           </div>
           
           <div className="p-10 bg-slate-950 flex flex-col items-center gap-6">
              {mode === 'Plant' && (
                <div className="flex gap-2 w-full overflow-x-auto no-scrollbar justify-center">
                  {(['NDVI', 'Thermal', 'Pathogen'] as SpectralLens[]).map(lens => (
                      <button 
                        key={lens} 
                        onClick={() => setActiveLens(lens)}
                        className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${activeLens === lens ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-white/5 text-white/40 border-white/5'}`}
                      >
                        {lens}
                      </button>
                  ))}
                </div>
              )}
              <button 
                onClick={captureImage} 
                className="w-20 h-20 bg-white rounded-full border-[8px] border-white/10 shadow-2xl active:scale-90 transition-all flex items-center justify-center relative group"
              >
                <div className="w-14 h-14 rounded-full border-2 border-slate-900 group-hover:scale-110 transition-transform" />
              </button>
           </div>
           <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-slate-950 rounded-[3rem] p-20 text-center text-white relative overflow-hidden shadow-2xl border border-white/5">
           <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600 via-transparent to-transparent animate-pulse" />
           <div className="relative z-10">
              <RefreshCw className="w-20 h-20 text-emerald-400 mx-auto mb-8 animate-spin" />
              <h3 className="text-3xl font-black font-outfit tracking-tighter mb-4">Neural Synthesis</h3>
              <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-[0.3em] max-w-sm mx-auto">
                {mode === 'Plant' ? 'Interpolating Hyperspectral Variance' : 'Extracting Biometric Parameter Mesh'}
              </p>
           </div>
        </div>
      )}

      {/* Results View */}
      {(cropResult || liveResult) && (
        <div className="animate-in slide-in-from-bottom-8 duration-700">
           <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden">
              <div className="relative h-[25rem] overflow-hidden">
                 <img src={cropResult?.imageUrl || liveResult?.imageUrl} className={`w-full h-full object-cover transition-all duration-1000 ${mode === 'Plant' ? getLensStyle(activeLens) : ''}`} alt="Diagnostic scan" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/10 to-transparent" />
                 
                 <div className="absolute bottom-8 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                       <div className="flex items-center gap-2 mb-3">
                          <span className="bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-500 shadow-lg">Mode: {mode} Scan</span>
                          {mode === 'Plant' && (cropResult?.pathogenSignature?.spreadRisk === 'High' || cropResult?.pathogenSignature?.spreadRisk === 'Immediate') && (
                            <span className="bg-red-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full animate-bounce shadow-lg">Stress Alert</span>
                          )}
                       </div>
                       <h3 className="text-white text-4xl font-black font-outfit uppercase tracking-tighter">{cropResult?.cropName || liveResult?.breed} Identification</h3>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex flex-col items-center">
                       <p className="text-white/60 text-[8px] font-black uppercase tracking-widest mb-1">Health Matrix</p>
                       <span className="text-4xl font-black text-white font-outfit">{cropResult?.healthScore || liveResult?.healthGrade}</span>
                    </div>
                 </div>
              </div>

              <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                 <div className="lg:col-span-2 space-y-10">
                    {mode === 'Plant' && cropResult ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-emerald-50 p-5 rounded-[2rem] border border-emerald-100 text-center">
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">NDVI</p>
                            <span className="text-3xl font-black text-emerald-900 font-outfit">{cropResult.spectralAnalysis?.ndviValue.toFixed(2)}</span>
                        </div>
                        <div className="bg-blue-50 p-5 rounded-[2rem] border border-blue-100 text-center">
                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Chloro</p>
                            <span className="text-3xl font-black text-blue-900 font-outfit">{cropResult.spectralAnalysis?.chlorophyllIndex}%</span>
                        </div>
                        <div className="bg-orange-50 p-5 rounded-[2rem] border border-orange-100 text-center">
                            <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-2">Heat</p>
                            <span className="text-2xl font-black text-orange-900 font-outfit uppercase">{cropResult.spectralAnalysis?.thermalStress}</span>
                        </div>
                        <div className="bg-slate-900 p-5 rounded-[2rem] text-center shadow-xl">
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Conf</p>
                            <span className="text-3xl font-black text-white font-outfit">{cropResult.pathogenSignature?.certainty}%</span>
                        </div>
                      </div>
                    ) : liveResult && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-3xl border flex items-center gap-4">
                           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Ruler className="w-5 h-5" /></div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase">Body Length</p>
                              <p className="text-lg font-black">{liveResult.biometrics.bodyLength}cm</p>
                           </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border flex items-center gap-4">
                           <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Scale className="w-5 h-5" /></div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase">Est. Weight</p>
                              <p className="text-lg font-black">{liveResult.weightEstimate}kg</p>
                           </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border flex items-center gap-4">
                           <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Heart className="w-5 h-5" /></div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase">Age Class</p>
                              <p className="text-lg font-black">{liveResult.ageEstimate}</p>
                           </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-500" /> AI Diagnostic Narrative
                       </h4>
                       <p className="text-base font-medium text-slate-700 leading-relaxed italic border-l-4 border-emerald-500 pl-6">
                          "{cropResult?.report || liveResult?.vitalsNote}"
                       </p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
                       <div className="flex items-center gap-2 mb-6">
                          <Zap className="w-5 h-5 text-emerald-400" />
                          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Protocol Strategy</h4>
                       </div>
                       <ul className="space-y-4">
                          {(cropResult?.actionPlan || ['Isolate subject for monitoring', 'Calibrate local sensors', 'Consult Digital Advisor']).map((action, idx) => (
                             <li key={idx} className="flex gap-4">
                                <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0 border border-emerald-500/20">
                                   <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <span className="text-xs font-bold tracking-tight leading-snug text-slate-300">{action}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                    <button onClick={() => {setCropResult(null); setLiveResult(null);}} className="w-full py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all">Clear Feed</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FieldScanner;
