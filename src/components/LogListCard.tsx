
import React, { useState } from 'react';
import { SlowQuery } from '../types';
import { TimerIcon, CopyIcon, CheckIcon } from './icons';

interface LogListCardProps {
  slowQueries: SlowQuery[];
}

const LogListCard: React.FC<LogListCardProps> = ({ slowQueries }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold font-orbitron text-cyan-400">Top 15 Slow Queries</h3>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Threshold: &gt; 1.0s</span>
      </div>
      <div className="flex-grow pr-2">
        {slowQueries.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            No slow queries detected.
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {slowQueries.map((log) => (
              <li key={log.id} className="bg-slate-800/60 p-3 rounded-md text-xs transition-all duration-300 hover:bg-slate-800 group border border-transparent hover:border-cyan-900 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2 text-amber-400 font-semibold whitespace-nowrap">
                        <TimerIcon className="w-4 h-4" />
                        <span>{log.time.toFixed(2)}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[10px]">{log.user}@{log.host}</span>
                        <button 
                            onClick={() => handleCopy(log.id, log.query)}
                            className="p-1.5 rounded-md bg-slate-700 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors"
                            title="Copy Full Query"
                        >
                            {copiedId === log.id ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
                
                <div className="relative flex-grow">
                    <p className="font-mono text-cyan-100 break-all text-[11px] leading-relaxed select-text bg-slate-900/50 p-2 rounded border border-slate-700/50 h-full max-h-32 overflow-y-auto custom-scrollbar">
                        {log.query}
                    </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LogListCard;
