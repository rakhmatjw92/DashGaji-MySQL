
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchInnoDBStatus } from '../services/apiService';
import { ConnectionStatus } from '../App';
import { ThemeColor } from '../types';
import { DatabaseIcon, SyncIcon, SearchIcon, ChevronDownIcon, ChevronUpIcon } from './icons';

interface InnoDBStatusPageProps {
  connectionStatus: ConnectionStatus;
  onConnectClick: () => void;
  sessionId: string;
  color: ThemeColor;
}

const InnoDBStatusPage: React.FC<InnoDBStatusPageProps> = ({ connectionStatus, onConnectClick, sessionId, color }) => {
  const [rawStatus, setRawStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    if (connectionStatus !== 'connected') return;
    setIsLoading(true);
    try {
      const data = await fetchInnoDBStatus(sessionId);
      setRawStatus(data.status);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch InnoDB status');
    } finally {
      setIsLoading(false);
    }
  }, [connectionStatus, sessionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sections = useMemo(() => {
    if (!rawStatus) return [];
    
    // Split the status into sections based on typical MySQL headers (all caps with dashes/equals)
    const headerRegex = /-{5,}\n([A-Z\s\/]+)\n-{5,}/g;
    const parts: { title: string; content: string }[] = [];
    
    let lastIndex = 0;
    let match;
    
    while ((match = headerRegex.exec(rawStatus)) !== null) {
      if (parts.length > 0) {
        parts[parts.length - 1].content = rawStatus.substring(lastIndex, match.index).trim();
      } else {
        // Handle the intro part if any
        const intro = rawStatus.substring(0, match.index).trim();
        if (intro) parts.push({ title: 'GENERAL', content: intro });
      }
      parts.push({ title: match[1].trim(), content: '' });
      lastIndex = match.index + match[0].length;
    }
    
    if (parts.length > 0) {
      parts[parts.length - 1].content = rawStatus.substring(lastIndex).trim();
    } else {
        parts.push({ title: 'RAW STATUS', content: rawStatus });
    }

    return parts;
  }, [rawStatus]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredSections = useMemo(() => {
    if (!searchTerm) return sections;
    const term = searchTerm.toLowerCase();
    return sections.filter(s => 
      s.title.toLowerCase().includes(term) || 
      s.content.toLowerCase().includes(term)
    );
  }, [sections, searchTerm]);

  if (connectionStatus !== 'connected') {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
             <div className="bg-slate-900/50 border border-slate-700 p-8 rounded-lg">
                <DatabaseIcon className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-300 mb-2">No Active Engine Link</h2>
                <p className="text-slate-400 mb-6">Connect to a database to inspect the InnoDB engine status.</p>
                <button 
                    onClick={onConnectClick}
                    className={`px-6 py-2 bg-${color}-600 text-white rounded-md hover:bg-${color}-500 transition-colors shadow-[0_0_10px_rgba(var(--color-${color}-500),0.4)]`}
                >
                    Connect Now
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold font-orbitron text-${color}-400`}>InnoDB Engine Monitor</h2>
          <p className="text-slate-400 text-sm">Detailed internal state of the storage engine</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-${color}-500 outline-none transition-all`}
            />
          </div>
          <button 
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <SyncIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SyncIcon className="w-5 h-5 text-red-400" />
            <p className="font-medium">Error: {error}</p>
          </div>
          <button 
            onClick={fetchData}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition-colors shadow-lg"
          >
            Retry Fetch
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredSections.map((section, idx) => {
          const isExpanded = expandedSections[section.title] !== false; // Default expanded
          const hasWait = section.content.toLowerCase().includes('wait') || section.content.toLowerCase().includes('lock wait');
          const hasDeadlock = section.content.toLowerCase().includes('deadlock');

          return (
            <div 
              key={idx} 
              className={`bg-slate-900/40 border transition-all duration-300 rounded-lg overflow-hidden ${
                hasDeadlock ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 
                hasWait ? 'border-amber-500/50' : 'border-slate-700'
              }`}
            >
              <button 
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-orbitron font-bold text-sm tracking-wider text-${color}-300 uppercase`}>
                    {section.title}
                  </span>
                  {hasDeadlock && <span className="bg-red-500 text-[10px] px-1.5 py-0.5 rounded text-white animate-pulse">CRITICAL: DEADLOCK</span>}
                  {hasWait && <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30 font-semibold">WAITS DETECTED</span>}
                </div>
                {isExpanded ? <ChevronUpIcon className="w-4 h-4 text-slate-500" /> : <ChevronDownIcon className="w-4 h-4 text-slate-500" />}
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 bg-slate-950/40">
                  <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap break-all leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
                    {section.content}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
        
        {filteredSections.length === 0 && (
          <div className="py-20 text-center text-slate-500 italic">
            No sections match your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default InnoDBStatusPage;
