
import React, { useState, useEffect, useRef } from 'react';
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
  BarChart3,
  Plus,
  Trash2,
  MapPin,
  Ruler,
  Microscope,
  Bell,
  BrainCircuit,
  Link as LinkIcon,
  Database,
  Camera,
  Search,
  Activity,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Cloud,
  X,
  CloudSync,
  Globe,
  MessageCircle,
  Shield,
  Heart,
  ChevronLeft,
  ChevronDown,
  Check,
  Edit2,
  Sparkles,
  Gem,
  ShoppingCart,
  PackageCheck,
  Flame
} from 'lucide-react';
import { FarmProfile, FarmerState, WeatherData, User, FinanceRecord, Quest, IoTNode, CropEntry, LandUnit, SoilData, AgriNotification, MLPrediction, BlockchainRecord, CropDiagnostic, LivestockDiagnostic } from './types';
import { generateQuests, generateAgriUpdates } from './services/geminiService';
import { fetchWeather } from './services/weatherService';
import { api } from './services/backend';
import Dashboard from './components/Dashboard';
import Quests from './components/Quests';
import Community from './components/Community';
import AIAdvisor from './components/AIAdvisor';
import FinanceManager from './components/FinanceManager';
import IoTControl from './components/IoTControl';
import Settings from './components/Settings';
import Auth from './components/Auth';
import SoilHub from './components/SoilHub';
import NotificationHub from './components/NotificationHub';
import MLInsightHub from './components/MLInsightHub';
import MarketOracle from './components/MarketOracle';
import FieldScanner from './components/FieldScanner';

type TabType = 'dashboard' | 'ai_hub' | 'quests' | 'ml' | 'oracle' | 'notifications' | 'soil' | 'iot' | 'finance' | 'community' | 'settings' | 'procurement';

const MODULES_CONFIG = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', core: true, roles: ['farmer'] },
  { id: 'procurement', icon: ShoppingCart, label: 'Procurement Hub', core: true, roles: ['buyer'] },
  { id: 'oracle', icon: Gem, label: 'Market Oracle', core: true, roles: ['farmer', 'buyer'] },
  { id: 'ai_hub', icon: BrainCircuit, label: 'AI Field Suite', core: true, roles: ['farmer'] },
  { id: 'quests', icon: Trophy, label: 'Mission Hub', roles: ['farmer'] },
  { id: 'ml', icon: Activity, label: 'Neural Hub', roles: ['farmer'] },
  { id: 'notifications', icon: Bell, label: 'Intel Feed', roles: ['farmer', 'buyer'] },
  { id: 'soil', icon: Microscope, label: 'Soil Hub', roles: ['farmer'] },
  { id: 'iot', icon: Cpu, label: 'Automation', roles: ['farmer'] },
  { id: 'finance', icon: Wallet, label: 'Finances', roles: ['farmer'] },
  { id: 'community', icon: Users, label: 'Community', roles: ['farmer'] },
  { id: 'settings', icon: SettingsIcon, label: 'Settings', core: true, roles: ['farmer', 'buyer'] }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FarmProfile | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [farmerState, setFarmerState] = useState<FarmerState | null>(null);

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      const [user, farmProfile, state] = await Promise.all([
        api.auth.me(),
        api.profile.get(),
        api.farm.getState()
      ]);
      
      setCurrentUser(user);
      setProfile(farmProfile);
      setFarmerState(state);
      
      if (user?.role === 'buyer') setActiveTab('procurement');
      else setActiveTab('dashboard');

      setLoading(false);
    };

    initApp();

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
    if (profile && isOnline) {
      fetchWeather(profile.latitude || 30.73, profile.longitude || 76.77).then(setWeather);
    }
  }, [profile, isOnline]);

  const handleAuth = async (user: User) => {
    setIsSyncing(true);
    const savedUser = await api.auth.login({
      ...user,
      enabledModules: user.enabledModules || MODULES_CONFIG.filter(m => m.roles.includes(user.role)).map(m => m.id)
    });
    setCurrentUser(savedUser);
    if (savedUser.role === 'buyer') setActiveTab('procurement');
    setIsSyncing(false);
  };

  const handleProfileSubmit = async (crops: CropEntry[], location: string, unit: LandUnit) => {
    setIsSyncing(true);
    let lat = 30.73;
    let lon = 76.77;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;
    } catch (e) { console.warn("Fallback coords"); }

    const totalArea = crops.reduce((sum, c) => sum + c.area, 0);
    const newProfile: FarmProfile = { crops, totalArea, location, unit, latitude: lat, longitude: lon };
    const [savedProfile, quests, updates] = await Promise.all([
      api.profile.update(newProfile),
      isOnline ? generateQuests(newProfile, weather || undefined) : Promise.resolve([]),
      isOnline ? generateAgriUpdates(newProfile) : Promise.resolve([])
    ]);

    setProfile(savedProfile);
    const newState = await api.farm.updateState({ activeQuests: quests, notifications: updates });
    setFarmerState(newState);
    setIsSyncing(false);
  };

  const handleCompleteDailyTask = async () => {
    if (!farmerState || farmerState.streak.dailyTaskCompleted) return;
    setIsSyncing(true);
    const newStreakCount = farmerState.streak.count + 1;
    const newState = await api.farm.updateState({
      streak: {
        ...farmerState.streak,
        count: newStreakCount,
        dailyTaskCompleted: true,
        lastVisit: new Date().toISOString()
      },
      score: farmerState.score + 100
    });
    setFarmerState(newState);
    setIsSyncing(false);
  };

  const handleNewDiagnostic = async (d: CropDiagnostic) => {
    setIsSyncing(true);
    const updatedHistory = await api.farm.saveDiagnostic(d);
    setFarmerState(prev => prev ? ({ ...prev, diagnosticHistory: updatedHistory, score: prev.score + 250 }) : null);
    if (farmerState && !farmerState.streak.dailyTaskCompleted) {
      await handleCompleteDailyTask();
    }
    setIsSyncing(false);
  };

  const handleNewLivestock = async (d: LivestockDiagnostic) => {
    setIsSyncing(true);
    setFarmerState(prev => prev ? ({ ...prev, livestockHistory: [d, ...prev.livestockHistory], score: prev.score + 300 }) : null);
    if (farmerState && !farmerState.streak.dailyTaskCompleted) {
      await handleCompleteDailyTask();
    }
    setIsSyncing(false);
  };

  const handleNewFinance = async (record: Omit<FinanceRecord, 'id' | 'date'>) => {
    setIsSyncing(true);
    const newRecord: FinanceRecord = { ...record, id: `FIN-${Date.now()}`, date: new Date().toLocaleDateString() };
    const updatedFinances = await api.farm.addFinance(newRecord);
    setFarmerState(prev => prev ? ({ ...prev, finances: updatedFinances }) : null);
    setIsSyncing(false);
  };

  const handleSellHarvest = async (record: BlockchainRecord, salePrice: number) => {
    setIsSyncing(true);
    const finRecord: FinanceRecord = {
      id: `FIN-SALE-${Date.now()}`, cropName: record.cropName, amount: salePrice * record.quantity,
      type: 'income', date: new Date().toLocaleDateString(), category: 'Sale',
      note: `Blockchain Verified Sale: ${record.id}`
    };
    const updatedLedger = farmerState?.blockchainLedger.map(b => 
      b.id === record.id ? { ...b, status: 'sold' as const, salePrice, escrowStatus: 'released' as const } : b
    ) || [];
    const newState = await api.farm.updateState({ 
      blockchainLedger: updatedLedger,
      finances: [finRecord, ...(farmerState?.finances || [])],
      score: (farmerState?.score || 0) + 500
    });
    setFarmerState(newState);
    setIsSyncing(false);
  };

  const handleUpdateRecord = async (id: string, updates: Partial<BlockchainRecord>) => {
    if (!farmerState) return;
    const updatedLedger = farmerState.blockchainLedger.map(r => r.id === id ? { ...r, ...updates } : r);
    const newState = await api.farm.updateState({ blockchainLedger: updatedLedger });
    setFarmerState(newState);
  };

  const handleUpdateIoTNode = async (id: string, updates: Partial<IoTNode>) => {
    const updatedNodes = await api.farm.updateIoTNode(id, updates);
    setFarmerState(prev => prev ? ({ ...prev, iotNodes: updatedNodes }) : null);
  };

  const markNotificationRead = async (id: string) => {
    if (!farmerState) return;
    const updatedNotifications = farmerState.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    const newState = await api.farm.updateState({ notifications: updatedNotifications });
    setFarmerState(newState);
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
    setProfile(null);
  };

  if (loading) return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 p-6 overflow-hidden">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <Cloud className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-600" />
      </div>
      <div className="text-center">
        <p className="text-lg font-black text-slate-900 font-outfit tracking-tight">Syncing Neural Core</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Establishing Grounded Link...</p>
      </div>
    </div>
  );

  if (!currentUser) return <Auth onAuthComplete={handleAuth} />;
  if (currentUser.role === 'farmer' && !profile) return <InitialSetup onComplete={handleProfileSubmit} loading={isSyncing} onBack={handleLogout} />;
  if (!farmerState) return null;

  const unreadCount = farmerState.notifications.filter(n => !n.read).length;
  const activeModules = MODULES_CONFIG.filter(m => m.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter selection:bg-emerald-100 selection:text-emerald-900">
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full bg-orange-500 text-white text-[10px] py-1 text-center z-[110] font-black uppercase tracking-widest flex items-center justify-center gap-2">
          <WifiOff className="w-3 h-3" /> Offline Buffer Active
        </div>
      )}

      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r flex flex-col transition-transform duration-300 shadow-2xl lg:shadow-none`}>
        <div className="p-8 flex items-center gap-3">
          <Leaf className="w-8 h-8 text-emerald-600" />
          <span className="text-xl font-bold font-outfit text-slate-900 tracking-tight">AgriQuest</span>
        </div>
        <nav className="flex-1 px-6 space-y-1 overflow-y-auto no-scrollbar">
          {activeModules.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3"><item.icon className="w-5 h-5" />{item.label}</div>
              {item.id === 'notifications' && unreadCount > 0 && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-slate-500 font-bold hover:text-red-600 transition-colors"><LogOut className="w-5 h-5" /> Log Out</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl"><Menu className="w-6 h-6" /></button>
            <h2 className="text-lg font-black text-slate-900 capitalize font-outfit">{activeTab.replace('ai_hub', 'Edge AI Suite').replace('ml', 'Neural Hub')}</h2>
          </div>
          <div className="flex items-center gap-3">
             {farmerState.streak.count > 0 && (
               <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 border border-orange-100">
                 <Flame className="w-4 h-4 fill-orange-500" /> {farmerState.streak.count}
               </div>
             )}
             <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 border border-emerald-200">
               <Zap className="w-4 h-4 fill-emerald-800" /> {farmerState.score}
             </div>
             <div className="bg-slate-100 px-4 py-2 rounded-full text-xs font-black border border-slate-200 uppercase">{currentUser.name}</div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-32">
          {activeTab === 'dashboard' && <Dashboard state={farmerState} profile={profile!} weather={weather} onCompleteDaily={handleCompleteDailyTask} />}
          {activeTab === 'ai_hub' && (
            <div className="space-y-12">
               <FieldScanner profile={profile!} onSaveDiagnostic={handleNewDiagnostic} onSaveLivestock={handleNewLivestock} cropHistory={farmerState.diagnosticHistory} livestockHistory={farmerState.livestockHistory} />
               <AIAdvisor profile={profile!} isOnline={isOnline} />
            </div>
          )}
          {activeTab === 'oracle' && <MarketOracle profile={profile!} ledger={farmerState.blockchainLedger} onAdd={(r) => setFarmerState(prev => prev ? ({...prev, blockchainLedger: [r, ...prev.blockchainLedger]}) : null)} onSell={handleSellHarvest} onUpdateRecord={handleUpdateRecord} isOnline={isOnline} farmHistory={farmerState.history} userRole={currentUser.role} />}
          {activeTab === 'quests' && <Quests quests={farmerState.activeQuests} onComplete={(pts) => api.farm.updateState({ score: farmerState.score + pts }).then(setFarmerState)} loading={isSyncing} onRefresh={() => {}} onQuestAction={() => {}} />}
          {activeTab === 'ml' && <MLInsightHub profile={profile!} nodes={farmerState.iotNodes} weather={weather} predictions={farmerState.mlPredictions} onNewPrediction={(p) => setFarmerState(prev => prev ? ({...prev, mlPredictions: [p, ...prev.mlPredictions]}) : null)} />}
          {activeTab === 'notifications' && <NotificationHub notifications={farmerState.notifications} onMarkRead={markNotificationRead} onRefresh={() => {}} loading={isSyncing} />}
          {activeTab === 'soil' && <SoilHub profile={profile!} onUpdateSoil={(cid, sd) => {}} isOnline={isOnline} weather={weather} />}
          {activeTab === 'iot' && <IoTControl nodes={farmerState.iotNodes} onUpdate={handleUpdateIoTNode} onAdd={(n) => api.farm.updateState({iotNodes: [...farmerState.iotNodes, n]}).then(setFarmerState)} onRemove={(id) => api.farm.updateState({iotNodes: farmerState.iotNodes.filter(n => n.id !== id)}).then(setFarmerState)} profile={profile!} weather={weather} />}
          {activeTab === 'finance' && <FinanceManager finances={farmerState.finances} onAdd={handleNewFinance} profile={profile!} />}
          {activeTab === 'community' && <Community score={farmerState.score} privacyMode={currentUser.privacy} />}
          {activeTab === 'settings' && <Settings user={currentUser} profile={profile!} onUserUpdate={handleAuth} onProfileUpdate={setProfile} onReset={() => {}} />}
          {activeTab === 'procurement' && <ProcurementHub ledger={farmerState.blockchainLedger} isOnline={isOnline} />}
        </div>
      </main>
    </div>
  );
};

const InitialSetup: React.FC<{ onComplete: (c: CropEntry[], l: string, u: LandUnit) => void; loading: boolean; onBack: () => void }> = ({ onComplete, loading, onBack }) => {
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState<LandUnit>('Acres');
  const [crops, setCrops] = useState<CropEntry[]>([]);
  const [ncName, setNcName] = useState('');
  const [ncArea, setNcArea] = useState(0);

  const addCrop = () => { if (ncName && ncArea > 0) { setCrops([...crops, { id: Math.random().toString(36).substr(2,9), name: ncName, area: ncArea }]); setNcName(''); setNcArea(0); } };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-200 animate-in zoom-in duration-500">
        <div className="flex items-center gap-4 mb-10"><div className="p-4 bg-emerald-600 rounded-3xl text-white"><Leaf className="w-8 h-8" /></div><div><h2 className="text-3xl font-black text-slate-900 font-outfit">Farm Node Setup</h2><p className="text-slate-500 font-medium text-sm">Calibrating local parameters</p></div></div>
        <div className="space-y-8">
          <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Location</label><input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900" placeholder="e.g. Salem, TN" value={location} onChange={e => setLocation(e.target.value)} /></div>
          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Crops</label>
             <div className="flex gap-2"><div className="flex-1 grid grid-cols-1 gap-3">
               <input className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900" placeholder="Variety" value={ncName} onChange={(e) => setNcName(e.target.value)} />
               <input type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900" placeholder="Area" value={ncArea || ''} onChange={(e) => setNcArea(parseFloat(e.target.value) || 0)} />
             </div><button onClick={addCrop} className="bg-slate-900 text-white px-5 rounded-2xl hover:bg-emerald-600 transition-all"><Plus className="w-6 h-6" /></button></div>
             <div className="flex flex-wrap gap-2 pt-2">{crops.map(c => <div key={c.id} className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 font-black text-[10px] uppercase">{c.name} ({c.area} {unit})<button onClick={() => setCrops(crops.filter(x => x.id !== c.id))}><X className="w-3 h-3" /></button></div>)}</div>
          </div>
          <button onClick={() => onComplete(crops, location, unit)} disabled={loading || !location || crops.length === 0} className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-30">
            {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <>Initialize Digital Twin <ArrowRight className="w-5 h-5" /></>}
          </button>
          <button onClick={onBack} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500">Sign Out</button>
        </div>
      </div>
    </div>
  );
};

const ProcurementHub: React.FC<{ ledger: BlockchainRecord[], isOnline: boolean }> = ({ ledger }) => {
  const readyBatches = ledger.filter(b => b.status === 'ready_to_sell');
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden"><h2 className="text-4xl font-black font-outfit mb-2">Procurement Hub</h2><p className="text-slate-400 font-medium">Monitoring <span className="text-emerald-400 font-black">{readyBatches.length} verified batches</span> ready for purchase.</p><ShoppingCart className="absolute -bottom-10 -right-10 w-64 h-64 opacity-5 text-emerald-500" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {readyBatches.map(batch => (
          <div key={batch.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all">
             <div className="flex items-center justify-between mb-6"><div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><PackageCheck className="w-7 h-7" /></div><span className="font-mono text-xs text-black">{batch.id}</span></div>
             <div className="space-y-6 mb-8"><div><h3 className="text-2xl font-black text-black font-outfit uppercase">{batch.cropName}</h3><div className="flex items-center gap-2 mt-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /><span className="text-[11px] font-black text-slate-500 uppercase">{batch.location}</span></div></div><div className="grid grid-cols-2 gap-4"><div className="p-5 bg-slate-50 rounded-2xl border border-slate-100"><span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Vol</span><span className="text-xl font-black text-black">{batch.quantity} {batch.unit}</span></div><div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100"><span className="text-[10px] font-black text-emerald-600 uppercase block mb-1">Eco Score</span><span className="text-xl font-black text-emerald-700">{batch.sustainabilityScore}/100</span></div></div></div>
             <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4"><p className="text-sm font-black uppercase">{batch.farmerName || 'Premium Producer'}</p><button className="w-full bg-emerald-600 py-3 rounded-xl font-black text-xs uppercase hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">Negotiate & Release Escrow <ArrowRight className="w-4 h-4" /></button></div>
          </div>
        ))}
        {readyBatches.length === 0 && <div className="col-span-full py-40 flex flex-col items-center text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200"><Search className="w-16 h-16 text-slate-200 mb-6" /><h3 className="text-2xl font-black text-slate-800 font-outfit">Market Quiet</h3><p className="text-slate-400 mt-2 max-w-xs font-medium">No verified batches found. Monitoring network signals...</p></div>}
      </div>
    </div>
  );
};

export default App;
