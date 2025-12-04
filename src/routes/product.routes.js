// Product Routes
import { Router } from "express";
import {
    getAllProducts,
    getProductById,
    apiGetProducts,
    apiGetProduct
} from "../controllers/product.controller.js";

export const router = Router();

// Page routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// API routes
router.get("/api/list", apiGetProducts);
router.get("/api/:id", apiGetProduct);

export default router;