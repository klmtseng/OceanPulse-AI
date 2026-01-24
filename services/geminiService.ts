import { GoogleGenAI, Schema, Type } from "@google/genai";
import { OceanCurrent, GeminiAnalysisResult } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Brief overview of current status" },
    climateImpact: { type: Type.STRING, description: "Impact on local and global weather" },
    marineLife: { type: Type.STRING, description: "Effects on fish migration and ecosystem" },
    navigationAdvice: { type: Type.STRING, description: "Advice for shipping and navigation" }
  },
  required: ["summary", "climateImpact", "marineLife", "navigationAdvice"]
};

export const analyzeCurrent = async (current: OceanCurrent, simulationData: any): Promise<GeminiAnalysisResult | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const prompt = `
      Analyze the ocean current "${current.name}" (${current.region}).
      Current Simulation Telemetry:
      - Speed: ${simulationData.currentSpeed.toFixed(2)} knots
      - Surface Temp: ${simulationData.temperature.toFixed(1)}°C
      - Salinity: ${simulationData.salinity.toFixed(1)} PSU

      Provide a real-time assessment report in Traditional Chinese (繁體中文).
      Focus on scientific accuracy regarding its role in the global conveyor belt or local climate.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_SCHEMA,
        systemInstruction: "You are an expert Oceanographer and Marine Meteorologist."
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiAnalysisResult;
    }
    return null;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
};
