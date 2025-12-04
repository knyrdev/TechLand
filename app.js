import express from "express";
import cors from "cors";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import engine from "ejs-mate";
import { PORT, SESSION_SECRET } from "./config.js";

// Import routes
import routes from "./src/routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// View engine setup
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Global variables for views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.cart = req.session.cart || [];
    next();
});

// Routes
app.use("/", routes);

// 404 handler
app.use((req, res) => {
    res.status(404).render("errors/404", { title: "Page Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("errors/500", { title: "Server Error" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});