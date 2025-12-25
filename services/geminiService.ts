
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FarmProfile, Quest, WeatherData, Message, MarketTrend } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuests = async (profile: FarmProfile, weather?: WeatherData): Promise<Quest[]> => {
  const cropList = profile.crops.join(', ');
  const prompt = `Generate 4 personalized sustainable farming quests for a farmer growing ${cropList} in ${profile.location}. 
  Weather: ${weather?.condition || 'Unknown'}. Focus on intercropping and water saving.`;

  try {
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
              points: { type: Type.INTEGER },
              category: { type: Type.STRING }
            },
            required: ["id", "title", "description", "difficulty", "points", "category"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]").map((q: any) => ({ ...q, status: 'available' }));
  } catch (error) {
    console.error("Quest Generation Error:", error);
    return [];
  }
};

export const getFarmingAdvice = async (history: Message[], profile: FarmProfile): Promise<Message> => {
  const systemInstruction = `You are "AgriBot Pro", a top-tier agricultural scientist. 
  Context: ${profile.farmSize} farm, Crops: ${profile.crops.join(', ')}, Location: ${profile.location}.
  Use your thinking budget to deeply analyze plant pathology and soil health. 
  If asked about nearby resources, use your internal knowledge (maps grounding is enabled via separate tool if needed).`;

  const lastMessage = history[history.length - 1];
  const parts: any[] = [{ text: lastMessage.text }];

  if (lastMessage.image) {
    parts.push({ inlineData: { data: lastMessage.image.split(',')[1], mimeType: 'image/jpeg' } });
  }
  if (lastMessage.video) {
    parts.push({ inlineData: { data: lastMessage.video.split(',')[1], mimeType: 'video/mp4' } });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: { 
        systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    return { role: 'model', text: response.text || "I'm processing that information..." };
  } catch (error) {
    console.error("Advice Error:", error);
    return { role: 'model', text: "Error connecting to AI intelligence." };
  }
};

export const getMarketPulse = async (profile: FarmProfile): Promise<MarketTrend> => {
  const crop = profile.crops[0] || "Wheat";
  const prompt = `Live market analysis for ${crop} in ${profile.location}. Need current price, trend, and forecast.`;

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
            demandForecast: { type: Type.STRING },
            suggestedAction: { type: Type.STRING }
          },
          required: ["cropName", "currentPrice", "priceTrend", "demandForecast", "suggestedAction"]
        }
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri,
      title: chunk.web?.title
    })).filter((s: any) => s.uri) || [];

    return { ...JSON.parse(response.text), sources };
  } catch (error) {
    console.error("Market Pulse Error:", error);
    throw error;
  }
};

export const findNearbyResources = async (query: string, lat: number, lon: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find ${query} near these coordinates.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lon } } }
      }
    });
    
    const mapLinks = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => 
      chunk.maps?.uri ? `\n- [${chunk.maps.title}](${chunk.maps.uri})` : ""
    ).join('') || "";

    return (response.text || "Looking for resources...") + "\n\n**Nearby Locations:**" + mapLinks;
  } catch (error) {
    return "Could not find nearby resources.";
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  } catch (error) {
    console.error("TTS Error:", error);
    return "";
  }
};

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [{ inlineData: { data: base64Audio, mimeType: 'audio/wav' } }, { text: "Transcribe this audio." }]
      }
    });
    return response.text || "";
  } catch (error) {
    return "";
  }
};
