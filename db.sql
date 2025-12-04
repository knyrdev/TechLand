-- ============================================================
-- TechLand Database Schema for PostgreSQL
-- Digital devices (Phones/Laptops), Repair Services & Courses
-- ============================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS Detalle_Reparacion CASCADE;
DROP TABLE IF EXISTS Inventario_Reparacion CASCADE;
DROP TABLE IF EXISTS Pagos CASCADE;
DROP TABLE IF EXISTS Inscripciones CASCADE;
DROP TABLE IF EXISTS Suscripciones CASCADE;
DROP TABLE IF EXISTS Cursos CASCADE;
DROP TABLE IF EXISTS Lecciones CASCADE;
DROP TABLE IF EXISTS Citas_Servicio CASCADE;
DROP TABLE IF EXISTS Servicios CASCADE;
DROP TABLE IF EXISTS Detalle_Pedido CASCADE;
DROP TABLE IF EXISTS Pedidos CASCADE;
DROP TABLE IF EXISTS Productos CASCADE;
DROP TABLE IF EXISTS Categorias_Producto CASCADE;
DROP TABLE IF EXISTS Imagenes CASCADE;
DROP TABLE IF EXISTS Sesiones CASCADE;
DROP TABLE IF EXISTS Usuarios CASCADE;
DROP TABLE IF EXISTS Roles CASCADE;

-- ============================================================
-- 1. Core Tables
-- ============================================================

-- Roles table (Admin, Client, Technician)
CREATE TABLE Roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO Roles (nombre_rol, descripcion) VALUES 
    ('admin', 'System administrator with full access'),
    ('cliente', 'Regular customer who can buy products and services'),
    ('tecnico', 'Repair technician who handles service appointments');

-- Users table
CREATE TABLE Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    avatar_url VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_conexion TIMESTAMP,
    id_rol INTEGER NOT NULL DEFAULT 2,
    FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
);

-- Create index for faster email lookups
CREATE INDEX idx_usuarios_email ON Usuarios(email);
CREATE INDEX idx_usuarios_rol ON Usuarios(id_rol);

-- Sessions table (for JWT refresh tokens)
CREATE TABLE Sesiones (
    id_sesion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    refresh_token VARCHAR(500) NOT NULL UNIQUE,
    access_token_jti VARCHAR(100), -- JWT ID for access token invalidation
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    direccion_ip VARCHAR(50),
    user_agent TEXT,
    dispositivo VARCHAR(100),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

CREATE INDEX idx_sesiones_usuario ON Sesiones(id_usuario);
CREATE INDEX idx_sesiones_refresh_token ON Sesiones(refresh_token);

-- Generic images table (reusable for products, courses, etc.)
CREATE TABLE Imagenes (
    id_imagen SERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    tipo VARCHAR(50) NOT NULL, -- 'producto', 'curso', 'servicio', 'usuario'
    referencia_id INTEGER NOT NULL, -- ID of the related entity
    es_principal BOOLEAN DEFAULT FALSE,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_imagenes_tipo_ref ON Imagenes(tipo, referencia_id);

-- ============================================================
-- 2. Product Management (Smartphones & Laptops)
-- ============================================================

-- Product categories
CREATE TABLE Categorias_Producto (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO Categorias_Producto (nombre, slug, descripcion, icono) VALUES 
    ('Smartphones', 'smartphones', 'Teléfonos inteligentes de última generación', 'bi-phone'),
    ('Laptops', 'laptops', 'Computadoras portátiles para trabajo y gaming', 'bi-laptop'),
    ('Accesorios', 'accesorios', 'Fundas, cargadores y accesorios varios', 'bi-headphones');

-- Products table (Smartphones and Laptops)
CREATE TABLE Productos (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    descripcion_corta VARCHAR(500),
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    precio_oferta NUMERIC(10, 2) CHECK (precio_oferta >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku VARCHAR(100) UNIQUE,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    especificaciones JSONB, -- Flexible specs storage
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    id_categoria INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES Categorias_Producto(id_categoria)
);

CREATE INDEX idx_productos_categoria ON Productos(id_categoria);
CREATE INDEX idx_productos_slug ON Productos(slug);
CREATE INDEX idx_productos_activo ON Productos(activo);
CREATE INDEX idx_productos_destacado ON Productos(destacado);

-- Insert sample products
INSERT INTO Productos (nombre, slug, descripcion, descripcion_corta, precio, stock, sku, marca, modelo, especificaciones, destacado, id_categoria) VALUES
    ('iPhone 15 Pro Max', 'iphone-15-pro-max', 
     'El iPhone 15 Pro Max cuenta con el chip A17 Pro, el más potente jamás creado. Con un sistema de cámara profesional y titanio de grado aeroespacial.',
     'Smartphone premium con chip A17 Pro y cámara de 48MP',
     1199.99, 25, 'APL-IP15PM-256', 'Apple', 'iPhone 15 Pro Max',
     '{"pantalla": "6.7 pulgadas Super Retina XDR", "procesador": "A17 Pro", "ram": "8GB", "almacenamiento": "256GB", "camara": "48MP + 12MP + 12MP", "bateria": "4422mAh"}',
     true, 1),
    ('Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra',
     'Galaxy S24 Ultra con Galaxy AI integrado. El smartphone más inteligente de Samsung con S Pen incluido y cámara de 200MP.',
     'Flagship Android con Galaxy AI y cámara de 200MP',
     1299.99, 20, 'SAM-S24U-256', 'Samsung', 'Galaxy S24 Ultra',
     '{"pantalla": "6.8 pulgadas Dynamic AMOLED 2X", "procesador": "Snapdragon 8 Gen 3", "ram": "12GB", "almacenamiento": "256GB", "camara": "200MP + 12MP + 50MP + 10MP", "bateria": "5000mAh"}',
     true, 1),
    ('Google Pixel 8 Pro', 'google-pixel-8-pro',
     'Pixel 8 Pro con el mejor procesador Tensor G3 de Google y 7 años de actualizaciones garantizadas.',
     'La mejor experiencia Android pura con IA de Google',
     999.99, 15, 'GOO-P8P-128', 'Google', 'Pixel 8 Pro',
     '{"pantalla": "6.7 pulgadas LTPO OLED", "procesador": "Google Tensor G3", "ram": "12GB", "almacenamiento": "128GB", "camara": "50MP + 48MP + 48MP", "bateria": "5050mAh"}',
     true, 1),
    ('Xiaomi 14 Ultra', 'xiaomi-14-ultra',
     'Xiaomi 14 Ultra con lentes Leica y el sistema de cámaras más avanzado en un smartphone.',
     'Fotografía profesional con lentes Leica',
     1099.99, 18, 'XIA-14U-512', 'Xiaomi', '14 Ultra',
     '{"pantalla": "6.73 pulgadas LTPO AMOLED", "procesador": "Snapdragon 8 Gen 3", "ram": "16GB", "almacenamiento": "512GB", "camara": "50MP Leica Quad", "bateria": "5000mAh"}',
     false, 1),
    ('MacBook Pro 14" M3 Pro', 'macbook-pro-14-m3-pro',
     'MacBook Pro de 14 pulgadas con chip M3 Pro. Potencia profesional para desarrolladores, creativos y científicos de datos.',
     'Laptop profesional con chip Apple Silicon M3 Pro',
     1999.99, 12, 'APL-MBP14-M3P', 'Apple', 'MacBook Pro 14"',
     '{"pantalla": "14.2 pulgadas Liquid Retina XDR", "procesador": "Apple M3 Pro", "ram": "18GB", "almacenamiento": "512GB SSD", "gpu": "14-core GPU", "bateria": "Hasta 17 horas"}',
     true, 2),
    ('Dell XPS 15', 'dell-xps-15',
     'Dell XPS 15 con pantalla OLED 3.5K y procesador Intel Core Ultra 7. El equilibrio perfecto entre potencia y portabilidad.',
     'Ultrabook premium con pantalla OLED 3.5K',
     1799.99, 10, 'DEL-XPS15-I7', 'Dell', 'XPS 15 9530',
     '{"pantalla": "15.6 pulgadas OLED 3.5K", "procesador": "Intel Core Ultra 7", "ram": "32GB", "almacenamiento": "1TB SSD", "gpu": "NVIDIA RTX 4060", "bateria": "Hasta 13 horas"}',
     true, 2),
    ('ASUS ROG Zephyrus G16', 'asus-rog-zephyrus-g16',
     'Laptop gaming ultradelgada con RTX 4070 y pantalla OLED de 240Hz. Gaming sin compromisos.',
     'Gaming laptop ultradelgada con RTX 4070',
     2199.99, 8, 'ASU-ROGZ16-4070', 'ASUS', 'ROG Zephyrus G16',
     '{"pantalla": "16 pulgadas OLED 240Hz", "procesador": "Intel Core Ultra 9", "ram": "32GB", "almacenamiento": "1TB SSD", "gpu": "NVIDIA RTX 4070", "bateria": "Hasta 10 horas"}',
     false, 2),
    ('Lenovo ThinkPad X1 Carbon', 'lenovo-thinkpad-x1-carbon',
     'ThinkPad X1 Carbon Gen 11, la laptop empresarial más ligera de su clase con seguridad de nivel empresarial.',
     'Laptop empresarial ultraligera y segura',
     1649.99, 15, 'LEN-X1C-G11', 'Lenovo', 'ThinkPad X1 Carbon Gen 11',
     '{"pantalla": "14 pulgadas 2.8K OLED", "procesador": "Intel Core i7-1365U", "ram": "16GB", "almacenamiento": "512GB SSD", "gpu": "Intel Iris Xe", "bateria": "Hasta 15 horas"}',
     false, 2);

-- ============================================================
-- 3. Orders Management
-- ============================================================

-- Orders table
CREATE TABLE Pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    subtotal NUMERIC(10, 2) NOT NULL,
    impuesto NUMERIC(10, 2) NOT NULL DEFAULT 0,
    descuento NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    direccion_envio TEXT,
    notas TEXT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

CREATE INDEX idx_pedidos_usuario ON Pedidos(id_usuario);
CREATE INDEX idx_pedidos_estado ON Pedidos(estado);
CREATE INDEX idx_pedidos_numero ON Pedidos(numero_pedido);

-- Order details
CREATE TABLE Detalle_Pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    UNIQUE (id_pedido, id_producto)
);

-- ============================================================
-- 4. Repair Services Management
-- ============================================================

-- Services catalog
CREATE TABLE Servicios (
    id_servicio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    descripcion_corta VARCHAR(500),
    precio_base NUMERIC(10, 2) NOT NULL CHECK (precio_base >= 0),
    duracion_estimada INTEGER, -- In minutes
    tipo_dispositivo VARCHAR(50) NOT NULL, -- 'smartphone', 'laptop', 'ambos'
    activo BOOLEAN DEFAULT TRUE,
    icono VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_servicios_slug ON Servicios(slug);
CREATE INDEX idx_servicios_tipo ON Servicios(tipo_dispositivo);

-- Insert default repair services
INSERT INTO Servicios (nombre, slug, descripcion, descripcion_corta, precio_base, duracion_estimada, tipo_dispositivo, icono) VALUES
    ('Cambio de Pantalla', 'cambio-pantalla', 
     'Reemplazo completo de pantalla dañada por una original o de alta calidad. Incluye el display LCD/OLED y el cristal táctil.',
     'Reemplazo de pantalla LCD/OLED con cristal táctil',
     89.99, 60, 'smartphone', 'bi-phone'),
    ('Cambio de Batería', 'cambio-bateria',
     'Sustitución de batería agotada o hinchada por una nueva de alta capacidad. Mejora la autonomía de tu dispositivo.',
     'Cambio de batería por una nueva de alta capacidad',
     49.99, 30, 'ambos', 'bi-battery-charging'),
    ('Reparación de Puerto de Carga', 'reparacion-puerto-carga',
     'Reparación o reemplazo del puerto de carga dañado. Soluciona problemas de carga lenta o intermitente.',
     'Reparación del conector de carga USB-C/Lightning',
     39.99, 45, 'ambos', 'bi-plug'),
    ('Recuperación de Datos', 'recuperacion-datos',
     'Recuperación de datos de dispositivos dañados o que no encienden. Fotos, contactos, mensajes y más.',
     'Rescate de información de dispositivos dañados',
     79.99, 120, 'ambos', 'bi-hdd'),
    ('Reparación de Placa Base', 'reparacion-placa-base',
     'Diagnóstico y reparación de problemas en la placa base. Microsoldadura de componentes SMD.',
     'Microsoldadura y reparación de componentes',
     129.99, 180, 'ambos', 'bi-cpu'),
    ('Limpieza por Daño de Líquidos', 'limpieza-liquidos',
     'Limpieza ultrasónica y tratamiento anticorrosión para dispositivos con daño por agua u otros líquidos.',
     'Tratamiento para dispositivos mojados',
     69.99, 90, 'ambos', 'bi-droplet'),
    ('Cambio de Teclado Laptop', 'cambio-teclado-laptop',
     'Reemplazo completo del teclado de tu laptop. Soluciona teclas que no funcionan o teclados dañados.',
     'Sustitución de teclado completo',
     99.99, 60, 'laptop', 'bi-keyboard'),
    ('Upgrade de RAM/SSD', 'upgrade-ram-ssd',
     'Ampliación de memoria RAM o cambio a disco SSD. Mejora drásticamente el rendimiento de tu laptop.',
     'Mejora de memoria y almacenamiento',
     29.99, 45, 'laptop', 'bi-memory');

-- Service appointments
CREATE TABLE Citas_Servicio (
    id_cita SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_servicio INTEGER NOT NULL,
    numero_cita VARCHAR(50) UNIQUE NOT NULL,
    fecha_cita TIMESTAMP NOT NULL,
    marca_dispositivo VARCHAR(100) NOT NULL,
    modelo_dispositivo VARCHAR(100) NOT NULL,
    descripcion_problema TEXT,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente', -- pendiente, confirmada, en_progreso, completada, cancelada
    diagnostico TEXT,
    costo_final NUMERIC(10, 2),
    fecha_entrega_estimada TIMESTAMP,
    notas_tecnico TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_servicio) REFERENCES Servicios(id_servicio)
);

CREATE INDEX idx_citas_usuario ON Citas_Servicio(id_usuario);
CREATE INDEX idx_citas_servicio ON Citas_Servicio(id_servicio);
CREATE INDEX idx_citas_estado ON Citas_Servicio(estado);
CREATE INDEX idx_citas_fecha ON Citas_Servicio(fecha_cita);

-- ============================================================
-- 5. Repair Parts Inventory
-- ============================================================

CREATE TABLE Inventario_Reparacion (
    id_pieza SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    modelo_compatible VARCHAR(255),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_minimo INTEGER DEFAULT 5,
    precio_costo NUMERIC(10, 2) CHECK (precio_costo >= 0),
    precio_venta NUMERIC(10, 2) CHECK (precio_venta >= 0),
    proveedor VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventario_sku ON Inventario_Reparacion(sku);

-- Parts used in repairs
CREATE TABLE Detalle_Reparacion (
    id_detalle SERIAL PRIMARY KEY,
    id_cita INTEGER NOT NULL,
    id_pieza INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    costo_unitario NUMERIC(10, 2) NOT NULL,
    FOREIGN KEY (id_cita) REFERENCES Citas_Servicio(id_cita) ON DELETE CASCADE,
    FOREIGN KEY (id_pieza) REFERENCES Inventario_Reparacion(id_pieza),
    UNIQUE (id_cita, id_pieza)
);

-- ============================================================
-- 6. Phone Repair Courses
-- ============================================================

-- Courses table
CREATE TABLE Cursos (
    id_curso SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    descripcion_corta VARCHAR(500),
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    precio_oferta NUMERIC(10, 2) CHECK (precio_oferta >= 0),
    duracion_horas INTEGER,
    nivel VARCHAR(50) NOT NULL, -- principiante, intermedio, avanzado
    instructor VARCHAR(100),
    instructor_bio TEXT,
    requisitos TEXT,
    que_aprenderas TEXT[], -- Array of learning outcomes
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    total_lecciones INTEGER DEFAULT 0,
    total_estudiantes INTEGER DEFAULT 0,
    calificacion_promedio NUMERIC(2,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cursos_slug ON Cursos(slug);
CREATE INDEX idx_cursos_nivel ON Cursos(nivel);
CREATE INDEX idx_cursos_activo ON Cursos(activo);
CREATE INDEX idx_cursos_destacado ON Cursos(destacado);

-- Course lessons
CREATE TABLE Lecciones (
    id_leccion SERIAL PRIMARY KEY,
    id_curso INTEGER NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    duracion_minutos INTEGER,
    orden INTEGER NOT NULL,
    video_url VARCHAR(500),
    contenido TEXT,
    es_gratuita BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso) ON DELETE CASCADE
);

CREATE INDEX idx_lecciones_curso ON Lecciones(id_curso);

-- Insert phone repair courses
INSERT INTO Cursos (titulo, slug, descripcion, descripcion_corta, precio, duracion_horas, nivel, instructor, instructor_bio, requisitos, que_aprenderas, destacado) VALUES
    ('Reparación de Smartphones: Nivel Básico', 'reparacion-smartphones-basico',
     'Curso completo para principiantes que desean adentrarse en el mundo de la reparación de teléfonos móviles. Aprenderás desde el uso correcto de herramientas hasta las reparaciones más comunes como cambio de pantalla y batería.',
     'Aprende las bases de la reparación de celulares desde cero',
     79.99, 20, 'principiante', 'Carlos Mendoza',
     'Técnico certificado con más de 10 años de experiencia en reparación de dispositivos móviles. Fundador de TechRepair Academy.',
     'No se requiere experiencia previa. Solo necesitas ganas de aprender y un kit básico de herramientas.',
     ARRAY['Identificar componentes internos de smartphones', 'Usar herramientas de reparación correctamente', 'Realizar cambios de pantalla y batería', 'Diagnosticar fallas comunes', 'Aplicar medidas de seguridad ESD'],
     true),
    ('Microsoldadura para Reparación de Celulares', 'microsoldadura-celulares',
     'Domina las técnicas de microsoldadura necesarias para reparaciones avanzadas de teléfonos. Desde el uso del microscopio y estación de soldadura hasta reemplazo de chips y conectores.',
     'Técnicas avanzadas de soldadura SMD para móviles',
     149.99, 35, 'avanzado', 'Roberto Sánchez',
     'Ingeniero electrónico especializado en microsoldadura. Instructor certificado con experiencia en centros de servicio autorizados.',
     'Conocimientos básicos de electrónica y experiencia previa en reparación de celulares.',
     ARRAY['Usar microscopio y estación de soldadura', 'Soldar y desoldar componentes SMD', 'Reparar circuitos de carga', 'Reemplazar chips de memoria y procesadores', 'Leer esquemáticos y diagramas'],
     true),
    ('Diagnóstico de Fallas en Smartphones', 'diagnostico-fallas-smartphones',
     'Aprende a diagnosticar correctamente cualquier falla en smartphones. Desde problemas de software hasta daños de hardware, este curso te convertirá en un experto en detección de problemas.',
     'Conviértete en experto en diagnóstico de fallas',
     99.99, 25, 'intermedio', 'Ana García',
     'Técnica especialista en diagnóstico con experiencia en Samsung y Apple. Formadora de técnicos para cadenas de retail.',
     'Conocimientos básicos de reparación de celulares recomendados.',
     ARRAY['Usar software de diagnóstico profesional', 'Identificar fallas de hardware con multímetro', 'Diagnosticar problemas de señal y WiFi', 'Detectar daños por agua', 'Crear reportes de diagnóstico profesionales'],
     true),
    ('Reparación de iPhones: Guía Completa', 'reparacion-iphones-completa',
     'Especialízate en la reparación de dispositivos Apple. Desde iPhone 8 hasta los últimos modelos, aprenderás las técnicas específicas y consideraciones especiales para reparar iPhones.',
     'Especialización en reparación de dispositivos Apple',
     129.99, 30, 'intermedio', 'Miguel Torres',
     'Ex-técnico de Apple con certificación ACMT. Especialista en dispositivos iOS con más de 8 años de experiencia.',
     'Experiencia básica en reparación de smartphones recomendada.',
     ARRAY['Reparar pantallas de iPhone (OLED y LCD)', 'Calibrar Face ID y Touch ID', 'Trabajar con baterías originales y aftermarket', 'Solucionar problemas de software iOS', 'Manejar herramientas especializadas para Apple'],
     false),
    ('Emprendimiento en Reparación de Celulares', 'emprendimiento-reparacion',
     'Más allá de las habilidades técnicas, este curso te enseña cómo montar y hacer crecer tu propio negocio de reparación de celulares. Marketing, atención al cliente y gestión de inventario.',
     'Aprende a crear tu propio negocio de reparación',
     89.99, 15, 'principiante', 'Laura Vega',
     'Empresaria con cadena de 5 tiendas de reparación. Mentora de nuevos emprendedores en el sector de tecnología.',
     'Interés en emprender. No se requieren conocimientos técnicos profundos.',
     ARRAY['Crear un plan de negocio viable', 'Seleccionar ubicación y equipamiento', 'Gestionar inventario de repuestos', 'Estrategias de marketing digital', 'Atención al cliente y garantías'],
     false);

-- ============================================================
-- 7. Subscriptions & Enrollments
-- ============================================================

-- Subscriptions (for course access)
CREATE TABLE Suscripciones (
    id_suscripcion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'mensual', 'anual', 'vitalicio'
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    estado VARCHAR(50) NOT NULL DEFAULT 'activa', -- activa, inactiva, cancelada, vencida
    precio_pagado NUMERIC(10, 2),
    auto_renovacion BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

CREATE INDEX idx_suscripciones_usuario ON Suscripciones(id_usuario);
CREATE INDEX idx_suscripciones_estado ON Suscripciones(estado);

-- Course enrollments
CREATE TABLE Inscripciones (
    id_inscripcion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_curso INTEGER NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progreso INTEGER DEFAULT 0, -- Percentage 0-100
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado TIMESTAMP,
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    estado_pago VARCHAR(50) NOT NULL DEFAULT 'pendiente', -- pagado, pendiente
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso),
    UNIQUE (id_usuario, id_curso)
);

CREATE INDEX idx_inscripciones_usuario ON Inscripciones(id_usuario);
CREATE INDEX idx_inscripciones_curso ON Inscripciones(id_curso);

-- ============================================================
-- 8. Payments
-- ============================================================

CREATE TABLE Pagos (
    id_pago SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    tipo_pago VARCHAR(50) NOT NULL, -- 'pedido', 'servicio', 'curso', 'suscripcion'
    referencia_id INTEGER NOT NULL, -- ID of the related entity
    monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    moneda VARCHAR(10) DEFAULT 'USD',
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50) NOT NULL, -- 'tarjeta', 'paypal', 'transferencia', 'efectivo'
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente', -- completado, pendiente, fallido, reembolsado
    referencia_externa VARCHAR(255), -- Payment gateway transaction ID
    detalles JSONB, -- Additional payment details
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

CREATE INDEX idx_pagos_usuario ON Pagos(id_usuario);
CREATE INDEX idx_pagos_tipo ON Pagos(tipo_pago, referencia_id);
CREATE INDEX idx_pagos_estado ON Pagos(estado);

-- ============================================================
-- 9. Shopping Cart (Persistent)
-- ============================================================

CREATE TABLE Carrito (
    id_carrito SERIAL PRIMARY KEY,
    id_usuario INTEGER,
    session_id VARCHAR(255), -- For anonymous users
    tipo_item VARCHAR(50) NOT NULL, -- 'producto', 'curso', 'servicio'
    referencia_id INTEGER NOT NULL,
    cantidad INTEGER DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

CREATE INDEX idx_carrito_usuario ON Carrito(id_usuario);
CREATE INDEX idx_carrito_session ON Carrito(session_id);

-- ============================================================
-- 10. Reviews & Ratings
-- ============================================================

CREATE TABLE Resenas (
    id_resena SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'producto', 'curso', 'servicio'
    referencia_id INTEGER NOT NULL,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    titulo VARCHAR(255),
    comentario TEXT,
    verificado BOOLEAN DEFAULT FALSE,
    aprobado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    UNIQUE(id_usuario, tipo, referencia_id)
);

CREATE INDEX idx_resenas_tipo ON Resenas(tipo, referencia_id);

-- ============================================================
-- 11. Useful Views
-- ============================================================

-- View for products with category info
CREATE OR REPLACE VIEW v_productos_completos AS
SELECT 
    p.*,
    c.nombre as categoria_nombre,
    c.slug as categoria_slug,
    c.icono as categoria_icono
FROM Productos p
JOIN Categorias_Producto c ON p.id_categoria = c.id_categoria
WHERE p.activo = true;

-- View for active services
CREATE OR REPLACE VIEW v_servicios_activos AS
SELECT * FROM Servicios WHERE activo = true ORDER BY precio_base;

-- View for featured courses
CREATE OR REPLACE VIEW v_cursos_destacados AS
SELECT * FROM Cursos WHERE activo = true AND destacado = true;

-- ============================================================
-- 12. Functions & Triggers
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON Productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON Cursos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON Citas_Servicio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_pedido = 'ORD-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEW.id_pedido::text, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate appointment number
CREATE OR REPLACE FUNCTION generate_appointment_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_cita = 'SRV-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(NEW.id_cita::text, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_appointment_number BEFORE INSERT ON Citas_Servicio
    FOR EACH ROW EXECUTE FUNCTION generate_appointment_number();