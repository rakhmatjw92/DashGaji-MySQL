
import React, { useState, useEffect } from 'react';
import { XIcon, DatabaseIcon, TrashIcon, PlusIcon, CheckIcon } from './icons';
import { ConnectionStatus } from '../App';
import { connectToDatabase } from '../services/apiService';
import { DbConnection } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeConnectionId: string | null;
  onSelectConnection: (connection: DbConnection) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setConnectionError: (error: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  activeConnectionId,
  onSelectConnection,
  setConnectionStatus, 
  setConnectionError 
}) => {
  const [connections, setConnections] = useState<DbConnection[]>([]);
  const [view, setView] = useState<'list' | 'form'>('form');
  
  // Form State
  const [nickname, setNickname] = useState('');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('3306');
  const [user, setUser] = useState('root');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('');
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [formError, setFormError] = useState('');

  // Load connections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mysql_orion_connections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConnections(parsed);
        // If we have saved connections and haven't explicitly started in form view, show list
        if (parsed.length > 0 && !activeConnectionId) {
            setView('list');
        }
      } catch (e) {
        console.error("Failed to parse saved connections", e);
      }
    }
  }, [activeConnectionId]);

  // Save connections to localStorage
  const saveToStorage = (updatedList: DbConnection[]) => {
    localStorage.setItem('mysql_orion_connections', JSON.stringify(updatedList));
    setConnections(updatedList);
  };

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!database || !host || !user || !nickname) {
      setFormError('Nickname, Host, User, and Database Name are all required.');
      return;
    }
    
    setFormError('');
    setIsConnecting(true);
    
    try {
      // Test connection
      await connectToDatabase({ host, port, user, password, database });
      
      const newConn: DbConnection = {
        id: crypto.randomUUID(),
        nickname,
        host,
        port,
        user,
        password,
        database
      };
      
      const updatedList = [...connections, newConn];
      saveToStorage(updatedList);
      
      // Select it immediately
      onSelectConnection(newConn);
      setView('list');
    } catch (err: any) {
      setFormError(err.message || 'Connection failed. Please check your credentials.');
    } finally {
      setIsConnecting(false);
    }
  };

  const deleteConnection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedList = connections.filter(c => c.id !== id);
    saveToStorage(updatedList);
    if (updatedList.length === 0) setView('form');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" aria-modal="true" role="dialog">
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md m-4 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <DatabaseIcon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold font-orbitron text-cyan-400">Database Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs (Only if connections exist) */}
        {connections.length > 0 && (
            <div className="flex border-b border-slate-800 p-1">
                <button 
                    onClick={() => setView('form')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${view === 'form' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Add New
                </button>
                <button 
                    onClick={() => setView('list')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${view === 'list' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Saved Clusters ({connections.length})
                </button>
            </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          
          {view === 'form' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Connection Nickname</label>
                <input 
                  type="text" 
                  placeholder="e.g. Production-Main"
                  value={nickname} 
                  onChange={e => setNickname(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 outline-none transition" 
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Host</label>
                  <input 
                    type="text" 
                    value={host} 
                    onChange={e => setHost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 outline-none transition" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Port</label>
                  <input 
                    type="text" 
                    value={port} 
                    onChange={e => setPort(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 outline-none transition" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">User</label>
                  <input 
                    type="text" 
                    value={user} 
                    onChange={e => setUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 outline-none transition" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 outline-none transition" 
                  />
                </div>
              </div>

              {/* HIGHLIGHTED DATABASE FIELD AS REQUESTED */}
              <div className="p-4 bg-cyan-500/5 border-2 border-cyan-500/30 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Database Name (Required)</label>
                <input 
                  type="text" 
                  placeholder="Enter specific database..."
                  value={database} 
                  onChange={e => setDatabase(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/40 rounded-lg px-3 py-2.5 text-slate-100 focus:ring-2 focus:ring-cyan-400 outline-none transition text-lg font-medium" 
                />
                <p className="mt-2 text-[10px] text-slate-500 italic">This must be the exact name of the schema to monitor.</p>
              </div>

              {formError && (
                <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg text-xs text-red-200 flex items-start gap-2">
                  <span>⚠️</span> {formError}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {connections.map((conn) => (
                <div 
                  key={conn.id}
                  onClick={() => { onSelectConnection(conn); onClose(); }}
                  className={`group flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    activeConnectionId === conn.id 
                    ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                    : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 truncate">{conn.nickname}</span>
                      {activeConnectionId === conn.id && <CheckIcon className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-1">
                        {conn.user}@{conn.host} • DB: <span className="text-cyan-600 font-mono">{conn.database}</span>
                    </p>
                  </div>
                  <button 
                    onClick={(e) => deleteConnection(conn.id, e)}
                    className="text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 rounded-b-xl">
          {view === 'form' ? (
            <>
              <button 
                onClick={onClose} 
                className="px-5 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleTestAndSave}
                disabled={isConnecting}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-cyan-900/20 flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Connecting...
                  </>
                ) : 'Test & Save'}
              </button>
            </>
          ) : (
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 text-sm font-medium"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
