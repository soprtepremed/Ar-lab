-- =====================================================
-- AR LAB - SCRIPT DE VERIFICACIÓN Y CREACIÓN COMPLETA
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. TABLA: usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    rol VARCHAR(20) DEFAULT 'operador',
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. TABLA: estudios_laboratorio
-- =====================================================
CREATE TABLE IF NOT EXISTS estudios_laboratorio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    categoria VARCHAR(100),
    descripcion TEXT,
    precio DECIMAL(10,2),
    tiempo_entrega VARCHAR(50),
    requiere_ayuno BOOLEAN DEFAULT false,
    indicaciones TEXT,
    tipo_muestra VARCHAR(100),
    metodologia VARCHAR(200),
    tubo_recipiente VARCHAR(150),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. TABLA: medicos_referentes
-- =====================================================
CREATE TABLE IF NOT EXISTS medicos_referentes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    especialidad VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. TABLA: citas (EXTENDIDA)
-- =====================================================
CREATE TABLE IF NOT EXISTS citas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_nombre VARCHAR(200) NOT NULL,
    paciente_telefono VARCHAR(20),
    paciente_email VARCHAR(100),
    fecha_hora TIMESTAMP NOT NULL,
    tipo_servicio VARCHAR(50) DEFAULT 'laboratorio',
    notas TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    
    -- Campos extendidos del paciente
    primer_nombre VARCHAR(100),
    segundo_nombre VARCHAR(100),
    primer_apellido VARCHAR(100),
    segundo_apellido VARCHAR(100),
    fecha_nacimiento DATE,
    diagnostico TEXT,
    
    -- Campos de pago
    total DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    pagado DECIMAL(10,2),
    metodo_pago VARCHAR(50),
    folio_venta INTEGER,
    
    -- Médico referente
    medico_referente_nombre VARCHAR(200),
    
    creado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. TABLA: citas_estudios (RELACIÓN)
-- =====================================================
CREATE TABLE IF NOT EXISTS citas_estudios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cita_id UUID REFERENCES citas(id) ON DELETE CASCADE,
    estudio_id UUID REFERENCES estudios_laboratorio(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. TABLA: configuracion_laboratorio
-- =====================================================
CREATE TABLE IF NOT EXISTS configuracion_laboratorio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_laboratorio VARCHAR(200) DEFAULT 'Ar Lab',
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    responsable_sanitario VARCHAR(200),
    cedula_profesional VARCHAR(50),
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. TABLA: resultados_laboratorio
-- =====================================================
CREATE TABLE IF NOT EXISTS resultados_laboratorio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cita_id UUID REFERENCES citas(id),
    estudio_id UUID REFERENCES estudios_laboratorio(id),
    resultado VARCHAR(200),
    unidades VARCHAR(50),
    valor_referencia TEXT,
    observaciones TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    realizado_por UUID REFERENCES usuarios(id),
    fecha_realizacion TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. TABLA: caja_diaria
-- =====================================================
CREATE TABLE IF NOT EXISTS caja_diaria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL,
    folio_venta INTEGER,
    concepto VARCHAR(200),
    tipo VARCHAR(50),
    metodo_pago VARCHAR(50),
    ingreso DECIMAL(10,2) DEFAULT 0,
    egreso DECIMAL(10,2) DEFAULT 0,
    saldo DECIMAL(10,2),
    cita_id UUID REFERENCES citas(id),
    usuario_id UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 9. CREAR ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_estudios_cita ON citas_estudios(cita_id);
CREATE INDEX IF NOT EXISTS idx_citas_estudios_estudio ON citas_estudios(estudio_id);
CREATE INDEX IF NOT EXISTS idx_caja_fecha ON caja_diaria(fecha);
CREATE INDEX IF NOT EXISTS idx_resultados_cita ON resultados_laboratorio(cita_id);

-- =====================================================
-- 10. HABILITAR RLS (Row Level Security)
-- =====================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudios_laboratorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicos_referentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas_estudios ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_laboratorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_laboratorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE caja_diaria ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 11. POLÍTICAS DE ACCESO (PUBLIC)
-- =====================================================
DROP POLICY IF EXISTS "Permitir todo en usuarios" ON usuarios;
CREATE POLICY "Permitir todo en usuarios" ON usuarios FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir todo en citas" ON citas;
CREATE POLICY "Permitir todo en citas" ON citas FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir todo en estudios_laboratorio" ON estudios_laboratorio;
CREATE POLICY "Permitir todo en estudios_laboratorio" ON estudios_laboratorio FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir todo en medicos_referentes" ON medicos_referentes;
CREATE POLICY "Permitir todo en medicos_referentes" ON medicos_referentes FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir todo en citas_estudios" ON citas_estudios;
CREATE POLICY "Permitir todo en citas_estudios" ON citas_estudios FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir todo en configuracion_laboratorio" ON configuracion_laboratorio;
CREATE POLICY "Permitir todo en configuracion_laboratorio" ON configuracion_laboratorio FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir todo en resultados_laboratorio" ON resultados_laboratorio;
CREATE POLICY "Permitir todo en resultados_laboratorio" ON resultados_laboratorio FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir todo en caja_diaria" ON caja_diaria;
CREATE POLICY "Permitir todo en caja_diaria" ON caja_diaria FOR ALL USING (true);

-- =====================================================
-- 12. INSERTAR CONFIGURACIÓN INICIAL
-- =====================================================
INSERT INTO configuracion_laboratorio (
    nombre_laboratorio,
    responsable_sanitario,
    cedula_profesional,
    direccion,
    telefono
) 
SELECT 
    'Ar Lab',
    'QFB Adolfo Ruiz López',
    '12345678',
    'Dirección del laboratorio',
    '961-106-2651'
WHERE NOT EXISTS (SELECT 1 FROM configuracion_laboratorio LIMIT 1);

-- =====================================================
-- 13. INSERTAR USUARIO ADMINISTRADOR
-- =====================================================
INSERT INTO usuarios (usuario, password, rol) 
VALUES ('ADOLFO RUIZ', '9611062651', 'admin')
ON CONFLICT (usuario) DO UPDATE SET password = '9611062651', rol = 'admin';

-- =====================================================
-- 14. VERIFICACIÓN (RESUMEN)
-- =====================================================
SELECT 
    'usuarios' as tabla,
    COUNT(*) as registros
FROM usuarios

UNION ALL

SELECT 
    'estudios_laboratorio' as tabla,
    COUNT(*) as registros
FROM estudios_laboratorio

UNION ALL

SELECT 
    'medicos_referentes' as tabla,
    COUNT(*) as registros
FROM medicos_referentes

UNION ALL

SELECT 
    'citas' as tabla,
    COUNT(*) as registros
FROM citas

UNION ALL

SELECT 
    'configuracion_laboratorio' as tabla,
    COUNT(*) as registros
FROM configuracion_laboratorio

UNION ALL

SELECT 
    'caja_diaria' as tabla,
    COUNT(*) as registros
FROM caja_diaria

ORDER BY tabla;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- ✅ Todas las tablas, índices y políticas creadas
-- 📊 Sistema listo para operar
-- =====================================================
