
import React from 'react';
import { DatabaseIcon, SettingsIcon, ActivityIcon, TermIcon } from './icons';
import { ConnectionStatus } from '../App';
import { ViewMode, ThemeColor } from '../types';

interface HeaderProps {
  onSettingsClick: () => void;
  connectionStatus: ConnectionStatus;
  databaseName: string;
  viewMode: ViewMode;
  setViewMode: (view: ViewMode) => void;
  color: ThemeColor;
}

const Header: React.FC<HeaderProps> = ({ 
  onSettingsClick, 
  connectionStatus, 
  databaseName, 
  viewMode, 
  setViewMode,
  color
}) => {
  
  const getStatusIndicator = () => {
    switch(connectionStatus) {
      case 'connected':
        return { text: 'CONNECTED', color: 'green' };
      case 'connecting':
        return { text: 'CONNECTING', color: 'yellow' };
      case 'error':
        return { text: 'ERROR', color: 'red' };
      case 'disconnected':
      default:
        return { text: 'DISCONNECTED', color: 'slate' };
    }
  };

  const status = getStatusIndicator();
  const colors = {
    green: { bg: 'bg-green-500', text: 'text-green-400', ping: 'bg-green-400' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-400', ping: 'bg-yellow-400' },
    red: { bg: 'bg-red-500', text: 'text-red-400', ping: 'bg-red-400' },
    slate: { bg: 'bg-slate-500', text: 'text-slate-400', ping: 'bg-slate-400' },
  };

  const colorClasses = colors[status.color as keyof typeof colors];

  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <DatabaseIcon className={`w-10 h-10 text-${color}-400`} />
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold font-orbitron text-${color}-400 tracking-wider`}>
              DB GajiKPPN Dashboard
            </h1>
            <p className="text-sm text-slate-400">
              {connectionStatus === 'connected' && databaseName 
                ? `Monitoring Database: ${databaseName}`
                : 'Live Performance Database Monitoring'
              }
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <nav className="flex bg-slate-900/60 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'dashboard' ? `bg-${color}-600/20 text-${color}-400` : 'text-slate-400 hover:text-slate-200'}`}
            >
              <ActivityIcon className="w-4 h-4" />
              Metrics
            </button>
            <button 
              onClick={() => setViewMode('innodb')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'innodb' ? `bg-${color}-600/20 text-${color}-400` : 'text-slate-400 hover:text-slate-200'}`}
            >
              <TermIcon className="w-4 h-4" />
              Engine Status
            </button>
          </nav>

          <div className="flex items-center gap-3 bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-800">
             <span className="relative flex h-3 w-3">
               {connectionStatus !== 'disconnected' && connectionStatus !== 'error' && (
                 <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClasses.ping} opacity-75`}></span>
               )}
               <span className={`relative inline-flex rounded-full h-3 w-3 ${colorClasses.bg}`}></span>
             </span>
             <span className={`${colorClasses.text} font-medium text-xs sm:text-sm`}>{status.text}</span>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
