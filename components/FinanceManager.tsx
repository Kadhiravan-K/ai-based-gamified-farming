import React, { useState } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, DollarSign, Coins, X, Eye, EyeOff, Zap } from 'lucide-react';
import { FinanceRecord, FarmProfile } from '../types';

interface FinanceManagerProps {
  finances: FinanceRecord[];
  onAdd: (record: Omit<FinanceRecord, 'id' | 'date'>) => void;
  profile: FarmProfile;
}

const FinanceManager: React.FC<FinanceManagerProps> = ({ finances, onAdd, profile }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isMasked, setIsMasked] = useState(true);
  const [formData, setFormData] = useState({ 
    category: 'Seeds', 
    cropName: profile.crops[0]?.name || 'General',
    amount: '', 
    type: 'expense' as 'expense' | 'income', 
    note: '' 
  });

  const getCurrencySymbol = (location: string) => {
    const loc = location.toLowerCase();
    if (loc.includes('india') || loc.includes('salem') || loc.includes('tamil')) return '₹';
    if (loc.includes('uk') || loc.includes('london')) return '£';
    if (loc.includes('europe') || loc.includes('france') || loc.includes('germany')) return '€';
    return '$';
  };

  const currency = getCurrencySymbol(profile.location);

  const totalExpense = finances.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const totalIncome = finances.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const profit = totalIncome - totalExpense;

  const formatValue = (val: number) => {
    if (isMasked) return '••••';
    return `${currency}${val.toLocaleString()}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;
    onAdd({ 
      category: formData.category, 
      cropName: formData.cropName,
      amount: parseFloat(formData.amount), 
      type: formData.type, 
      note: formData.note 
    });
    setIsAdding(false);
    setFormData({ ...formData, amount: '', note: '', category: 'Seeds', cropName: profile.crops[0]?.name || 'General', type: 'expense' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-outfit">Finance</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMasked(!isMasked)}
            className="p-3 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-all"
            title={isMasked ? "Show Values" : "Hide Values"}
          >
            {isMasked ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 border border-emerald-200">
             <Zap className="w-4 h-4 fill-emerald-800" /> 0
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-full text-xs font-black border border-slate-200 uppercase text-slate-400">GUEST USER</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex items-center gap-6">
          <div className="p-4 bg-red-50 rounded-2xl text-red-600"><TrendingDown className="w-8 h-8" /></div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Investment</p>
            <h4 className="text-4xl font-black text-slate-900 font-outfit">{formatValue(totalExpense)}</h4>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex items-center gap-6">
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600"><TrendingUp className="w-8 h-8" /></div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Returns</p>
            <h4 className="text-4xl font-black text-slate-900 font-outfit">{formatValue(totalIncome)}</h4>
          </div>
        </div>

        <div className="bg-[#059669] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <p className="text-[11px] font-black uppercase opacity-70 tracking-widest">Net ROI</p>
            <Wallet className="w-6 h-6 opacity-40" />
          </div>
          <h4 className="text-5xl font-black tracking-tighter font-outfit relative z-10">{formatValue(profit)}</h4>
          <div className="absolute top-0 right-0 p-12 opacity-5"><DollarSign className="w-48 h-48" /></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4">
        <h3 className="text-2xl font-black text-slate-900 font-outfit self-start">Financial Ledger</h3>
        <button onClick={() => setIsAdding(true)} className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all text-sm uppercase tracking-widest">
          <Plus className="w-4 h-4" /> Log Transaction
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2rem] border-2 border-emerald-100 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mb-8 flex items-center justify-between">
             <h4 className="text-lg font-black text-black font-outfit uppercase">Add Entry</h4>
             <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-black transition-all"><X className="w-6 h-6" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">1. Transaction Type</label>
               <div className="flex gap-2">
                <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-4 rounded-xl font-black text-[11px] transition-all border-2 ${formData.type === 'expense' ? 'bg-red-500 text-white border-red-500 shadow-lg' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-300'}`}>EXPENSE</button>
                <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-4 rounded-xl font-black text-[11px] transition-all border-2 ${formData.type === 'income' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-300'}`}>INCOME</button>
               </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">2. Targeted Crop</label>
              <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-sm outline-none appearance-none" value={formData.cropName} onChange={e => setFormData({...formData, cropName: e.target.value})}>
                <option value="General">General Farm</option>
                {profile.crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">3. Value ({currency})</label>
              <input type="number" step="any" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-sm outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">4. Resource Category</label>
              <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-sm outline-none appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Seeds</option><option>Fertilizer</option><option>Labor</option><option>Irrigation</option><option>Sale</option>
              </select>
            </div>
            <button type="submit" className="md:col-span-4 bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl">
              Finalize & Secure Entry
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Timeline</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Variety</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Resource</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {finances.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50/50">
                <td className="px-8 py-5 text-[11px] font-bold text-slate-400">{record.date}</td>
                <td className="px-8 py-5"><span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-black uppercase tracking-tighter">{record.cropName}</span></td>
                <td className="px-8 py-5 text-sm font-black text-black">{record.category}</td>
                <td className={`px-8 py-5 text-sm text-right font-black ${record.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {record.type === 'expense' ? '-' : '+'}{formatValue(record.amount)}
                </td>
              </tr>
            ))}
            {finances.length === 0 && (
              <tr><td colSpan={4} className="py-24 text-center"><Coins className="w-16 h-16 text-slate-200 mx-auto mb-4" /><p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No history found</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceManager;