
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Zap, 
  X, 
  Gem, 
  RefreshCw, 
  Plus, 
  ShoppingCart, 
  MapPin, 
  CheckCircle2, 
  Hash, 
  History, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  Database,
  Link as LinkIcon,
  Tag,
  TrendingUp,
  TrendingDown,
  PackageCheck,
  QrCode,
  Lock,
  ArrowUpRight,
  Thermometer,
  Droplet
} from 'lucide-react';
import { BlockchainRecord, FarmProfile, MarketTrend, UserRole } from '../types';
import { verifyHarvestForBlockchain, getMarketPulse } from '../services/geminiService';

interface MarketOracleProps {
  profile: FarmProfile;
  ledger: BlockchainRecord[];
  onAdd: (record: BlockchainRecord) => void;
  onSell: (record: BlockchainRecord, salePrice: number) => void;
  onUpdateRecord: (id: string, updates: Partial<BlockchainRecord>) => void;
  isOnline: boolean;
  farmHistory: any[];
  userRole: UserRole;
}

const MarketOracle: React.FC<MarketOracleProps> = ({ profile, ledger, onAdd, onSell, onUpdateRecord, isOnline, farmHistory, userRole }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<Record<string, MarketTrend>>({});
  const [newBatch, setNewBatch] = useState({ cropName: profile.crops[0]?.name || '', quantity: 0, unit: profile.unit, targetPrice: 0 });
  const [selectedProof, setSelectedProof] = useState<BlockchainRecord | null>(null);

  const refreshMarkets = async () => {
    if (!isOnline) return;
    setLoading(true);
    const uniqueCrops = Array.from(new Set(ledger.map(b => b.cropName)));
    if (uniqueCrops.length === 0 && profile.crops.length > 0) uniqueCrops.push(profile.crops[0].name);
    
    const pulses: Record<string, MarketTrend> = {};
    for (const crop of uniqueCrops) {
      try {
        const trend = await getMarketPulse(profile, crop);
        pulses[crop] = trend;
      } catch (e) { console.error(e); }
    }
    setMarketData(pulses);
    setLoading(false);
  };

  useEffect(() => {
    if (userRole !== 'farmer') return;
    ledger.forEach(batch => {
      const trend = marketData[batch.cropName];
      if (batch.status === 'waiting' && batch.targetPrice && trend && trend.currentPrice >= batch.targetPrice) {
         onUpdateRecord(batch.id, { status: 'ready_to_sell' });
      }
    });
  }, [marketData, ledger, userRole]);

  useEffect(() => {
    refreshMarkets();
    const interval = setInterval(refreshMarkets, 60000);
    return () => clearInterval(interval);
  }, [isOnline]);

  const handleMint = async () => {
    setLoading(true);
    try {
      const verification = await verifyHarvestForBlockchain(newBatch.cropName, farmHistory, profile);
      const prevHash = ledger.length > 0 ? ledger[0].hash : '0x0000000000000000';
      
      const record: BlockchainRecord = {
        id: `TX-${Date.now()}`,
        hash: '0x' + Math.random().toString(16).substr(2, 32),
        previousHash: prevHash,
        timestamp: new Date().toISOString(),
        cropName: newBatch.cropName,
        quantity: newBatch.quantity,
        unit: newBatch.unit,
        farmerId: 'AG-782',
        farmerName: profile.location.split(',')[0] + ' Producer',
        location: profile.location,
        sustainabilityScore: verification.score,
        isVerified: verification.score > 60,
        aiVerificationNote: verification.note,
        status: 'waiting',
        targetPrice: newBatch.targetPrice || undefined,
        escrowStatus: 'locked',
        iotLogs: [
          { time: '10:00', temp: 22, humidity: 65 },
          { time: '12:00', temp: 24, humidity: 60 },
          { time: '14:00', temp: 23, humidity: 62 }
        ],
        traceabilityProof: {
          seedSource: 'Certified AI_Core_Seed v1.2',
          sowingDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          diagnosticHistoryCount: farmHistory.length
        }
      };
      
      onAdd(record);
      setIsMinting(false);
      setNewBatch({ ...newBatch, quantity: 0, targetPrice: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-outfit flex items-center gap-3">
            <Gem className="w-8 h-8 text-emerald-600" />
            Market Oracle
          </h2>
          <p className="text-slate-500 font-bold text-sm tracking-tight">Decentralized Value Chain & IoT Oracle Ledger</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {userRole === 'farmer' && (
            <button onClick={() => setIsMinting(true)} className="flex-1 md:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-600 transition-all">
              <Plus className="w-5 h-5" /> Mint Harvest
            </button>
          )}
        </div>
      </div>

      {isMinting && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-black font-outfit uppercase tracking-tighter">Blockchain Registry</h3>
              <button onClick={() => setIsMinting(false)} className="p-2 text-slate-400 hover:text-black transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Variety</label>
                  <select 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-sm text-black outline-none focus:border-emerald-500 transition-all"
                    value={newBatch.cropName}
                    onChange={e => setNewBatch({...newBatch, cropName: e.target.value})}
                  >
                    {profile.crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Harvest Vol ({profile.unit})</label>
                  <input 
                    type="number"
                    placeholder="e.g. 1500"
                    className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-sm text-black outline-none focus:border-emerald-500 transition-all"
                    value={newBatch.quantity || ''}
                    onChange={e => setNewBatch({...newBatch, quantity: parseFloat(e.target.value) || 0})}
                  />
               </div>
               <button onClick={handleMint} disabled={loading || !newBatch.quantity} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all active:scale-[0.98]">
                  {loading ? <RefreshCw className="w-6 h-6 animate-spin mx-auto" /> : 'Finalize Seed-to-Shelf Audit'}
               </button>
            </div>
          </div>
        </div>
      )}

      {selectedProof && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl animate-in slide-in-from-bottom-12 duration-500 border border-slate-200 overflow-hidden relative">
            <button onClick={() => setSelectedProof(null)} className="absolute top-10 right-10 p-3 bg-slate-100 rounded-2xl text-slate-500 hover:text-black"><X className="w-6 h-6" /></button>
            
            <div className="flex items-center gap-4 mb-10">
              <div className="p-5 bg-slate-900 rounded-[2rem] text-emerald-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 font-outfit uppercase tracking-tighter">Traceability Proof</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Twin & IoT Oracle Audit Log</p>
              </div>
            </div>

            <div className="space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-center mb-6">
                 <div className="p-6 bg-slate-50 border rounded-[2rem] shadow-inner relative group">
                    <QrCode className="w-32 h-32 text-slate-900" />
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-[2rem]">
                       <span className="text-[8px] font-black uppercase text-slate-900 tracking-widest">Consumer Verify Scan</span>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-[2.5rem] border border-blue-100">
                <h4 className="text-[11px] font-black text-blue-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Thermometer className="w-4 h-4" /> IoT Oracle Cold-Chain Logs</h4>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProof.iotLogs?.map((log, i) => (
                    <div key={i} className="bg-white/50 p-3 rounded-xl border border-blue-100 text-center">
                      <p className="text-[8px] font-black text-slate-400">{log.time}</p>
                      <p className="text-xs font-black text-blue-900">{log.temp}°C</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Seed Integrity</span>
                   <p className="text-sm font-black text-slate-900">{selectedProof.traceabilityProof?.seedSource || 'N/A'}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sowing Date</span>
                   <p className="text-sm font-black text-slate-900">{selectedProof.traceabilityProof?.sowingDate || 'N/A'}</p>
                </div>
              </div>

              <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
                <div className="flex items-center justify-between mb-6">
                   <h4 className="text-[11px] font-black text-emerald-800 uppercase tracking-[0.2em]">Sustainability Signature</h4>
                   <span className="text-3xl font-black text-emerald-600 font-outfit">{selectedProof.sustainabilityScore}/100</span>
                </div>
                <p className="text-base font-medium text-emerald-900 italic leading-relaxed">"{selectedProof.aiVerificationNote}"</p>
              </div>

              <div className="space-y-3 pb-4">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Database className="w-3 h-3" /> Immutable Fingerprint
                 </span>
                 <p className="text-[10px] font-mono bg-slate-900 text-emerald-400 p-5 rounded-2xl break-all leading-relaxed shadow-inner">
                    Hash: {selectedProof.hash}<br/>
                    Parent: {selectedProof.previousHash}
                 </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <button onClick={() => setSelectedProof(null)} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em]">Close Audit View</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {ledger.map((block) => {
          const trend = marketData[block.cropName];

          return (
            <div key={block.id} className={`bg-white rounded-[3.5rem] border overflow-hidden transition-all duration-500 group ${block.status === 'ready_to_sell' ? 'border-emerald-500 ring-8 ring-emerald-500/5' : 'border-slate-200 shadow-sm'}`}>
              <div className={`p-10 flex flex-col sm:flex-row items-center justify-between gap-6 ${block.status === 'sold' ? 'bg-slate-100' : 'bg-slate-900'}`}>
                 <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center border transition-all ${block.status === 'sold' ? 'bg-slate-200 border-slate-300' : 'bg-white/5 border-white/10 group-hover:scale-110'}`}>
                      <Box className={`w-8 h-8 ${block.status === 'sold' ? 'text-slate-400' : 'text-emerald-400'}`} />
                    </div>
                    <div>
                      <h3 className={`font-black text-2xl uppercase tracking-tighter leading-none ${block.status === 'sold' ? 'text-slate-500' : 'text-white'}`}>
                        {block.cropName} Harvest
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                         <MapPin className="w-3.5 h-3.5 text-slate-500" />
                         <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{block.location || 'Local Node'}</span>
                      </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    {block.status === 'ready_to_sell' && (
                       <div className="bg-emerald-600 text-white px-6 py-2.5 rounded-full border border-emerald-500 animate-pulse flex items-center gap-3">
                          <Tag className="w-4 h-4" />
                          <span className="text-[11px] font-black uppercase tracking-widest">Direct Trade Open</span>
                       </div>
                    )}
                    <div className={`px-8 py-3 rounded-2xl border font-black text-lg ${block.status === 'sold' ? 'bg-slate-200 text-slate-500' : 'bg-white/5 text-white border-white/10'}`}>
                      {block.quantity} {block.unit}
                    </div>
                 </div>
              </div>
              
              <div className="p-10 grid grid-cols-1 lg:grid-cols-4 gap-12 bg-slate-50/20">
                 <div className="lg:col-span-3 space-y-8">
                    {block.status !== 'sold' && trend && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Mandi Oracle Index</span>
                               <span className="text-5xl font-black text-black font-outfit leading-none">${trend.currentPrice}</span>
                            </div>
                            <div className={`p-4 rounded-2xl ${trend.priceTrend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                               {trend.priceTrend === 'up' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                            </div>
                         </div>
                         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                               <Sparkles className="w-4 h-4 text-emerald-500" /> Automated Trading Signal
                            </span>
                            <div className="flex items-center gap-3">
                               <span className="px-5 py-2 bg-slate-900 text-white text-[11px] font-black uppercase rounded-full">{trend.sellingSignal}</span>
                               <p className="text-[11px] font-bold text-slate-500 leading-tight">Target: ${block.targetPrice || 'N/A'}</p>
                            </div>
                         </div>
                      </div>
                    )}

                    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 flex flex-col sm:flex-row items-center gap-10 shadow-sm group/audit cursor-pointer" onClick={() => setSelectedProof(block)}>
                      <div className="flex flex-col items-center shrink-0">
                        <span className="text-5xl font-black text-emerald-600 font-outfit">{block.sustainabilityScore}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Eco Score</span>
                      </div>
                      <div className="w-px h-16 bg-slate-100 hidden sm:block" />
                      <div className="flex-1">
                         <p className="text-base text-black font-black tracking-tight leading-relaxed italic opacity-80 mb-4">"{block.aiVerificationNote}"</p>
                         <div className="flex items-center gap-4">
                            <button className="text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover/audit:gap-4 transition-all">
                                Verify Traceability Passport <QrCode className="w-4 h-4" />
                            </button>
                            {block.escrowStatus && (
                               <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase">
                                  <Lock className="w-3 h-3" /> Escrow: {block.escrowStatus}
                               </div>
                            )}
                         </div>
                      </div>
                    </div>
                 </div>

                 <div className="lg:col-span-1 space-y-4">
                    {block.status === 'ready_to_sell' && userRole === 'farmer' && (
                       <button onClick={() => onSell(block, trend?.currentPrice || 0)} className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                         <PackageCheck className="w-5 h-5" /> Confirm Direct Sale
                       </button>
                    )}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mint Date</p>
                      <p className="text-sm font-black text-black">{new Date(block.timestamp).toLocaleDateString()}</p>
                    </div>
                    <button className="w-full py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-all flex items-center justify-center gap-2">
                       <LinkIcon className="w-4 h-4" /> Agri-Scan Explorer
                    </button>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketOracle;
