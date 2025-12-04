-- Script SQL para PostgreSQL basado en el Modelo ER

-- ----------------------------------------------------
-- 1. Gestión de Usuarios y Autenticación
-- ----------------------------------------------------

-- Tabla de Roles (para control de acceso: Administrador, Cliente, Técnico)
CREATE TABLE Roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de Usuarios
CREATE TABLE Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Almacena el hash de la contraseña
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    id_rol INTEGER NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
);

-- Tabla de Sesiones (para gestión de Refresh Tokens en JWT)
CREATE TABLE Sesiones (
    id_sesion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    activo BOOLEAN DEFAULT TRUE, -- TRUE: Válido, FALSE: Revocado/Cerrado
    direccion_ip VARCHAR(50),
    user_agent TEXT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- ----------------------------------------------------
-- 2. Gestión de Productos (Venta)
-- ----------------------------------------------------

-- Tabla de Productos (Smartphones y Laptops)
CREATE TABLE Productos (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    activo BOOLEAN DEFAULT TRUE,
    tipo_producto VARCHAR(50) NOT NULL -- 'Smartphone' o 'Laptop'
);

-- Tabla de Pedidos
CREATE TABLE Pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    fecha_pedido TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado_pedido VARCHAR(50) NOT NULL, -- 'Pendiente', 'Enviado', 'Completado', 'Cancelado'
    total NUMERIC(10, 2) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- Tabla de Detalle de Pedido (para la relación M:N entre Pedidos y Productos)
CREATE TABLE Detalle_Pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL, -- Precio al momento de la compra
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    UNIQUE (id_pedido, id_producto) -- Evita duplicados en el mismo pedido
);

-- ----------------------------------------------------
-- 3. Gestión de Servicios de Reparación
-- ----------------------------------------------------

-- Tabla de Servicios ofrecidos
CREATE TABLE Servicios (
    id_servicio SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_base NUMERIC(10, 2) NOT NULL CHECK (precio_base >= 0),
    duracion_estimada INTEGER -- En minutos
);

-- Tabla de Citas para el Servicio de Reparación
CREATE TABLE Citas_Servicio (
    id_cita SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    fecha_hora_cita TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    dispositivo_modelo VARCHAR(100) NOT NULL,
    descripcion_falla TEXT,
    estado_reparacion VARCHAR(50) NOT NULL, -- 'Pendiente', 'En Progreso', 'Listo para Entrega', 'Finalizado'
    costo_final NUMERIC(10, 2) CHECK (costo_final >= 0),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- ----------------------------------------------------
-- 4. Gestión de Cursos de Reparación y Suscripciones
-- ----------------------------------------------------

-- Tabla de Cursos
CREATE TABLE Cursos (
    id_curso SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    duracion_horas INTEGER,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de Suscripciones (acceso a cursos)
CREATE TABLE Suscripciones (
    id_suscripcion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    nombre_suscripcion VARCHAR(100) NOT NULL, -- e.g., 'Mensual', 'Anual'
    fecha_inicio TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP WITHOUT TIME ZONE, -- NULL si es de por vida
    estado VARCHAR(50) NOT NULL, -- 'Activa', 'Inactiva', 'Vencida'
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- Tabla de Inscripciones (relación M:N entre Usuarios y Cursos)
CREATE TABLE Inscripciones (
    id_inscripcion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_curso INTEGER NOT NULL,
    fecha_inscripcion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado_pago VARCHAR(50) NOT NULL, -- 'Pagado', 'Pendiente' (depende de Suscripciones)
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso),
    UNIQUE (id_usuario, id_curso) -- Un usuario solo se inscribe una vez por curso
);

-- ----------------------------------------------------
-- 5. Gestión de Pagos y Transacciones
-- ----------------------------------------------------

-- Tabla de Pagos
CREATE TABLE Pagos (
    id_pago SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    fecha_pago TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50) NOT NULL, -- 'Tarjeta', 'PayPal', etc.
    estado_pago VARCHAR(50) NOT NULL, -- 'Completado', 'Fallido', 'Reembolsado'
    referencia_transaccion VARCHAR(255), -- ID de la pasarela de pago
    id_pedido INTEGER,
    id_suscripcion INTEGER,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido),
    FOREIGN KEY (id_suscripcion) REFERENCES Suscripciones(id_suscripcion),
    -- Restricción de Integridad: Debe estar relacionado con un Pedido o una Suscripción
    CHECK (
        (id_pedido IS NOT NULL AND id_suscripcion IS NULL) OR
        (id_pedido IS NULL AND id_suscripcion IS NOT NULL)
    )
);

-- ----------------------------------------------------
-- 6. Consideraciones Adicionales (Inventario de Piezas)
-- ----------------------------------------------------

-- Tabla de Inventario de Piezas de Repuesto
CREATE TABLE Inventario_Reparacion (
    id_pieza SERIAL PRIMARY KEY,
    nombre_pieza VARCHAR(100) NOT NULL,
    modelo_compatible VARCHAR(100), -- e.g., 'iPhone X', 'MacBook Air M1'
    stock INTEGER NOT NULL CHECK (stock >= 0),
    precio_costo NUMERIC(10, 2) CHECK (precio_costo >= 0),
    precio_venta_sugerido NUMERIC(10, 2) CHECK (precio_venta_sugerido >= 0)
);

-- Tabla de Detalle de Reparación (para registrar qué piezas se usaron en una cita)
CREATE TABLE Detalle_Reparacion (
    id_detalle_rep SERIAL PRIMARY KEY,
    id_cita INTEGER NOT NULL,
    id_pieza INTEGER NOT NULL,
    cantidad_usada INTEGER NOT NULL CHECK (cantidad_usada > 0),
    costo_pieza_al_momento NUMERIC(10, 2) NOT NULL,
    FOREIGN KEY (id_cita) REFERENCES Citas_Servicio(id_cita),
    FOREIGN KEY (id_pieza) REFERENCES Inventario_Reparacion(id_pieza),
    UNIQUE (id_cita, id_pieza)
);