-- =====================================================
-- CREAR ANALITOS ESPECÍFICOS PARA ORINA Y ASIGNARLOS
-- =====================================================

DO $$
DECLARE
    profile_id UUID;
    new_ego_glu_id UUID;
    new_ego_eri_id UUID;
    old_qs_glu_id UUID;
    old_bh_eri_id UUID;
BEGIN
    -- 1. Obtener ID del Perfil EGO
    SELECT id INTO profile_id FROM estudios_laboratorio WHERE nombre ILIKE '%General de Orina%' AND es_perfil = true LIMIT 1;
    
    -- 2. Obtener los IDs actuales (INCALCULADOS/SANGRE) que vamos a reemplazar
    -- Buscamos por código QS-GLU y BH-ERI que son los que se ven en tu tabla
    SELECT id INTO old_qs_glu_id FROM estudios_laboratorio WHERE codigo = 'QS-GLU' LIMIT 1;
    SELECT id INTO old_bh_eri_id FROM estudios_laboratorio WHERE codigo = 'BH-ERI' LIMIT 1;

    -- 3. Insertar o recuperar 'Glucosa' EXCLUSIVA de Orina
    -- Verificamos si ya existe uno con código EGO-GLU para no duplicar
    SELECT id INTO new_ego_glu_id FROM estudios_laboratorio WHERE codigo = 'EGO-GLU' LIMIT 1;
    
    IF new_ego_glu_id IS NULL THEN
        INSERT INTO estudios_laboratorio (id, nombre, categoria, codigo, unidades, rango_referencia, tipo_muestra)
        VALUES (gen_random_uuid(), 'Glucosa', 'Uroanálisis', 'EGO-GLU', 'mg/dL', 'Negativo', 'Orina')
        RETURNING id INTO new_ego_glu_id;
        RAISE NOTICE 'Creado nuevo estudio: Glucosa (Orina)';
    END IF;

    -- 4. Insertar o recuperar 'Eritrocitos' EXCLUSIVO de Orina
    -- Verificamos si ya existe uno con código EGO-SED-ERI
    SELECT id INTO new_ego_eri_id FROM estudios_laboratorio WHERE codigo = 'EGO-SED-ERI' LIMIT 1;
    
    IF new_ego_eri_id IS NULL THEN
        INSERT INTO estudios_laboratorio (id, nombre, categoria, codigo, unidades, rango_referencia, tipo_muestra)
        VALUES (gen_random_uuid(), 'Eritrocitos', 'Uroanálisis', 'EGO-SED-ERI', 'x campo', '0-2', 'Orina')
        RETURNING id INTO new_ego_eri_id;
        RAISE NOTICE 'Creado nuevo estudio: Eritrocitos (Orina)';
    END IF;

    -- 5. REEMPLAZAR EN EL PERFIL
    
    -- Reemplazar Glucosa Sangre -> Glucosa Orina
    IF profile_id IS NOT NULL AND old_qs_glu_id IS NOT NULL THEN
        -- Borramos la relación vieja y creamos la nueva para asegurar limpieza
        DELETE FROM estudio_componentes WHERE perfil_id = profile_id AND componente_id = old_qs_glu_id;
        
        -- Insertamos la nueva si no existe
        IF NOT EXISTS (SELECT 1 FROM estudio_componentes WHERE perfil_id = profile_id AND componente_id = new_ego_glu_id) THEN
            INSERT INTO estudio_componentes (perfil_id, componente_id) VALUES (profile_id, new_ego_glu_id);
            RAISE NOTICE 'Actualizado perfil: Glucosa cambiada a versión Orina';
        END IF;
    END IF;

    -- Reemplazar Eritrocitos Sangre -> Eritrocitos Orina
    IF profile_id IS NOT NULL AND old_bh_eri_id IS NOT NULL THEN
        DELETE FROM estudio_componentes WHERE perfil_id = profile_id AND componente_id = old_bh_eri_id;
        
        IF NOT EXISTS (SELECT 1 FROM estudio_componentes WHERE perfil_id = profile_id AND componente_id = new_ego_eri_id) THEN
            INSERT INTO estudio_componentes (perfil_id, componente_id) VALUES (profile_id, new_ego_eri_id);
            RAISE NOTICE 'Actualizado perfil: Eritrocitos cambiados a versión Orina';
        END IF;
    END IF;

END $$;
