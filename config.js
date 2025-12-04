// TechLand Configuration
import "dotenv/config";

// Application Configuration
export const {
    NODE_ENV = "development",
    PORT = 3000,
    
    // Database Configuration
    DB_HOST = "localhost",
    DB_PORT = 5432,
    DB_USER = "techland",
    DB_PASSWORD = "techland_secret_2024",
    DB_NAME = "techland_db",
    
    // JWT Configuration
    JWT_SECRET = "techland-jwt-super-secret-key-change-in-production",
    JWT_EXPIRES_IN = "15m",
    JWT_REFRESH_EXPIRES_IN = "7d",
    
    // Session Configuration
    SESSION_SECRET = "techland-session-secret-key"
} = process.env;

// Database connection string
export const DATABASE_URL = process.env.DATABASE_URL || 
    `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Database pool configuration
export const dbConfig = {
    host: DB_HOST,
    port: parseInt(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// JWT Configuration object
export const jwtConfig = {
    secret: JWT_SECRET,
    accessTokenExpiry: JWT_EXPIRES_IN,
    refreshTokenExpiry: JWT_REFRESH_EXPIRES_IN,
    issuer: "techland",
    audience: "techland-users"
};

// App configuration
export const appConfig = {
    name: "TechLand",
    description: "Dispositivos digitales, reparaciones y cursos",
    isProduction: NODE_ENV === "production",
    isDevelopment: NODE_ENV === "development"
};