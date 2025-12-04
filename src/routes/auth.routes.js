// Authentication Routes
import { Router } from "express";
import {
    getLoginPage,
    getRegisterPage,
    login,
    register,
    logout,
    logoutAll,
    getProfile,
    updateProfile,
    changePassword,
    apiLogin,
    apiRegister
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const router = Router();

// Page routes
router.get("/login", getLoginPage);
router.get("/register", getRegisterPage);
router.get("/registro", getRegisterPage); // Spanish alias

// Auth actions
router.post("/login", login);
router.post("/register", register);
router.get("/logout", logout);
router.get("/logout-all", authenticate, logoutAll);

// Profile routes (protected)
router.get("/profile", authenticate, getProfile);
router.post("/profile", authenticate, updateProfile);
router.post("/change-password", authenticate, changePassword);

// API routes
router.post("/api/login", apiLogin);
router.post("/api/register", apiRegister);

export default router;