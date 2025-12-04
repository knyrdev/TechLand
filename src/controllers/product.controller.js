// Product Controller with Database Integration
import { query } from "../database/index.js";

// Get all products with filters
export const getAllProducts = async (req, res) => {
    try {
        const { category, search, sort, marca, min_price, max_price } = req.query;
        
        let sql = `
            SELECT p.*, c.nombre as categoria_nombre, c.slug as categoria_slug, c.icono as categoria_icono
            FROM Productos p
            JOIN Categorias_Producto c ON p.id_categoria = c.id_categoria
            WHERE p.activo = true
        `;
        const params = [];
        let paramIndex = 1;
        
        // Filter by category slug
        if (category) {
            sql += ` AND c.slug = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }
        
        // Filter by brand
        if (marca) {
            sql += ` AND p.marca = $${paramIndex}`;
            params.push(marca);
            paramIndex++;
        }
        
        // Search by name or description
        if (search) {
            sql += ` AND (p.nombre ILIKE $${paramIndex} OR p.descripcion ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        // Price filters
        if (min_price) {
            sql += ` AND COALESCE(p.precio_oferta, p.precio) >= $${paramIndex}`;
            params.push(parseFloat(min_price));
            paramIndex++;
        }
        
        if (max_price) {
            sql += ` AND COALESCE(p.precio_oferta, p.precio) <= $${paramIndex}`;
            params.push(parseFloat(max_price));
            paramIndex++;
        }
        
        // Sort options
        switch (sort) {
            case "price-asc":
                sql += ` ORDER BY COALESCE(p.precio_oferta, p.precio) ASC`;
                break;
            case "price-desc":
                sql += ` ORDER BY COALESCE(p.precio_oferta, p.precio) DESC`;
                break;
            case "name":
                sql += ` ORDER BY p.nombre ASC`;
                break;
            case "newest":
                sql += ` ORDER BY p.created_at DESC`;
                break;
            default:
                sql += ` ORDER BY p.destacado DESC, p.created_at DESC`;
        }
        
        const result = await query(sql, params);
        
        // Get categories for filter
        const categoriesResult = await query(
            `SELECT * FROM Categorias_Producto WHERE activo = true ORDER BY nombre`
        );
        
        // Get brands for filter
        const brandsResult = await query(
            `SELECT DISTINCT marca FROM Productos WHERE activo = true AND marca IS NOT NULL ORDER BY marca`
        );
        
        res.render("pages/products/index", {
            title: "Productos - TechLand",
            products: result.rows,
            categories: categoriesResult.rows,
            brands: brandsResult.rows.map(r => r.marca),
            filters: {
                category: category || "",
                search: search || "",
                sort: sort || "",
                marca: marca || "",
                min_price: min_price || "",
                max_price: max_price || ""
            }
        });
        
    } catch (error) {
        console.error("Error getting products:", error);
        res.render("pages/products/index", {
            title: "Productos - TechLand",
            products: [],
            categories: [],
            brands: [],
            filters: {},
            error: "Error al cargar los productos"
        });
    }
};

// Get single product by slug or ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Try to find by slug first, then by ID
        let result;
        if (isNaN(id)) {
            result = await query(
                `SELECT p.*, c.nombre as categoria_nombre, c.slug as categoria_slug
                 FROM Productos p
                 JOIN Categorias_Producto c ON p.id_categoria = c.id_categoria
                 WHERE p.slug = $1 AND p.activo = true`,
                [id]
            );
        } else {
            result = await query(
                `SELECT p.*, c.nombre as categoria_nombre, c.slug as categoria_slug
                 FROM Productos p
                 JOIN Categorias_Producto c ON p.id_categoria = c.id_categoria
                 WHERE p.id_producto = $1 AND p.activo = true`,
                [parseInt(id)]
            );
        }
        
        const product = result.rows[0];
        
        if (!product) {
            return res.status(404).render("errors/404", {
                title: "Producto no encontrado - TechLand"
            });
        }
        
        // Get related products (same category)
        const relatedResult = await query(
            `SELECT p.*, c.nombre as categoria_nombre
             FROM Productos p
             JOIN Categorias_Producto c ON p.id_categoria = c.id_categoria
             WHERE p.id_categoria = $1 AND p.id_producto != $2 AND p.activo = true
             ORDER BY RANDOM()
             LIMIT 4`,
            [product.id_categoria, product.id_producto]
        );
        
        // Get product images
        const imagesResult = await query(
            `SELECT * FROM Imagenes 
             WHERE tipo = 'producto' AND referencia_id = $1 
             ORDER BY es_principal DESC, orden ASC`,
            [product.id_producto]
        );
        
        // Get reviews
        const reviewsResult = await query(
            `SELECT r.*, u.nombre as usuario_nombre
             FROM Resenas r
             JOIN Usuarios u ON r.id_usuario = u.id_usuario
             WHERE r.tipo = 'producto' AND r.referencia_id = $1 AND r.aprobado = true
             ORDER BY r.created_at DESC
             LIMIT 10`,
            [product.id_producto]
        );
        
        // Calculate average rating
        const ratingResult = await query(
            `SELECT AVG(calificacion) as promedio, COUNT(*) as total
             FROM Resenas
             WHERE tipo = 'producto' AND referencia_id = $1 AND aprobado = true`,
            [product.id_producto]
        );
        
        res.render("pages/products/detail", {
            title: `${product.nombre} - TechLand`,
            product: {
                ...product,
                images: imagesResult.rows,
                reviews: reviewsResult.rows,
                rating: {
                    average: parseFloat(ratingResult.rows[0]?.promedio) || 0,
                    total: parseInt(ratingResult.rows[0]?.total) || 0
                }
            },
            relatedProducts: relatedResult.rows
        });
        
    } catch (error) {
        console.error("Error getting product:", error);
        res.status(500).render("errors/500", {
            title: "Error - TechLand"
        });
    }
};

// API: Get products (JSON)
export const apiGetProducts = async (req, res) => {
    try {
        const { category, search, limit = 20, offset = 0 } = req.query;
        
        let sql = `
            SELECT p.*, c.nombre as categoria_nombre, c.slug as categoria_slug
            FROM Productos p
            JOIN Categorias_Producto c ON p.id_categoria = c.id_categoria
            WHERE p.activo = true
        `;
        const params = [];
        let paramIndex = 1;
        
        if (category) {
            sql += ` AND c.slug = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }
        
        if (search) {
            sql += ` AND (p.nombre ILIKE $${paramIndex} OR p.descripcion ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        sql += ` ORDER BY p.destacado DESC, p.created_at DESC`;
        sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await query(sql, params);
        
        res.json({
            success: true,
            products: result.rows,
            count: result.rows.length
        });
        
    } catch (error) {
        console.error("API Error getting products:", error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
};

// API: Get single product
export const apiGetProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(
            `SELECT p.*, c.nombre as categoria_nombre
             FROM Productos p
             JOIN Categorias_Producto c ON p.id_categoria = c.id_categoria
             WHERE (p.id_producto = $1 OR p.slug = $1) AND p.activo = true`,
            [id]
        );
        
        const product = result.rows[0];
        
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.json({ success: true, product });
        
    } catch (error) {
        console.error("API Error getting product:", error);
        res.status(500).json({ error: "Error al obtener producto" });
    }
};

// Get featured products
export const getFeaturedProducts = async (limit = 8) => {
    try {
        const result = await query(
            `SELECT p.*, c.nombre as categoria_nombre, c.slug as categoria_slug
             FROM Productos p
             JOIN Categorias_Producto c ON p.id_categoria = c.id_categoria
             WHERE p.activo = true AND p.destacado = true
             ORDER BY p.created_at DESC
             LIMIT $1`,
            [limit]
        );
        return result.rows;
    } catch (error) {
        console.error("Error getting featured products:", error);
        return [];
    }
};

// Export for use in other controllers
export default {
    getAllProducts,
    getProductById,
    apiGetProducts,
    apiGetProduct,
    getFeaturedProducts
};