// Course Controller for Phone Repair Courses
import { query } from "../database/index.js";

// Get all courses with filters
export const getAllCourses = async (req, res) => {
    try {
        const { nivel, search, sort } = req.query;
        
        let sql = `
            SELECT * FROM Cursos
            WHERE activo = true
        `;
        const params = [];
        let paramIndex = 1;
        
        // Filter by level
        if (nivel) {
            sql += ` AND nivel = $${paramIndex}`;
            params.push(nivel);
            paramIndex++;
        }
        
        // Search
        if (search) {
            sql += ` AND (titulo ILIKE $${paramIndex} OR descripcion ILIKE $${paramIndex} OR instructor ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        // Sort options
        switch (sort) {
            case "price-asc":
                sql += ` ORDER BY COALESCE(precio_oferta, precio) ASC`;
                break;
            case "price-desc":
                sql += ` ORDER BY COALESCE(precio_oferta, precio) DESC`;
                break;
            case "popular":
                sql += ` ORDER BY total_estudiantes DESC`;
                break;
            case "rating":
                sql += ` ORDER BY calificacion_promedio DESC`;
                break;
            case "newest":
                sql += ` ORDER BY created_at DESC`;
                break;
            default:
                sql += ` ORDER BY destacado DESC, total_estudiantes DESC`;
        }
        
        const result = await query(sql, params);
        
        // Get levels for filter
        const levelsResult = await query(
            `SELECT nivel FROM (
                SELECT DISTINCT nivel FROM Cursos WHERE activo = true
             ) sub
             ORDER BY
             CASE nivel
                WHEN 'principiante' THEN 1
                WHEN 'intermedio' THEN 2
                WHEN 'avanzado' THEN 3
             END`
        );
        
        res.render("pages/courses/index", {
            title: "Cursos de Reparación - TechLand",
            courses: result.rows,
            levels: levelsResult.rows.map(r => r.nivel),
            filters: {
                nivel: nivel || "",
                search: search || "",
                sort: sort || ""
            }
        });
        
    } catch (error) {
        console.error("Error getting courses:", error);
        res.render("pages/courses/index", {
            title: "Cursos de Reparación - TechLand",
            courses: [],
            levels: [],
            filters: {},
            error: "Error al cargar los cursos"
        });
    }
};

// Get single course by slug
export const getCourseBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Try by slug first, then by ID
        let result;
        if (isNaN(slug)) {
            result = await query(
                `SELECT * FROM Cursos WHERE slug = $1 AND activo = true`,
                [slug]
            );
        } else {
            result = await query(
                `SELECT * FROM Cursos WHERE id_curso = $1 AND activo = true`,
                [parseInt(slug)]
            );
        }
        
        const course = result.rows[0];
        
        if (!course) {
            return res.status(404).render("errors/404", {
                title: "Curso no encontrado - TechLand"
            });
        }
        
        // Get course lessons
        const lessonsResult = await query(
            `SELECT * FROM Lecciones 
             WHERE id_curso = $1 AND activo = true 
             ORDER BY orden ASC`,
            [course.id_curso]
        );
        
        // Get related courses
        const relatedResult = await query(
            `SELECT * FROM Cursos 
             WHERE activo = true AND id_curso != $1 AND nivel = $2
             ORDER BY RANDOM()
             LIMIT 3`,
            [course.id_curso, course.nivel]
        );
        
        // Get reviews
        const reviewsResult = await query(
            `SELECT r.*, u.nombre as usuario_nombre
             FROM Resenas r
             JOIN Usuarios u ON r.id_usuario = u.id_usuario
             WHERE r.tipo = 'curso' AND r.referencia_id = $1 AND r.aprobado = true
             ORDER BY r.created_at DESC
             LIMIT 10`,
            [course.id_curso]
        );
        
        // Check if user is enrolled
        let isEnrolled = false;
        let enrollment = null;
        
        if (req.user) {
            const enrollmentResult = await query(
                `SELECT * FROM Inscripciones 
                 WHERE id_usuario = $1 AND id_curso = $2`,
                [req.user.userId, course.id_curso]
            );
            
            if (enrollmentResult.rows.length > 0) {
                isEnrolled = true;
                enrollment = enrollmentResult.rows[0];
            }
        }
        
        res.render("pages/courses/detail", {
            title: `${course.titulo} - TechLand`,
            course: {
                ...course,
                lessons: lessonsResult.rows,
                reviews: reviewsResult.rows
            },
            relatedCourses: relatedResult.rows,
            isEnrolled,
            enrollment
        });
        
    } catch (error) {
        console.error("Error getting course:", error);
        res.status(500).render("errors/500", {
            title: "Error - TechLand"
        });
    }
};

// Enroll in course
export const enrollCourse = async (req, res) => {
    try {
        const { slug } = req.params;
        
        if (!req.user) {
            return res.redirect(`/auth/login?redirect=/cursos/${slug}`);
        }
        
        // Get course
        const courseResult = await query(
            `SELECT * FROM Cursos WHERE slug = $1 AND activo = true`,
            [slug]
        );
        
        const course = courseResult.rows[0];
        
        if (!course) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }
        
        // Check if already enrolled
        const existingResult = await query(
            `SELECT * FROM Inscripciones WHERE id_usuario = $1 AND id_curso = $2`,
            [req.user.userId, course.id_curso]
        );
        
        if (existingResult.rows.length > 0) {
            return res.redirect(`/cursos/${slug}?already_enrolled=true`);
        }
        
        // Create enrollment
        await query(
            `INSERT INTO Inscripciones (id_usuario, id_curso, estado_pago)
             VALUES ($1, $2, 'pendiente')`,
            [req.user.userId, course.id_curso]
        );
        
        // Update course students count
        await query(
            `UPDATE Cursos SET total_estudiantes = total_estudiantes + 1 WHERE id_curso = $1`,
            [course.id_curso]
        );
        
        res.redirect(`/cursos/${slug}?enrolled=true`);
        
    } catch (error) {
        console.error("Error enrolling in course:", error);
        res.redirect(`/cursos/${req.params.slug}?error=true`);
    }
};

// Get user's enrolled courses
export const getUserCourses = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/auth/login");
        }
        
        const result = await query(
            `SELECT c.*, i.progreso, i.completado, i.fecha_inscripcion
             FROM Inscripciones i
             JOIN Cursos c ON i.id_curso = c.id_curso
             WHERE i.id_usuario = $1
             ORDER BY i.fecha_inscripcion DESC`,
            [req.user.userId]
        );
        
        res.render("pages/courses/my-courses", {
            title: "Mis Cursos - TechLand",
            enrollments: result.rows
        });
        
    } catch (error) {
        console.error("Error getting user courses:", error);
        res.render("pages/courses/my-courses", {
            title: "Mis Cursos - TechLand",
            enrollments: [],
            error: "Error al cargar los cursos"
        });
    }
};

// Watch lesson
export const watchLesson = async (req, res) => {
    try {
        const { slug, lessonId } = req.params;
        
        if (!req.user) {
            return res.redirect(`/auth/login?redirect=/cursos/${slug}`);
        }
        
        // Get course
        const courseResult = await query(
            `SELECT * FROM Cursos WHERE slug = $1 AND activo = true`,
            [slug]
        );
        
        const course = courseResult.rows[0];
        
        if (!course) {
            return res.status(404).render("errors/404", { title: "Curso no encontrado" });
        }
        
        // Check enrollment
        const enrollmentResult = await query(
            `SELECT * FROM Inscripciones WHERE id_usuario = $1 AND id_curso = $2`,
            [req.user.userId, course.id_curso]
        );
        
        // Get lesson
        const lessonResult = await query(
            `SELECT * FROM Lecciones WHERE id_leccion = $1 AND id_curso = $2`,
            [lessonId, course.id_curso]
        );
        
        const lesson = lessonResult.rows[0];
        
        if (!lesson) {
            return res.status(404).render("errors/404", { title: "Lección no encontrada" });
        }
        
        // Check if lesson is free or user is enrolled
        if (!lesson.es_gratuita && enrollmentResult.rows.length === 0) {
            return res.redirect(`/cursos/${slug}?need_enrollment=true`);
        }
        
        // Get all lessons for navigation
        const lessonsResult = await query(
            `SELECT * FROM Lecciones WHERE id_curso = $1 AND activo = true ORDER BY orden ASC`,
            [course.id_curso]
        );
        
        res.render("pages/courses/lesson", {
            title: `${lesson.titulo} - ${course.titulo} - TechLand`,
            course,
            lesson,
            lessons: lessonsResult.rows,
            enrollment: enrollmentResult.rows[0] || null
        });
        
    } catch (error) {
        console.error("Error watching lesson:", error);
        res.status(500).render("errors/500", { title: "Error" });
    }
};

// API: Get all courses
export const apiGetCourses = async (req, res) => {
    try {
        const { nivel, limit = 20, offset = 0 } = req.query;
        
        let sql = `SELECT * FROM Cursos WHERE activo = true`;
        const params = [];
        let paramIndex = 1;
        
        if (nivel) {
            sql += ` AND nivel = $${paramIndex}`;
            params.push(nivel);
            paramIndex++;
        }
        
        sql += ` ORDER BY destacado DESC, total_estudiantes DESC`;
        sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await query(sql, params);
        
        res.json({ success: true, courses: result.rows });
        
    } catch (error) {
        console.error("API Error getting courses:", error);
        res.status(500).json({ error: "Error al obtener cursos" });
    }
};

// Get featured courses
export const getFeaturedCourses = async (limit = 4) => {
    try {
        const result = await query(
            `SELECT * FROM Cursos 
             WHERE activo = true AND destacado = true 
             ORDER BY total_estudiantes DESC 
             LIMIT $1`,
            [limit]
        );
        return result.rows;
    } catch (error) {
        console.error("Error getting featured courses:", error);
        return [];
    }
};

export default {
    getAllCourses,
    getCourseBySlug,
    enrollCourse,
    getUserCourses,
    watchLesson,
    apiGetCourses,
    getFeaturedCourses
};