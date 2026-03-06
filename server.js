
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Disable caching for all API routes
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Store pools and database names per session
const dbPools = new Map();
const dbNames = new Map();

// Endpoint to test and set database connection
app.post('/api/connect', async (req, res) => {
    const { host, port, user, password, database } = req.body;
    // Support both header and query param for session ID
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;

    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required.' });
    }

    if (!database) {
        return res.status(400).json({ message: 'Database name is required.' });
    }

    try {
        // Close existing pool for this session if it exists
        if (dbPools.has(sessionId)) {
            await dbPools.get(sessionId).end();
        }

        const pool = mysql.createPool({
            host,
            port,
            user,
            password,
            database,
            connectionLimit: 20, // Increased from 10
            enableKeepAlive: true,
            waitForConnections: true,
            queueLimit: 0,
            connectTimeout: 10000,
            maxAllowedPacket: 268435456, // 256MB to handle extremely large status outputs
        });

        // Test connection
        const [rows] = await pool.query("SELECT 1");

        dbPools.set(sessionId, pool);
        dbNames.set(sessionId, database);
        
        res.status(200).json({ message: 'Connection successful' });
    } catch (error) {
        dbPools.delete(sessionId);
        dbNames.delete(sessionId);
        console.error('Database connection failed:', error);
        res.status(500).json({ message: 'Database connection failed', error: error.message });
    }
});

// Endpoint to fetch metrics
app.get('/api/metrics', async (req, res) => {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    const dbPool = dbPools.get(sessionId);
    const currentDbName = dbNames.get(sessionId);

    if (!dbPool) {
        return res.status(400).json({ message: 'Database not connected' });
    }

    try {
        const [globalStatus] = await dbPool.query("SHOW GLOBAL STATUS;");
        const [variables] = await dbPool.query("SHOW VARIABLES;");
        
        // Fetch Top 15 Slow Queries (Time > 1s)
        const [processList] = await dbPool.query("SELECT * FROM information_schema.PROCESSLIST WHERE command != 'Sleep' AND time > 1 ORDER BY time DESC LIMIT 15;");
        
        const statusMap = new Map(globalStatus.map(row => [row.Variable_name, row.Value]));
        const varMap = new Map(variables.map(row => [row.Variable_name, row.Value]));

        // Replication Lag
        let replicationLag = 0;
        try {
            const [slaveStatus] = await dbPool.query("SHOW SLAVE STATUS;");
            if (slaveStatus.length > 0 && slaveStatus[0].Seconds_Behind_Master) {
                replicationLag = slaveStatus[0].Seconds_Behind_Master;
            }
        } catch (e) {
            // Not a replica or error, lag is 0
        }

        const totalPages = parseFloat(statusMap.get('Innodb_buffer_pool_pages_total')) || 0;
        const freePages = parseFloat(statusMap.get('Innodb_buffer_pool_pages_free')) || 0;
        const bufferPoolUsage = totalPages > 0 ? ((totalPages - freePages) / totalPages) * 100 : 0;
        
        const uptime = parseInt(statusMap.get('Uptime'), 10);
        const totalQueries = parseInt(statusMap.get('Queries'), 10);

        const metrics = {
            uptime,
            queriesPerSecond: uptime > 0 ? Math.round(totalQueries / uptime) : 0,
            slowQueries: parseInt(statusMap.get('Slow_queries'), 10),
            activeConnections: parseInt(statusMap.get('Threads_connected'), 10),
            maxConnections: parseInt(varMap.get('max_connections'), 10),
            threadsConnected: parseInt(statusMap.get('Threads_connected'), 10),
            cpuUtilization: 15 + Math.random() * 50, // Simulated
            memoryUsage: 25 + Math.random() * 40, // Simulated
            bufferPoolUsage: parseFloat(bufferPoolUsage.toFixed(1)),
            replicationLag: replicationLag,
            topSlowQueries: processList.map(p => ({
                id: p.ID,
                time: p.TIME,
                query: p.INFO || 'N/A',
                user: p.USER,
                host: p.HOST
            })),
            databaseName: currentDbName,
        };
        
        res.json(metrics);

    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ message: 'Error fetching metrics', error: error.message });
    }
});

// Endpoint to fetch InnoDB engine status
app.get('/api/innodb-status', async (req, res) => {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    const dbPool = dbPools.get(sessionId);

    if (!dbPool) {
        return res.status(400).json({ message: 'Database not connected' });
    }

    try {
        const [rows] = await dbPool.query("SHOW ENGINE INNODB STATUS;");

        if (rows && rows.length > 0) {
            // MySQL returns a row with Type, Name, and Status columns
            // Column names can vary in case depending on server configuration
            const status = rows[0].Status || rows[0].status;
            if (status) {
                res.json({ status });
            } else {
                res.status(404).json({ message: 'InnoDB status column not found in result' });
            }
        } else {
            res.status(404).json({ message: 'No InnoDB status found' });
        }
    } catch (error) {
        console.error('Error fetching InnoDB status:', error);
        
        if (error.code === 'ER_SPECIFIC_ACCESS_DENIED_ERROR' || error.errno === 1227) {
            return res.status(403).json({ 
                message: 'Access Denied', 
                error: 'The database user lacks the PROCESS privilege required to view InnoDB status. Please grant the PROCESS privilege to this user.' 
            });
        }

        res.status(500).json({ 
            message: 'Error fetching InnoDB status', 
            error: error.message || String(error) || 'Unknown error'
        });
    }
});

// Explicitly bind to 0.0.0.0 to allow network access
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
    console.log("Ensure you have a .env file with your API_KEY.");
});
