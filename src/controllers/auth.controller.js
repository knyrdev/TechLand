// Authentication Controller with JWT
import bcrypt from "bcryptjs";
import { query } from "../database/index.js";
import { generateTokens, revokeRefreshToken, revokeAllUserSessions } from "../utils/jwt.js";

// Cookie options
const accessTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000 // 15 minutes
};

const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Render login page
export const getLoginPage = (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }
    
    const redirect = req.query.redirect || "/";
    
    res.render("pages/auth/login", {
        title: "Iniciar Sesión - TechLand",
        error: null,
        redirect
    });
};

// Render register page
export const getRegisterPage = (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }
    
    res.render("pages/auth/register", {
        title: "Crear Cuenta - TechLand",
        error: null
    });
};

// Login handler
export const login = async (req, res) => {
    try {
        const { email, password, remember } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.render("pages/auth/login", {
                title: "Iniciar Sesión - TechLand",
                error: "Email y contraseña son requeridos",
                redirect: req.body.redirect || "/"
            });
        }
        
        // Find user with role
        const result = await query(
            `SELECT u.*, r.nombre_rol 
             FROM Usuarios u 
             JOIN Roles r ON u.id_rol = r.id_rol 
             WHERE u.email = $1 AND u.activo = true`,
            [email.toLowerCase().trim()]
        );
        
        const user = result.rows[0];
        
        if (!user) {
            return res.render("pages/auth/login", {
                title: "Iniciar Sesión - TechLand",
                error: "Email o contraseña incorrectos",
                redirect: req.body.redirect || "/"
            });
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.render("pages/auth/login", {
                title: "Iniciar Sesión - TechLand",
                error: "Email o contraseña incorrectos",
                redirect: req.body.redirect || "/"
            });
        }
        
        // Generate JWT tokens
        const { accessToken, refreshToken } = await generateTokens(user, req);
        
        // Set cookies
        res.cookie("accessToken", accessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", refreshToken, {
            ...refreshTokenCookieOptions,
            maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : refreshTokenCookieOptions.maxAge // 30 days if remember
        });
        
        // Update last login
        await query(
            `UPDATE Usuarios SET ultima_conexion = NOW() WHERE id_usuario = $1`,
            [user.id_usuario]
        );
        
        // Also set session for backward compatibility with views
        req.session.user = {
            id: user.id_usuario,
            name: user.nombre,
            email: user.email,
            role: user.nombre_rol
        };
        
        // Redirect
        const redirect = req.body.redirect || "/";
        res.redirect(redirect);
        
    } catch (error) {
        console.error("Login error:", error);
        res.render("pages/auth/login", {
            title: "Iniciar Sesión - TechLand",
            error: "Ocurrió un error durante el inicio de sesión",
            redirect: req.body.redirect || "/"
        });
    }
};

// Register handler
export const register = async (req, res) => {
    try {
        const { nombre, apellido, email, telefono, password, confirmPassword } = req.body;
        
        // Validate input
        if (!nombre || !email || !password || !confirmPassword) {
            return res.render("pages/auth/register", {
                title: "Crear Cuenta - TechLand",
                error: "Todos los campos obligatorios son requeridos"
            });
        }
        
        if (password.length < 8) {
            return res.render("pages/auth/register", {
                title: "Crear Cuenta - TechLand",
                error: "La contraseña debe tener al menos 8 caracteres"
            });
        }
        
        if (password !== confirmPassword) {
            return res.render("pages/auth/register", {
                title: "Crear Cuenta - TechLand",
                error: "Las contraseñas no coinciden"
            });
        }
        
        // Check if email exists
        const existingUser = await query(
            `SELECT id_usuario FROM Usuarios WHERE email = $1`,
            [email.toLowerCase().trim()]
        );
        
        if (existingUser.rows.length > 0) {
            return res.render("pages/auth/register", {
                title: "Crear Cuenta - TechLand",
                error: "Este email ya está registrado"
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create user (default role: cliente = 2)
        const result = await query(
            `INSERT INTO Usuarios (nombre, apellido, email, telefono, password_hash, id_rol)
             VALUES ($1, $2, $3, $4, $5, 2)
             RETURNING id_usuario, nombre, apellido, email`,
            [nombre.trim(), apellido?.trim() || null, email.toLowerCase().trim(), telefono?.trim() || null, hashedPassword]
        );
        
        const newUser = result.rows[0];
        newUser.nombre_rol = "cliente";
        
        // Generate JWT tokens
        const { accessToken, refreshToken } = await generateTokens(newUser, req);
        
        // Set cookies
        res.cookie("accessToken", accessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
        
        // Also set session for backward compatibility
        req.session.user = {
            id: newUser.id_usuario,
            name: newUser.nombre,
            email: newUser.email,
            role: "cliente"
        };
        
        res.redirect("/");
        
    } catch (error) {
        console.error("Registration error:", error);
        res.render("pages/auth/register", {
            title: "Crear Cuenta - TechLand",
            error: "Ocurrió un error durante el registro"
        });
    }
};

// Logout handler
export const logout = async (req, res) => {
    try {
        // Revoke refresh token
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await revokeRefreshToken(refreshToken);
        }
        
        // Clear cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        
        // Destroy session
        req.session?.destroy();
        
        res.redirect("/");
    } catch (error) {
        console.error("Logout error:", error);
        res.redirect("/");
    }
};

// Logout from all devices
export const logoutAll = async (req, res) => {
    try {
        if (req.user) {
            await revokeAllUserSessions(req.user.userId);
        }
        
        // Clear cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        
        // Destroy session
        req.session?.destroy();
        
        res.redirect("/auth/login");
    } catch (error) {
        console.error("Logout all error:", error);
        res.redirect("/");
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/auth/login");
        }
        
        const result = await query(
            `SELECT u.*, r.nombre_rol 
             FROM Usuarios u 
             JOIN Roles r ON u.id_rol = r.id_rol 
             WHERE u.id_usuario = $1`,
            [req.user.userId]
        );
        
        const user = result.rows[0];
        
        if (!user) {
            return res.redirect("/auth/login");
        }
        
        // Get user's orders count
        const ordersResult = await query(
            `SELECT COUNT(*) as total FROM Pedidos WHERE id_usuario = $1`,
            [req.user.userId]
        );
        
        // Get user's enrolled courses
        const coursesResult = await query(
            `SELECT COUNT(*) as total FROM Inscripciones WHERE id_usuario = $1`,
            [req.user.userId]
        );
        
        res.render("pages/auth/profile", {
            title: "Mi Perfil - TechLand",
            profile: {
                ...user,
                password_hash: undefined,
                ordersCount: parseInt(ordersResult.rows[0].total),
                coursesCount: parseInt(coursesResult.rows[0].total)
            }
        });
        
    } catch (error) {
        console.error("Profile error:", error);
        res.redirect("/");
    }
};

// Update profile
export const updateProfile = async (req, res) => {
    try {
        const { nombre, apellido, telefono, direccion } = req.body;
        
        await query(
            `UPDATE Usuarios 
             SET nombre = $1, apellido = $2, telefono = $3, direccion = $4
             WHERE id_usuario = $5`,
            [nombre, apellido || null, telefono || null, direccion || null, req.user.userId]
        );
        
        // Update session
        if (req.session?.user) {
            req.session.user.name = nombre;
        }
        
        res.redirect("/profile?success=true");
        
    } catch (error) {
        console.error("Update profile error:", error);
        res.redirect("/profile?error=true");
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        if (newPassword !== confirmPassword) {
            return res.redirect("/profile?error=passwords_mismatch");
        }
        
        if (newPassword.length < 8) {
            return res.redirect("/profile?error=password_short");
        }
        
        // Get current password
        const result = await query(
            `SELECT password_hash FROM Usuarios WHERE id_usuario = $1`,
            [req.user.userId]
        );
        
        const user = result.rows[0];
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        
        if (!isMatch) {
            return res.redirect("/profile?error=wrong_password");
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        // Update password
        await query(
            `UPDATE Usuarios SET password_hash = $1 WHERE id_usuario = $2`,
            [hashedPassword, req.user.userId]
        );
        
        // Revoke all sessions except current
        await revokeAllUserSessions(req.user.userId);
        
        // Generate new tokens
        const newTokens = await generateTokens({ id_usuario: req.user.userId, ...req.user }, req);
        
        res.cookie("accessToken", newTokens.accessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", newTokens.refreshToken, refreshTokenCookieOptions);
        
        res.redirect("/profile?success=password_changed");
        
    } catch (error) {
        console.error("Change password error:", error);
        res.redirect("/profile?error=true");
    }
};

// API: Login (returns JSON)
export const apiLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña son requeridos" });
        }
        
        const result = await query(
            `SELECT u.*, r.nombre_rol 
             FROM Usuarios u 
             JOIN Roles r ON u.id_rol = r.id_rol 
             WHERE u.email = $1 AND u.activo = true`,
            [email.toLowerCase().trim()]
        );
        
        const user = result.rows[0];
        
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }
        
        const { accessToken, refreshToken } = await generateTokens(user, req);
        
        res.cookie("accessToken", accessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
        
        res.json({
            success: true,
            user: {
                id: user.id_usuario,
                nombre: user.nombre,
                email: user.email,
                role: user.nombre_rol
            },
            accessToken
        });
        
    } catch (error) {
        console.error("API Login error:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// API: Register (returns JSON)
export const apiRegister = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
        }
        
        const existing = await query(`SELECT id_usuario FROM Usuarios WHERE email = $1`, [email.toLowerCase().trim()]);
        
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "Este email ya está registrado" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const result = await query(
            `INSERT INTO Usuarios (nombre, email, password_hash, id_rol) VALUES ($1, $2, $3, 2) RETURNING id_usuario, nombre, email`,
            [nombre.trim(), email.toLowerCase().trim(), hashedPassword]
        );
        
        const newUser = result.rows[0];
        newUser.nombre_rol = "cliente";
        
        const { accessToken, refreshToken } = await generateTokens(newUser, req);
        
        res.cookie("accessToken", accessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
        
        res.status(201).json({
            success: true,
            user: {
                id: newUser.id_usuario,
                nombre: newUser.nombre,
                email: newUser.email,
                role: "cliente"
            },
            accessToken
        });
        
    } catch (error) {
        console.error("API Register error:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
};