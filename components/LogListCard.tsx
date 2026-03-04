
import React from 'react';
import { SlowQuery } from '../types';
import { TimerIcon } from './icons';

interface LogListCardProps {
  slowQueries: SlowQuery[];
}

const LogListCard: React.FC<LogListCardProps> = ({ slowQueries }) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 h-full flex flex-col">
      <h3 className="text-lg font-bold font-orbitron text-cyan-400 mb-4">Top Slow Queries</h3>
      <div className="flex-grow overflow-y-auto pr-2">
        {slowQueries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            No slow queries detected.
          </div>
        ) : (
          <ul className="space-y-3">
            {slowQueries.map((log) => (
              <li key={log.id} className="bg-slate-800/60 p-3 rounded-md text-xs transition-all duration-300 hover:bg-slate-800">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-mono text-cyan-300 break-all pr-4 flex-1">
                    {log.query.length > 100 ? `${log.query.substring(0, 100)}...` : log.query}
                  </p>
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold whitespace-nowrap">
                    <TimerIcon className="w-4 h-4" />
                    <span>{log.time.toFixed(2)}s</span>
                  </div>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  <span>{log.user}@{log.host}</span>
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
