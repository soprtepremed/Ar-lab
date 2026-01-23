-- =====================================================
-- DEBUG PROFUNDO: VER DUPLICADOS Y UUIDS
-- =====================================================

-- 1. Ver TODOS los estudios que se llamen "Glucosa"
SELECT id, nombre, categoria, codigo 
FROM estudios_laboratorio 
WHERE nombre ILIKE 'Glucosa';

-- 2. Ver TODOS los estudios que se llamen "Eritrocitos"
SELECT id, nombre, categoria, codigo 
FROM estudios_laboratorio 
WHERE nombre ILIKE 'Eritrocitos';

-- 3. Ver EXACTAMENTE qué IDs están en el Perfil de Orina
SELECT 
    p.nombre as nombre_perfil,
    ec.perfil_id,
    ec.componente_id as id_actual_en_perfil,
    c.nombre as nombre_componente,
    c.categoria as categoria_actual,
    c.codigo as codigo_actual
FROM estudio_componentes ec
JOIN estudios_laboratorio p ON ec.perfil_id = p.id
JOIN estudios_laboratorio c ON ec.componente_id = c.id
WHERE p.nombre ILIKE '%General de Orina%';
