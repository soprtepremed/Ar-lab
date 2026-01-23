-- =====================================================
-- ASEGURAR INTEGRIDAD DE CÓDIGOS (ENFORCE_CODES.sql) - FINAL
-- =====================================================

-- 1. Rellenar códigos nulos (Dentro de un bloque DO para poder usar PL/PGSQL)
DO $$
BEGIN
    UPDATE estudios_laboratorio 
    SET codigo = 'TEMP-' || substring(id::text, 1, 8)
    WHERE codigo IS NULL OR codigo = '';
END $$;

-- 2. Hacer la columna OBLIGATORIA (Comando SQL directo)
ALTER TABLE estudios_laboratorio 
ALTER COLUMN codigo SET NOT NULL;

-- 3. Limpiar constraint previo si existe (para evitar error de duplicado al re-correr)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estudios_laboratorio_codigo_key') THEN
        ALTER TABLE estudios_laboratorio DROP CONSTRAINT estudios_laboratorio_codigo_key;
    END IF;
END $$;

-- 4. Agregar restricción UNIQUE (Comando SQL directo)
ALTER TABLE estudios_laboratorio 
ADD CONSTRAINT estudios_laboratorio_codigo_key UNIQUE (codigo);

-- 5. Mensaje de Éxito (Debe ir dentro de un bloque DO)
DO $$
BEGIN
    RAISE NOTICE '¡ÉXITO! Restricciones de Código (Único y Obligatorio) aplicadas.';
END $$;
