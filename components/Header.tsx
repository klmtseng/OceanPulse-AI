import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full z-20 p-6 pointer-events-none">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">
                    Ocean<span className="text-cyan-400">Pulse</span> AI
                </h1>
                <p className="text-cyan-200/80 text-sm font-light mt-1 max-w-md drop-shadow-md">
                    Global Real-time Ocean Current Tracking & Environmental Analysis
                </p>
            </div>
            
            <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md rounded-full px-4 py-2 border border-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-mono text-slate-300">SYSTEM ONLINE</span>
            </div>
        </div>
      </div>
  );
};

export default Header;