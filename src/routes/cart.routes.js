// Cart Routes
import { Router } from "express";
import { 
    getCart, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    getCheckout 
} from "../controllers/cart.controller.js";

const router = Router();

router.get("/", getCart);
router.post("/add", addToCart);
router.post("/update", updateCartItem);
router.post("/remove", removeFromCart);
router.post("/clear", clearCart);
router.get("/checkout", getCheckout);

export { router };