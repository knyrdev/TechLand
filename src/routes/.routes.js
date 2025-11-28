// Home Routes
import { Router } from "express";
import { getHomePage, getAboutPage, getContactPage } from "../controllers/home.controller.js";

const router = Router();

router.get("/", getHomePage);
router.get("/about", getAboutPage);
router.get("/contact", getContactPage);

export { router };