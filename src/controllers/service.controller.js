// Service Controller for Repair Services
import { query, transaction } from "../database/index.js";

// Get all repair services
export const getAllServices = async (req, res) => {
    try {
        const { tipo, search } = req.query;
        
        let sql = `
            SELECT * FROM Servicios
            WHERE activo = true
        `;
        const params = [];
        let paramIndex = 1;
        
        // Filter by device type
        if (tipo && tipo !== "todos") {
            sql += ` AND (tipo_dispositivo = $${paramIndex} OR tipo_dispositivo = 'ambos')`;
            params.push(tipo);
            paramIndex++;
        }
        
        // Search
        if (search) {
            sql += ` AND (nombre ILIKE $${paramIndex} OR descripcion ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        sql += ` ORDER BY precio_base ASC`;
        
        const result = await query(sql, params);
        
        res.render("pages/services/index", {
            title: "Servicios de Reparación - TechLand",
            services: result.rows,
            filters: {
                tipo: tipo || "todos",
                search: search || ""
            }
        });
        
    } catch (error) {
        console.error("Error getting services:", error);
        res.render("pages/services/index", {
            title: "Servicios de Reparación - TechLand",
            services: [],
            filters: {},
            error: "Error al cargar los servicios"
        });
    }
};

// Get single service by slug
export const getServiceBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const result = await query(
            `SELECT * FROM Servicios WHERE slug = $1 AND activo = true`,
            [slug]
        );
        
        const service = result.rows[0];
        
        if (!service) {
            return res.status(404).render("errors/404", {
                title: "Servicio no encontrado - TechLand"
            });
        }
        
        // Get related services
        const relatedResult = await query(
            `SELECT * FROM Servicios 
             WHERE activo = true AND id_servicio != $1 
             AND (tipo_dispositivo = $2 OR tipo_dispositivo = 'ambos')
             ORDER BY RANDOM()
             LIMIT 4`,
            [service.id_servicio, service.tipo_dispositivo]
        );
        
        res.render("pages/services/detail", {
            title: `${service.nombre} - TechLand`,
            service,
            relatedServices: relatedResult.rows
        });
        
    } catch (error) {
        console.error("Error getting service:", error);
        res.status(500).render("errors/500", {
            title: "Error - TechLand"
        });
    }
};

// Show booking form
export const getBookingForm = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Check authentication
        if (!req.user) {
            return res.redirect(`/auth/login?redirect=/servicios/${slug}/agendar`);
        }
        
        const result = await query(
            `SELECT * FROM Servicios WHERE slug = $1 AND activo = true`,
            [slug]
        );
        
        const service = result.rows[0];
        
        if (!service) {
            return res.status(404).render("errors/404", {
                title: "Servicio no encontrado"
            });
        }
        
        // Get user data
        const userResult = await query(
            `SELECT * FROM Usuarios WHERE id_usuario = $1`,
            [req.user.userId]
        );
        
        res.render("pages/services/booking", {
            title: `Agendar ${service.nombre} - TechLand`,
            service,
            userData: userResult.rows[0],
            error: null
        });
        
    } catch (error) {
        console.error("Error getting booking form:", error);
        res.redirect("/servicios");
    }
};

// Create service appointment
export const createBooking = async (req, res) => {
    try {
        const { slug } = req.params;
        const { 
            fecha_cita, 
            hora_cita, 
            marca_dispositivo, 
            modelo_dispositivo, 
            descripcion_problema 
        } = req.body;
        
        // Validate authentication
        if (!req.user) {
            return res.redirect("/auth/login");
        }
        
        // Get service
        const serviceResult = await query(
            `SELECT * FROM Servicios WHERE slug = $1 AND activo = true`,
            [slug]
        );
        
        const service = serviceResult.rows[0];
        
        if (!service) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }
        
        // Combine date and time
        const fechaHoraCita = new Date(`${fecha_cita}T${hora_cita}`);
        
        // Validate date is in the future
        if (fechaHoraCita <= new Date()) {
            return res.render("pages/services/booking", {
                title: `Agendar ${service.nombre} - TechLand`,
                service,
                error: "La fecha debe ser en el futuro"
            });
        }
        
        // Create appointment
        const result = await query(
            `INSERT INTO Citas_Servicio 
             (id_usuario, id_servicio, fecha_cita, marca_dispositivo, modelo_dispositivo, descripcion_problema, estado)
             VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
             RETURNING *`,
            [
                req.user.userId,
                service.id_servicio,
                fechaHoraCita,
                marca_dispositivo,
                modelo_dispositivo,
                descripcion_problema
            ]
        );
        
        const appointment = result.rows[0];
        
        res.redirect(`/servicios/cita/${appointment.numero_cita}?success=true`);
        
    } catch (error) {
        console.error("Error creating booking:", error);
        res.redirect(`/servicios/${req.params.slug}/agendar?error=true`);
    }
};

// View appointment details
export const getAppointment = async (req, res) => {
    try {
        const { numero } = req.params;
        
        if (!req.user) {
            return res.redirect("/auth/login");
        }
        
        const result = await query(
            `SELECT c.*, s.nombre as servicio_nombre, s.precio_base
             FROM Citas_Servicio c
             JOIN Servicios s ON c.id_servicio = s.id_servicio
             WHERE c.numero_cita = $1 AND c.id_usuario = $2`,
            [numero, req.user.userId]
        );
        
        const appointment = result.rows[0];
        
        if (!appointment) {
            return res.status(404).render("errors/404", {
                title: "Cita no encontrada"
            });
        }
        
        res.render("pages/services/appointment", {
            title: `Cita ${appointment.numero_cita} - TechLand`,
            appointment
        });
        
    } catch (error) {
        console.error("Error getting appointment:", error);
        res.status(500).render("errors/500", {
            title: "Error - TechLand"
        });
    }
};

// Get user's appointments
export const getUserAppointments = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/auth/login");
        }
        
        const result = await query(
            `SELECT c.*, s.nombre as servicio_nombre, s.precio_base
             FROM Citas_Servicio c
             JOIN Servicios s ON c.id_servicio = s.id_servicio
             WHERE c.id_usuario = $1
             ORDER BY c.fecha_cita DESC`,
            [req.user.userId]
        );
        
        res.render("pages/services/my-appointments", {
            title: "Mis Citas - TechLand",
            appointments: result.rows
        });
        
    } catch (error) {
        console.error("Error getting user appointments:", error);
        res.render("pages/services/my-appointments", {
            title: "Mis Citas - TechLand",
            appointments: [],
            error: "Error al cargar las citas"
        });
    }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
    try {
        const { numero } = req.params;
        
        if (!req.user) {
            return res.status(401).json({ error: "No autorizado" });
        }
        
        // Verify ownership and status
        const result = await query(
            `SELECT * FROM Citas_Servicio 
             WHERE numero_cita = $1 AND id_usuario = $2 AND estado = 'pendiente'`,
            [numero, req.user.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Cita no encontrada o no se puede cancelar" });
        }
        
        // Update status
        await query(
            `UPDATE Citas_Servicio SET estado = 'cancelada' WHERE numero_cita = $1`,
            [numero]
        );
        
        res.json({ success: true, message: "Cita cancelada exitosamente" });
        
    } catch (error) {
        console.error("Error canceling appointment:", error);
        res.status(500).json({ error: "Error al cancelar la cita" });
    }
};

// API: Get all services
export const apiGetServices = async (req, res) => {
    try {
        const { tipo } = req.query;
        
        let sql = `SELECT * FROM Servicios WHERE activo = true`;
        const params = [];
        
        if (tipo && tipo !== "todos") {
            sql += ` AND (tipo_dispositivo = $1 OR tipo_dispositivo = 'ambos')`;
            params.push(tipo);
        }
        
        sql += ` ORDER BY precio_base ASC`;
        
        const result = await query(sql, params);
        
        res.json({ success: true, services: result.rows });
        
    } catch (error) {
        console.error("API Error getting services:", error);
        res.status(500).json({ error: "Error al obtener servicios" });
    }
};

// Get featured/popular services
export const getFeaturedServices = async (limit = 4) => {
    try {
        const result = await query(
            `SELECT * FROM Servicios WHERE activo = true ORDER BY precio_base ASC LIMIT $1`,
            [limit]
        );
        return result.rows;
    } catch (error) {
        console.error("Error getting featured services:", error);
        return [];
    }
};

export default {
    getAllServices,
    getServiceBySlug,
    getBookingForm,
    createBooking,
    getAppointment,
    getUserAppointments,
    cancelAppointment,
    apiGetServices,
    getFeaturedServices
};