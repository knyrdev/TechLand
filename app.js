// TechLand Application Entry Point
import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import engine from "ejs-mate";
import { PORT, SESSION_SECRET, appConfig } from "./config.js";
import { testConnection } from "./src/database/index.js";
import { optionalAuth, userToLocals, loadUserData } from "./src/middleware/auth.middleware.js";

// Import routes
import routes from "./src/routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy (for getting real IP behind reverse proxy)
app.set("trust proxy", 1);

// CORS Configuration
app.use(cors({
    origin: appConfig.isProduction ? "https://techland.com" : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Session configuration (fallback for views)
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: appConfig.isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// View engine setup
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Optional authentication for all routes (populates req.user if token exists)
app.use(optionalAuth);
app.use(loadUserData);

// Global variables for views
app.use((req, res, next) => {
    // User data for views
    res.locals.user = req.userData || req.user || req.session?.user || null;
    res.locals.isAuthenticated = !!(req.user || req.session?.user);
    res.locals.isAdmin = req.user?.role === "admin";
    
    // Cart from session (will be replaced with DB cart later)
    res.locals.cart = req.session?.cart || [];
    res.locals.cartCount = res.locals.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // App info
    res.locals.appName = appConfig.name;
    res.locals.currentYear = new Date().getFullYear();
    res.locals.currentPath = req.path;
    
    next();
});

// Health check endpoint (for Docker)
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use("/", routes);

// 404 handler
app.use((req, res) => {
    res.status(404).render("errors/404", { 
        title: "Página no encontrada - TechLand" 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.stack);
    
    if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.status(500).json({ 
            error: appConfig.isDevelopment ? err.message : "Internal server error"
        });
    }
    
    res.status(500).render("errors/500", { 
        title: "Error del servidor - TechLand",
        error: appConfig.isDevelopment ? err : null
    });
});

// Graceful shutdown handling
const gracefulShutdown = async () => {
    console.log("\n⏹️ Shutting down gracefully...");
    
    // Close database pool
    const { closePool } = await import("./src/database/index.js");
    await closePool();
    
    process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
const startServer = async () => {
    try {
        // Test database connection
        console.log("🔄 Testing database connection...");
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.warn("⚠️ Database not connected. Running in limited mode.");
        }
        
        // Start listening
        app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 TechLand Server Started                             ║
║                                                          ║
║   🌐 URL: http://localhost:${PORT}                         ║
║   📦 Environment: ${appConfig.isProduction ? "Production" : "Development"}                       ║
║   💾 Database: ${dbConnected ? "Connected" : "Not Connected"}                        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();