-- Script para unificar nombres de categorías (Corrección de duplicados)
-- Esto arregla el problema de tener "QUIMICA CLINICA" y "Química Clínica" por separado

-- 1. Unificar Química Clínica (Con acentos y Title Case)
UPDATE estudios_laboratorio 
SET categoria = 'Química Clínica' 
WHERE categoria ILIKE 'quimica clinica' OR categoria ILIKE 'química clínica';

-- 2. Unificar Hematología
UPDATE estudios_laboratorio 
SET categoria = 'Hematología' 
WHERE categoria ILIKE 'hematologia' OR categoria ILIKE 'hematología';

-- 3. Unificar Uroanálisis
UPDATE estudios_laboratorio 
SET categoria = 'Uroanálisis' 
WHERE categoria ILIKE 'uroanalisis' OR categoria ILIKE 'uroanálisis';

-- 4. Unificar Inmunología
UPDATE estudios_laboratorio 
SET categoria = 'Inmunología' 
WHERE categoria ILIKE 'inmunologia' OR categoria ILIKE 'inmunología';

-- 5. Unificar Coprología
UPDATE estudios_laboratorio 
SET categoria = 'Coprología' 
WHERE categoria ILIKE 'coprologia' OR categoria ILIKE 'coprología';

-- 6. Unificar Coagulación
UPDATE estudios_laboratorio 
SET categoria = 'Coagulación' 
WHERE categoria ILIKE 'coagulacion' OR categoria ILIKE 'coagulación';

-- 7. Limpiar espacios en blanco extra
UPDATE estudios_laboratorio 
SET categoria = TRIM(categoria);
