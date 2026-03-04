
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import InnoDBStatusPage from './components/InnoDBStatusPage';
import { ViewMode, DbConnection } from './types';
import { connectToDatabase } from './services/apiService';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionError, setConnectionError] = useState('');
  const [databaseName, setDatabaseName] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  
  // Generate a unique session ID for this tab/window
  const [sessionId] = useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  });

  const handleSelectConnection = async (conn: DbConnection) => {
    setConnectionStatus('connecting');
    setActiveConnectionId(conn.id);
    setIsSettingsOpen(false); // Close modal on select
    
    try {
      await connectToDatabase({
        host: conn.host,
        port: conn.port,
        user: conn.user,
        password: conn.password,
        database: conn.database
      }, sessionId);
      setConnectionStatus('connected');
      setDatabaseName(conn.database);
    } catch (err: any) {
      setConnectionError(err.message || 'Failed to reconnect');
      setConnectionStatus('error');
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJub25lIiBzdHJva2U9InJnYigxNSwyMyw0MiwwLjA1KSI+PGVmLWdyaWQtcGF0dGVybiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHg9IjAiIHk9IjAiPjxwYXRoIGQ9Ik0gMzIgMCAwIDAgMCAzMiIgLz48L2VmLWdyaWQtcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2VmLWdyaWQtcGF0dGVybikiLz48L3N2Zz4=')]"></div>
      <main className="relative container mx-auto p-4 sm:p-6 lg:p-8">
        <Header 
          onSettingsClick={() => setIsSettingsOpen(true)} 
          connectionStatus={connectionStatus}
          databaseName={databaseName}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        
        {viewMode === 'dashboard' ? (
          <Dashboard 
            connectionStatus={connectionStatus} 
            connectionError={connectionError}
            onConnectClick={() => setIsSettingsOpen(true)}
            setDatabaseName={setDatabaseName}
            sessionId={sessionId}
          />
        ) : (
          <InnoDBStatusPage 
            connectionStatus={connectionStatus}
            onConnectClick={() => setIsSettingsOpen(true)}
            sessionId={sessionId}
          />
        )}
      </main>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        activeConnectionId={activeConnectionId}
        onSelectConnection={handleSelectConnection}
        setConnectionStatus={setConnectionStatus}
        setConnectionError={setConnectionError}
        sessionId={sessionId}
      />
    </div>
  );
};

export default App;
