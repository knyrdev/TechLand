// Cart Controller - Handles Products, Courses, and Services
import { query, transaction } from "../database/index.js";

// Item types
const ITEM_TYPES = {
    PRODUCT: "producto",
    COURSE: "curso",
    SERVICE: "servicio"
};

// Get cart items from session or database
const getCartItems = async (req) => {
    // If user is logged in, try to get from database first
    if (req.user) {
        const result = await query(
            `SELECT * FROM Carrito WHERE id_usuario = $1`,
            [req.user.userId]
        );
        
        if (result.rows.length > 0) {
            return result.rows;
        }
    }
    
    // Fall back to session cart
    return req.session.cart || [];
};

// Sync session cart to database (when user logs in)
export const syncCartToDatabase = async (req) => {
    if (!req.user || !req.session.cart || req.session.cart.length === 0) {
        return;
    }
    
    try {
        for (const item of req.session.cart) {
            // Check if item already exists in database cart
            const existing = await query(
                `SELECT * FROM Carrito 
                 WHERE id_usuario = $1 AND tipo_item = $2 AND referencia_id = $3`,
                [req.user.userId, item.type, item.id]
            );
            
            if (existing.rows.length === 0) {
                await query(
                    `INSERT INTO Carrito (id_usuario, tipo_item, referencia_id, cantidad, precio_unitario)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [req.user.userId, item.type, item.id, item.quantity, item.price]
                );
            }
        }
        
        // Clear session cart after sync
        req.session.cart = [];
    } catch (error) {
        console.error("Error syncing cart:", error);
    }
};

// Get cart page
export const getCart = async (req, res) => {
    try {
        const cart = req.session.cart || [];
        
        // Enrich cart items with current data
        const enrichedCart = [];
        
        for (const item of cart) {
            let itemData = null;
            
            if (item.type === ITEM_TYPES.PRODUCT) {
                const result = await query(
                    `SELECT p.*, c.nombre as categoria_nombre 
                     FROM Productos p 
                     JOIN Categorias_Producto c ON p.id_categoria = c.id_categoria
                     WHERE p.id_producto = $1 AND p.activo = true`,
                    [item.id]
                );
                if (result.rows[0]) {
                    itemData = {
                        ...item,
                        name: result.rows[0].nombre,
                        price: parseFloat(result.rows[0].precio_oferta || result.rows[0].precio),
                        image: `/img/products/${result.rows[0].slug}.jpg`,
                        stock: result.rows[0].stock,
                        category: result.rows[0].categoria_nombre
                    };
                }
            } else if (item.type === ITEM_TYPES.COURSE) {
                const result = await query(
                    `SELECT * FROM Cursos WHERE id_curso = $1 AND activo = true`,
                    [item.id]
                );
                if (result.rows[0]) {
                    itemData = {
                        ...item,
                        name: result.rows[0].titulo,
                        price: parseFloat(result.rows[0].precio_oferta || result.rows[0].precio),
                        image: `/img/courses/${result.rows[0].slug}.jpg`,
                        instructor: result.rows[0].instructor,
                        quantity: 1 // Courses always quantity 1
                    };
                }
            } else if (item.type === ITEM_TYPES.SERVICE) {
                const result = await query(
                    `SELECT * FROM Servicios WHERE id_servicio = $1 AND activo = true`,
                    [item.id]
                );
                if (result.rows[0]) {
                    itemData = {
                        ...item,
                        name: result.rows[0].nombre,
                        price: parseFloat(result.rows[0].precio_base),
                        image: null,
                        duration: result.rows[0].duracion_estimada,
                        quantity: 1 // Services always quantity 1
                    };
                }
            }
            
            if (itemData) {
                enrichedCart.push(itemData);
            }
        }
        
        // Calculate totals
        const subtotal = enrichedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.16; // 16% IVA
        const total = subtotal + tax;
        
        res.render("pages/cart/index", {
            title: "Carrito de Compras - TechLand",
            cart: enrichedCart,
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2),
            itemCount: enrichedCart.reduce((sum, item) => sum + item.quantity, 0)
        });
        
    } catch (error) {
        console.error("Error getting cart:", error);
        res.render("pages/cart/index", {
            title: "Carrito de Compras - TechLand",
            cart: [],
            subtotal: "0.00",
            tax: "0.00",
            total: "0.00",
            itemCount: 0,
            error: "Error al cargar el carrito"
        });
    }
};

// Add item to cart
export const addToCart = async (req, res) => {
    try {
        const { id, type, quantity = 1 } = req.body;
        
        if (!req.session.cart) {
            req.session.cart = [];
        }
        
        let item = null;
        let itemPrice = 0;
        let itemName = "";
        
        // Validate item exists and get price
        if (type === ITEM_TYPES.PRODUCT || type === "product") {
            const result = await query(
                `SELECT * FROM Productos WHERE id_producto = $1 AND activo = true`,
                [parseInt(id)]
            );
            if (!result.rows[0]) {
                return res.status(404).json({ error: "Producto no encontrado" });
            }
            item = result.rows[0];
            itemPrice = parseFloat(item.precio_oferta || item.precio);
            itemName = item.nombre;
            
            // Check stock
            if (item.stock < quantity) {
                return res.status(400).json({ error: "Stock insuficiente" });
            }
        } else if (type === ITEM_TYPES.COURSE || type === "course") {
            const result = await query(
                `SELECT * FROM Cursos WHERE id_curso = $1 AND activo = true`,
                [parseInt(id)]
            );
            if (!result.rows[0]) {
                return res.status(404).json({ error: "Curso no encontrado" });
            }
            item = result.rows[0];
            itemPrice = parseFloat(item.precio_oferta || item.precio);
            itemName = item.titulo;
            
            // Check if user already enrolled
            if (req.user) {
                const enrolled = await query(
                    `SELECT * FROM Inscripciones WHERE id_usuario = $1 AND id_curso = $2`,
                    [req.user.userId, item.id_curso]
                );
                if (enrolled.rows.length > 0) {
                    return res.status(400).json({ error: "Ya estás inscrito en este curso" });
                }
            }
        } else if (type === ITEM_TYPES.SERVICE || type === "service") {
            const result = await query(
                `SELECT * FROM Servicios WHERE id_servicio = $1 AND activo = true`,
                [parseInt(id)]
            );
            if (!result.rows[0]) {
                return res.status(404).json({ error: "Servicio no encontrado" });
            }
            item = result.rows[0];
            itemPrice = parseFloat(item.precio_base);
            itemName = item.nombre;
        } else {
            return res.status(400).json({ error: "Tipo de item inválido" });
        }
        
        // Normalize type
        const normalizedType = type === "product" ? ITEM_TYPES.PRODUCT : 
                              type === "course" ? ITEM_TYPES.COURSE :
                              type === "service" ? ITEM_TYPES.SERVICE : type;
        
        // Check if item already in cart
        const existingIndex = req.session.cart.findIndex(
            cartItem => cartItem.id === parseInt(id) && cartItem.type === normalizedType
        );
        
        if (existingIndex > -1) {
            // Update quantity for products only
            if (normalizedType === ITEM_TYPES.PRODUCT) {
                req.session.cart[existingIndex].quantity += parseInt(quantity);
            } else {
                // Courses and services can only be added once
                return res.status(400).json({ error: "Este item ya está en tu carrito" });
            }
        } else {
            // Add new item
            req.session.cart.push({
                id: parseInt(id),
                type: normalizedType,
                price: itemPrice,
                name: itemName,
                quantity: normalizedType === ITEM_TYPES.PRODUCT ? parseInt(quantity) : 1
            });
        }
        
        const cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // JSON response for AJAX
        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.json({
                success: true,
                message: `${itemName} agregado al carrito`,
                cartCount
            });
        }
        
        res.redirect("back");
        
    } catch (error) {
        console.error("Error adding to cart:", error);
        
        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.status(500).json({ error: "Error al agregar al carrito" });
        }
        
        res.redirect("back");
    }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
    try {
        const { id, type, quantity } = req.body;
        
        if (!req.session.cart) {
            return res.status(400).json({ error: "Carrito vacío" });
        }
        
        const normalizedType = type === "product" ? ITEM_TYPES.PRODUCT : 
                              type === "course" ? ITEM_TYPES.COURSE :
                              type === "service" ? ITEM_TYPES.SERVICE : type;
        
        const itemIndex = req.session.cart.findIndex(
            item => item.id === parseInt(id) && item.type === normalizedType
        );
        
        if (itemIndex === -1) {
            return res.status(404).json({ error: "Item no encontrado en el carrito" });
        }
        
        // Only products can have quantity > 1
        if (normalizedType !== ITEM_TYPES.PRODUCT) {
            return res.status(400).json({ error: "No se puede modificar la cantidad de este item" });
        }
        
        if (parseInt(quantity) <= 0) {
            // Remove item
            req.session.cart.splice(itemIndex, 1);
        } else {
            // Check stock
            const result = await query(
                `SELECT stock FROM Productos WHERE id_producto = $1`,
                [parseInt(id)]
            );
            
            if (result.rows[0] && result.rows[0].stock < quantity) {
                return res.status(400).json({ error: "Stock insuficiente" });
            }
            
            req.session.cart[itemIndex].quantity = parseInt(quantity);
        }
        
        // Calculate new totals
        const subtotal = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.16;
        const total = subtotal + tax;
        
        res.json({
            success: true,
            cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2)
        });
        
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ error: "Error al actualizar el carrito" });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const { id, type } = req.body;
        
        if (!req.session.cart) {
            return res.status(400).json({ error: "Carrito vacío" });
        }
        
        const normalizedType = type === "product" ? ITEM_TYPES.PRODUCT : 
                              type === "course" ? ITEM_TYPES.COURSE :
                              type === "service" ? ITEM_TYPES.SERVICE : type;
        
        const itemIndex = req.session.cart.findIndex(
            item => item.id === parseInt(id) && item.type === normalizedType
        );
        
        if (itemIndex === -1) {
            return res.status(404).json({ error: "Item no encontrado" });
        }
        
        req.session.cart.splice(itemIndex, 1);
        
        const subtotal = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.16;
        const total = subtotal + tax;
        
        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.json({
                success: true,
                cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0),
                subtotal: subtotal.toFixed(2),
                tax: tax.toFixed(2),
                total: total.toFixed(2)
            });
        }
        
        res.redirect("/cart");
        
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ error: "Error al eliminar del carrito" });
    }
};

// Clear entire cart
export const clearCart = async (req, res) => {
    req.session.cart = [];
    
    if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.json({ success: true, cartCount: 0 });
    }
    
    res.redirect("/cart");
};

// Checkout page
export const getCheckout = async (req, res) => {
    try {
        const cart = req.session.cart || [];
        
        if (cart.length === 0) {
            return res.redirect("/cart");
        }
        
        // Require authentication for checkout
        if (!req.user) {
            return res.redirect("/auth/login?redirect=/cart/checkout");
        }
        
        // Enrich and validate cart items
        const enrichedCart = [];
        let hasError = false;
        
        for (const item of cart) {
            if (item.type === ITEM_TYPES.PRODUCT) {
                const result = await query(
                    `SELECT * FROM Productos WHERE id_producto = $1 AND activo = true`,
                    [item.id]
                );
                
                if (!result.rows[0] || result.rows[0].stock < item.quantity) {
                    hasError = true;
                    continue;
                }
                
                enrichedCart.push({
                    ...item,
                    name: result.rows[0].nombre,
                    price: parseFloat(result.rows[0].precio_oferta || result.rows[0].precio)
                });
            } else if (item.type === ITEM_TYPES.COURSE) {
                const result = await query(
                    `SELECT * FROM Cursos WHERE id_curso = $1 AND activo = true`,
                    [item.id]
                );
                
                if (result.rows[0]) {
                    enrichedCart.push({
                        ...item,
                        name: result.rows[0].titulo,
                        price: parseFloat(result.rows[0].precio_oferta || result.rows[0].precio),
                        quantity: 1
                    });
                }
            } else if (item.type === ITEM_TYPES.SERVICE) {
                const result = await query(
                    `SELECT * FROM Servicios WHERE id_servicio = $1 AND activo = true`,
                    [item.id]
                );
                
                if (result.rows[0]) {
                    enrichedCart.push({
                        ...item,
                        name: result.rows[0].nombre,
                        price: parseFloat(result.rows[0].precio_base),
                        quantity: 1
                    });
                }
            }
        }
        
        // Get user data
        const userResult = await query(
            `SELECT * FROM Usuarios WHERE id_usuario = $1`,
            [req.user.userId]
        );
        
        const subtotal = enrichedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.16;
        const total = subtotal + tax;
        
        res.render("pages/cart/checkout", {
            title: "Finalizar Compra - TechLand",
            cart: enrichedCart,
            userData: userResult.rows[0],
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2),
            hasStockError: hasError
        });
        
    } catch (error) {
        console.error("Error getting checkout:", error);
        res.redirect("/cart");
    }
};

// Process checkout
export const processCheckout = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/auth/login");
        }
        
        const cart = req.session.cart || [];
        
        if (cart.length === 0) {
            return res.redirect("/cart");
        }
        
        const { direccion_envio, metodo_pago, notas } = req.body;
        
        // Separate items by type
        const products = cart.filter(item => item.type === ITEM_TYPES.PRODUCT);
        const courses = cart.filter(item => item.type === ITEM_TYPES.COURSE);
        const services = cart.filter(item => item.type === ITEM_TYPES.SERVICE);
        
        await transaction(async (client) => {
            // Process product orders
            if (products.length > 0) {
                let subtotal = 0;
                
                // Validate stock and calculate subtotal
                for (const item of products) {
                    const result = await client.query(
                        `SELECT * FROM Productos WHERE id_producto = $1 FOR UPDATE`,
                        [item.id]
                    );
                    
                    if (!result.rows[0] || result.rows[0].stock < item.quantity) {
                        throw new Error(`Stock insuficiente para ${result.rows[0]?.nombre || "producto"}`);
                    }
                    
                    subtotal += item.price * item.quantity;
                }
                
                const tax = subtotal * 0.16;
                const total = subtotal + tax;
                
                // Create order
                const orderResult = await client.query(
                    `INSERT INTO Pedidos (id_usuario, numero_pedido, subtotal, impuesto, total, direccion_envio, notas, estado)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
                     RETURNING id_pedido, numero_pedido`,
                    [req.user.userId, `ORD-${Date.now()}`, subtotal, tax, total, direccion_envio, notas]
                );
                
                const orderId = orderResult.rows[0].id_pedido;
                
                // Add order details and update stock
                for (const item of products) {
                    await client.query(
                        `INSERT INTO Detalle_Pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [orderId, item.id, item.quantity, item.price, item.price * item.quantity]
                    );
                    
                    await client.query(
                        `UPDATE Productos SET stock = stock - $1 WHERE id_producto = $2`,
                        [item.quantity, item.id]
                    );
                }
                
                // Create payment record
                await client.query(
                    `INSERT INTO Pagos (id_usuario, tipo_pago, referencia_id, monto, metodo_pago, estado)
                     VALUES ($1, 'pedido', $2, $3, $4, 'completado')`,
                    [req.user.userId, orderId, total, metodo_pago]
                );
            }
            
            // Process course enrollments
            for (const item of courses) {
                // Create enrollment
                await client.query(
                    `INSERT INTO Inscripciones (id_usuario, id_curso, estado_pago)
                     VALUES ($1, $2, 'pagado')
                     ON CONFLICT (id_usuario, id_curso) DO UPDATE SET estado_pago = 'pagado'`,
                    [req.user.userId, item.id]
                );
                
                // Update student count
                await client.query(
                    `UPDATE Cursos SET total_estudiantes = total_estudiantes + 1 WHERE id_curso = $1`,
                    [item.id]
                );
                
                // Create payment record
                await client.query(
                    `INSERT INTO Pagos (id_usuario, tipo_pago, referencia_id, monto, metodo_pago, estado)
                     VALUES ($1, 'curso', $2, $3, $4, 'completado')`,
                    [req.user.userId, item.id, item.price, metodo_pago]
                );
            }
            
            // Services are handled separately through appointments
            // Just create payment records for now
            for (const item of services) {
                await client.query(
                    `INSERT INTO Pagos (id_usuario, tipo_pago, referencia_id, monto, metodo_pago, estado)
                     VALUES ($1, 'servicio', $2, $3, $4, 'pendiente')`,
                    [req.user.userId, item.id, item.price, metodo_pago]
                );
            }
        });
        
        // Clear cart
        req.session.cart = [];
        
        res.redirect("/cart/success");
        
    } catch (error) {
        console.error("Error processing checkout:", error);
        res.redirect("/cart/checkout?error=" + encodeURIComponent(error.message));
    }
};

// Checkout success page
export const getCheckoutSuccess = (req, res) => {
    res.render("pages/cart/success", {
        title: "¡Compra Exitosa! - TechLand"
    });
};

export default {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCheckout,
    processCheckout,
    getCheckoutSuccess,
    syncCartToDatabase
};