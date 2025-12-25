import React, { useState } from 'react';
import { User, FarmProfile, CropEntry, LandUnit } from '../types';
import { 
  User as UserIcon, 
  Sprout, 
  Trash2, 
  Save, 
  Mail, 
  RefreshCcw,
  CheckCircle,
  Plus,
  X,
  Ruler,
  Wallet,
  Users
} from 'lucide-react';

interface SettingsProps {
  user: User;
  profile: FarmProfile;
  onUserUpdate: (user: User) => void;
  onProfileUpdate: (profile: FarmProfile) => void;
  onReset: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, profile, onUserUpdate, onProfileUpdate, onReset }) => {
  const [localUser, setLocalUser] = useState(user);
  const [localProfile, setLocalProfile] = useState(profile);
  const [newCrop, setNewCrop] = useState({ name: '', area: '', unit: profile.unit || ('Acres' as LandUnit) });
  const [activeUnit, setActiveUnit] = useState<LandUnit>(profile.unit || 'Acres');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const landUnits: LandUnit[] = ['Acres', 'Hectares', 'Bigha', 'Kanal', 'Marla', 'Guntha', 'Cents', 'Biswa'];

  const handleSave = () => {
    setSaveStatus('saving');
    const totalArea = localProfile.crops.reduce((sum, c) => sum + c.area, 0);
    const updatedProfile = { ...localProfile, totalArea, unit: activeUnit };
    
    setTimeout(() => {
      onUserUpdate(localUser);
      onProfileUpdate(updatedProfile);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const addCrop = () => {
    const areaValue = parseFloat(newCrop.area);
    if (newCrop.name.trim() && !isNaN(areaValue) && areaValue > 0) {
      setLocalProfile({
        ...localProfile,
        crops: [...localProfile.crops, { 
          id: Math.random().toString(36).substr(2, 9),
          name: newCrop.name,
          area: areaValue,
          unit: newCrop.unit
        }]
      });
      setNewCrop({ name: '', area: '', unit: activeUnit });
    }
  };

  const removeCrop = (index: number) => {
    setLocalProfile({
      ...localProfile,
      crops: localProfile.crops.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-32 no-horizontal-scroll">
      
      {/* Identity Profile */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 font-outfit">Identity Profile</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage your farmer credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest px-1">Display Name</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                value={localUser.name}
                onChange={(e) => setLocalUser({ ...localUser, name: e.target.value })}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-black text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email"
                value={localUser.email}
                onChange={(e) => setLocalUser({ ...localUser, email: e.target.value })}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-black text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* New Entry Pipeline */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="p-6 bg-[#f0fdf9] rounded-[2.5rem] border border-[#ccfbf1] flex flex-col gap-5">
          <h4 className="text-[11px] font-black text-[#0f766e] uppercase tracking-[0.15em] px-1">NEW ENTRY PIPELINE</h4>
          <div className="flex flex-col gap-4">
            <input 
              placeholder="Crop Variety (e.g. Rice)"
              value={newCrop.name}
              onChange={e => setNewCrop({ ...newCrop, name: e.target.value })}
              className="w-full px-6 py-5 bg-white border border-[#ccfbf1] rounded-[1.8rem] text-sm font-black text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-[#10b98115] outline-none shadow-sm transition-all"
            />
            
            <div className="flex items-center gap-3">
              <div className="flex-1 relative flex items-center group border-[#ccfbf1] border rounded-[1.8rem] bg-white overflow-hidden">
                <input 
                  type="number"
                  step="any"
                  placeholder="Area"
                  value={newCrop.area}
                  onChange={e => setNewCrop({ ...newCrop, area: e.target.value })}
                  className="w-full pl-6 pr-32 py-5 bg-transparent text-sm font-black text-slate-900 placeholder:text-slate-400 focus:ring-0 outline-none"
                />
                <div className="absolute right-4 flex items-center gap-2">
                  <div className="bg-[#f8fafc] border border-slate-200 rounded-full px-2 py-1 flex items-center shadow-sm">
                    <select
                      className="text-[10px] font-black text-slate-500 bg-transparent uppercase tracking-widest outline-none cursor-pointer px-2 py-1"
                      value={newCrop.unit}
                      onChange={e => setNewCrop({ ...newCrop, unit: e.target.value as LandUnit })}
                    >
                      {landUnits.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={addCrop}
                disabled={!newCrop.name || !newCrop.area}
                className="px-8 py-5 bg-slate-900 text-white rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.15em] hover:bg-[#10b981] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" /> ADD
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {localProfile.crops.map((crop, idx) => (
            <div key={crop.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h5 className="font-black text-sm text-slate-900">{crop.name}</h5>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{crop.area} {crop.unit}</p>
                </div>
              </div>
              <button onClick={() => removeCrop(idx)} className="p-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Primary Unit Logic Grid */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-slate-100 rounded-2xl text-slate-700">
            <Ruler className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 font-outfit">Primary Unit Logic</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GLOBAL SCALING FOR AREA MEASUREMENTS</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {landUnits.map(u => (
            <button 
              key={u}
              onClick={() => setActiveUnit(u)}
              className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                activeUnit === u ? 'bg-[#1e293b] text-white border-[#1e293b] shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 px-1">
        <button 
          onClick={handleSave}
          disabled={saveStatus !== 'idle'}
          className={`w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-3 px-8 py-5 rounded-[1.5rem] font-black transition-all shadow-xl shadow-slate-200 ${
            saveStatus === 'saved' ? 'bg-emerald-100 text-emerald-800' : 
            saveStatus === 'saving' ? 'bg-slate-100 text-slate-400 border-none shadow-none' : 
            'bg-slate-900 text-white hover:bg-emerald-600'
          }`}
        >
          {saveStatus === 'idle' && <><Save className="w-5 h-5" /> Commit Node Profile</>}
          {saveStatus === 'saving' && <><RefreshCcw className="w-5 h-5 animate-spin" /> Uplinking Core...</>}
          {saveStatus === 'saved' && <><CheckCircle className="w-5 h-5" /> Verified & Saved!</>}
        </button>
      </div>
    </div>
  );
};

export default Settings;