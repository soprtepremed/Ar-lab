-- ACTUALIZAR SCHEMA PARA RESULTADOS
-- Ejecutar en Supabase SQL Editor

-- 1. Asegurar que la tabla citas_estudios tenga columnas de resultados
ALTER TABLE citas_estudios ADD COLUMN IF NOT EXISTS valor_resultado TEXT;
ALTER TABLE citas_estudios ADD COLUMN IF NOT EXISTS estado_resultado VARCHAR(20) DEFAULT 'pendiente';
ALTER TABLE citas_estudios ADD COLUMN IF NOT EXISTS validado_por VARCHAR(100);
ALTER TABLE citas_estudios ADD COLUMN IF NOT EXISTS fecha_validacion TIMESTAMPTZ;
ALTER TABLE citas_estudios ADD COLUMN IF NOT EXISTS resultado TEXT;

-- 2. Asegurar que estudios_laboratorio tenga rango_referencia (si no lo tiene)
ALTER TABLE estudios_laboratorio ADD COLUMN IF NOT EXISTS rango_referencia TEXT;
