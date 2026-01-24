-- MODIFICACIÓN PARA ESTRUCTURA TIPO HOSPITAL
-- Agregar columnas necesarias para segmentación avanzada

ALTER TABLE citas 
ADD COLUMN IF NOT EXISTS piso VARCHAR(50),
ADD COLUMN IF NOT EXISTS servicio VARCHAR(100),
ADD COLUMN IF NOT EXISTS expediente_numero VARCHAR(50),
ADD COLUMN IF NOT EXISTS medico_nombre VARCHAR(200);

-- Crear índices para búsquedas rápidas en estos campos
CREATE INDEX IF NOT EXISTS idx_citas_piso ON citas(piso);
CREATE INDEX IF NOT EXISTS idx_citas_servicio ON citas(servicio);
CREATE INDEX IF NOT EXISTS idx_citas_expediente ON citas(expediente_numero);
CREATE INDEX IF NOT EXISTS idx_citas_medico ON citas(medico_nombre);
