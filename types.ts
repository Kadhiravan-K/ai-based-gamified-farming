
export type UserRole = 'farmer' | 'buyer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  privacy: 'public' | 'private';
  isGuest?: boolean;
  enabledModules?: string[];
  notificationPrefs: {
    agriUpdates: boolean;
    cropAlerts: boolean;
    events: boolean;
  };
}

// Added WeatherData interface to fix export errors
export interface WeatherData {
  temp: number;
  humidity: number;
  precipitation: number;
  condition: string;
  forecast: string;
}

export interface CropDiagnostic {
  id: string;
  timestamp: string;
  cropName: string;
  healthScore: number;
  condition: string;
  detectedIssues: string[];
  report: string;
  actionPlan: string[];
  imageUrl?: string;
  spectralAnalysis?: {
    ndviValue: number;
    biomassDensity: string;
    chlorophyllIndex: number;
    thermalStress: 'Low' | 'Moderate' | 'High' | 'Critical';
  };
  pathogenSignature?: {
    type: string;
    certainty: number;
    spreadRisk: 'Low' | 'Medium' | 'High' | 'Immediate';
    pathogenCategory: 'Fungal' | 'Bacterial' | 'Viral' | 'Pest' | 'Nutritional';
  };
}

export interface LivestockDiagnostic {
  id: string;
  timestamp: string;
  breed: string;
  weightEstimate: number;
  healthGrade: 'A' | 'B' | 'C' | 'D';
  biometrics: {
    bodyLength: number; // cm
    height: number; // cm
    girth: number; // cm
  };
  ageEstimate: string;
  vitalsNote: string;
  imageUrl?: string;
}

export interface FertilizerPrescription {
  recommendedN: number;
  recommendedP: number;
  recommendedK: number;
  unit: string;
  timingNote: string;
  sustainabilityImpact: string;
  splitDoseSuggested: boolean;
}

export interface AgriNotification {
  id: string;
  title: string;
  text: string;
  type: 'update' | 'alert' | 'event' | 'price_alert' | 'procurement';
  date: string;
  read: boolean;
}

export interface FinanceRecord {
  id: string;
  category: string;
  cropName: string;
  amount: number;
  type: 'expense' | 'income';
  date: string;
  note: string;
}

export interface BlockchainRecord {
  id: string;
  hash: string;
  previousHash: string;
  timestamp: string;
  cropName: string;
  quantity: number;
  unit: string;
  farmerId: string;
  farmerName?: string;
  location?: string;
  sustainabilityScore: number;
  isVerified: boolean;
  aiVerificationNote: string;
  status: 'waiting' | 'ready_to_sell' | 'sold';
  targetPrice?: number;
  salePrice?: number;
  escrowStatus?: 'locked' | 'confirmed' | 'released';
  iotLogs?: { time: string; temp: number; humidity: number }[];
  traceabilityProof?: {
    seedSource: string;
    sowingDate: string;
    diagnosticHistoryCount: number;
  };
}

export type AIAlgorithmType = 'CNN' | 'RNN' | 'Random Forest' | 'LSTM' | 'Decision Tree';

export interface IoTNode {
  id: string;
  name: string;
  type: 'sensor' | 'pump' | 'integrated';
  status: 'online' | 'offline';
  moisture?: number;
  ph?: number;
  nutrients?: {
    n: number;
    p: number;
    k: number;
  };
  pumpActive?: boolean;
  lastReading: string;
  mode: 'manual' | 'timer' | 'sensor' | 'ml_optimized';
  threshold: number;
  duration: number;
  frequency: number;
  targetCrop?: string;
  linkedSensorId?: string; 
}

export interface MLPrediction {
  cropId: string;
  yieldForecast: number;
  confidenceScore: number;
  algorithmUsed: AIAlgorithmType;
  riskFactors: {
    pestProbability: number;
    droughtStress: number;
    nutrientDeficiency: number;
  };
  suggestedMitigation: string;
  timestamp: string;
  futureSightVideoUrl?: string;
}

export interface MarketTrend {
  cropName: string;
  currentPrice: number;
  priceTrend: 'up' | 'down' | 'stable';
  priceRating: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Peak';
  sellingSignal: 'Sell' | 'Hold' | 'Wait';
  demandForecast: string;
  suggestedAction: string;
  sources?: { uri: string; title: string }[];
}

export interface SoilData {
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  organicCarbon?: number;
  lastTested?: string;
  prescription?: FertilizerPrescription;
}

export interface CropEntry {
  id: string;
  name: string;
  area: number;
  unit?: LandUnit;
  soilLabData?: SoilData;
}

export type LandUnit = 'Acres' | 'Hectares' | 'Bigha' | 'Kanal' | 'Marla' | 'Guntha' | 'Cents' | 'Biswa';

export interface FarmProfile {
  crops: CropEntry[];
  totalArea: number;
  unit: LandUnit;
  location: string;
  latitude?: number;
  longitude?: number;
  soilType?: string;
  soilData?: SoilData;
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
  iotNodes: IoTNode[];
  notifications: AgriNotification[];
  mlPredictions: MLPrediction[];
  blockchainLedger: BlockchainRecord[];
  diagnosticHistory: CropDiagnostic[];
  livestockHistory: LivestockDiagnostic[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  description: string;
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

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  video?: string;
  audio?: string;
  isThinking?: boolean;
  sources?: { uri: string; title: string }[];
}
