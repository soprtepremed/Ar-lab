-- =====================================================
-- CORREGIR GUARDADO DE NOTAS (FIX_NOTES_COLUMN.sql)
-- Agrega la columna 'observaciones' si no existe.
-- =====================================================

DO $$
BEGIN
    -- 1. Agregar columna observaciones si falta
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'citas_estudios' 
        AND column_name = 'observaciones'
    ) THEN
        ALTER TABLE citas_estudios ADD COLUMN observaciones TEXT;
        RAISE NOTICE 'Columna observaciones agregada con éxito.';
    ELSE
        RAISE NOTICE 'La columna observaciones ya existía.';
    END IF;
END $$;

-- 2. Asegurar que se pueda editar (Policies)
-- Re-aplicar permisos básicos (por si acaso)
GRANT ALL ON TABLE citas_estudios TO authenticated;
GRANT ALL ON TABLE citas_estudios TO service_role;

RAISE NOTICE 'Permisos verificados. Intenta guardar la nota ahora.';
