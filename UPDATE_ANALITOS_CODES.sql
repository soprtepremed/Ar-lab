-- =====================================================
-- SCRIPT DE ACTUALIZACIÓN DE CÓDIGOS DE ANALITOS (CORREGIDO)
-- Se usa "LIMIT 1" para evitar errores si hay estudios duplicados con el mismo nombre.
-- =====================================================

-- 1. QUÍMICA SANGUÍNEA (Prefijo: QS-)
-- =====================================================
UPDATE estudios_laboratorio SET codigo = 'QS-GLU' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Glucosa' OR nombre ILIKE 'Glucose') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-UREA' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND nombre ILIKE 'Urea' LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-BUN' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Nitrógeno Ureico%' OR nombre ILIKE 'BUN') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-CREA' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Creatinina' OR nombre ILIKE 'Creatinine') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-AU' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Ácido Úrico' OR nombre ILIKE 'Acido Urico') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-COL' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Colesterol%' AND nombre NOT ILIKE '%HDL%' AND nombre NOT ILIKE '%LDL%') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-TRI' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Triglicéridos' OR nombre ILIKE 'Trigliceridos') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-HDL' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Colesterol HDL' OR nombre ILIKE '%Alta Densidad%') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-LDL' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Colesterol LDL' OR nombre ILIKE '%Baja Densidad%') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-VLDL' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Colesterol VLDL' OR nombre ILIKE '%Muy Baja Densidad%') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-BT' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Bilirrubina Total') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-BD' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Bilirrubina Directa' OR nombre ILIKE 'Bilirrubina Conjugada') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-BI' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Bilirrubina Indirecta' OR nombre ILIKE 'Bilirrubina No Conjugada') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-AST' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'TGO' OR nombre ILIKE 'AST' OR nombre ILIKE '%Aspartato%') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-ALT' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'TGP' OR nombre ILIKE 'ALT' OR nombre ILIKE '%Alanina%') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-FA' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Fosfatasa Alcalina') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-GGT' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'GGT' OR nombre ILIKE 'Gamma%') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'QS-DH' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Química%' AND (nombre ILIKE 'Deshidrogenasa Láctica' OR nombre ILIKE 'DHL') LIMIT 1);

-- 2. BIOMETRÍA HEMÁTICA (Prefijo: BH-)
-- =====================================================
UPDATE estudios_laboratorio SET codigo = 'BH-LEU' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'Leucocitos' OR nombre ILIKE 'WBC') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'BH-ERI' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'Eritrocitos' OR nombre ILIKE 'Glóbulos Rojos' OR nombre ILIKE 'RBC') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'BH-HB' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'Hemoglobina' OR nombre ILIKE 'HGB') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'BH-HTO' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'Hematocrito' OR nombre ILIKE 'HCT') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'BH-VCM' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'VCM' OR nombre ILIKE 'Volumen Corpuscular Medio') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'BH-HCM' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'HCM' OR nombre ILIKE 'Hemoglobina Corpuscular Media') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'BH-CHCM' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'CHCM' OR nombre ILIKE 'Concentración Media%') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'BH-PLT' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'Plaquetas' OR nombre ILIKE 'PLT') LIMIT 1);

-- Diferencial
UPDATE estudios_laboratorio SET codigo = 'BH-NEU-P' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'Neutrófilos%' AND nombre ILIKE '%') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'BH-LIN-P' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'Linfocitos%' AND nombre ILIKE '%') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'BH-MON-P' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'Monocitos%' AND nombre ILIKE '%') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'BH-EOS-P' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'Eosinófilos%' AND nombre ILIKE '%') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'BH-BAS-P' WHERE id = (SELECT id FROM estudios_laboratorio WHERE categoria ILIKE 'Hematología%' AND (nombre ILIKE 'Basófilos%' AND nombre ILIKE '%') LIMIT 1);

-- 3. EXAMEN GENERAL DE ORINA (Prefijo: EGO-)
-- =====================================================
UPDATE estudios_laboratorio SET codigo = 'EGO-COL' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND nombre ILIKE 'Color' LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-ASP' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND nombre ILIKE 'Aspecto' LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-DEN' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND nombre ILIKE 'Densidad' LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-PH' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND nombre ILIKE 'pH' LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-GLU' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND nombre ILIKE 'Glucosa' LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-PRO' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND (nombre ILIKE 'Proteínas' OR nombre ILIKE 'Proteinas') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-BIL' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND nombre ILIKE 'Bilirrubinas' LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-CET' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND (nombre ILIKE 'Cetonas' OR nombre ILIKE 'Cuerpos Cetónicos' OR nombre ILIKE 'Cuerpos Cetonicos') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-HB' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND (nombre ILIKE 'Hemoglobina' OR nombre ILIKE 'Sangre') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-NIT' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND nombre ILIKE 'Nitritos' LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-LEU' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND nombre ILIKE 'Leucocitos' LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-URO' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND nombre ILIKE 'Urobilinógeno' LIMIT 1);

-- Sedimento
UPDATE estudios_laboratorio SET codigo = 'EGO-SED-LEU' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND nombre ILIKE 'Leucocitos' AND nombre ILIKE '%campo%' LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-SED-ERI' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND (nombre ILIKE 'Eritrocitos' OR nombre ILIKE 'Hematíes') AND nombre ILIKE '%campo%' LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-SED-BAC' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND (nombre ILIKE 'Bacterias') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-SED-CEL' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND (nombre ILIKE 'Células Epiteliales' OR nombre ILIKE 'Celulas Epiteliales') LIMIT 1);
UPDATE estudios_laboratorio SET codigo = 'EGO-SED-CRIS' WHERE id = (SELECT id FROM estudios_laboratorio WHERE (categoria ILIKE 'Uroanálisis' OR categoria ILIKE 'General de Orina') AND (nombre ILIKE 'Cristales') LIMIT 1);

-- VERIFICACIÓN
SELECT codigo, nombre, categoria 
FROM estudios_laboratorio 
WHERE codigo IS NOT NULL 
ORDER BY categoria, codigo;
