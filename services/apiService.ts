
import { MySQLMetrics } from '../types';

const API_BASE_URL = 'http://localhost:3001';

export const connectToDatabase = async (credentials: { host: string, port: string, user: string, password?: string, database: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to connect to the database');
    }
    return await response.json();
};


export const fetchMetrics = async (): Promise<MySQLMetrics> => {
    const response = await fetch(`${API_BASE_URL}/api/metrics`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch metrics');
    }
    return await response.json();
};

export const fetchInnoDBStatus = async (): Promise<{ status: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/innodb-status`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch InnoDB status');
    }
    return await response.json();
};
