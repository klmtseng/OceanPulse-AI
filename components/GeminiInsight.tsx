import React, { useState, useEffect } from 'react';
import { OceanCurrent, GeminiAnalysisResult, SimulationData } from '../types';
import { analyzeCurrent } from '../services/geminiService';

interface Props {
  current: OceanCurrent;
  simData: SimulationData;
}

const GeminiInsight: React.FC<Props> = ({ current, simData }) => {
  const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger analysis when current changes
  useEffect(() => {
    let isMounted = true;

    const fetchAnalysis = async () => {
        if (!current) return;
        
        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            // Add a small delay to prevent rapid API calls if user clicks around fast
            await new Promise(r => setTimeout(r, 800));
            if (!isMounted) return;

            const result = await analyzeCurrent(current, simData);
            if (isMounted) setAnalysis(result);
        } catch (err) {
            if (isMounted) setError("Unable to connect to Gemini AI for live analysis.");
        } finally {
            if (isMounted) setLoading(false);
        }
    };

    fetchAnalysis();

    return () => { isMounted = false; };
  }, [current.id]); // Re-run only if ID changes. We don't want to re-run on every tick of simData.

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md border-t border-slate-700/50">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="font-semibold text-slate-200">Gemini Live Analysis</h3>
            </div>
            {loading && <span className="text-xs text-purple-400 animate-pulse">Generating Insights...</span>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm">
                    {error} <br/>
                    <span className="text-xs opacity-50">Please check your API Key.</span>
                </div>
            )}

            {!loading && !analysis && !error && (
                <div className="text-slate-500 text-center mt-10 text-sm">
                    Waiting for analysis...
                </div>
            )}

            {analysis && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/30">
                        <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                        <p className="text-sm text-slate-200 leading-relaxed">{analysis.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-medium text-blue-300 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                Climate Impact
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/20 p-2 rounded">{analysis.climateImpact}</p>
                        </div>
                        
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-medium text-emerald-300 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Marine Ecosystem
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/20 p-2 rounded">{analysis.marineLife}</p>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-medium text-amber-300 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                Maritime Navigation
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/20 p-2 rounded">{analysis.navigationAdvice}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default GeminiInsight;
