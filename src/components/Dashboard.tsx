
import React, { useState, useEffect, useCallback } from 'react';
import { MySQLMetrics, TimeSeriesDataPoint } from '../types';
import MetricCard from './MetricCard';
import ChartCard from './ChartCard';
import LogListCard from './LogListCard';
import { ClockIcon, ZapIcon, AlertTriangleIcon, UsersIcon, CpuIcon, MemoryStickIcon, SyncIcon, GitBranchIcon, DatabaseIcon } from './icons';
import { ConnectionStatus } from '../App';
import { fetchMetrics } from '../services/apiService';

const initialState: MySQLMetrics = {
    uptime: 0,
    queriesPerSecond: 0,
    slowQueries: 0,
    activeConnections: 0,
    maxConnections: 0,
    threadsConnected: 0,
    cpuUtilization: 0,
    memoryUsage: 0,
    bufferPoolUsage: 0,
    replicationLag: 0,
    topSlowQueries: [],
    databaseName: ''
};

interface DashboardProps {
    connectionStatus: ConnectionStatus;
    connectionError: string;
    onConnectClick: () => void;
    setDatabaseName: (name: string) => void;
    sessionId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ connectionStatus, connectionError, onConnectClick, setDatabaseName, sessionId }) => {
    const [metrics, setMetrics] = useState<MySQLMetrics>(initialState);
    const [history, setHistory] = useState<TimeSeriesDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDataAndAnalysis = useCallback(async () => {
        if (connectionStatus !== 'connected') return;

        try {
            setError(null);
            const newMetrics = await fetchMetrics(sessionId);
            setMetrics(newMetrics);
            setDatabaseName(newMetrics.databaseName);

            setHistory(prevHistory => {
                const now = new Date();
                const newPoint: TimeSeriesDataPoint = {
                    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    qps: newMetrics.queriesPerSecond,
                    cpu: newMetrics.cpuUtilization,
                };
                return [...prevHistory.slice(-29), newPoint];
            });
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data from server. Please check your connection and try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [connectionStatus, setDatabaseName, sessionId]);
    
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let isMounted = true;

        const poll = async () => {
            if (connectionStatus === 'connected') {
                await fetchDataAndAnalysis();
                if (isMounted) {
                    timeoutId = setTimeout(poll, 15000); // Wait 15s AFTER previous request completes
                }
            }
        };

        if (connectionStatus === 'connected') {
            setIsLoading(true);
            poll();
        } else {
             setIsLoading(false);
             setMetrics(initialState);
             setHistory([]);
             setDatabaseName('');
        }

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [connectionStatus, fetchDataAndAnalysis, setDatabaseName]);


    if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                 <div className="bg-slate-900/50 border border-slate-700 p-8 rounded-lg">
                    <DatabaseIcon className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-300 mb-2">Not Connected</h2>
                    <p className="text-slate-400 mb-6">
                        {connectionStatus === 'error' 
                            ? `Connection failed: ${connectionError}`
                            : 'Please configure your database connection to begin monitoring.'
                        }
                    </p>
                    <button 
                        onClick={onConnectClick}
                        className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors shadow-[0_0_10px_rgba(56,189,248,0.4)]"
                    >
                        Connect to Database
                    </button>
                </div>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                 <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
                 <p className="mt-4 text-lg text-cyan-300 font-orbitron">Fetching Live Metrics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-center">
                 <div className="bg-red-900/50 border border-red-500 p-8 rounded-lg">
                    <AlertTriangleIcon className="w-12 h-12 mx-auto text-red-400 mb-4" />
                    <h2 className="text-2xl font-bold text-red-300 mb-2">Data Fetch Error</h2>
                    <p className="text-red-200">{error}</p>
                </div>
            </div>
        );
    }
    
    const formatUptime = (seconds: number) => {
        if (seconds <= 0) return '0m';
        const d = Math.floor(seconds / (3600*24));
        const h = Math.floor(seconds % (3600*24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        return `${d > 0 ? `${d}d ` : ''}${h > 0 ? `${h}h ` : ''}${m}m`;
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <MetricCard icon={<ClockIcon />} title="Uptime" value={formatUptime(metrics.uptime)} />
                 <MetricCard icon={<ZapIcon />} title="Queries/Sec" value={metrics.queriesPerSecond.toLocaleString()} />
                 <MetricCard icon={<AlertTriangleIcon />} title="Slow Queries" value={metrics.slowQueries.toLocaleString()} />
                 <MetricCard icon={<UsersIcon />} title="Connections" value={`${metrics.activeConnections} / ${metrics.maxConnections}`} />
                 <MetricCard icon={<CpuIcon />} title="CPU Usage" value={`${metrics.cpuUtilization.toFixed(1)}%`} tooltip="Simulated Value" />
                 <MetricCard icon={<MemoryStickIcon />} title="Memory Usage" value={`${metrics.memoryUsage.toFixed(1)}%`} tooltip="Simulated Value" />
                 <MetricCard icon={<SyncIcon />} title="Replication Lag" value={`${metrics.replicationLag.toFixed(1)}s`} />
                 <MetricCard icon={<GitBranchIcon />} title="Threads" value={metrics.threadsConnected.toLocaleString()} />
            </div>

            <div className="flex flex-col gap-6">
                <div className="w-full">
                     <ChartCard data={history} />
                </div>
                <div className="w-full">
                     <LogListCard slowQueries={metrics.topSlowQueries} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
