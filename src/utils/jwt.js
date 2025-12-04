// JWT Utilities for TechLand
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { jwtConfig } from "../../config.js";
import { query } from "../database/index.js";

// Generate Access Token
export const generateAccessToken = (user) => {
    const payload = {
        userId: user.id_usuario,
        email: user.email,
        role: user.nombre_rol || "cliente",
        jti: uuidv4() // Unique token ID for revocation
    };
    
    return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.accessTokenExpiry,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
    });
};

// Generate Refresh Token
export const generateRefreshToken = () => {
    return uuidv4() + "-" + uuidv4();
};

// Verify Access Token
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, jwtConfig.secret, {
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
    } catch (error) {
        return null;
    }
};

// Decode Token (without verification)
export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

// Store Refresh Token in Database
export const storeRefreshToken = async (userId, refreshToken, req) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7 days
    
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.connection?.remoteAddress || "Unknown";
    const device = parseDevice(userAgent);
    
    await query(
        `INSERT INTO Sesiones (id_usuario, refresh_token, fecha_expiracion, direccion_ip, user_agent, dispositivo)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, refreshToken, expirationDate, ipAddress, userAgent, device]
    );
};

// Validate Refresh Token
export const validateRefreshToken = async (refreshToken) => {
    const result = await query(
        `SELECT s.*, u.email, u.nombre, r.nombre_rol
         FROM Sesiones s
         JOIN Usuarios u ON s.id_usuario = u.id_usuario
         JOIN Roles r ON u.id_rol = r.id_rol
         WHERE s.refresh_token = $1 
         AND s.activo = true 
         AND s.fecha_expiracion > NOW()`,
        [refreshToken]
    );
    
    return result.rows[0] || null;
};

// Revoke Refresh Token
export const revokeRefreshToken = async (refreshToken) => {
    await query(
        `UPDATE Sesiones SET activo = false WHERE refresh_token = $1`,
        [refreshToken]
    );
};

// Revoke All User Sessions
export const revokeAllUserSessions = async (userId) => {
    await query(
        `UPDATE Sesiones SET activo = false WHERE id_usuario = $1`,
        [userId]
    );
};

// Clean Expired Sessions (can be run periodically)
export const cleanExpiredSessions = async () => {
    const result = await query(
        `DELETE FROM Sesiones WHERE fecha_expiracion < NOW() OR activo = false`
    );
    return result.rowCount;
};

// Parse device from user agent
const parseDevice = (userAgent) => {
    if (/mobile/i.test(userAgent)) return "Mobile";
    if (/tablet/i.test(userAgent)) return "Tablet";
    if (/windows/i.test(userAgent)) return "Windows PC";
    if (/macintosh/i.test(userAgent)) return "Mac";
    if (/linux/i.test(userAgent)) return "Linux";
    return "Unknown";
};

// Generate both tokens
export const generateTokens = async (user, req) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    
    await storeRefreshToken(user.id_usuario, refreshToken, req);
    
    return { accessToken, refreshToken };
};

// Refresh tokens using refresh token
export const refreshTokens = async (oldRefreshToken, req) => {
    const session = await validateRefreshToken(oldRefreshToken);
    
    if (!session) {
        return null;
    }
    
    // Revoke old refresh token
    await revokeRefreshToken(oldRefreshToken);
    
    // Generate new tokens
    const user = {
        id_usuario: session.id_usuario,
        email: session.email,
        nombre: session.nombre,
        nombre_rol: session.nombre_rol
    };
    
    return generateTokens(user, req);
};

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    decodeToken,
    storeRefreshToken,
    validateRefreshToken,
    revokeRefreshToken,
    revokeAllUserSessions,
    cleanExpiredSessions,
    generateTokens,
    refreshTokens
};