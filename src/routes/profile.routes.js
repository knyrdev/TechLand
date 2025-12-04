// Profile Routes
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import * as profileController from "../controllers/profile.controller.js";

const router = Router();

// All profile routes require authentication
router.use(authenticate);

// Profile pages
router.get("/", profileController.getProfile);
router.post("/actualizar", profileController.updateProfile);
router.post("/direccion", profileController.updateAddress);
router.post("/cambiar-password", profileController.changePassword);

// User history pages
router.get("/pedidos", profileController.getOrders);
router.get("/pedidos/:id", profileController.getOrderDetail);
router.get("/cursos", profileController.getCourses);
router.get("/servicios", profileController.getServices);

// API endpoints
router.get("/api/data", profileController.apiGetProfile);
router.put("/api/update", profileController.apiUpdateProfile);

export default router;