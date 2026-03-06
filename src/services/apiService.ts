
import { MySQLMetrics } from '../types';

// Use relative path to leverage Vite proxy in development and same-origin in production
const API_BASE_URL = '';

export const connectToDatabase = async (credentials: { host: string, port: string, user: string, password?: string, database: string }, sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/connect`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-session-id': sessionId
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to connect to the database');
    }
    return await response.json();
};


export const fetchMetrics = async (sessionId: string): Promise<MySQLMetrics> => {
    const response = await fetch(`${API_BASE_URL}/api/metrics?sessionId=${sessionId}`, {
        headers: {
            'x-session-id': sessionId
        }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch metrics');
    }
    return await response.json();
};

export const fetchInnoDBStatus = async (sessionId: string): Promise<{ status: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/innodb-status?sessionId=${sessionId}`, {
        headers: {
            'x-session-id': sessionId
        }
    });
    if (!response.ok) {
        const errorData = await response.json();
        const detail = errorData.error ? `: ${errorData.error}` : '';
        throw new Error(`${errorData.message || 'Failed to fetch InnoDB status'}${detail}`);
    }
    return await response.json();
};
