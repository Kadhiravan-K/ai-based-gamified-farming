
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  MessageSquare, 
  Users, 
  Leaf, 
  Menu,
  Zap,
  WifiOff,
  CloudSun,
  LogOut,
  Sprout,
  Wallet,
  Cpu,
  Settings as SettingsIcon,
  Shield,
  ShieldOff,
  BarChart3,
  Flame
} from 'lucide-react';
import { FarmProfile, FarmerState, WeatherData, User, FinanceRecord, Quest, IoTState } from './types';
import { generateQuests } from './services/geminiService';
import { fetchWeather } from './services/weatherService';
import Dashboard from './components/Dashboard';
import Quests from './components/Quests';
import Community from './components/Community';
import AIAdvisor from './components/AIAdvisor';
import FinanceManager from './components/FinanceManager';
import IoTControl from './components/IoTControl';
import Settings from './components/Settings';
import MarketTrends from './components/MarketTrends';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quests' | 'community' | 'advisor' | 'finance' | 'iot' | 'market' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FarmProfile | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  
  const [farmerState, setFarmerState] = useState<FarmerState>({
    score: 450,
    level: 3,
    streak: {
      count: 1,
      lastVisit: new Date().toISOString(),
      dailyTaskCompleted: false
    },
    activeQuests: [],
    badges: [
      { id: '1', name: 'Soil Keeper', icon: '🌱', unlocked: true, description: 'First step in soil conservation.' },
      { id: '2', name: 'Water Wizard', icon: '💧', unlocked: false, description: 'Mastered efficient irrigation.' },
      { id: '3', name: 'Organic Pioneer', icon: '🦋', unlocked: true, description: 'Eliminated synthetic pesticides.' }
    ],
    history: [{ date: 'Mon', score: 320 }, { date: 'Tue', score: 450 }],
    lastSynced: new Date().toISOString(),
    finances: [],
    iot: { 
      moisture: 42, 
      ph: 6.5,
      nutrients: { n: 45, p: 30, k: 50 },
      pumpActive: false, 
      lastReading: new Date().toISOString(),
      mode: 'manual',
      threshold: 30,
      duration: 15,
      frequency: 6
    }
  });

  const [loading, setLoading] = useState(false);

  // Streak Management
  useEffect(() => {
    const savedState = localStorage.getItem('agri_state');
    if (savedState) {
      const parsed = JSON.parse(savedState) as FarmerState;
      const lastVisit = new Date(parsed.streak.lastVisit);
      const today = new Date();
      
      const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        setFarmerState(prev => ({
          ...prev,
          streak: {
            ...prev.streak,
            count: prev.streak.count + 1,
            lastVisit: today.toISOString(),
            dailyTaskCompleted: false
          }
        }));
      } else if (diffDays > 1) {
        setFarmerState(prev => ({
          ...prev,
          streak: {
            count: 1,
            lastVisit: today.toISOString(),
            dailyTaskCompleted: false
          }
        }));
      }
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('agri_user');
    const savedProfile = localStorage.getItem('agri_profile');
    const savedState = localStorage.getItem('agri_state');
    
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedState) setFarmerState(JSON.parse(savedState));
  }, []);

  useEffect(() => {
    if (profile && isOnline) {
      const lat = profile.latitude || 30.7333;
      const lon = profile.longitude || 76.7794;
      fetchWeather(lat, lon).then(setWeather);
    }
  }, [profile, isOnline]);

  useEffect(() => {
    localStorage.setItem('agri_state', JSON.stringify(farmerState));
    if (currentUser) localStorage.setItem('agri_user', JSON.stringify(currentUser));
    if (profile) localStorage.setItem('agri_profile', JSON.stringify(profile));
  }, [farmerState, currentUser, profile]);

  const handleAuthComplete = (user: User) => {
    const userWithPrivacy = { ...user, privacy: (user.privacy || 'public') as 'public' | 'private' };
    setCurrentUser(userWithPrivacy);
    localStorage.setItem('agri_user', JSON.stringify(userWithPrivacy));
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const cropInput = formData.get('cropTypes') as string;
    const crops = cropInput.split(',').map(c => c.trim()).filter(c => c.length > 0);

    const newProfile: FarmProfile = {
      crops,
      farmSize: formData.get('farmSize') as string,
      location: formData.get('location') as string,
      latitude: 30.7333,
      longitude: 76.7794
    };
    setProfile(newProfile);
    localStorage.setItem('agri_profile', JSON.stringify(newProfile));
    if (isOnline) {
      const quests = await generateQuests(newProfile, weather || undefined);
      setFarmerState(prev => ({ ...prev, activeQuests: quests }));
    }
    setLoading(false);
  };

  const handleRefreshQuests = async () => {
    if (!profile || !isOnline) return;
    setLoading(true);
    try {
      const newQuests = await generateQuests(profile, weather || undefined);
      setFarmerState(prev => ({
        ...prev,
        activeQuests: [
          ...prev.activeQuests.filter(q => q.isCustom || q.status === 'completed'),
          ...newQuests
        ]
      }));
    } catch (error) {
      console.error("Refresh quests failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestAction = (quest: Quest, action: 'add' | 'delete') => {
    if (action === 'add') {
      setFarmerState(prev => ({
        ...prev,
        activeQuests: [quest, ...prev.activeQuests]
      }));
    } else if (action === 'delete') {
      setFarmerState(prev => ({
        ...prev,
        activeQuests: prev.activeQuests.filter(q => q.id !== quest.id)
      }));
    }
  };

  const updateIoT = (updates: Partial<IoTState>) => {
    setFarmerState(prev => ({ 
      ...prev, 
      iot: { ...prev.iot, ...updates, lastReading: new Date().toISOString() } 
    }));
  };

  const addFinanceRecord = (r: Omit<FinanceRecord, 'id' | 'date'>) => {
    const newRecord: FinanceRecord = { 
      ...r, 
      id: Math.random().toString(), 
      date: new Date().toLocaleDateString() 
    };
    setFarmerState(p => ({ ...p, finances: [newRecord, ...p.finances] }));
  };

  const completeDailyTask = () => {
    if (!farmerState.streak.dailyTaskCompleted) {
      setFarmerState(prev => ({
        ...prev,
        score: prev.score + 100,
        streak: { ...prev.streak, dailyTaskCompleted: true }
      }));
    }
  };

  const resetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (!currentUser) return <Auth onAuthComplete={handleAuthComplete} />;

  if (!profile) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-emerald-100">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-emerald-100 p-5 rounded-full mb-4"><Sprout className="w-10 h-10 text-emerald-600" /></div>
            <h1 className="text-3xl font-bold text-slate-800 font-outfit text-center">Farm Setup</h1>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Crops (comma separated)</label>
              <input name="cropTypes" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl" placeholder="e.g. Rice, Wheat, Moong" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Farm Size</label>
              <select name="farmSize" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl">
                <option value="small">Small ( &lt; 2 acres )</option>
                <option value="medium">Medium ( 2-10 acres )</option>
                <option value="large">Large ( &gt; 10 acres )</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Location</label>
              <input name="location" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl" placeholder="Location (Town/City)" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700">
              {loading ? 'Initializing...' : 'Get Started'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full bg-orange-500 text-white text-[10px] py-1 text-center z-[100] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <WifiOff className="w-3 h-3" /> Offline Mode
        </div>
      )}

      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-72 bg-white border-r flex flex-col transition-transform
      `}>
        <div className="p-8 flex items-center gap-3">
          <Leaf className="w-8 h-8 text-emerald-600" />
          <span className="text-xl font-bold font-outfit text-slate-800">AgriQuest</span>
        </div>

        <nav className="flex-1 px-6 space-y-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'quests', icon: Trophy, label: 'Mission Hub' },
            { id: 'iot', icon: Cpu, label: 'Soil Health' },
            { id: 'market', icon: BarChart3, label: 'Market Pulse' },
            { id: 'finance', icon: Wallet, label: 'Finance' },
            { id: 'community', icon: Users, label: 'Community' },
            { id: 'advisor', icon: MessageSquare, label: 'AI Advisor' },
            { id: 'settings', icon: SettingsIcon, label: 'Settings' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all ${
                activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Streak</span>
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="w-3 h-3 fill-orange-500" />
                <span className="text-[10px] font-black">{farmerState.streak.count}d</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">{currentUser.name}</p>
          </div>
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-3 px-5 py-2 text-slate-500 font-bold hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-600"><Menu className="w-6 h-6" /></button>
            <h2 className="text-xl font-bold text-slate-800 capitalize font-outfit">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-black">
              <Flame className="w-4 h-4 fill-orange-600" /> {farmerState.streak.count} Day Streak
            </div>
            <div className="bg-emerald-100 text-emerald-700 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 fill-emerald-700" /> {farmerState.score}
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 flex-1 max-w-6xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard state={farmerState} profile={profile} weather={weather} onCompleteDaily={completeDailyTask} />}
          {activeTab === 'quests' && (
            <Quests 
              quests={farmerState.activeQuests} 
              onComplete={(pts) => setFarmerState(p => ({ ...p, score: p.score + pts }))} 
              loading={loading}
              onRefresh={handleRefreshQuests}
              onQuestAction={handleQuestAction} 
            />
          )}
          {activeTab === 'community' && <Community score={farmerState.score} privacyMode={currentUser.privacy} />}
          {activeTab === 'advisor' && <AIAdvisor profile={profile} isOnline={isOnline} />}
          {activeTab === 'finance' && <FinanceManager finances={farmerState.finances} onAdd={addFinanceRecord} />}
          {activeTab === 'iot' && <IoTControl state={farmerState.iot} onUpdate={updateIoT} />}
          {activeTab === 'market' && <MarketTrends profile={profile} isOnline={isOnline} />}
          {activeTab === 'settings' && (
            <Settings 
              user={currentUser} 
              profile={profile} 
              onUserUpdate={setCurrentUser} 
              onProfileUpdate={setProfile}
              onReset={resetData}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
