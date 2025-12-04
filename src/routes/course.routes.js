// Course Routes
import { Router } from "express";
import {
    getAllCourses,
    getCourseBySlug,
    enrollCourse,
    getUserCourses,
    watchLesson,
    apiGetCourses
} from "../controllers/course.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const router = Router();

// Page routes
router.get("/", getAllCourses);
router.get("/mis-cursos", authenticate, getUserCourses);
router.get("/:slug", getCourseBySlug);
router.get("/:slug/leccion/:lessonId", watchLesson);

// Actions (protected)
router.post("/:slug/inscribirse", authenticate, enrollCourse);

// API routes
router.get("/api/list", apiGetCourses);

export default router;