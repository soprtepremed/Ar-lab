-- =====================================================
-- AGREGAR CAMPO SEXO A LA TABLA CITAS
-- Ejecutar en Supabase SQL Editor
-- =====================================================

ALTER TABLE citas
ADD COLUMN IF NOT EXISTS paciente_sexo VARCHAR(20);

COMMENT ON COLUMN citas.paciente_sexo IS 'Género/Sexo del paciente (Masculino, Femenino, Otro)';
