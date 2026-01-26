export interface OceanCurrent {
  id: string;
  name: string;
  region: string;
  type: 'Warm' | 'Cold';
  avgSpeedKnots: number;
  avgTempCelsius: number;
  depthRange: [number, number]; // Min and max depth in meters
  description: string;
  coordinates: [number, number]; // Lat, Lng for camera focus
  pathNodes: [number, number][]; // Simplified path for visualization
}

export interface HistoryDataPoint {
  time: string;
  speed: number;
  temp: number;
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
