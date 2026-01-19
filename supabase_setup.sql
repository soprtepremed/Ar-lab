-- =====================================================
-- AR LAB - Script de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Crear tabla de usuarios (si no existe)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    rol VARCHAR(20) DEFAULT 'operador',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crear tabla de citas (si no existe)
CREATE TABLE IF NOT EXISTS citas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_nombre VARCHAR(200) NOT NULL,
    paciente_telefono VARCHAR(20),
    paciente_email VARCHAR(100),
    fecha_hora TIMESTAMP NOT NULL,
    tipo_servicio VARCHAR(50) DEFAULT 'laboratorio',
    notas TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    creado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_hora);

-- 4. Insertar usuario administrador
INSERT INTO usuarios (usuario, password, rol) 
VALUES ('ADOLFO RUIZ', '9611062651', 'admin')
ON CONFLICT (usuario) DO UPDATE SET password = '9611062651', rol = 'admin';

-- 5. Habilitar acceso público a las tablas (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY IF NOT EXISTS "Permitir lectura de usuarios" ON usuarios FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Permitir todo en citas" ON citas FOR ALL USING (true);
