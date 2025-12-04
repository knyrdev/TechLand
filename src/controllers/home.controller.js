// Home Controller
import { query } from "../database/index.js";
import { getFeaturedProducts } from "./product.controller.js";
import { getFeaturedCourses } from "./course.controller.js";
import { getFeaturedServices } from "./service.controller.js";

// Home page
export const getHomePage = async (req, res) => {
    try {
        // Get featured products
        const productsResult = await query(
            `SELECT p.*, c.nombre as categoria_nombre, c.slug as categoria_slug
             FROM Productos p
             JOIN Categorias_Producto c ON p.id_categoria = c.id_categoria
             WHERE p.activo = true AND p.destacado = true
             ORDER BY p.created_at DESC
             LIMIT 8`
        );
        
        // Get featured courses
        const coursesResult = await query(
            `SELECT * FROM Cursos 
             WHERE activo = true AND destacado = true 
             ORDER BY total_estudiantes DESC 
             LIMIT 4`
        );
        
        // Get services
        const servicesResult = await query(
            `SELECT * FROM Servicios 
             WHERE activo = true 
             ORDER BY precio_base ASC 
             LIMIT 6`
        );
        
        // Get stats
        const statsResult = await query(`
            SELECT 
                (SELECT COUNT(*) FROM Productos WHERE activo = true) as total_productos,
                (SELECT COUNT(*) FROM Cursos WHERE activo = true) as total_cursos,
                (SELECT COUNT(*) FROM Servicios WHERE activo = true) as total_servicios,
                (SELECT COALESCE(SUM(total_estudiantes), 0) FROM Cursos) as total_estudiantes
        `);
        
        res.render("pages/home", {
            title: "TechLand - Dispositivos, Reparaciones y Cursos",
            featuredProducts: productsResult.rows,
            featuredCourses: coursesResult.rows,
            services: servicesResult.rows,
            stats: statsResult.rows[0] || {
                total_productos: 0,
                total_cursos: 0,
                total_servicios: 0,
                total_estudiantes: 0
            }
        });
        
    } catch (error) {
        console.error("Error loading home page:", error);
        // Render with empty data if database fails
        res.render("pages/home", {
            title: "TechLand - Dispositivos, Reparaciones y Cursos",
            featuredProducts: [],
            featuredCourses: [],
            services: [],
            stats: { total_productos: 0, total_cursos: 0, total_servicios: 0, total_estudiantes: 0 }
        });
    }
};

// About page
export const getAboutPage = (req, res) => {
    res.render("pages/about", {
        title: "Sobre Nosotros - TechLand"
    });
};

// Contact page
export const getContactPage = (req, res) => {
    res.render("pages/contact", {
        title: "Contacto - TechLand"
    });
};

// Handle contact form
export const submitContact = async (req, res) => {
    try {
        const { nombre, email, asunto, mensaje } = req.body;
        
        // Here you would typically save to database or send email
        // For now, just redirect with success
        
        res.redirect("/contacto?success=true");
        
    } catch (error) {
        console.error("Error submitting contact:", error);
        res.redirect("/contacto?error=true");
    }
};

export default {
    getHomePage,
    getAboutPage,
    getContactPage,
    submitContact
};