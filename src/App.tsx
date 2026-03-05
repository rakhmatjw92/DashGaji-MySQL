
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import InnoDBStatusPage from './components/InnoDBStatusPage';
import { ViewMode, DbConnection, Session, ThemeColor } from './types';
import { connectToDatabase } from './services/apiService';
import { PlusIcon, XIcon, DatabaseIcon } from './components/icons';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const COLORS: ThemeColor[] = ['cyan', 'emerald', 'violet', 'amber', 'rose'];

const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Helper to generate IDs
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSelectConnection = async (conn: DbConnection) => {
    setIsSettingsOpen(false);
    
    // Create new session
    const newSessionId = generateId();
    const color = COLORS[sessions.length % COLORS.length];
    
    const newSession: Session = {
      id: newSessionId,
      connection: conn,
      status: 'connecting',
      color,
      viewMode: 'dashboard'
    };

    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSessionId);

    try {
      await connectToDatabase({
        host: conn.host,
        port: conn.port,
        user: conn.user,
        password: conn.password,
        database: conn.database
      }, newSessionId);

      setSessions(prev => prev.map(s => 
        s.id === newSessionId ? { ...s, status: 'connected' } : s
      ));
    } catch (err: any) {
      setSessions(prev => prev.map(s => 
        s.id === newSessionId ? { ...s, status: 'error', error: err.message || 'Failed to connect' } : s
      ));
    }
  };

  const closeSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessions(prev => {
      const newSessions = prev.filter(s => s.id !== sessionId);
      if (activeSessionId === sessionId && newSessions.length > 0) {
        setActiveSessionId(newSessions[newSessions.length - 1].id);
      } else if (newSessions.length === 0) {
        setActiveSessionId(null);
      }
      return newSessions;
    });
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const setViewMode = (mode: ViewMode) => {
    if (activeSessionId) {
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId ? { ...s, viewMode: mode } : s
      ));
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 flex flex-col">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJub25lIiBzdHJva2U9InJnYigxNSwyMyw0MiwwLjA1KSI+PGVmLWdyaWQtcGF0dGVybiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHg9IjAiIHk9IjAiPjxwYXRoIGQ9Ik0gMzIgMCAwIDAgMCAzMiIgLz48L2VmLWdyaWQtcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2VmLWdyaWQtcGF0dGVybikiLz48L3N2Zz4=')] pointer-events-none"></div>
      
      {/* Top Bar with Tabs */}
      <div className="relative z-10 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md">
        <div className="container mx-auto px-4 pt-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-0 custom-scrollbar">
                {sessions.map(session => (
                    <div 
                        key={session.id}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`
                            group relative flex items-center gap-2 px-4 py-2 rounded-t-lg border-t border-x cursor-pointer transition-all min-w-[160px] max-w-[240px]
                            ${activeSessionId === session.id 
                                ? `bg-slate-950 border-slate-700 text-${session.color}-400` 
                                : 'bg-slate-900 border-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                            }
                        `}
                    >
                        <div className={`w-2 h-2 rounded-full ${
                            session.status === 'connected' ? `bg-${session.color}-500` : 
                            session.status === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                        }`} />
                        <span className="truncate text-sm font-medium flex-grow">{session.connection.nickname}</span>
                        <button 
                            onClick={(e) => closeSession(e, session.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                        >
                            <XIcon className="w-3 h-3" />
                        </button>
                        
                        {/* Active Indicator Line */}
                        {activeSessionId === session.id && (
                            <div className={`absolute bottom-[-1px] left-0 right-0 h-[2px] bg-${session.color}-500`} />
                        )}
                    </div>
                ))}
                
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded-lg transition-colors mb-1"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">New Connection</span>
                </button>
            </div>
        </div>
      </div>

      <main className="relative container mx-auto p-4 sm:p-6 lg:p-8 flex-grow z-0">
        {activeSession ? (
            <>
                <Header 
                    onSettingsClick={() => setIsSettingsOpen(true)} 
                    connectionStatus={activeSession.status}
                    databaseName={activeSession.connection.database}
                    viewMode={activeSession.viewMode}
                    setViewMode={setViewMode}
                    color={activeSession.color}
                />
                
                {activeSession.viewMode === 'dashboard' ? (
                <Dashboard 
                    key={activeSession.id} // Force remount on session switch
                    connectionStatus={activeSession.status} 
                    connectionError={activeSession.error || ''}
                    onConnectClick={() => setIsSettingsOpen(true)}
                    setDatabaseName={() => {}} // Name is managed by session
                    sessionId={activeSession.id}
                    color={activeSession.color}
                />
                ) : (
                <InnoDBStatusPage 
                    key={activeSession.id}
                    connectionStatus={activeSession.status}
                    onConnectClick={() => setIsSettingsOpen(true)}
                    sessionId={activeSession.id}
                    color={activeSession.color}
                />
                )}
            </>
        ) : (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                <div className="bg-slate-900/50 border border-slate-700 p-12 rounded-2xl max-w-lg w-full backdrop-blur-sm">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <DatabaseIcon className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h1 className="text-3xl font-bold font-orbitron text-white mb-4">DB GajiKPPN Monitor</h1>
                    <p className="text-slate-400 mb-8 text-lg">
                        Connect to a database to start monitoring performance metrics, slow queries, and engine status in real-time.
                    </p>
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] flex items-center gap-2 mx-auto"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Connection
                    </button>
                </div>
            </div>
        )}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        activeConnectionId={null} // Always null for new connection
        onSelectConnection={handleSelectConnection}
        setConnectionStatus={() => {}} // Handled in App
        setConnectionError={() => {}} // Handled in App
        sessionId="" // Not used in this context anymore
      />
    </div>
  );
};

export default App;
