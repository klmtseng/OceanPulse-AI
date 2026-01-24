import React, { useEffect, useState } from 'react';
import { OceanCurrent, SimulationData } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  current: OceanCurrent;
  simulationData: SimulationData;
}

const InfoPanel: React.FC<Props> = ({ current, simulationData }) => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setHistory(prev => {
        const newData = {
            time: simulationData.timestamp.toLocaleTimeString(),
            speed: simulationData.currentSpeed,
            temp: simulationData.temperature
        };
        const newHist = [...prev, newData];
        return newHist.slice(-20); // Keep last 20 points
    });
  }, [simulationData]);

  // Reset history on current change
  useEffect(() => {
      setHistory([]);
  }, [current.id]);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          {current.name}
        </h2>
        <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${current.type === 'Warm' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {current.type} Current
            </span>
            <span className="text-sm text-slate-400">{current.region}</span>
        </div>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {current.description}
        </p>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Live Speed</div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono text-cyan-400">{simulationData.currentSpeed.toFixed(1)}</span>
                <span className="text-xs text-slate-500">knots</span>
            </div>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Surface Temp</div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono text-cyan-400">{simulationData.temperature.toFixed(1)}</span>
                <span className="text-xs text-slate-500">°C</span>
            </div>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Salinity</div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono text-cyan-400">{simulationData.salinity.toFixed(1)}</span>
                <span className="text-xs text-slate-500">PSU</span>
            </div>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Est. Depth</div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono text-cyan-400">0 - 800</span>
                <span className="text-xs text-slate-500">m</span>
            </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 w-full bg-slate-800/30 rounded-xl border border-slate-700/50 p-2">
         <h3 className="text-xs font-semibold text-slate-400 mb-2 pl-2">Real-time Velocity Trend</h3>
         <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={history}>
                <defs>
                    <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} hide />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#22d3ee' }}
                />
                <Area type="monotone" dataKey="speed" stroke="#22d3ee" fillOpacity={1} fill="url(#colorSpeed)" animationDuration={500} />
            </AreaChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InfoPanel;
