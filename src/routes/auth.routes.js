// Auth Routes
import { Router } from "express";
import { 
    getLoginPage, 
    getRegisterPage, 
    login, 
    register, 
    logout 
} from "../controllers/auth.controller.js";

const router = Router();

router.get("/login", getLoginPage);
router.post("/login", login);
router.get("/register", getRegisterPage);
router.post("/register", register);
router.get("/logout", logout);

export { router };