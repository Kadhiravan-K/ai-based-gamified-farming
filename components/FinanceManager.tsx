import React, { useState } from 'react';
// Added X icon to imports
import { Plus, Wallet, TrendingUp, TrendingDown, DollarSign, PieChart, Coins, X } from 'lucide-react';
import { FinanceRecord, FarmProfile } from '../types';

interface FinanceManagerProps {
  finances: FinanceRecord[];
  onAdd: (record: Omit<FinanceRecord, 'id' | 'date'>) => void;
  profile: FarmProfile;
}

const FinanceManager: React.FC<FinanceManagerProps> = ({ finances, onAdd, profile }) => {
  const [isAdding, setIsAdding] = useState(false);
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
    setFormData({ ...formData, amount: '', note: '' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-50 rounded-2xl text-red-600"><TrendingDown className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Investment</p>
              <h4 className="text-2xl font-black text-black">{currency}{totalExpense.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Returns</p>
              <h4 className="text-2xl font-black text-black">{currency}{totalIncome.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className={`p-6 rounded-3xl border shadow-lg ${profit >= 0 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Net ROI</p>
            <Wallet className="w-5 h-5 opacity-40" />
          </div>
          <h4 className="text-3xl font-black tracking-tight">{currency}{profit.toLocaleString()}</h4>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <h3 className="text-xl font-black text-slate-900 font-outfit">Financial Ledger</h3>
        <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-600 transition-all text-sm">
          <Plus className="w-4 h-4" /> Log Transaction
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2rem] border-2 border-emerald-100 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mb-8 flex items-center justify-between">
             <h4 className="text-lg font-black text-black font-outfit">Add Entry</h4>
             <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-black"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">1. Transaction Type</label>
               <div className="flex gap-2">
                <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-4 rounded-xl font-black text-[11px] transition-all border-2 ${formData.type === 'expense' ? 'bg-red-500 text-white border-red-500 shadow-lg' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-300'}`}>EXPENSE</button>
                <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-4 rounded-xl font-black text-[11px] transition-all border-2 ${formData.type === 'income' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-300'}`}>INCOME</button>
               </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">2. Targeted Crop</label>
              <select 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-sm text-black outline-none focus:border-emerald-500 transition-all"
                value={formData.cropName}
                onChange={e => setFormData({...formData, cropName: e.target.value})}
              >
                <option value="General">General Farm</option>
                {profile.crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">3. Value ({currency})</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">{currency}</span>
                <input type="number" required className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-sm text-black outline-none focus:border-emerald-500 transition-all" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">4. Resource Category</label>
              <select 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-sm text-black outline-none focus:border-emerald-500 transition-all"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>Seeds</option><option>Fertilizer</option><option>Labor</option><option>Irrigation</option><option>Sale</option><option>Pesticides</option><option>Hardware</option>
              </select>
            </div>

            <button type="submit" className="md:col-span-4 bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-[0.98]">
              Finalize & Secure Entry
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
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
                  {record.type === 'expense' ? '-' : '+'}{currency}{record.amount.toLocaleString()}
                </td>
              </tr>
            ))}
            {finances.length === 0 && (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <Coins className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No transaction history found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceManager;