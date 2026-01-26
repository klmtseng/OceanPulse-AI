import React, { useState, useEffect } from 'react';
import GlobeVisualization from './components/GlobeVisualization';
import InfoPanel from './components/InfoPanel';
import GeminiInsight from './components/GeminiInsight';
import Header from './components/Header';
import CurrentsList from './components/CurrentsList';
import { MAJOR_CURRENTS } from './constants';
import { OceanCurrent, SimulationData } from './types';

const App: React.FC = () => {
  const [selectedCurrent, setSelectedCurrent] = useState<OceanCurrent | null>(MAJOR_CURRENTS[0]);
  const [simData, setSimData] = useState<SimulationData>({
      timestamp: new Date(),
      currentSpeed: 0,
      temperature: 0,
      salinity: 35
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Check for API Key on mount
  useEffect(() => {
    if (!process.env.API_KEY) {
      setShowApiKeyModal(true);
    }
  }, []);

  // Simulate real-time data fluctuations
  useEffect(() => {
    if (!selectedCurrent) return;

    const baseSpeed = selectedCurrent.avgSpeedKnots;
    const baseTemp = selectedCurrent.avgTempCelsius;

    const interval = setInterval(() => {
        setSimData(prev => ({
            timestamp: new Date(),
            // Random fluctuation around average
            currentSpeed: baseSpeed + (Math.random() * 0.4 - 0.2), 
            temperature: baseTemp + (Math.random() * 0.2 - 0.1),
            salinity: 34 + Math.random()
        }));
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedCurrent]);

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex overflow-hidden">
      
      {/* Background/Globe Layer */}
      <div className="absolute inset-0 z-0">
        <GlobeVisualization 
            selectedCurrent={selectedCurrent} 
            onSelectCurrent={setSelectedCurrent}
            currents={MAJOR_CURRENTS}
        />
      </div>

      {/* UI Overlay Components */}
      <Header />
      
      <CurrentsList 
        currents={MAJOR_CURRENTS}
        selectedCurrent={selectedCurrent}
        onSelect={setSelectedCurrent}
      />

      {/* Right Sidebar: Details & AI */}
      <div className="absolute right-0 top-0 h-full z-20 w-full md:w-96 bg-slate-900/80 backdrop-blur-xl border-l border-slate-700 shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-full md:translate-x-0">
         {selectedCurrent ? (
            <>
                <div className="flex-shrink-0">
                    <InfoPanel current={selectedCurrent} simulationData={simData} />
                </div>
                <div className="flex-1 overflow-hidden">
                    <GeminiInsight current={selectedCurrent} simData={simData} />
                </div>
            </>
         ) : (
             <div className="flex items-center justify-center h-full text-slate-500">
                 Select a current to view details
             </div>
         )}
      </div>

      {/* Mobile Selection Drawer (Simplified) */}
      <div className="md:hidden absolute bottom-0 w-full z-30 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700 p-4">
          <select 
            className="w-full bg-slate-800 text-white p-3 rounded-lg outline-none border border-slate-600"
            onChange={(e) => {
                const c = MAJOR_CURRENTS.find(mc => mc.id === e.target.value);
                if(c) setSelectedCurrent(c);
            }}
            value={selectedCurrent?.id || ''}
          >
              {MAJOR_CURRENTS.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
              ))}
          </select>
      </div>

      {/* API Key Modal Warning */}
      {showApiKeyModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-xl border border-red-500/50 max-w-md text-center shadow-2xl">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-xl font-bold text-white mb-2">Missing API Key</h2>
                <p className="text-slate-300 text-sm mb-4">
                    The <code>process.env.API_KEY</code> is missing. The AI features will not function correctly without a valid Google Gemini API key.
                </p>
                <button 
                    onClick={() => setShowApiKeyModal(false)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Continue in Demo Mode
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;