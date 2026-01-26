import React from 'react';
import { OceanCurrent } from '../types';

interface Props {
  currents: OceanCurrent[];
  selectedCurrent: OceanCurrent | null;
  onSelect: (current: OceanCurrent) => void;
}

const CurrentsList: React.FC<Props> = ({ currents, selectedCurrent, onSelect }) => {
  return (
    <div className="absolute left-6 top-32 z-20 w-64 bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-10rem)] transition-transform duration-300 -translate-x-full md:translate-x-0">
         <div className="p-4 border-b border-slate-700/50 bg-slate-800/40">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monitored Currents</h3>
         </div>
         <div className="overflow-y-auto custom-scrollbar flex-1">
             {currents.map(current => (
                 <button
                    key={current.id}
                    onClick={() => onSelect(current)}
                    className={`w-full text-left p-4 border-b border-slate-800/50 transition-colors hover:bg-slate-800/60 ${selectedCurrent?.id === current.id ? 'bg-cyan-900/30 border-l-4 border-l-cyan-400' : 'border-l-4 border-l-transparent'}`}
                 >
                    <div className="text-sm font-semibold text-slate-200">{current.name.split('(')[0]}</div>
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-500">{current.region}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${current.type === 'Warm' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {current.type}
                        </span>
                    </div>
                 </button>
             ))}
         </div>
      </div>
  );
};

export default CurrentsList;