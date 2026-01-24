-- CHECK: Profiles named 'Examen General de Orina'
SELECT id, nombre, codigo, categoria 
FROM estudios_laboratorio 
WHERE nombre ILIKE '%General de Orina%' AND es_perfil = true;

-- CHECK: All studies named 'Eritrocitos' or similar
SELECT id, nombre, categoria, codigo, unidades, rango_referencia 
FROM estudios_laboratorio 
WHERE nombre ILIKE 'Eritrocitos%' OR nombre ILIKE '%Glóbulos Rojos%';

-- CHECK: Components of EGO Profile
-- (Replace 'UUID_DEL_PERFIL' with actual query if possible, or join)
SELECT 
    p.nombre as perfil,
    c.nombre as componente,
    c.categoria,
    c.codigo,
    c.unidades,
    c.rango_referencia
FROM estudio_componentes ec
JOIN estudios_laboratorio p ON ec.perfil_id = p.id
JOIN estudios_laboratorio c ON ec.componente_id = c.id
WHERE p.nombre ILIKE '%General de Orina%';
