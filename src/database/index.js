// Database Connection Module
import pg from "pg";
import { dbConfig, appConfig } from "../../config.js";

const { Pool } = pg;

// Create connection pool
const pool = new Pool(dbConfig);

// Connection event handlers
pool.on("connect", () => {
    if (appConfig.isDevelopment) {
        console.log("✅ Database connected successfully");
    }
});

pool.on("error", (err) => {
    console.error("❌ Unexpected database error:", err);
    process.exit(-1);
});

// Query helper function
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (appConfig.isDevelopment) {
            console.log("📊 Query executed:", { text: text.substring(0, 50), duration: `${duration}ms`, rows: result.rowCount });
        }
        
        return result;
    } catch (error) {
        console.error("❌ Database query error:", error.message);
        throw error;
    }
};

// Get a client from the pool (for transactions)
export const getClient = async () => {
    const client = await pool.connect();
    const originalQuery = client.query.bind(client);
    const originalRelease = client.release.bind(client);
    
    // Track query timeout
    let lastQuery = null;
    const timeout = setTimeout(() => {
        console.error("⚠️ Client has been checked out for more than 5 seconds!");
        console.error(`Last query: ${lastQuery}`);
    }, 5000);
    
    // Override query to track last query
    client.query = (...args) => {
        lastQuery = args[0];
        return originalQuery(...args);
    };
    
    // Override release to clear timeout
    client.release = () => {
        clearTimeout(timeout);
        client.query = originalQuery;
        client.release = originalRelease;
        return originalRelease();
    };
    
    return client;
};

// Transaction helper
export const transaction = async (callback) => {
    const client = await getClient();
    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// Test database connection
export const testConnection = async () => {
    try {
        const result = await query("SELECT NOW() as current_time");
        console.log("🔗 Database connection test successful:", result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error("❌ Database connection test failed:", error.message);
        return false;
    }
};

// Close pool (for graceful shutdown)
export const closePool = async () => {
    await pool.end();
    console.log("🔌 Database pool closed");
};

export default {
    query,
    getClient,
    transaction,
    testConnection,
    closePool,
    pool
};