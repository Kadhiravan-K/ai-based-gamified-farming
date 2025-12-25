
import React, { useState } from 'react';
import { Database, Link as LinkIcon, ShieldCheck, Cpu, RefreshCw, Plus, Package, Hash, History, ExternalLink, Box, Zap, TrendingUp, X } from 'lucide-react';
import { BlockchainRecord, FarmProfile, FarmerState, AgriNotification } from '../types';
import { verifyHarvestForBlockchain, getMarketPulse } from '../services/geminiService';

interface BlockchainLedgerProps {
  profile: FarmProfile;
  ledger: BlockchainRecord[];
  onAdd: (record: BlockchainRecord) => void;
  onNewNotification: (notification: AgriNotification) => void;
  farmHistory: any[];
}

const BlockchainLedger: React.FC<BlockchainLedgerProps> = ({ profile, ledger, onAdd, onNewNotification, farmHistory }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBatch, setNewBatch] = useState({ cropName: profile.crops[0]?.name || '', quantity: 0, unit: profile.unit });

  const generateHash = () => {
    return '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  const handleMint = async () => {
    setLoading(true);
    try {
      const verification = await verifyHarvestForBlockchain(newBatch.cropName, farmHistory, profile);
      
      const prevHash = ledger.length > 0 ? ledger[0].hash : '00000000000000000000000000000000';
      /* Fixed: Added status property to comply with BlockchainRecord interface */
      const record: BlockchainRecord = {
        id: `TX-${Date.now()}`,
        hash: generateHash(),
        previousHash: prevHash,
        timestamp: new Date().toISOString(),
        cropName: newBatch.cropName,
        quantity: newBatch.quantity,
        unit: newBatch.unit,
        farmerId: 'AG-782',
        sustainabilityScore: verification.score,
        isVerified: verification.score > 60,
        aiVerificationNote: verification.note,
        status: 'waiting'
      };
      
      onAdd(record);

      const pulse = await getMarketPulse(profile, newBatch.cropName);
      if (pulse.sellingSignal === 'Sell' || pulse.priceRating === 'Peak' || pulse.priceRating === 'Excellent') {
        onNewNotification({
          id: `PRICE-${Date.now()}`,
          title: `🔥 Profit Alert: ${newBatch.cropName} Market High!`,
          text: `Today's price for your freshly minted ${newBatch.cropName} harvest is ${pulse.priceRating} at $${pulse.currentPrice}. AgriBot Signal: ${pulse.sellingSignal}. Sell now for maximum ROI!`,
          type: 'price_alert',
          date: new Date().toISOString(),
          read: false
        });
      }

      setIsMinting(false);
      setNewBatch({ cropName: profile.crops[0]?.name || '', quantity: 0, unit: profile.unit });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-outfit flex items-center gap-3">
            <LinkIcon className="w-8 h-8 text-emerald-600" />
            Supply Chain Ledger
          </h2>
          <p className="text-slate-500 font-bold text-sm tracking-tight">Immutable verification & post-harvest market oracles</p>
        </div>
        <button 
          onClick={() => setIsMinting(true)}
          className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-600 transition-all"
        >
          <Plus className="w-5 h-5" /> Mint Harvest Batch
        </button>
      </div>

      {isMinting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-black font-outfit uppercase">Blockchain Minting</h3>
              <button onClick={() => setIsMinting(false)} className="p-2 text-slate-400 hover:text-black transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block px-1">Select Crop Variety</label>
                  <select 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm text-black outline-none focus:border-emerald-500 transition-all"
                    value={newBatch.cropName}
                    onChange={e => setNewBatch({...newBatch, cropName: e.target.value})}
                  >
                    {profile.crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block px-1">Harvest Quantity</label>
                  <div className="flex gap-4">
                    <input 
                      type="number"
                      placeholder="e.g. 500"
                      className="flex-1 p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm text-black outline-none focus:border-emerald-500 transition-all placeholder:text-slate-300"
                      value={newBatch.quantity || ''}
                      onChange={e => setNewBatch({...newBatch, quantity: parseFloat(e.target.value) || 0})}
                    />
                    <div className="px-6 bg-slate-100 border-2 border-slate-200 rounded-2xl font-black text-[10px] text-slate-500 uppercase flex items-center tracking-widest">{newBatch.unit}</div>
                  </div>
               </div>

               <div className="bg-emerald-50 p-8 rounded-[2rem] border-2 border-emerald-100 space-y-4">
                  <div className="flex items-center gap-3 text-emerald-800">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">AI Oracle Protocol Active</span>
                  </div>
                  <p className="text-xs text-emerald-700 font-bold leading-relaxed">
                    By minting, you authorize the AI Oracle to analyze your farm's sustainable practice history. Verified batches receive a premium digital signature on the chain.
                  </p>
               </div>

               <button 
                  onClick={handleMint}
                  disabled={loading || !newBatch.quantity}
                  className="w-full bg-slate-900 text-white py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-600 transition-all disabled:opacity-50 active:scale-[0.98]"
               >
                  {loading ? (
                    <div className="flex flex-col items-center gap-2">
                       <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                       <span className="text-[9px] font-black uppercase tracking-widest animate-pulse">Computing Cryptography...</span>
                    </div>
                  ) : 'Confirm Immutable Entry'}
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {ledger.map((block) => (
          <div key={block.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="bg-slate-900 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <Box className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg uppercase tracking-tight">{block.cropName} Harvest</h3>
                    <p className="text-slate-400 text-[10px] font-mono tracking-widest">{block.id}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {block.isVerified && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-5 py-2 rounded-full border border-emerald-500/20">
                       <ShieldCheck className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Premium Proof</span>
                    </div>
                  )}
                  <div className="bg-white/5 px-6 py-2 rounded-xl border border-white/10 text-white font-black text-sm">
                    {block.quantity} {block.unit}
                  </div>
               </div>
            </div>
            
            <div className="p-10 grid grid-cols-1 lg:grid-cols-4 gap-12 bg-slate-50/20">
               <div className="lg:col-span-3 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5" /> Current Block Hash
                      </span>
                      <p className="text-[10px] font-mono bg-white p-4 rounded-xl border border-slate-200 truncate text-slate-800 shadow-inner">{block.hash}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <History className="w-3.5 h-3.5" /> Parent Hash
                      </span>
                      <p className="text-[10px] font-mono bg-white p-4 rounded-xl border border-slate-200 truncate text-slate-400 shadow-inner">{block.previousHash}</p>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] border-2 border-emerald-50 shadow-sm flex flex-col sm:flex-row items-center gap-8">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="text-4xl font-black text-emerald-600 font-outfit">{block.sustainabilityScore}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Eco Score</span>
                    </div>
                    <div className="w-px h-12 bg-slate-100 hidden sm:block" />
                    <p className="text-sm text-slate-800 font-black tracking-tight leading-relaxed italic">"{block.aiVerificationNote}"</p>
                  </div>
               </div>

               <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 text-center shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Timestamp</p>
                    <p className="text-sm font-black text-black">{new Date(block.timestamp).toLocaleDateString()}</p>
                    <p className="text-[11px] font-bold text-slate-500 mt-1">{new Date(block.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <button className="w-full py-5 bg-slate-100 rounded-[1.5rem] text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm active:scale-95">
                    <ExternalLink className="w-4 h-4" /> Block Explorer
                  </button>
               </div>
            </div>
          </div>
        ))}

        {ledger.length === 0 && (
          <div className="py-32 flex flex-col items-center text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Database className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 font-outfit">Ledger Buffer Empty</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto font-black text-sm uppercase tracking-tight">
              Begin minting your harvest varieties to generate immutable sustainability proofs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainLedger;
