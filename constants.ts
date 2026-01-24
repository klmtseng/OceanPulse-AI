import { OceanCurrent } from './types';

// Simplified representation of major ocean currents
export const MAJOR_CURRENTS: OceanCurrent[] = [
  {
    id: 'gulf-stream',
    name: '墨西哥灣流 (Gulf Stream)',
    region: 'North Atlantic',
    type: 'Warm',
    avgSpeedKnots: 4.5,
    avgTempCelsius: 26.5,
    description: '強大的暖流，對歐洲氣候有深遠影響。',
    coordinates: [35, -50],
    pathNodes: [[25, -80], [30, -78], [35, -75], [40, -60], [45, -40], [50, -20]]
  },
  {
    id: 'kuroshio',
    name: '黑潮 (Kuroshio Current)',
    region: 'North Pacific',
    type: 'Warm',
    avgSpeedKnots: 3.8,
    avgTempCelsius: 24.0,
    description: '太平洋北部的西邊界流，對台灣與日本氣候至關重要。',
    coordinates: [30, 135],
    pathNodes: [[15, 125], [22, 122], [25, 125], [30, 130], [35, 140], [40, 150]]
  },
  {
    id: 'humboldt',
    name: '秘魯涼流 (Humboldt Current)',
    region: 'South Pacific',
    type: 'Cold',
    avgSpeedKnots: 0.8,
    avgTempCelsius: 16.0,
    description: '富含營養的冷水流，支撐著豐富的漁場。',
    coordinates: [-20, -80],
    pathNodes: [[-45, -75], [-35, -73], [-25, -72], [-15, -75], [-5, -80]]
  },
  {
    id: 'agulhas',
    name: '阿古拉斯洋流 (Agulhas Current)',
    region: 'Indian Ocean',
    type: 'Warm',
    avgSpeedKnots: 4.2,
    avgTempCelsius: 23.0,
    description: '南半球最強的西邊界流之一，流經非洲東南海岸。',
    coordinates: [-30, 30],
    pathNodes: [[-25, 35], [-30, 32], [-35, 25], [-38, 20]]
  },
  {
    id: 'california',
    name: '加利福尼亞洋流 (California Current)',
    region: 'North Pacific',
    type: 'Cold',
    avgSpeedKnots: 0.5,
    avgTempCelsius: 15.0,
    description: '沿著北美西海岸向南流動的冷流。',
    coordinates: [35, -125],
    pathNodes: [[48, -128], [40, -126], [30, -120], [23, -115]]
  },
  {
    id: 'north-equatorial',
    name: '北赤道洋流 (North Equatorial)',
    region: 'Pacific/Atlantic',
    type: 'Warm',
    avgSpeedKnots: 1.5,
    avgTempCelsius: 28.0,
    description: '由東向西流動的重要赤道洋流，受東北信風驅動。',
    coordinates: [10, -140],
    pathNodes: [[10, -100], [10, -120], [12, -140], [14, -160], [15, -170]]
  },
  {
      id: 'brazil',
      name: '巴西洋流 (Brazil Current)',
      region: 'South Atlantic',
      type: 'Warm',
      avgSpeedKnots: 2.5,
      avgTempCelsius: 24.0,
      description: '南大西洋西部的暖流，沿著巴西海岸向南流動。',
      coordinates: [-20, -35],
      pathNodes: [[-10, -32], [-15, -34], [-23, -38], [-30, -45]]
  },
  {
      id: 'benguela',
      name: '本吉拉涼流 (Benguela Current)',
      region: 'South Atlantic',
      type: 'Cold',
      avgSpeedKnots: 1.2,
      avgTempCelsius: 14.0,
      description: '沿非洲西南岸向北流動的強勁冷流，漁業資源豐富。',
      coordinates: [-25, 12],
      pathNodes: [[-34, 18], [-30, 16], [-25, 13], [-20, 10]]
  },
  {
      id: 'acc',
      name: '南極繞極流 (ACC)',
      region: 'Southern Ocean',
      type: 'Cold',
      avgSpeedKnots: 2.0,
      avgTempCelsius: 4.0,
      description: '地球上最大的洋流，環繞南極洲由西向東流動，連接各大洋。',
      coordinates: [-55, 0],
      pathNodes: [[-55, -60], [-58, -30], [-55, 0], [-53, 30], [-58, 70], [-60, 120], [-62, 160], [-58, -160], [-55, -120]]
  },
   {
      id: 'eac',
      name: '東澳洋流 (East Australian)',
      region: 'South Pacific',
      type: 'Warm',
      avgSpeedKnots: 3.0,
      avgTempCelsius: 22.0,
      description: '沿澳洲東岸向南流動的暖流，因《海底總動員》而聞名。',
      coordinates: [-30, 155],
      pathNodes: [[-18, 148], [-25, 153], [-32, 155], [-38, 152]]
  },
  {
      id: 'canary',
      name: '加那利涼流 (Canary Current)',
      region: 'North Atlantic',
      type: 'Cold',
      avgSpeedKnots: 1.0,
      avgTempCelsius: 18.0,
      description: '沿非洲西北岸向南流動，屬於北大西洋環流的一部分。',
      coordinates: [28, -18],
      pathNodes: [[35, -10], [30, -15], [25, -18], [15, -22]]
  }
];

export const MOCK_GEO_JSON_URL = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';