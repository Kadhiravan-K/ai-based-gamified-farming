
import React, { useState } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, DollarSign, PieChart, Info } from 'lucide-react';
import { FinanceRecord } from '../types';

interface FinanceManagerProps {
  finances: FinanceRecord[];
  onAdd: (record: Omit<FinanceRecord, 'id' | 'date'>) => void;
}

const FinanceManager: React.FC<FinanceManagerProps> = ({ finances, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ category: 'Seeds', amount: '', type: 'expense' as 'expense' | 'income', note: '' });

  const totalExpense = finances.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const totalIncome = finances.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const profit = totalIncome - totalExpense;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;
    onAdd({ 
      category: formData.category, 
      amount: parseFloat(formData.amount), 
      type: formData.type, 
      note: formData.note 
    });
    setIsAdding(false);
    setFormData({ category: 'Seeds', amount: '', type: 'expense', note: '' });
  };

  return (
    <div className="space-y-6">
      {/* Finance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-50 rounded-2xl text-red-600"><TrendingDown className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Investment</p>
              <h4 className="text-2xl font-black text-slate-900">${totalExpense.toLocaleString()}</h4>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full w-[65%]" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Returns</p>
              <h4 className="text-2xl font-black text-slate-900">${totalIncome.toLocaleString()}</h4>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[45%]" />
          </div>
        </div>
        <div className={`p-6 rounded-3xl border shadow-lg ${profit >= 0 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Net Profit / Loss</p>
            <Wallet className="w-5 h-5 opacity-40" />
          </div>
          <h4 className="text-3xl font-black tracking-tight">${profit.toLocaleString()}</h4>
          <p className="text-[10px] mt-2 font-bold opacity-70">Real-time Yield Forecast</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <h3 className="text-xl font-black text-slate-900 font-outfit">Transaction Ledger</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-600 transition-all text-sm"
        >
          <Plus className="w-4 h-4" /> New Record
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2rem] border-2 border-emerald-100 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Category</label>
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>Seeds</option><option>Fertilizer</option><option>Labor</option><option>Equipment</option><option>Crop Sale</option><option>Subsidy</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Amount ($)</label>
              <input 
                type="number" required placeholder="0.00"
                className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Type</label>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, type: 'expense'})}
                  className={`flex-1 py-4 rounded-xl font-black text-xs transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}
                >Expense</button>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, type: 'income'})}
                  className={`flex-1 py-4 rounded-xl font-black text-xs transition-all ${formData.type === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}
                >Income</button>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black text-xs hover:bg-emerald-600 transition-all">Save</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-xs text-slate-400 hover:text-red-500">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {finances.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 text-sm font-bold text-slate-500">{record.date}</td>
                <td className="px-8 py-5 text-sm font-black text-slate-900">{record.category}</td>
                <td className={`px-8 py-5 text-sm font-black ${record.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {record.type === 'expense' ? '-' : '+'}${record.amount.toLocaleString()}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${record.type === 'expense' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {record.type}
                  </span>
                </td>
              </tr>
            ))}
            {finances.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <PieChart className="w-12 h-12 opacity-10" />
                    <p className="text-sm font-bold">No financial history detected.</p>
                  </div>
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
