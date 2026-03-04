
export type ViewMode = 'dashboard' | 'innodb';

export interface DbConnection {
  id: string;
  nickname: string;
  host: string;
  port: string;
  user: string;
  password?: string;
  database: string;
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
