-- MODIFICACIONES PARA TABLA 'CITAS' (Datos del Paciente/Reporte)
-- Agrega columnas para Procedencia, Servicio, Cama, Diagnóstico, etc.
ALTER TABLE public.citas 
ADD COLUMN IF NOT EXISTS procedencia text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS servicio text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cama text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS diagnostico text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS medico_referente text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fecha_liberacion timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fecha_toma_muestra timestamptz DEFAULT NULL;

-- MODIFICACIONES PARA TABLA 'ESTUDIOS_LABORATORIO' (Catálogo de Pruebas)
-- Agrega columnas para Metodología y Unidad de medida
ALTER TABLE public.estudios_laboratorio 
ADD COLUMN IF NOT EXISTS metodo text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS unidad text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rango_referencia text DEFAULT NULL;
