// Authentication Middleware for TechLand
import { verifyAccessToken, refreshTokens, decodeToken } from "../utils/jwt.js";
import { query } from "../database/index.js";

// Extract token from request
const extractToken = (req) => {
    // Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }
    
    // Check cookies
    if (req.cookies && req.cookies.accessToken) {
        return req.cookies.accessToken;
    }
    
    return null;
};

// Authentication middleware (required)
export const authenticate = async (req, res, next) => {
    try {
        const token = extractToken(req);
        
        if (!token) {
            // For API requests
            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(401).json({ 
                    error: "Authentication required",
                    code: "NO_TOKEN"
                });
            }
            // For web requests, redirect to login
            return res.redirect("/auth/login?redirect=" + encodeURIComponent(req.originalUrl));
        }
        
        const decoded = verifyAccessToken(token);
        
        if (!decoded) {
            // Try to refresh token
            const refreshToken = req.cookies?.refreshToken;
            
            if (refreshToken) {
                const newTokens = await refreshTokens(refreshToken, req);
                
                if (newTokens) {
                    // Set new tokens in cookies
                    res.cookie("accessToken", newTokens.accessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        maxAge: 15 * 60 * 1000 // 15 minutes
                    });
                    res.cookie("refreshToken", newTokens.refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                    });
                    
                    // Verify new token
                    const newDecoded = verifyAccessToken(newTokens.accessToken);
                    req.user = newDecoded;
                    return next();
                }
            }
            
            // Token invalid and cannot refresh
            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(401).json({ 
                    error: "Token expired or invalid",
                    code: "INVALID_TOKEN"
                });
            }
            return res.redirect("/auth/login?redirect=" + encodeURIComponent(req.originalUrl));
        }
        
        // Token valid, attach user to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        
        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.status(500).json({ error: "Authentication error" });
        }
        return res.redirect("/auth/login");
    }
};

// Optional authentication (doesn't block if no token)
export const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);
        
        if (token) {
            const decoded = verifyAccessToken(token);
            if (decoded) {
                req.user = decoded;
            }
        }
        
        next();
    } catch (error) {
        // Continue without user
        next();
    }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(401).json({ error: "Authentication required" });
            }
            return res.redirect("/auth/login");
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(403).json({ 
                    error: "You do not have permission to access this resource",
                    code: "FORBIDDEN"
                });
            }
            return res.status(403).render("errors/403", { 
                title: "Access Denied",
                message: "You do not have permission to access this resource"
            });
        }
        
        next();
    };
};

// Admin only middleware
export const adminOnly = authorize("admin");

// Technician or admin middleware
export const technicianOnly = authorize("admin", "tecnico");

// Get current user data from database
export const loadUserData = async (req, res, next) => {
    if (req.user && req.user.userId) {
        try {
            const result = await query(
                `SELECT u.*, r.nombre_rol 
                 FROM Usuarios u 
                 JOIN Roles r ON u.id_rol = r.id_rol 
                 WHERE u.id_usuario = $1 AND u.activo = true`,
                [req.user.userId]
            );
            
            if (result.rows[0]) {
                req.userData = {
                    ...result.rows[0],
                    password_hash: undefined // Remove sensitive data
                };
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    }
    next();
};

// Middleware to pass user data to views
export const userToLocals = (req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.userData = req.userData || null;
    res.locals.isAuthenticated = !!req.user;
    res.locals.isAdmin = req.user?.role === "admin";
    res.locals.isTechnician = req.user?.role === "tecnico" || req.user?.role === "admin";
    next();
};

export default {
    authenticate,
    optionalAuth,
    authorize,
    adminOnly,
    technicianOnly,
    loadUserData,
    userToLocals
};