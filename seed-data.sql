-- ============================================================
-- TechLand - Seed Data for Testing
-- Compatible with db.sql schema
-- ============================================================

-- Clear existing data (in correct order due to foreign keys)
TRUNCATE TABLE Detalle_Reparacion CASCADE;
TRUNCATE TABLE Inventario_Reparacion CASCADE;
TRUNCATE TABLE Resenas CASCADE;
TRUNCATE TABLE Pagos CASCADE;
TRUNCATE TABLE Inscripciones CASCADE;
TRUNCATE TABLE Suscripciones CASCADE;
TRUNCATE TABLE Lecciones CASCADE;
TRUNCATE TABLE Cursos CASCADE;
TRUNCATE TABLE Citas_Servicio CASCADE;
TRUNCATE TABLE Servicios CASCADE;
TRUNCATE TABLE Detalle_Pedido CASCADE;
TRUNCATE TABLE Pedidos CASCADE;
TRUNCATE TABLE Carrito CASCADE;
TRUNCATE TABLE Imagenes CASCADE;
TRUNCATE TABLE Productos CASCADE;
TRUNCATE TABLE Sesiones CASCADE;
TRUNCATE TABLE Usuarios CASCADE;

-- Reset sequences
ALTER SEQUENCE usuarios_id_usuario_seq RESTART WITH 1;
ALTER SEQUENCE sesiones_id_sesion_seq RESTART WITH 1;
ALTER SEQUENCE imagenes_id_imagen_seq RESTART WITH 1;
ALTER SEQUENCE productos_id_producto_seq RESTART WITH 1;
ALTER SEQUENCE pedidos_id_pedido_seq RESTART WITH 1;
ALTER SEQUENCE detalle_pedido_id_detalle_seq RESTART WITH 1;
ALTER SEQUENCE servicios_id_servicio_seq RESTART WITH 1;
ALTER SEQUENCE citas_servicio_id_cita_seq RESTART WITH 1;
ALTER SEQUENCE inventario_reparacion_id_pieza_seq RESTART WITH 1;
ALTER SEQUENCE detalle_reparacion_id_detalle_seq RESTART WITH 1;
ALTER SEQUENCE cursos_id_curso_seq RESTART WITH 1;
ALTER SEQUENCE lecciones_id_leccion_seq RESTART WITH 1;
ALTER SEQUENCE suscripciones_id_suscripcion_seq RESTART WITH 1;
ALTER SEQUENCE inscripciones_id_inscripcion_seq RESTART WITH 1;
ALTER SEQUENCE pagos_id_pago_seq RESTART WITH 1;
ALTER SEQUENCE carrito_id_carrito_seq RESTART WITH 1;
ALTER SEQUENCE resenas_id_resena_seq RESTART WITH 1;

-- ============================================================
-- USUARIOS (Users)
-- Password for all users: "password123" (bcrypt hashed)
-- Roles: 1=admin, 2=cliente, 3=tecnico
-- ============================================================
INSERT INTO Usuarios (nombre, apellido, email, password_hash, telefono, direccion, avatar_url, activo, email_verificado, id_rol) VALUES
-- Administradores (id_rol = 1)
('Carlos', 'Rodríguez', 'admin@techland.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0412-1234567', 'Av. Principal, Torre TechLand, Piso 10, Caracas', NULL, true, true, 1),
('María', 'González', 'maria.admin@techland.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0414-9876543', 'Calle 5, Edificio Plaza, Maracaibo', NULL, true, true, 1),

-- Técnicos (id_rol = 3)
('José', 'Martínez', 'jose.tecnico@techland.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0424-5551234', 'Urb. Los Samanes, Casa 15, Valencia', NULL, true, true, 3),
('Ana', 'López', 'ana.tecnico@techland.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0416-3332211', 'Av. Bolívar, Centro Comercial Mall, Barquisimeto', NULL, true, true, 3),

-- Clientes (id_rol = 2)
('Pedro', 'Ramírez', 'pedro@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0424-1234567', 'Calle 10, Casa 25, Caracas', NULL, true, true, 2),
('Laura', 'Mendoza', 'laura@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0416-9876543', 'Av. Las Américas, Apto 5B, Maracay', NULL, true, true, 2),
('Miguel', 'Torres', 'miguel@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0412-5554433', 'Urb. El Paraíso, Quinta 8, Puerto La Cruz', NULL, true, true, 2),
('Carmen', 'Flores', 'carmen@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0414-3336677', 'Calle Comercio, Local 12, San Cristóbal', NULL, true, true, 2),
('Fernando', 'Vargas', 'fernando@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0424-8889900', 'Av. Principal, Torre Norte, Barquisimeto', NULL, true, true, 2),
('Daniela', 'Castillo', 'daniela@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0416-2223344', 'Calle 8, Edificio Sol, Valencia', NULL, true, true, 2),
('Andrés', 'Morales', 'andres@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0412-6667788', 'Urb. La Florida, Casa 30, Caracas', NULL, true, true, 2),
('Sofía', 'Rojas', 'sofia@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0414-4445566', 'Av. Libertador, Apto 12A, Maracaibo', NULL, true, true, 2),
('Ricardo', 'Silva', 'ricardo@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0424-7776655', 'Calle Miranda, Casa 5, Maturín', NULL, true, true, 2),
('Valentina', 'Pérez', 'valentina@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0416-1119988', 'Urb. Santa Rosa, Quinta 12, Ciudad Bolívar', NULL, true, true, 2),

-- Usuario sin verificar email
('Luis', 'Fernández', 'luis.nuevo@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0412-9998877', NULL, NULL, true, false, 2),

-- Usuario inactivo
('Elena', 'García', 'elena.inactiva@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VX.6wQLfpPn.6Gy', '0414-5556677', 'Calle Vieja, Casa 1, Caracas', NULL, false, true, 2);

-- ============================================================
-- PRODUCTOS (Products)
-- id_categoria: 1=Smartphones, 2=Laptops, 3=Accesorios
-- ============================================================

-- Additional Smartphones (complementing those in db.sql)
INSERT INTO Productos (nombre, slug, descripcion, descripcion_corta, precio, precio_oferta, stock, sku, marca, modelo, especificaciones, destacado, activo, id_categoria) VALUES
-- Additional iPhones
('iPhone 15 128GB', 'iphone-15-128gb',
 'El iPhone 15 trae Dynamic Island a toda la línea, transformando la forma de interactuar con las notificaciones. Cámara de 48MP con sensor mejorado y chip A16 Bionic.',
 'Dynamic Island, 48MP, USB-C',
 899.99, 849.99, 35, 'APL-IP15-128', 'Apple', 'iPhone 15',
 '{"pantalla": "6.1 pulgadas Super Retina XDR", "procesador": "A16 Bionic", "ram": "6GB", "almacenamiento": "128GB", "camara": "48MP + 12MP", "bateria": "3349mAh"}',
 false, true, 1),

('iPhone 14 128GB', 'iphone-14-128gb',
 'iPhone 14 con chip A15 Bionic, Detección de Accidentes y Modo Acción en video. El sistema de cámaras captura fotos brillantes en cualquier luz.',
 'A15 Bionic, Modo Acción, Detección de Accidentes',
 699.99, 649.99, 40, 'APL-IP14-128', 'Apple', 'iPhone 14',
 '{"pantalla": "6.1 pulgadas Super Retina XDR", "procesador": "A15 Bionic", "ram": "6GB", "almacenamiento": "128GB", "camara": "12MP + 12MP", "bateria": "3279mAh"}',
 false, true, 1),

('iPhone SE (3ra Gen) 64GB', 'iphone-se-3-64gb',
 'iPhone SE combina el diseño clásico con el potente chip A15 Bionic. Touch ID, 5G y el sistema de cámaras más avanzado en un iPhone económico.',
 'A15 Bionic, Touch ID, 5G',
 429.99, 379.99, 50, 'APL-IPSE3-64', 'Apple', 'iPhone SE 3',
 '{"pantalla": "4.7 pulgadas Retina HD", "procesador": "A15 Bionic", "ram": "4GB", "almacenamiento": "64GB", "camara": "12MP", "bateria": "2018mAh"}',
 false, true, 1),

-- Samsung Galaxy additional models
('Samsung Galaxy S24 128GB', 'samsung-galaxy-s24-128gb',
 'Galaxy S24 con Galaxy AI en un formato compacto. Circle to Search, traducción en tiempo real y la potencia del Exynos 2400.',
 'Galaxy AI, Circle to Search, Compacto',
 849.99, 799.99, 30, 'SAM-S24-128', 'Samsung', 'Galaxy S24',
 '{"pantalla": "6.2 pulgadas Dynamic AMOLED 2X", "procesador": "Exynos 2400", "ram": "8GB", "almacenamiento": "128GB", "camara": "50MP + 12MP + 10MP", "bateria": "4000mAh"}',
 false, true, 1),

('Samsung Galaxy A55 5G 256GB', 'samsung-galaxy-a55-5g-256gb',
 'Galaxy A55 5G lleva características premium a la gama media. Pantalla Super AMOLED de 120Hz, 4 años de actualizaciones y resistencia IP67.',
 '5G, 4 años actualizaciones, IP67',
 449.99, 399.99, 45, 'SAM-A55-256', 'Samsung', 'Galaxy A55',
 '{"pantalla": "6.6 pulgadas Super AMOLED 120Hz", "procesador": "Exynos 1480", "ram": "8GB", "almacenamiento": "256GB", "camara": "50MP + 12MP + 5MP", "bateria": "5000mAh"}',
 false, true, 1),

('Samsung Galaxy Z Flip5 256GB', 'samsung-galaxy-z-flip5-256gb',
 'Galaxy Z Flip5 con la pantalla de cubierta más grande: 3.4 pulgadas Flex Window. Diseño compacto cuando plegado, experiencia completa al abrirlo.',
 'Plegable, Flex Window 3.4"',
 999.99, 899.99, 15, 'SAM-ZFL5-256', 'Samsung', 'Galaxy Z Flip5',
 '{"pantalla": "6.7 pulgadas FHD+ (interno) / 3.4 pulgadas (externo)", "procesador": "Snapdragon 8 Gen 2", "ram": "8GB", "almacenamiento": "256GB", "camara": "12MP + 12MP", "bateria": "3700mAh"}',
 true, true, 1),

('Samsung Galaxy Z Fold5 512GB', 'samsung-galaxy-z-fold5-512gb',
 'El plegable más versátil de Samsung. Pantalla de 7.6 pulgadas cuando desplegado para máxima productividad, compatible con S Pen.',
 'Plegable, 7.6" desplegado, S Pen compatible',
 1699.99, 1499.99, 10, 'SAM-ZF5-512', 'Samsung', 'Galaxy Z Fold5',
 '{"pantalla": "7.6 pulgadas QXGA+ (interno) / 6.2 pulgadas HD+ (externo)", "procesador": "Snapdragon 8 Gen 2", "ram": "12GB", "almacenamiento": "512GB", "camara": "50MP + 12MP + 10MP", "bateria": "4400mAh"}',
 true, true, 1),

-- Google Pixel
('Google Pixel 8 128GB', 'google-pixel-8-128gb',
 'Pixel 8 con Google Tensor G3 y 7 años de actualizaciones. Magic Eraser, Photo Unblur y la experiencia Android más pura.',
 'Tensor G3, 7 años actualizaciones, IA Google',
 699.99, 649.99, 25, 'GOO-P8-128', 'Google', 'Pixel 8',
 '{"pantalla": "6.2 pulgadas OLED 120Hz", "procesador": "Google Tensor G3", "ram": "8GB", "almacenamiento": "128GB", "camara": "50MP + 12MP", "bateria": "4575mAh"}',
 false, true, 1),

('Google Pixel 7a 128GB', 'google-pixel-7a-128gb',
 'Pixel 7a trae la experiencia Pixel a un precio accesible. Tensor G2, carga inalámbrica y las funciones de IA que amas.',
 'Tensor G2, Carga inalámbrica',
 449.99, 399.99, 35, 'GOO-P7A-128', 'Google', 'Pixel 7a',
 '{"pantalla": "6.1 pulgadas OLED 90Hz", "procesador": "Google Tensor G2", "ram": "8GB", "almacenamiento": "128GB", "camara": "64MP + 13MP", "bateria": "4385mAh"}',
 false, true, 1),

-- Additional Laptops
('MacBook Pro 16" M3 Max 1TB', 'macbook-pro-16-m3-max-1tb',
 'El MacBook Pro más potente con chip M3 Max. CPU de 16 núcleos, GPU de 40 núcleos y hasta 128GB de memoria unificada para profesionales.',
 'M3 Max, 16 núcleos, GPU 40 núcleos',
 3999.99, NULL, 5, 'APL-MBP16-M3MX-1TB', 'Apple', 'MacBook Pro 16"',
 '{"pantalla": "16.2 pulgadas Liquid Retina XDR", "procesador": "M3 Max 16 núcleos", "gpu": "40 núcleos", "ram": "48GB", "almacenamiento": "1TB SSD", "bateria": "22 horas"}',
 true, true, 2),

('MacBook Air 15" M3 256GB', 'macbook-air-15-m3-256gb',
 'MacBook Air de 15 pulgadas con chip M3. Pantalla más grande, increíblemente delgado y hasta 18 horas de batería.',
 'M3, 15.3 pulgadas, 18h batería',
 1299.99, 1199.99, 20, 'APL-MBA15-M3-256', 'Apple', 'MacBook Air 15"',
 '{"pantalla": "15.3 pulgadas Liquid Retina", "procesador": "M3 8 núcleos", "gpu": "10 núcleos", "ram": "8GB", "almacenamiento": "256GB SSD", "bateria": "18 horas"}',
 false, true, 2),

('MacBook Air 13" M3 512GB', 'macbook-air-13-m3-512gb',
 'La laptop más popular de Apple ahora con chip M3. Ligera, potente y con la mejor autonomía de su clase.',
 'M3, Ultraligera, All-day battery',
 1399.99, NULL, 25, 'APL-MBA13-M3-512', 'Apple', 'MacBook Air 13"',
 '{"pantalla": "13.6 pulgadas Liquid Retina", "procesador": "M3 8 núcleos", "gpu": "10 núcleos", "ram": "8GB", "almacenamiento": "512GB SSD", "bateria": "18 horas"}',
 false, true, 2),

('HP Spectre x360 16" i7', 'hp-spectre-x360-16-i7',
 'Convertible premium de 16 pulgadas con pantalla OLED 4K. Diseño elegante en aluminio y bisagra 360° para máxima versatilidad.',
 'Convertible 360°, OLED 4K, Stylus incluido',
 1799.99, 1649.99, 12, 'HP-SPX360-16', 'HP', 'Spectre x360 16',
 '{"pantalla": "16 pulgadas OLED 4K touch", "procesador": "Intel Core i7-13700H", "ram": "32GB", "almacenamiento": "1TB SSD", "bateria": "16 horas"}',
 true, true, 2),

('HP Pavilion Plus 14"', 'hp-pavilion-plus-14',
 'Laptop de productividad con pantalla OLED 2.8K. Core i5 de última generación y diseño premium a precio accesible.',
 'OLED 2.8K, Core i5, Compacta',
 849.99, 749.99, 30, 'HP-PAV14-I5', 'HP', 'Pavilion Plus 14',
 '{"pantalla": "14 pulgadas OLED 2.8K", "procesador": "Intel Core i5-1340P", "ram": "16GB", "almacenamiento": "512GB SSD", "bateria": "11 horas"}',
 false, true, 2),

('ASUS ROG Zephyrus G14', 'asus-rog-zephyrus-g14',
 'Gaming laptop compacta de 14 pulgadas con RTX 4060. AMD Ryzen 9 y pantalla de 165Hz para gaming en cualquier lugar.',
 'RTX 4060, Ryzen 9, 165Hz',
 1599.99, 1449.99, 15, 'ASU-ROGZ14-4060', 'ASUS', 'ROG Zephyrus G14',
 '{"pantalla": "14 pulgadas QHD 165Hz", "procesador": "AMD Ryzen 9 7940HS", "gpu": "RTX 4060 8GB", "ram": "16GB", "almacenamiento": "1TB SSD", "bateria": "10 horas"}',
 false, true, 2),

('Razer Blade 15 RTX 4070', 'razer-blade-15-rtx-4070',
 'Laptop gaming premium con diseño unibody de aluminio. RTX 4070 y pantalla QHD 240Hz para esports y AAA.',
 'RTX 4070, QHD 240Hz, Aluminio CNC',
 2299.99, 2099.99, 8, 'RAZ-BL15-4070', 'Razer', 'Blade 15',
 '{"pantalla": "15.6 pulgadas QHD 240Hz", "procesador": "Intel Core i7-13800H", "gpu": "RTX 4070 8GB", "ram": "16GB", "almacenamiento": "1TB SSD", "bateria": "6 horas"}',
 true, true, 2),

('MSI Stealth 16 Studio', 'msi-stealth-16-studio',
 'Creador de contenido y gaming en un diseño elegante. RTX 4060 y pantalla 4K+ para trabajo profesional.',
 'RTX 4060, 4K+, Ultra delgada',
 1899.99, 1749.99, 10, 'MSI-ST16-4060', 'MSI', 'Stealth 16 Studio',
 '{"pantalla": "16 pulgadas 4K+ 120Hz", "procesador": "Intel Core i7-13700H", "gpu": "RTX 4060 8GB", "ram": "32GB", "almacenamiento": "1TB SSD", "bateria": "7 horas"}',
 false, true, 2);

-- ============================================================
-- IMAGES for Products
-- ============================================================
INSERT INTO Imagenes (url, alt_text, tipo, referencia_id, es_principal, orden) VALUES
-- Images for original products from db.sql (IDs 1-8)
('/images/products/iphone-15-pro-max.jpg', 'iPhone 15 Pro Max Titanio Natural', 'producto', 1, true, 1),
('/images/products/samsung-galaxy-s24-ultra.jpg', 'Samsung Galaxy S24 Ultra Titanium', 'producto', 2, true, 1),
('/images/products/google-pixel-8-pro.jpg', 'Google Pixel 8 Pro Bay', 'producto', 3, true, 1),
('/images/products/xiaomi-14-ultra.jpg', 'Xiaomi 14 Ultra Negro', 'producto', 4, true, 1),
('/images/products/macbook-pro-14-m3-pro.jpg', 'MacBook Pro 14 M3 Pro Space Black', 'producto', 5, true, 1),
('/images/products/dell-xps-15.jpg', 'Dell XPS 15 Silver', 'producto', 6, true, 1),
('/images/products/asus-rog-zephyrus-g16.jpg', 'ASUS ROG Zephyrus G16', 'producto', 7, true, 1),
('/images/products/thinkpad-x1-carbon.jpg', 'Lenovo ThinkPad X1 Carbon', 'producto', 8, true, 1),
-- Images for new products (IDs 9+)
('/images/products/iphone-15.jpg', 'iPhone 15', 'producto', 9, true, 1),
('/images/products/iphone-14.jpg', 'iPhone 14', 'producto', 10, true, 1),
('/images/products/iphone-se-3.jpg', 'iPhone SE 3ra Gen', 'producto', 11, true, 1),
('/images/products/samsung-galaxy-s24.jpg', 'Samsung Galaxy S24', 'producto', 12, true, 1),
('/images/products/samsung-galaxy-a55.jpg', 'Samsung Galaxy A55', 'producto', 13, true, 1),
('/images/products/samsung-galaxy-z-flip5.jpg', 'Samsung Galaxy Z Flip5', 'producto', 14, true, 1),
('/images/products/samsung-galaxy-z-fold5.jpg', 'Samsung Galaxy Z Fold5', 'producto', 15, true, 1),
('/images/products/google-pixel-8.jpg', 'Google Pixel 8', 'producto', 16, true, 1),
('/images/products/google-pixel-7a.jpg', 'Google Pixel 7a', 'producto', 17, true, 1),
('/images/products/macbook-pro-16-m3-max.jpg', 'MacBook Pro 16 M3 Max', 'producto', 18, true, 1),
('/images/products/macbook-air-15-m3.jpg', 'MacBook Air 15 M3', 'producto', 19, true, 1),
('/images/products/macbook-air-13-m3.jpg', 'MacBook Air 13 M3', 'producto', 20, true, 1),
('/images/products/hp-spectre-x360-16.jpg', 'HP Spectre x360 16', 'producto', 21, true, 1),
('/images/products/hp-pavilion-plus-14.jpg', 'HP Pavilion Plus 14', 'producto', 22, true, 1),
('/images/products/asus-rog-zephyrus-g14.jpg', 'ASUS ROG Zephyrus G14', 'producto', 23, true, 1),
('/images/products/razer-blade-15.jpg', 'Razer Blade 15', 'producto', 24, true, 1),
('/images/products/msi-stealth-16.jpg', 'MSI Stealth 16 Studio', 'producto', 25, true, 1);

-- ============================================================
-- ADDITIONAL COURSES (complementing db.sql courses)
-- ============================================================
INSERT INTO Cursos (titulo, slug, descripcion, descripcion_corta, precio, precio_oferta, duracion_horas, nivel, instructor, instructor_bio, requisitos, que_aprenderas, destacado) VALUES
('Diagnóstico Profesional de Smartphones', 'diagnostico-profesional-smartphones',
 'Desarrolla habilidades de diagnóstico que te permitirán identificar fallos con precisión. Metodologías sistemáticas, herramientas de diagnóstico e interpretación de códigos de error.',
 'Metodologías de diagnóstico efectivo',
 179.99, 149.99, 25, 'intermedio', 'José Martínez',
 'Técnico con 8 años de experiencia en diagnóstico de dispositivos móviles y laptops.',
 'Experiencia básica en reparación de teléfonos. Multímetro y herramientas básicas.',
 ARRAY['Usar software de diagnóstico profesional', 'Identificar fallas de hardware con multímetro', 'Diagnosticar problemas de señal y WiFi', 'Detectar daños por agua', 'Crear reportes de diagnóstico profesionales'],
 false),

('Reparación de Laptops: Guía Completa', 'reparacion-laptops-guia-completa',
 'Curso integral de reparación de laptops para todas las marcas. Desde cambios de pantalla y teclado hasta diagnóstico de placa base.',
 'Todo sobre reparación de laptops',
 299.99, 249.99, 50, 'intermedio', 'Ana López',
 'Técnica especializada en reparación de laptops con certificaciones de Dell y HP.',
 'Conocimientos básicos de hardware. Herramientas de reparación de laptops.',
 ARRAY['Desmontar y ensamblar laptops de todas las marcas', 'Cambiar pantallas LCD y OLED', 'Reemplazar teclados y trackpads', 'Realizar upgrades de RAM y SSD', 'Diagnosticar problemas de placa base'],
 true),

('Reparación de MacBook: Especialización', 'reparacion-macbook-especializacion',
 'Especialízate en la reparación de equipos Apple Mac. Cubre MacBook Air, MacBook Pro incluyendo modelos con chip Apple Silicon.',
 'Experto en equipos Apple Mac',
 399.99, NULL, 45, 'avanzado', 'Carlos Rodríguez',
 'Técnico certificado Apple con más de 10 años de experiencia en reparación de Mac.',
 'Experiencia en reparación de laptops. Herramientas especializadas para Apple.',
 ARRAY['Reparar pantallas Retina y Liquid Retina', 'Diagnosticar problemas con Apple Diagnostics', 'Reemplazar componentes de MacBook Intel y Apple Silicon', 'Reparar problemas de trackpad y teclado', 'Solucionar errores de firmware y T2'],
 true),

('Emprendimiento en Reparación de Celulares', 'emprendimiento-reparacion-celulares',
 'Aprende a convertir tus habilidades técnicas en un negocio rentable. Planificación, equipamiento, proveedores, marketing y gestión.',
 'Inicia tu negocio de reparaciones',
 149.99, 99.99, 20, 'principiante', 'María González',
 'Empresaria con red de 3 tiendas de reparación en Venezuela.',
 'Conocimientos técnicos de reparación (básicos). Interés en emprendimiento.',
 ARRAY['Crear un plan de negocio viable', 'Seleccionar ubicación y equipamiento', 'Gestionar inventario de repuestos', 'Estrategias de marketing digital', 'Atención al cliente y garantías'],
 false),

('Soldadura Básica para Electrónica', 'soldadura-basica-electronica',
 'Fundamentos de soldadura para reparación electrónica. Through-hole, SMD básico, buenas prácticas de seguridad.',
 'Primeros pasos en soldadura electrónica',
 99.99, 79.99, 15, 'principiante', 'José Martínez',
 'Técnico con certificaciones en IPC para soldadura electrónica.',
 'Sin experiencia previa requerida. Soldador básico (60W recomendado).',
 ARRAY['Usar soldador correctamente', 'Soldar componentes through-hole', 'Introducción a SMD', 'Desoldar con malla y bomba', 'Seguridad en el trabajo con soldadura'],
 false);

-- ============================================================
-- LECCIONES (Course Lessons)
-- For original courses from db.sql (IDs 1-5) and new courses
-- ============================================================

-- Lecciones for Course 1: Reparación de Smartphones: Nivel Básico
INSERT INTO Lecciones (id_curso, titulo, descripcion, duracion_minutos, orden, video_url, es_gratuita) VALUES
(1, 'Bienvenida al curso', 'Introducción, objetivos y estructura del curso', 15, 1, 'https://videos.techland.com/c1/l1', true),
(1, 'Herramientas esenciales', 'Kit completo de herramientas para reparación', 30, 2, 'https://videos.techland.com/c1/l2', true),
(1, 'Anatomía de un smartphone', 'Componentes internos y su función', 45, 3, 'https://videos.techland.com/c1/l3', false),
(1, 'Apertura de dispositivos iPhone', 'Técnicas seguras de desmontaje', 40, 4, 'https://videos.techland.com/c1/l4', false),
(1, 'Apertura de dispositivos Android', 'Desmontaje de Samsung, Xiaomi y otros', 40, 5, 'https://videos.techland.com/c1/l5', false),
(1, 'Cambio de pantalla - Teoría', 'Tipos de pantallas y proceso general', 35, 6, 'https://videos.techland.com/c1/l6', false),
(1, 'Cambio de pantalla iPhone', 'Práctica con iPhone', 60, 7, 'https://videos.techland.com/c1/l7', false),
(1, 'Cambio de pantalla Samsung', 'Técnicas para AMOLED', 55, 8, 'https://videos.techland.com/c1/l8', false),
(1, 'Reemplazo de batería', 'Guía universal para baterías', 45, 9, 'https://videos.techland.com/c1/l9', false),
(1, 'Puerto de carga', 'Diagnóstico y reemplazo', 50, 10, 'https://videos.techland.com/c1/l10', false),
(1, 'Reparación de cámara', 'Módulos de cámara trasera y frontal', 40, 11, 'https://videos.techland.com/c1/l11', false),
(1, 'Botones y flex cables', 'Componentes pequeños pero importantes', 35, 12, 'https://videos.techland.com/c1/l12', false);

-- Lecciones for Course 2: Microsoldadura para Reparación de Celulares
INSERT INTO Lecciones (id_curso, titulo, descripcion, duracion_minutos, orden, video_url, es_gratuita) VALUES
(2, 'Introducción a la microsoldadura', 'Qué es y por qué es importante', 20, 1, 'https://videos.techland.com/c2/l1', true),
(2, 'Equipamiento profesional', 'Estación, microscopio y accesorios', 35, 2, 'https://videos.techland.com/c2/l2', true),
(2, 'Configuración del espacio de trabajo', 'Setup óptimo para microsoldadura', 25, 3, 'https://videos.techland.com/c2/l3', false),
(2, 'Tipos de soldadura y flux', 'Cuándo usar cada material', 40, 4, 'https://videos.techland.com/c2/l4', false),
(2, 'Técnicas básicas SMD', 'Resistencias y capacitores', 50, 5, 'https://videos.techland.com/c2/l5', false),
(2, 'Práctica en placa de pruebas', 'Ejercicios guiados', 60, 6, 'https://videos.techland.com/c2/l6', false),
(2, 'Desoldar componentes', 'Técnicas sin dañar la placa', 45, 7, 'https://videos.techland.com/c2/l7', false),
(2, 'Introducción a BGA', 'Chips Ball Grid Array', 55, 8, 'https://videos.techland.com/c2/l8', false),
(2, 'Reballing básico', 'Técnica fundamental', 50, 9, 'https://videos.techland.com/c2/l9', false),
(2, 'Proyecto final', 'Reparación completa guiada', 65, 10, 'https://videos.techland.com/c2/l10', false);

-- Lecciones for Course 3: Diagnóstico de Fallas en Smartphones
INSERT INTO Lecciones (id_curso, titulo, descripcion, duracion_minutos, orden, video_url, es_gratuita) VALUES
(3, 'Filosofía del diagnóstico', 'Metodología sistemática', 20, 1, 'https://videos.techland.com/c3/l1', true),
(3, 'Herramientas de diagnóstico', 'Multímetro, fuente y software', 35, 2, 'https://videos.techland.com/c3/l2', true),
(3, 'Diagnóstico visual', 'Qué buscar a simple vista', 25, 3, 'https://videos.techland.com/c3/l3', false),
(3, 'Uso del multímetro', 'Mediciones esenciales', 45, 4, 'https://videos.techland.com/c3/l4', false),
(3, 'Fuente de poder en diagnóstico', 'Lectura de consumos', 40, 5, 'https://videos.techland.com/c3/l5', false),
(3, 'Problemas de encendido', 'No enciende, reinicia, etc.', 50, 6, 'https://videos.techland.com/c3/l6', false),
(3, 'Problemas de carga', 'Circuitos de carga', 45, 7, 'https://videos.techland.com/c3/l7', false),
(3, 'Problemas de señal', 'Baseband y antenas', 40, 8, 'https://videos.techland.com/c3/l8', false);

-- Lecciones for Course 6: Reparación de Laptops (new course - id 6 in sequence)
INSERT INTO Lecciones (id_curso, titulo, descripcion, duracion_minutos, orden, video_url, es_gratuita) VALUES
(6, 'Introducción a laptops', 'Diferencias con smartphones', 20, 1, 'https://videos.techland.com/c6/l1', true),
(6, 'Herramientas para laptops', 'Kit especializado', 30, 2, 'https://videos.techland.com/c6/l2', true),
(6, 'Desmontaje general', 'Principios universales', 45, 3, 'https://videos.techland.com/c6/l3', false),
(6, 'Cambio de pantalla', 'LCD, LED, OLED y touch', 55, 4, 'https://videos.techland.com/c6/l4', false),
(6, 'Reemplazo de teclado', 'Diferentes diseños', 40, 5, 'https://videos.techland.com/c6/l5', false),
(6, 'Upgrade de RAM y SSD', 'Mejoras de rendimiento', 35, 6, 'https://videos.techland.com/c6/l6', false),
(6, 'Sistema de enfriamiento', 'Limpieza y pasta térmica', 40, 7, 'https://videos.techland.com/c6/l7', false),
(6, 'Reparación de bisagras', 'Problema común', 35, 8, 'https://videos.techland.com/c6/l8', false),
(6, 'Diagnóstico de placa base', 'Identificación de fallas', 50, 9, 'https://videos.techland.com/c6/l9', false),
(6, 'Especial MacBook', 'Particularidades Apple', 60, 10, 'https://videos.techland.com/c6/l10', false);

-- ============================================================
-- PEDIDOS (Orders)
-- ============================================================
INSERT INTO Pedidos (id_usuario, numero_pedido, estado, subtotal, impuesto, descuento, total, direccion_envio, notas) VALUES
-- Completed orders
(5, 'ORD-20241115-000001', 'entregado', 1199.99, 0, 0, 1199.99, 'Calle 10, Casa 25, Caracas', 'Entrega en horario de oficina'),
(6, 'ORD-20241118-000002', 'entregado', 849.99, 0, 50.00, 799.99, 'Av. Las Américas, Apto 5B, Maracay', NULL),
(7, 'ORD-20241120-000003', 'entregado', 699.99, 0, 0, 699.99, 'Urb. El Paraíso, Quinta 8, Puerto La Cruz', 'Dejar con el portero'),

-- Processing orders
(8, 'ORD-20241201-000004', 'procesando', 1999.99, 0, 200.00, 1799.99, 'Calle Comercio, Local 12, San Cristóbal', NULL),
(9, 'ORD-20241202-000005', 'enviado', 1299.99, 0, 0, 1299.99, 'Av. Principal, Torre Norte, Barquisimeto', 'Llamar antes de entregar'),
(10, 'ORD-20241203-000006', 'confirmado', 449.99, 0, 50.00, 399.99, 'Calle 8, Edificio Sol, Valencia', NULL),

-- Pending orders
(11, 'ORD-20241204-000007', 'pendiente', 999.99, 0, 100.00, 899.99, 'Urb. La Florida, Casa 30, Caracas', NULL),

-- Cancelled order
(12, 'ORD-20241125-000008', 'cancelado', 1699.99, 0, 0, 1699.99, 'Av. Libertador, Apto 12A, Maracaibo', 'Cancelado por el cliente');

-- ============================================================
-- DETALLE_PEDIDO (Order Details)
-- Only for products (per schema)
-- ============================================================
INSERT INTO Detalle_Pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES
-- Order 1: iPhone 15 Pro Max
(1, 1, 1, 1199.99, 1199.99),

-- Order 2: Samsung Galaxy S24
(2, 12, 1, 799.99, 799.99),

-- Order 3: iPhone 14
(3, 10, 1, 649.99, 649.99),

-- Order 4: MacBook Pro 14
(4, 5, 1, 1999.99, 1999.99),

-- Order 5: MacBook Air 15
(5, 19, 1, 1199.99, 1199.99),

-- Order 6: Samsung Galaxy A55
(6, 13, 1, 399.99, 399.99),

-- Order 7: Samsung Galaxy Z Flip5
(7, 14, 1, 899.99, 899.99),

-- Order 8 (cancelled): Samsung Galaxy Z Fold5
(8, 15, 1, 1499.99, 1499.99);

-- ============================================================
-- CITAS_SERVICIO (Service Appointments)
-- ============================================================
INSERT INTO Citas_Servicio (id_usuario, id_servicio, fecha_cita, marca_dispositivo, modelo_dispositivo, descripcion_problema, estado, diagnostico, costo_final, notas_tecnico) VALUES
-- Completed appointments
(5, 1, '2024-11-15 10:00:00', 'Apple', 'iPhone 13 Pro', 'Pantalla rota por caída', 'completada', 'Pantalla OLED dañada, Face ID funcional', 89.99, 'Se reemplazó pantalla OLED original. True Tone calibrado.'),
(6, 2, '2024-11-18 14:00:00', 'Apple', 'iPhone 12', 'Batería dura muy poco, salud 72%', 'completada', 'Batería degradada, requiere reemplazo', 49.99, 'Batería nueva instalada. Salud 100%.'),
(7, 3, '2024-11-20 11:00:00', 'Samsung', 'Galaxy S22', 'No carga, puerto suelto', 'completada', 'Puerto USB-C dañado', 39.99, 'Puerto reemplazado. Carga rápida verificada.'),

-- In progress
(8, 5, '2024-12-04 10:00:00', 'Apple', 'iPhone X', 'No enciende después de mojarse', 'en_progreso', 'Corrosión en conector batería. Limpieza en proceso.', NULL, NULL),
(9, 7, '2024-12-05 15:00:00', 'Dell', 'XPS 15', 'Teclado no responde algunas teclas', 'en_progreso', NULL, NULL, NULL),

-- Confirmed (upcoming)
(10, 1, '2024-12-10 11:00:00', 'Apple', 'iPhone 14 Pro', 'Pantalla rayada profundamente', 'confirmada', NULL, NULL, NULL),
(11, 8, '2024-12-12 09:00:00', 'Lenovo', 'ThinkPad X1', 'Quiere upgrade a SSD NVMe', 'confirmada', NULL, NULL, NULL),
(5, 4, '2024-12-15 10:00:00', 'Apple', 'iPhone 8 Plus', 'Recuperar fotos, no enciende', 'confirmada', NULL, NULL, NULL),

-- Pending
(12, 2, '2024-12-20 14:00:00', 'Xiaomi', 'Mi 11', 'Batería inflada', 'pendiente', NULL, NULL, NULL),

-- Cancelled
(6, 5, '2024-11-25 10:00:00', 'Samsung', 'Galaxy S21', 'Reparación de placa', 'cancelada', NULL, NULL, 'Cliente decidió comprar teléfono nuevo');

-- ============================================================
-- INVENTARIO_REPARACION (Repair Parts Inventory)
-- ============================================================
INSERT INTO Inventario_Reparacion (nombre, sku, modelo_compatible, stock, stock_minimo, precio_costo, precio_venta, proveedor) VALUES
('Pantalla iPhone 15 Pro Max OLED', 'PNT-IP15PM-OLED', 'iPhone 15 Pro Max', 10, 3, 150.00, 250.00, 'Apple Parts Co'),
('Pantalla iPhone 14 Pro OLED', 'PNT-IP14P-OLED', 'iPhone 14 Pro', 15, 5, 120.00, 200.00, 'Apple Parts Co'),
('Pantalla iPhone 13 OLED', 'PNT-IP13-OLED', 'iPhone 13, iPhone 13 Pro', 20, 5, 80.00, 140.00, 'Apple Parts Co'),
('Pantalla Samsung S24 Ultra AMOLED', 'PNT-S24U-AMOLED', 'Galaxy S24 Ultra', 8, 3, 180.00, 280.00, 'Samsung Parts'),
('Pantalla Samsung S23 AMOLED', 'PNT-S23-AMOLED', 'Galaxy S23', 12, 5, 100.00, 160.00, 'Samsung Parts'),
('Batería iPhone 15 Pro Max', 'BAT-IP15PM', 'iPhone 15 Pro Max', 25, 10, 25.00, 45.00, 'Apple Parts Co'),
('Batería iPhone 14', 'BAT-IP14', 'iPhone 14, iPhone 14 Plus', 30, 10, 20.00, 35.00, 'Apple Parts Co'),
('Batería Samsung S24', 'BAT-S24', 'Galaxy S24, S24+', 20, 8, 18.00, 30.00, 'Samsung Parts'),
('Puerto Lightning iPhone', 'PRT-LGHT', 'iPhone 8-14', 40, 15, 8.00, 18.00, 'Generic Parts'),
('Puerto USB-C Samsung', 'PRT-USBC-SAM', 'Galaxy S20-S24', 35, 15, 6.00, 15.00, 'Generic Parts'),
('Flex botón iPhone 14', 'FLX-BTN-IP14', 'iPhone 14 series', 25, 10, 10.00, 22.00, 'Apple Parts Co'),
('Cámara trasera iPhone 13', 'CAM-IP13-R', 'iPhone 13', 15, 5, 45.00, 75.00, 'Apple Parts Co'),
('Teclado MacBook Pro 14', 'TEC-MBP14', 'MacBook Pro 14 2021-2024', 8, 3, 80.00, 150.00, 'Apple Parts Co'),
('SSD NVMe 1TB', 'SSD-NVME-1TB', 'Universal', 20, 5, 60.00, 100.00, 'Storage Corp'),
('RAM DDR4 16GB', 'RAM-DDR4-16', 'Laptops DDR4', 25, 10, 35.00, 60.00, 'Memory Inc');

-- ============================================================
-- SUSCRIPCIONES (Subscriptions)
-- ============================================================
INSERT INTO Suscripciones (id_usuario, tipo, fecha_inicio, fecha_fin, estado, precio_pagado, auto_renovacion) VALUES
(5, 'mensual', '2024-12-01', '2025-01-01', 'activa', 19.99, true),
(6, 'anual', '2024-06-01', '2025-06-01', 'activa', 149.99, true),
(11, 'mensual', '2024-11-01', '2024-12-01', 'vencida', 19.99, false),
(7, 'vitalicio', '2024-01-15', NULL, 'activa', 499.99, false);

-- ============================================================
-- INSCRIPCIONES (Course Enrollments)
-- ============================================================
INSERT INTO Inscripciones (id_usuario, id_curso, fecha_inscripcion, progreso, completado, fecha_completado, calificacion, estado_pago) VALUES
-- User 5: 2 courses
(5, 1, '2024-10-15', 75, false, NULL, NULL, 'pagado'),
(5, 2, '2024-11-01', 30, false, NULL, NULL, 'pagado'),

-- User 6: Completed course
(6, 1, '2024-09-01', 100, true, '2024-10-15', 5, 'pagado'),
(6, 3, '2024-11-10', 45, false, NULL, NULL, 'pagado'),

-- User 7: 1 course
(7, 1, '2024-11-20', 15, false, NULL, NULL, 'pagado'),

-- User 8: Completed emprendimiento
(8, 9, '2024-08-01', 100, true, '2024-09-15', 5, 'pagado'),

-- User 11: Multiple courses
(11, 1, '2024-10-01', 100, true, '2024-11-20', 4, 'pagado'),
(11, 2, '2024-10-15', 80, false, NULL, NULL, 'pagado'),
(11, 6, '2024-11-01', 20, false, NULL, NULL, 'pagado'),

-- User 12: Pending payment
(12, 1, '2024-12-01', 0, false, NULL, NULL, 'pendiente');

-- ============================================================
-- PAGOS (Payments)
-- ============================================================
INSERT INTO Pagos (id_usuario, tipo_pago, referencia_id, monto, moneda, metodo_pago, estado, referencia_externa, detalles) VALUES
-- Product orders
(5, 'pedido', 1, 1199.99, 'USD', 'tarjeta', 'completado', 'STRIPE_PI_1A2B3C', '{"ultimos4": "4242", "marca": "Visa"}'),
(6, 'pedido', 2, 799.99, 'USD', 'paypal', 'completado', 'PAYPAL_TXN_9X8Y7Z', '{"email": "laura@email.com"}'),
(7, 'pedido', 3, 699.99, 'USD', 'tarjeta', 'completado', 'STRIPE_PI_5E6F7G', '{"ultimos4": "1234", "marca": "Mastercard"}'),
(8, 'pedido', 4, 1799.99, 'USD', 'tarjeta', 'pendiente', NULL, NULL),
(9, 'pedido', 5, 1299.99, 'USD', 'tarjeta', 'completado', 'STRIPE_PI_9I0J1K', '{"ultimos4": "5678", "marca": "Visa"}'),
(10, 'pedido', 6, 399.99, 'USD', 'transferencia', 'pendiente', NULL, NULL),
(11, 'pedido', 7, 899.99, 'USD', 'tarjeta', 'pendiente', NULL, NULL),
(12, 'pedido', 8, 1499.99, 'USD', 'tarjeta', 'reembolsado', 'STRIPE_PI_REFUND', '{"reembolso_fecha": "2024-11-26"}'),

-- Service payments
(5, 'servicio', 1, 89.99, 'USD', 'tarjeta', 'completado', 'STRIPE_PI_SRV001', '{"ultimos4": "4242", "marca": "Visa"}'),
(6, 'servicio', 2, 49.99, 'USD', 'efectivo', 'completado', NULL, '{"recibido_por": "José Martínez"}'),
(7, 'servicio', 3, 39.99, 'USD', 'tarjeta', 'completado', 'STRIPE_PI_SRV003', '{"ultimos4": "1234", "marca": "Mastercard"}'),

-- Course payments
(5, 'curso', 1, 79.99, 'USD', 'tarjeta', 'completado', 'STRIPE_PI_CRS001', '{"ultimos4": "4242", "marca": "Visa"}'),
(5, 'curso', 2, 149.99, 'USD', 'tarjeta', 'completado', 'STRIPE_PI_CRS002', '{"ultimos4": "4242", "marca": "Visa"}'),
(6, 'curso', 1, 79.99, 'USD', 'paypal', 'completado', 'PAYPAL_TXN_CRS001', '{"email": "laura@email.com"}'),
(6, 'curso', 3, 99.99, 'USD', 'paypal', 'completado', 'PAYPAL_TXN_CRS003', '{"email": "laura@email.com"}'),

-- Subscription payments
(5, 'suscripcion', 1, 19.99, 'USD', 'tarjeta', 'completado', 'STRIPE_PI_SUB001', '{"ultimos4": "4242", "marca": "Visa"}'),
(6, 'suscripcion', 2, 149.99, 'USD', 'paypal', 'completado', 'PAYPAL_TXN_SUB002', '{"email": "laura@email.com"}');

-- ============================================================
-- CARRITO (Shopping Cart)
-- ============================================================
INSERT INTO Carrito (id_usuario, session_id, tipo_item, referencia_id, cantidad, precio_unitario) VALUES
-- User 5's cart
(5, NULL, 'producto', 23, 1, 1449.99),  -- ASUS ROG Zephyrus G14
(5, NULL, 'curso', 6, 1, 249.99),  -- Reparación de Laptops

-- User 11's cart
(11, NULL, 'producto', 16, 1, 649.99),  -- Google Pixel 8
(11, NULL, 'servicio', 4, 1, 79.99),  -- Recuperación de datos

-- Anonymous cart 1
(NULL, 'session_abc123def456', 'producto', 9, 1, 849.99),  -- iPhone 15

-- Anonymous cart 2
(NULL, 'session_xyz789ghi012', 'servicio', 1, 1, 89.99),  -- Cambio de pantalla
(NULL, 'session_xyz789ghi012', 'servicio', 2, 1, 49.99);  -- Cambio de batería

-- ============================================================
-- RESENAS (Reviews)
-- ============================================================
INSERT INTO Resenas (id_usuario, tipo, referencia_id, calificacion, titulo, comentario, verificado, aprobado) VALUES
-- Product reviews
(5, 'producto', 1, 5, 'iPhone increíble', 'El iPhone 15 Pro Max es espectacular. La cámara de 48MP toma fotos increíbles y el titanio se siente muy premium.', true, true),
(6, 'producto', 12, 4, 'Muy buen Galaxy', 'El S24 cumple con las expectativas. Galaxy AI es útil aunque algunas funciones requieren internet.', true, true),
(7, 'producto', 5, 5, 'La mejor laptop', 'El MacBook Pro con M3 Pro es una bestia. Edito videos 4K sin problemas.', true, true),
(8, 'producto', 13, 4, 'Excelente gama media', 'El A55 tiene todo: buena cámara, batería todo el día, actualizaciones. Solo falta carga inalámbrica.', true, true),
(11, 'producto', 3, 5, 'Pixel increíble', 'El Pixel 8 Pro tiene la mejor cámara que he visto. Magic Eraser es magia real.', true, true),

-- Service reviews
(5, 'servicio', 1, 5, 'Servicio excelente', 'Cambiaron la pantalla de mi iPhone en menos de 2 horas. Quedó como nuevo.', true, true),
(6, 'servicio', 2, 5, 'Batería nueva', 'Mi iPhone revivió con la batería nueva. Ahora dura todo el día.', true, true),
(7, 'servicio', 3, 4, 'Buen trabajo', 'El puerto de carga quedó perfecto. Recomendado.', true, true),

-- Course reviews
(5, 'curso', 1, 5, 'Curso muy completo', 'Empecé sin saber nada y ahora puedo reparar pantallas y baterías. Excelente instructor.', true, true),
(6, 'curso', 1, 5, 'Excelente para empezar', 'Este curso me dio las bases para mi negocio de reparaciones.', true, true),
(11, 'curso', 1, 4, 'Muy bueno', 'Contenido excelente aunque algunos videos podrían actualizarse.', true, true),
(6, 'curso', 3, 5, 'Diagnóstico real', 'Aprendí a diagnosticar como profesional. Muy recomendado.', true, true),
(8, 'curso', 9, 5, 'Me ayudó a emprender', 'Gracias a este curso tengo mi taller funcionando.', true, true);

-- ============================================================
-- SESIONES (JWT Sessions)
-- ============================================================
INSERT INTO Sesiones (id_usuario, refresh_token, access_token_jti, fecha_expiracion, activo, direccion_ip, user_agent, dispositivo) VALUES
(1, 'refresh_token_admin_001', 'jti_admin_001', NOW() + INTERVAL '7 days', true, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', 'Windows PC'),
(5, 'refresh_token_pedro_001', 'jti_pedro_001', NOW() + INTERVAL '7 days', true, '192.168.1.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/605', 'iPhone'),
(6, 'refresh_token_laura_001', 'jti_laura_001', NOW() + INTERVAL '7 days', true, '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Chrome/120.0', 'MacBook'),
(11, 'refresh_token_andres_001', 'jti_andres_001', NOW() + INTERVAL '7 days', true, '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/120.0', 'Windows PC'),
-- Expired session
(5, 'refresh_token_pedro_expired', 'jti_pedro_expired', NOW() - INTERVAL '1 day', false, '192.168.1.101', 'Mozilla/5.0 (iPhone)', 'iPhone antiguo');

-- ============================================================
-- Update Cursos statistics
-- ============================================================
UPDATE Cursos SET total_lecciones = (
    SELECT COUNT(*) FROM Lecciones WHERE Lecciones.id_curso = Cursos.id_curso
);

UPDATE Cursos SET total_estudiantes = (
    SELECT COUNT(*) FROM Inscripciones WHERE Inscripciones.id_curso = Cursos.id_curso
);

UPDATE Cursos SET calificacion_promedio = COALESCE((
    SELECT ROUND(AVG(calificacion)::numeric, 1)
    FROM Resenas 
    WHERE tipo = 'curso' AND referencia_id = Cursos.id_curso
), 0);

-- ============================================================
-- VERIFICATION
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEED DATA SUMMARY:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Usuarios: %', (SELECT COUNT(*) FROM Usuarios);
    RAISE NOTICE '  - Admins: %', (SELECT COUNT(*) FROM Usuarios WHERE id_rol = 1);
    RAISE NOTICE '  - Clientes: %', (SELECT COUNT(*) FROM Usuarios WHERE id_rol = 2);
    RAISE NOTICE '  - Tecnicos: %', (SELECT COUNT(*) FROM Usuarios WHERE id_rol = 3);
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Productos: %', (SELECT COUNT(*) FROM Productos);
    RAISE NOTICE '  - Smartphones: %', (SELECT COUNT(*) FROM Productos WHERE id_categoria = 1);
    RAISE NOTICE '  - Laptops: %', (SELECT COUNT(*) FROM Productos WHERE id_categoria = 2);
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Servicios: %', (SELECT COUNT(*) FROM Servicios);
    RAISE NOTICE 'Citas servicio: %', (SELECT COUNT(*) FROM Citas_Servicio);
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Cursos: %', (SELECT COUNT(*) FROM Cursos);
    RAISE NOTICE 'Lecciones: %', (SELECT COUNT(*) FROM Lecciones);
    RAISE NOTICE 'Inscripciones: %', (SELECT COUNT(*) FROM Inscripciones);
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Pedidos: %', (SELECT COUNT(*) FROM Pedidos);
    RAISE NOTICE 'Detalles pedido: %', (SELECT COUNT(*) FROM Detalle_Pedido);
    RAISE NOTICE 'Pagos: %', (SELECT COUNT(*) FROM Pagos);
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Items carrito: %', (SELECT COUNT(*) FROM Carrito);
    RAISE NOTICE 'Resenas: %', (SELECT COUNT(*) FROM Resenas);
    RAISE NOTICE 'Sesiones: %', (SELECT COUNT(*) FROM Sesiones);
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Inventario piezas: %', (SELECT COUNT(*) FROM Inventario_Reparacion);
    RAISE NOTICE 'Suscripciones: %', (SELECT COUNT(*) FROM Suscripciones);
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Seed data loaded successfully!';
    RAISE NOTICE '========================================';
END $$;