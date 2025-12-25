
export interface User {
  id: string;
  name: string;
  email: string;
  privacy: 'public' | 'private';
  isGuest?: boolean;
}

export interface FinanceRecord {
  id: string;
  category: string;
  amount: number;
  type: 'expense' | 'income';
  date: string;
  note: string;
}

export interface IoTState {
  moisture: number;
  ph: number;
  nutrients: {
    n: number;
    p: number;
    k: number;
  };
  pumpActive: boolean;
  lastReading: string;
  mode: 'manual' | 'timer' | 'sensor';
  threshold: number;
  duration: number;
  frequency: number;
}

export interface MarketTrend {
  cropName: string;
  currentPrice: number;
  priceTrend: 'up' | 'down' | 'stable';
  demandForecast: string;
  suggestedAction: string;
  sources?: { uri: string; title: string }[];
}

export interface FarmProfile {
  crops: string[];
  farmSize: string;
  location: string;
  latitude?: number;
  longitude?: number;
  soilType?: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  precipitation: number;
  forecast: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  category: string;
  status: 'available' | 'in-progress' | 'completed';
  isOfflineReady?: boolean;
  isCustom?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

export interface FarmerState {
  score: number;
  level: number;
  streak: {
    count: number;
    lastVisit: string;
    dailyTaskCompleted: boolean;
  };
  activeQuests: Quest[];
  badges: Badge[];
  history: { date: string; score: number }[];
  lastSynced: string;
  finances: FinanceRecord[];
  iot: IoTState;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  video?: string;
  audio?: string;
  isThinking?: boolean;
  sources?: { uri: string; title: string }[];
}
