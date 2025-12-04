// Profile Controller
import { query, transaction } from "../database/index.js";
import bcrypt from "bcryptjs";

/**
 * Display user profile page
 */
export const getProfile = async (req, res) => {
    try {
        res.render("pages/profile/index", {
            title: "Mi Perfil - TechLand",
            user: req.userData || req.user
        });
    } catch (error) {
        console.error("Error loading profile:", error);
        res.render("pages/profile/index", {
            title: "Mi Perfil - TechLand",
            error: "Error al cargar el perfil"
        });
    }
};

/**
 * Update user profile information
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        const { nombre, apellido, telefono } = req.body;
        
        await query(
            `UPDATE usuarios 
             SET nombre = $1, apellido = $2, telefono = $3, fecha_actualizacion = NOW()
             WHERE id_usuario = $4`,
            [nombre, apellido, telefono, userId]
        );
        
        // Update session
        if (req.session && req.session.user) {
            req.session.user = { ...req.session.user, nombre, apellido, telefono };
        }
        
        res.redirect("/perfil?message=Perfil actualizado correctamente");
    } catch (error) {
        console.error("Error updating profile:", error);
        res.redirect("/perfil?error=Error al actualizar el perfil");
    }
};

/**
 * Update user address
 */
export const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        const { direccion, ciudad, estado, codigo_postal } = req.body;
        
        await query(
            `UPDATE usuarios 
             SET direccion = $1, ciudad = $2, estado = $3, codigo_postal = $4, fecha_actualizacion = NOW()
             WHERE id_usuario = $5`,
            [direccion, ciudad, estado, codigo_postal, userId]
        );
        
        res.redirect("/perfil?message=Dirección actualizada correctamente");
    } catch (error) {
        console.error("Error updating address:", error);
        res.redirect("/perfil?error=Error al actualizar la dirección");
    }
};

/**
 * Change user password
 */
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        const { current_password, new_password, confirm_password } = req.body;
        
        // Validate passwords match
        if (new_password !== confirm_password) {
            return res.redirect("/perfil?error=Las contraseñas no coinciden");
        }
        
        // Get current password hash
        const result = await query(
            "SELECT password_hash FROM usuarios WHERE id_usuario = $1",
            [userId]
        );
        
        if (!result.rows.length) {
            return res.redirect("/perfil?error=Usuario no encontrado");
        }
        
        // Verify current password
        const isValid = await bcrypt.compare(current_password, result.rows[0].password_hash);
        if (!isValid) {
            return res.redirect("/perfil?error=Contraseña actual incorrecta");
        }
        
        // Hash new password
        const newHash = await bcrypt.hash(new_password, 12);
        
        // Update password
        await query(
            `UPDATE usuarios 
             SET password_hash = $1, fecha_actualizacion = NOW()
             WHERE id_usuario = $2`,
            [newHash, userId]
        );
        
        res.redirect("/perfil?message=Contraseña actualizada correctamente");
    } catch (error) {
        console.error("Error changing password:", error);
        res.redirect("/perfil?error=Error al cambiar la contraseña");
    }
};

/**
 * Get user orders
 */
export const getOrders = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        
        const result = await query(
            `SELECT p.*, 
                    (SELECT json_agg(json_build_object(
                        'nombre', COALESCE(pr.nombre, c.titulo, s.nombre),
                        'tipo', dp.tipo_item,
                        'cantidad', dp.cantidad,
                        'precio_unitario', dp.precio_unitario
                    ))
                    FROM detalle_pedidos dp
                    LEFT JOIN productos pr ON dp.tipo_item = 'producto' AND dp.id_item = pr.id_producto
                    LEFT JOIN cursos c ON dp.tipo_item = 'curso' AND dp.id_item = c.id_curso
                    LEFT JOIN servicios s ON dp.tipo_item = 'servicio' AND dp.id_item = s.id_servicio
                    WHERE dp.id_pedido = p.id_pedido
                    ) as items
             FROM pedidos p 
             WHERE p.id_usuario = $1
             ORDER BY p.fecha_creacion DESC`,
            [userId]
        );
        
        res.render("pages/profile/orders", {
            title: "Mis Pedidos - TechLand",
            orders: result.rows
        });
    } catch (error) {
        console.error("Error loading orders:", error);
        res.render("pages/profile/orders", {
            title: "Mis Pedidos - TechLand",
            orders: [],
            error: "Error al cargar los pedidos"
        });
    }
};

/**
 * Get user enrolled courses
 */
export const getCourses = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        
        const result = await query(
            `SELECT c.*, 
                    ec.progreso, ec.fecha_inscripcion, ec.fecha_ultimo_acceso,
                    (SELECT COUNT(*) FROM lecciones WHERE id_curso = c.id_curso) as total_lecciones,
                    (SELECT COUNT(*) FROM progreso_lecciones pl 
                     JOIN lecciones l ON pl.id_leccion = l.id_leccion 
                     WHERE l.id_curso = c.id_curso AND pl.id_usuario = $1 AND pl.completada = true
                    ) as lecciones_completadas
             FROM estudiantes_cursos ec
             JOIN cursos c ON ec.id_curso = c.id_curso
             WHERE ec.id_usuario = $1
             ORDER BY ec.fecha_ultimo_acceso DESC NULLS LAST`,
            [userId]
        );
        
        res.render("pages/profile/courses", {
            title: "Mis Cursos - TechLand",
            courses: result.rows
        });
    } catch (error) {
        console.error("Error loading courses:", error);
        res.render("pages/profile/courses", {
            title: "Mis Cursos - TechLand",
            courses: [],
            error: "Error al cargar los cursos"
        });
    }
};

/**
 * Get user service appointments
 */
export const getServices = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        
        const result = await query(
            `SELECT rs.*, s.nombre as servicio_nombre, s.tiempo_estimado_horas
             FROM reservas_servicios rs
             JOIN servicios s ON rs.id_servicio = s.id_servicio
             WHERE rs.id_usuario = $1
             ORDER BY rs.fecha_cita DESC`,
            [userId]
        );
        
        res.render("pages/profile/services", {
            title: "Mis Servicios - TechLand",
            reservations: result.rows
        });
    } catch (error) {
        console.error("Error loading services:", error);
        res.render("pages/profile/services", {
            title: "Mis Servicios - TechLand",
            reservations: [],
            error: "Error al cargar los servicios"
        });
    }
};

/**
 * Get order detail
 */
export const getOrderDetail = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        const { id } = req.params;
        
        const orderResult = await query(
            `SELECT p.*, pa.metodo_pago, pa.estado as estado_pago
             FROM pedidos p
             LEFT JOIN pagos pa ON p.id_pedido = pa.id_pedido
             WHERE p.id_pedido = $1 AND p.id_usuario = $2`,
            [id, userId]
        );
        
        if (!orderResult.rows.length) {
            return res.redirect("/perfil/pedidos?error=Pedido no encontrado");
        }
        
        const itemsResult = await query(
            `SELECT dp.*, 
                    COALESCE(pr.nombre, c.titulo, s.nombre) as nombre,
                    COALESCE(pr.slug, c.slug, s.slug) as slug
             FROM detalle_pedidos dp
             LEFT JOIN productos pr ON dp.tipo_item = 'producto' AND dp.id_item = pr.id_producto
             LEFT JOIN cursos c ON dp.tipo_item = 'curso' AND dp.id_item = c.id_curso
             LEFT JOIN servicios s ON dp.tipo_item = 'servicio' AND dp.id_item = s.id_servicio
             WHERE dp.id_pedido = $1`,
            [id]
        );
        
        res.render("pages/profile/order-detail", {
            title: `Pedido #${id} - TechLand`,
            order: orderResult.rows[0],
            items: itemsResult.rows
        });
    } catch (error) {
        console.error("Error loading order detail:", error);
        res.redirect("/perfil/pedidos?error=Error al cargar el pedido");
    }
};

// API Endpoints for AJAX

/**
 * API: Get user profile data
 */
export const apiGetProfile = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        
        const result = await query(
            `SELECT id_usuario, nombre, apellido, email, telefono, 
                    direccion, ciudad, estado, codigo_postal, rol, fecha_registro
             FROM usuarios WHERE id_usuario = $1`,
            [userId]
        );
        
        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
        
        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error("API Error getting profile:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
};

/**
 * API: Update profile
 */
export const apiUpdateProfile = async (req, res) => {
    try {
        const userId = req.user.id_usuario;
        const { nombre, apellido, telefono, direccion, ciudad, estado, codigo_postal } = req.body;
        
        await query(
            `UPDATE usuarios 
             SET nombre = $1, apellido = $2, telefono = $3, 
                 direccion = $4, ciudad = $5, estado = $6, codigo_postal = $7,
                 fecha_actualizacion = NOW()
             WHERE id_usuario = $8`,
            [nombre, apellido, telefono, direccion, ciudad, estado, codigo_postal, userId]
        );
        
        res.json({ success: true, message: "Perfil actualizado" });
    } catch (error) {
        console.error("API Error updating profile:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
};