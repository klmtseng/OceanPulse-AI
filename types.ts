export interface OceanCurrent {
  id: string;
  name: string;
  region: string;
  type: 'Warm' | 'Cold';
  avgSpeedKnots: number;
  avgTempCelsius: number;
  description: string;
  coordinates: [number, number]; // Lat, Lng for camera focus
  pathNodes: [number, number][]; // Simplified path for visualization
}

export interface SimulationData {
  timestamp: Date;
  currentSpeed: number;
  temperature: number;
  salinity: number;
}

export interface GeminiAnalysisResult {
  summary: string;
  climateImpact: string;
  marineLife: string;
  navigationAdvice: string;
}

export enum ViewMode {
  GLOBE = 'GLOBE',
  FLAT = 'FLAT'
}
