-- =====================================================
-- CORRECCIÓN DEL PERFIL DE ORINA (EGO)
-- Cambiar componentes de Sangre (Química/Biometría) por los de Orina
-- =====================================================

DO $$
DECLARE
    profile_id UUID;
    ego_glu_id UUID;
    qs_glu_id UUID;
    ego_eri_id UUID;
    bh_eri_id UUID;
BEGIN
    -- 1. Obtener ID del Perfil EGO
    SELECT id INTO profile_id FROM estudios_laboratorio WHERE nombre ILIKE '%General de Orina%' AND es_perfil = true LIMIT 1;

    -- 2. Obtener IDs de los componentes CORRECTOS (Orina)
    SELECT id INTO ego_glu_id FROM estudios_laboratorio WHERE codigo = 'EGO-GLU' LIMIT 1;
    -- Intentar buscar Eritrocitos de sedimento (x campo)
    SELECT id INTO ego_eri_id FROM estudios_laboratorio WHERE codigo = 'EGO-SED-ERI' LIMIT 1;
    -- Si no existe EGO-SED-ERI, buscar genérico de orina
    IF ego_eri_id IS NULL THEN
        SELECT id INTO ego_eri_id FROM estudios_laboratorio 
        WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') 
          AND nombre ILIKE 'Eritrocitos' 
          AND id != (SELECT id FROM estudios_laboratorio WHERE codigo = 'BH-ERI' LIMIT 1)
        LIMIT 1;
    END IF;

    -- 3. Obtener IDs de los componentes INCORRECTOS (Sangre) actuales
    SELECT id INTO qs_glu_id FROM estudios_laboratorio WHERE codigo = 'QS-GLU' LIMIT 1;
    SELECT id INTO bh_eri_id FROM estudios_laboratorio WHERE codigo = 'BH-ERI' LIMIT 1;

    -- 4. Realizar el cambio en la tabla de relación (estudio_componentes)
    
    -- Corregir Glucosa (QS -> EGO)
    IF profile_id IS NOT NULL AND ego_glu_id IS NOT NULL AND qs_glu_id IS NOT NULL THEN
        UPDATE estudio_componentes
        SET componente_id = ego_glu_id
        WHERE perfil_id = profile_id AND componente_id = qs_glu_id;
        
        RAISE NOTICE 'Corregido: Glucosa (Sanguínea -> Orina)';
    END IF;

    -- Corregir Eritrocitos (BH -> EGO)
    IF profile_id IS NOT NULL AND ego_eri_id IS NOT NULL AND bh_eri_id IS NOT NULL THEN
        UPDATE estudio_componentes
        SET componente_id = ego_eri_id
        WHERE perfil_id = profile_id AND componente_id = bh_eri_id;
        
        RAISE NOTICE 'Corregido: Eritrocitos (Biometría -> Orina)';
    ELSE
        RAISE NOTICE 'No se pudo corregir Eritrocitos: Verifica que exista el estudio de Orina correspondiente (Codigo EGO-SED-ERI).';
    END IF;

END $$;

-- VERIFICACIÓN FINAL
SELECT 
    p.nombre as perfil,
    c.nombre as componente,
    c.categoria,
    c.codigo
FROM estudio_componentes ec
JOIN estudios_laboratorio p ON ec.perfil_id = p.id
JOIN estudios_laboratorio c ON ec.componente_id = c.id
WHERE p.id = (SELECT id FROM estudios_laboratorio WHERE nombre ILIKE '%General de Orina%' AND es_perfil = true LIMIT 1);
