// Main Routes - TechLand
import { Router } from "express";
import { getHomePage, getAboutPage, getContactPage, submitContact } from "../controllers/home.controller.js";

const router = Router();

// Home page
router.get("/", getHomePage);

// Static pages
router.get("/nosotros", getAboutPage);
router.get("/about", getAboutPage);
router.get("/contacto", getContactPage);
router.get("/contact", getContactPage);
router.post("/contacto", submitContact);

// Import and use other routes
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import serviceRoutes from "./service.routes.js";
import courseRoutes from "./course.routes.js";
import cartRoutes from "./cart.routes.js";
import profileRoutes from "./profile.routes.js";

router.use("/auth", authRoutes);
router.use("/productos", productRoutes);
router.use("/products", productRoutes); // English alias
router.use("/servicios", serviceRoutes);
router.use("/services", serviceRoutes); // English alias
router.use("/cursos", courseRoutes);
router.use("/courses", courseRoutes); // English alias
router.use("/cart", cartRoutes);
router.use("/carrito", cartRoutes); // Spanish alias
router.use("/perfil", profileRoutes);
router.use("/profile", profileRoutes); // English alias

export default router;