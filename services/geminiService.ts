
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FarmProfile, Quest, WeatherData, Message, MarketTrend, AgriNotification, MLPrediction, IoTNode, AIAlgorithmType, CropDiagnostic, FertilizerPrescription, LivestockDiagnostic } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const connectLiveAdvisor = async (callbacks: {
  onopen: () => void;
  onmessage: (message: any) => void;
  onerror: (e: any) => void;
  onclose: () => void;
}) => {
  const ai = getAI();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: `You are AgriQuest Pro, an elite Multilingual Agricultural Decision Support System. 
      Help farmers troubleshoot crops and livestock using real-time voice. 
      Key abilities:
      1. Conversational UX: Support native Indian languages (Hindi, Tamil, Telugu, etc.) if spoken to in them.
      2. Decision Support: Give step-by-step plans (e.g., "Step 1: Calibrate pH, Step 2: Apply Urea").
      3. Scientific precision: Use localized metrics. 
      Be scientific yet approachable.`,
    }
  });
};

export const analyzeCropHealth = async (base64Image: string, profile: FarmProfile): Promise<CropDiagnostic> => {
  const ai = getAI();
  const prompt = `Act as an Edge-AI Spectral Diagnostic Suite. 
  1. Process RGB image for pathogen markers (spots, wilting, mosaic).
  2. Perform NIR-simulation: Estimate NDVI, Biomass, and Chlorophyll index.
  3. Identify plant stress patterns (Thermal vs Nutrient).
  Analyze for ${profile.location}. Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } }, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cropName: { type: Type.STRING },
            healthScore: { type: Type.NUMBER },
            condition: { type: Type.STRING },
            detectedIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
            report: { type: Type.STRING },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            spectralAnalysis: {
              type: Type.OBJECT,
              properties: {
                ndviValue: { type: Type.NUMBER },
                biomassDensity: { type: Type.STRING },
                chlorophyllIndex: { type: Type.NUMBER },
                thermalStress: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Critical'] }
              },
              required: ["ndviValue", "biomassDensity", "chlorophyllIndex", "thermalStress"]
            },
            pathogenSignature: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                certainty: { type: Type.NUMBER },
                spreadRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Immediate'] },
                pathogenCategory: { type: Type.STRING, enum: ['Fungal', 'Bacterial', 'Viral', 'Pest', 'Nutritional'] }
              },
              required: ["type", "certainty", "spreadRisk", "pathogenCategory"]
            }
          },
          required: ["cropName", "healthScore", "condition", "detectedIssues", "report", "actionPlan", "spectralAnalysis", "pathogenSignature"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return { id: `DIAG-${Date.now()}`, timestamp: new Date().toISOString(), ...parsed, imageUrl: base64Image };
  } catch (error) { throw error; }
};

export const analyzeLivestockBiometrics = async (base64Image: string): Promise<LivestockDiagnostic> => {
  const ai = getAI();
  const prompt = `Act as an AI Livestock Specialist. 
  1. Recognize animal breed.
  2. Extract Biometric Parameters from 2D image: Estimate body length, height, and girth in cm.
  3. Calculate an "Objective Health Grade" (A-D) based on body condition score.
  4. Estimate weight in kg.
  Return JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } }, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          breed: { type: Type.STRING },
          weightEstimate: { type: Type.NUMBER },
          healthGrade: { type: Type.STRING, enum: ['A', 'B', 'C', 'D'] },
          biometrics: {
            type: Type.OBJECT,
            properties: {
              bodyLength: { type: Type.NUMBER },
              height: { type: Type.NUMBER },
              girth: { type: Type.NUMBER }
            },
            required: ["bodyLength", "height", "girth"]
          },
          ageEstimate: { type: Type.STRING },
          vitalsNote: { type: Type.STRING }
        },
        required: ["breed", "weightEstimate", "healthGrade", "biometrics", "ageEstimate", "vitalsNote"]
      }
    }
  });
  const parsed = JSON.parse(response.text || "{}");
  return { id: `LIVE-${Date.now()}`, timestamp: new Date().toISOString(), ...parsed, imageUrl: base64Image };
};

export const optimizeFertilizer = async (cropName: string, soilData: any, weather: WeatherData | undefined): Promise<FertilizerPrescription> => {
  const ai = getAI();
  const prompt = `Act as a Precision Agronomist Decisions Support System. 
  Inputs: Crop=${cropName}, Soil=${JSON.stringify(soilData)}, Weather=${JSON.stringify(weather)}.
  Goal: Variable Rate Recommendations. Tell the farmer exact KG/HA doses based on plot GPS.
  If high rain is predicted, suggest split-dose protocol. Return JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedN: { type: Type.NUMBER },
          recommendedP: { type: Type.NUMBER },
          recommendedK: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          timingNote: { type: Type.STRING },
          sustainabilityImpact: { type: Type.STRING },
          splitDoseSuggested: { type: Type.BOOLEAN }
        },
        required: ["recommendedN", "recommendedP", "recommendedK", "unit", "timingNote", "sustainabilityImpact", "splitDoseSuggested"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const get7DayPredictiveAlerts = async (profile: FarmProfile, weather: WeatherData | undefined): Promise<AgriNotification[]> => {
  const ai = getAI();
  const prompt = `Act as a Time-Series Agricultural Forecasting Engine. 
  Generate 7-day predictive alerts for pests, market shifts, or climate risks in ${profile.location}.
  Return specific, actionable alerts in JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            text: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['update', 'alert', 'price_alert'] },
            date: { type: Type.STRING }
          },
          required: ["id", "title", "text", "type", "date"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getMarketPulse = async (profile: FarmProfile, targetCropName?: string): Promise<MarketTrend> => {
  const ai = getAI();
  const crop = targetCropName || profile.crops[0]?.name || "Wheat";
  const prompt = `Direct market pulse for ${crop} in ${profile.location}. Use googleSearch. Return JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cropName: { type: Type.STRING },
            currentPrice: { type: Type.NUMBER },
            priceTrend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
            priceRating: { type: Type.STRING, enum: ['Poor', 'Fair', 'Good', 'Excellent', 'Peak'] },
            sellingSignal: { type: Type.STRING, enum: ['Sell', 'Hold', 'Wait'] },
            demandForecast: { type: Type.STRING },
            suggestedAction: { type: Type.STRING }
          },
          required: ["cropName", "currentPrice", "priceTrend", "priceRating", "sellingSignal", "demandForecast", "suggestedAction"]
        }
      }
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri, title: chunk.web?.title
    })).filter((s: any) => s.uri) || [];
    const parsedData = JSON.parse(response.text || "{}");
    return { ...parsedData, sources };
  } catch (error) {
    return { cropName: crop, currentPrice: 0, priceTrend: 'stable', priceRating: 'Fair', sellingSignal: 'Wait', demandForecast: "Scanner active...", suggestedAction: "Verify with mandi.", sources: [] };
  }
};

export const runMLDiagnostic = async (crop: any, nodeData: IoTNode[], algorithm: AIAlgorithmType, weather?: WeatherData): Promise<MLPrediction> => {
  const ai = getAI();
  const prompt = `Alg: ${algorithm}. Sensors: ${JSON.stringify(nodeData)}. Weather: ${JSON.stringify(weather)}. Forecast yield/risks for ${crop.name}. JSON.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          yieldForecast: { type: Type.NUMBER },
          confidenceScore: { type: Type.NUMBER },
          riskFactors: {
            type: Type.OBJECT,
            properties: { pestProbability: { type: Type.NUMBER }, droughtStress: { type: Type.NUMBER }, nutrientDeficiency: { type: Type.NUMBER } }
          },
          suggestedMitigation: { type: Type.STRING }
        },
        required: ["yieldForecast", "confidenceScore", "riskFactors", "suggestedMitigation"]
      }
    }
  });
  const parsed = JSON.parse(response.text || "{}");
  return {
    cropId: crop.id, yieldForecast: parsed.yieldForecast, confidenceScore: parsed.confidenceScore * 100,
    algorithmUsed: algorithm, timestamp: new Date().toISOString(), suggestedMitigation: parsed.suggestedMitigation,
    riskFactors: {
      pestProbability: parsed.riskFactors.pestProbability * 100,
      droughtStress: parsed.riskFactors.droughtStress * 100,
      nutrientDeficiency: parsed.riskFactors.nutrientDeficiency * 100
    }
  };
};

export const getFarmingAdvice = async (history: Message[], profile: FarmProfile): Promise<Message> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    config: { systemInstruction: `You are AgriBot Pro, a Multilingual Digital Agronomist for ${profile.location}. Give exact, variable-rate step-by-step advice.`, thinkingConfig: { thinkingBudget: 16000 } }
  });
  return { role: 'model', text: response.text || "Analysing..." };
};

export const verifyHarvestForBlockchain = async (cropName: string, history: any[], profile: FarmProfile): Promise<{ score: number, note: string }> => {
  const ai = getAI();
  const prompt = `Audit Seed-to-Shelf records for ${cropName} in ${profile.location}. Sustainability score 0-100? Note for blockchain signature? JSON.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          note: { type: Type.STRING }
        },
        required: ["score", "note"]
      }
    }
  });
  return JSON.parse(response.text || '{"score": 50, "note": "Basic Verification"}');
};

export const generateFutureSight = async (cropName: string, healthScore: number): Promise<string> => {
  const ai = getAI();
  const prompt = `A cinematic 5-second video of a lush, healthy ${cropName} field under golden hour sunlight, health score ${healthScore}. Photorealistic 4k.`;
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (error) { return ""; }
};

// Added generateQuests to resolve compilation error in App.tsx
export const generateQuests = async (profile: FarmProfile, weather: WeatherData | undefined): Promise<Quest[]> => {
  const ai = getAI();
  const prompt = `Act as an AI Farm Mentor. 
  Generate 3 highly specific, localized agricultural quests/missions for a farm in ${profile.location}.
  Crops: ${profile.crops.map(c => c.name).join(', ')}.
  Current Weather: ${JSON.stringify(weather)}.
  Return JSON array of Quests.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
            points: { type: Type.NUMBER },
            category: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['available', 'in-progress', 'completed'] }
          },
          required: ["id", "title", "description", "difficulty", "points", "category", "status"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

// Added generateAgriUpdates to resolve compilation error in App.tsx
export const generateAgriUpdates = async (profile: FarmProfile): Promise<AgriNotification[]> => {
  const ai = getAI();
  const prompt = `Act as an Agricultural News Oracle. 
  Generate 3 recent, localized agricultural updates or price alerts for ${profile.location}.
  Return JSON array of AgriNotifications.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            text: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['update', 'alert', 'event', 'price_alert', 'procurement'] },
            date: { type: Type.STRING },
            read: { type: Type.BOOLEAN }
          },
          required: ["id", "title", "text", "type", "date", "read"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

// Added findNearbyResources using googleMaps tool to resolve compilation error in SoilHub.tsx
export const findNearbyResources = async (query: string, lat: number, lon: number): Promise<void> => {
  const ai = getAI();
  // Maps grounding supported in Gemini 2.5 series (using flash-lite-latest)
  await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: `Find ${query} near coordinates ${lat}, ${lon}.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lon
          }
        }
      }
    },
  });
};
