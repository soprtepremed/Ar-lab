-- =====================================================
-- ACTUALIZAR Química Sanguínea y Pruebas Hepáticas
-- Tipo de muestra: Suero
-- Tubo: Rojo, dorado seco o con gel separador
-- =====================================================

-- Actualizar Química Sanguínea
UPDATE estudios_laboratorio 
SET 
    tipo_muestra = 'Suero',
    tubo_recipiente = 'Tubo rojo, dorado seco o con gel separador'
WHERE categoria = 'Química Sanguínea';

-- Actualizar Pruebas Hepáticas (Función Hepática)
UPDATE estudios_laboratorio 
SET 
    tipo_muestra = 'Suero',
    tubo_recipiente = 'Tubo rojo, dorado seco o con gel separador'
WHERE categoria = 'Pruebas Hepáticas';

-- Verificar los cambios
SELECT 
    codigo,
    nombre,
    categoria,
    tipo_muestra,
    tubo_recipiente
FROM estudios_laboratorio
WHERE categoria IN ('Química Sanguínea', 'Pruebas Hepáticas')
ORDER BY categoria, codigo;

-- Resumen de actualización
SELECT 
    categoria,
    COUNT(*) as estudios_actualizados,
    tipo_muestra,
    tubo_recipiente
FROM estudios_laboratorio
WHERE categoria IN ('Química Sanguínea', 'Pruebas Hepáticas')
GROUP BY categoria, tipo_muestra, tubo_recipiente;
