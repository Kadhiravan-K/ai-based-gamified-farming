
import React, { useState } from 'react';
import { User, FarmProfile } from '../types';
import { 
  User as UserIcon, 
  Sprout, 
  Shield, 
  Trash2, 
  Save, 
  Mail, 
  MapPin, 
  Maximize2, 
  RefreshCcw,
  CheckCircle,
  AlertCircle,
  X
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
  const [newCrop, setNewCrop] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      onUserUpdate(localUser);
      onProfileUpdate(localProfile);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const addCrop = () => {
    if (newCrop.trim() && !localProfile.crops.includes(newCrop.trim())) {
      setLocalProfile({
        ...localProfile,
        crops: [...localProfile.crops, newCrop.trim()]
      });
      setNewCrop('');
    }
  };

  const removeCrop = (cropToRemove: string) => {
    setLocalProfile({
      ...localProfile,
      crops: localProfile.crops.filter(c => c !== cropToRemove)
    });
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      {/* Profile Section */}
      <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 font-outfit">Identity Profile</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage your farmer identity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest px-1">Display Name</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                value={localUser.name}
                onChange={(e) => setLocalUser({ ...localUser, name: e.target.value })}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email"
                value={localUser.email}
                onChange={(e) => setLocalUser({ ...localUser, email: e.target.value })}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Farm Profile Section */}
      <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 font-outfit">Farm Configuration</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update your agricultural parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest px-1">Crop Ecosystem</label>
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[100px] items-start">
                {localProfile.crops.map(crop => (
                  <span key={crop} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 border border-emerald-200">
                    {crop}
                    <button onClick={() => removeCrop(crop)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {localProfile.crops.length === 0 && <span className="text-slate-400 text-xs py-1.5 italic">No crops listed</span>}
              </div>
            </div>
            
            <div className="flex gap-2">
              <input 
                value={newCrop}
                onChange={(e) => setNewCrop(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCrop())}
                placeholder="Add crop (e.g. Millet)"
                className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 outline-none"
              />
              <button onClick={addCrop} className="bg-slate-900 text-white px-5 rounded-xl text-xs font-black uppercase hover:bg-emerald-600 transition-all">Add</button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest px-1">Farm Size</label>
              <div className="relative">
                <Maximize2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={localProfile.farmSize}
                  onChange={(e) => setLocalProfile({ ...localProfile, farmSize: e.target.value })}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium appearance-none"
                >
                  <option value="small">Small ( &lt; 2 acres )</option>
                  <option value="medium">Medium ( 2-10 acres )</option>
                  <option value="large">Large ( &gt; 10 acres )</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest px-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={localProfile.location}
                  onChange={(e) => setLocalProfile({ ...localProfile, location: e.target.value })}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 font-outfit">Privacy & Visibility</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Control how you appear to others</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="space-y-1">
            <h4 className="font-black text-slate-800">Community Leaderboard</h4>
            <p className="text-xs text-slate-500">When enabled, your farm score is visible to the village community.</p>
          </div>
          <button 
            onClick={() => setLocalUser({ ...localUser, privacy: localUser.privacy === 'public' ? 'private' : 'public' })}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${localUser.privacy === 'public' ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${localUser.privacy === 'public' ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <button 
          onClick={handleSave}
          disabled={saveStatus !== 'idle'}
          className={`w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-xl ${
            saveStatus === 'saved' ? 'bg-emerald-100 text-emerald-700' : 
            saveStatus === 'saving' ? 'bg-slate-100 text-slate-400' : 
            'bg-slate-900 text-white hover:bg-emerald-600'
          }`}
        >
          {saveStatus === 'idle' && <><Save className="w-5 h-5" /> Update Profile</>}
          {saveStatus === 'saving' && <><RefreshCcw className="w-5 h-5 animate-spin" /> Saving Changes...</>}
          {saveStatus === 'saved' && <><CheckCircle className="w-5 h-5" /> Configuration Saved!</>}
        </button>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Changes are synced with your local storage instantly.
        </p>
      </div>

      {/* Danger Zone */}
      <section className="bg-red-50 rounded-[2rem] border border-red-100 p-8 mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 rounded-2xl text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-red-900 font-outfit">Danger Zone</h3>
            <p className="text-xs font-bold text-red-600/60 uppercase tracking-widest">Irreversible actions</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-white/50 rounded-3xl border border-red-200 border-dashed">
          <div className="space-y-1">
            <h4 className="font-black text-red-900">Reset Farm Progress</h4>
            <p className="text-xs text-red-700/70">Wipe all quests, badges, finance records and IoT history.</p>
          </div>
          <button 
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Hard Reset
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
