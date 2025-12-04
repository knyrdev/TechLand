// Cart Routes
import { Router } from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCheckout,
    processCheckout,
    getCheckoutSuccess
} from "../controllers/cart.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const router = Router();

// Cart pages
router.get("/", getCart);
router.get("/checkout", getCheckout);
router.get("/success", getCheckoutSuccess);

// Cart actions
router.post("/add", addToCart);
router.post("/update", updateCartItem);
router.post("/remove", removeFromCart);
router.post("/clear", clearCart);

// Checkout (protected)
router.post("/checkout", authenticate, processCheckout);

export default router;