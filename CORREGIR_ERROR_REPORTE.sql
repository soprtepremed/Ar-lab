
-- EJECUTAR ESTO EN EL SQL EDITOR DE SUPABASE
-- Esto corregirá el error "column citas_estudios_1.mostrar_en_reporte does not exist"

ALTER TABLE citas_estudios 
ADD COLUMN IF NOT EXISTS mostrar_en_reporte BOOLEAN DEFAULT true;

-- Verificar que se creó
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'citas_estudios' AND column_name = 'mostrar_en_reporte';
