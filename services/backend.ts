
import { FarmerState, User, FarmProfile, CropDiagnostic, FinanceRecord, IoTNode, Quest, MLPrediction, BlockchainRecord } from "../types";

/**
 * VIRTUAL BACKEND SERVICE
 * Simulates a full-stack REST API with an In-Memory Database 
 * persisted to LocalStorage.
 */

const LATENCY = 600;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class VirtualDatabase {
  private storageKey = 'agriquest_vdb';

  constructor() {
    if (!localStorage.getItem(this.storageKey)) {
      this.initDefault();
    }
  }

  private initDefault() {
    const defaultState: any = {
      user: null,
      profile: null,
      state: {
        score: 0,
        level: 1,
        streak: { count: 0, lastVisit: new Date().toISOString(), dailyTaskCompleted: false },
        activeQuests: [],
        badges: [],
        history: [],
        lastSynced: new Date().toISOString(),
        finances: [],
        iotNodes: [],
        notifications: [],
        mlPredictions: [],
        blockchainLedger: [],
        diagnosticHistory: []
      }
    };
    localStorage.setItem(this.storageKey, JSON.stringify(defaultState));
  }

  public getData() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
  }

  public saveData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
}

const db = new VirtualDatabase();

export const api = {
  // --- AUTH ENDPOINTS ---
  auth: {
    me: async (): Promise<User | null> => {
      await delay(LATENCY);
      return db.getData().user;
    },
    login: async (user: User): Promise<User> => {
      await delay(LATENCY + 200);
      const data = db.getData();
      data.user = user;
      db.saveData(data);
      return user;
    },
    logout: async () => {
      await delay(300);
      const data = db.getData();
      data.user = null;
      db.saveData(data);
    }
  },

  // --- PROFILE ENDPOINTS ---
  profile: {
    get: async (): Promise<FarmProfile | null> => {
      await delay(LATENCY);
      return db.getData().profile;
    },
    update: async (profile: FarmProfile): Promise<FarmProfile> => {
      await delay(LATENCY + 400);
      const data = db.getData();
      data.profile = profile;
      db.saveData(data);
      return profile;
    }
  },

  // --- STATE / FARM DATA ENDPOINTS ---
  farm: {
    getState: async (): Promise<FarmerState> => {
      await delay(LATENCY);
      return db.getData().state;
    },
    updateState: async (updates: Partial<FarmerState>): Promise<FarmerState> => {
      await delay(200); // Fast sync for state
      const data = db.getData();
      data.state = { ...data.state, ...updates, lastSynced: new Date().toISOString() };
      db.saveData(data);
      return data.state;
    },
    
    // Diagnostic History
    saveDiagnostic: async (diagnostic: CropDiagnostic): Promise<CropDiagnostic[]> => {
      await delay(LATENCY);
      const data = db.getData();
      data.state.diagnosticHistory = [diagnostic, ...data.state.diagnosticHistory].slice(0, 50);
      data.state.score += 250;
      db.saveData(data);
      return data.state.diagnosticHistory;
    },

    // Finances
    addFinance: async (record: FinanceRecord): Promise<FinanceRecord[]> => {
      await delay(LATENCY);
      const data = db.getData();
      data.state.finances = [record, ...data.state.finances];
      db.saveData(data);
      return data.state.finances;
    },

    // IoT
    updateIoTNode: async (id: string, updates: Partial<IoTNode>): Promise<IoTNode[]> => {
      // Very low latency for real-time feel
      const data = db.getData();
      data.state.iotNodes = data.state.iotNodes.map((n: IoTNode) => 
        n.id === id ? { ...n, ...updates, lastReading: new Date().toISOString() } : n
      );
      db.saveData(data);
      return data.state.iotNodes;
    }
  }
};
