// Service Routes (Repair Services)
import { Router } from "express";
import {
    getAllServices,
    getServiceBySlug,
    getBookingForm,
    createBooking,
    getAppointment,
    getUserAppointments,
    cancelAppointment,
    apiGetServices
} from "../controllers/service.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const router = Router();

// Page routes
router.get("/", getAllServices);
router.get("/mis-citas", authenticate, getUserAppointments);
router.get("/cita/:numero", authenticate, getAppointment);
router.get("/:slug", getServiceBySlug);
router.get("/:slug/agendar", getBookingForm);

// Actions (protected)
router.post("/:slug/agendar", authenticate, createBooking);
router.post("/cita/:numero/cancelar", authenticate, cancelAppointment);

// API routes
router.get("/api/list", apiGetServices);

export default router;