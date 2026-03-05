
export type ViewMode = 'dashboard' | 'innodb';

export type ThemeColor = 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose';

export interface DbConnection {
  id: string;
  nickname: string;
  host: string;
  port: string;
  user: string;
  password?: string;
  database: string;
}

export interface Session {
  id: string;
  connection: DbConnection;
  status: 'connected' | 'connecting' | 'error' | 'disconnected';
  error?: string;
  color: ThemeColor;
  viewMode: ViewMode;
}

export interface SlowQuery {
  id: number;
  time: number;
  query: string;
  user: string;
  host: string;
}

export interface MySQLMetrics {
  uptime: number;
  queriesPerSecond: number;
  slowQueries: number;
  activeConnections: number;
  maxConnections: number;
  threadsConnected: number;
  cpuUtilization: number;
  memoryUsage: number;
  bufferPoolUsage: number;
  replicationLag: number;
  topSlowQueries: SlowQuery[];
  databaseName: string;
}

export interface TimeSeriesDataPoint {
  time: string;
  qps: number;
  cpu: number;
}

export interface InnoDBStatusSection {
  title: string;
  content: string;
}
