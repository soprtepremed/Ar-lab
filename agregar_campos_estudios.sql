-- =====================================================
-- Agregar campos técnicos a tabla estudios_laboratorio
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Agregar los tres nuevos campos
ALTER TABLE estudios_laboratorio 
ADD COLUMN IF NOT EXISTS tipo_muestra VARCHAR(100),
ADD COLUMN IF NOT EXISTS metodologia VARCHAR(200),
ADD COLUMN IF NOT EXISTS tubo_recipiente VARCHAR(150);

-- Actualizar ejemplos con información técnica
-- Química Sanguínea
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero o plasma',
    metodologia = 'Espectrofotometría enzimática (Glucosa oxidasa)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante) o tubo gris (fluoruro)'
WHERE codigo = 'GLU';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero o plasma',
    metodologia = 'Espectrofotometría (Método de Jaffé)',
    tubo_recipiente = 'Tubo rojo o verde (heparina)'
WHERE codigo = 'CREA';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría enzimática (Ureasa)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'UREA';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría enzimática (Uricasa)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'AU';

-- Perfil Lipídico
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría enzimática (CHOD-PAP)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'COL';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría enzimática directa',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'HDL';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Cálculo (Friedewald) o enzimático directo',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'LDL';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría enzimática (GPO-PAP)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'TG';

-- Pruebas Hepáticas
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría (Método de Jendrassik-Grof)',
    tubo_recipiente = 'Tubo rojo (proteger de la luz)'
WHERE codigo = 'BT';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría (Biuret)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'PT';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría (Verde de bromocresol)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'ALB';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría cinética UV (IFCC)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'AST';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría cinética UV (IFCC)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'ALT';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría (PNPP)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'ALP';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría enzimática',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'GGT';

-- Electrolitos
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero o plasma heparinizado',
    metodologia = 'Electrodo ion selectivo (ISE)',
    tubo_recipiente = 'Tubo rojo o verde (heparina)'
WHERE codigo = 'NA';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero o plasma heparinizado',
    metodologia = 'Electrodo ion selectivo (ISE)',
    tubo_recipiente = 'Tubo rojo o verde (heparina)'
WHERE codigo = 'K';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero o plasma heparinizado',
    metodologia = 'Electrodo ion selectivo (ISE)',
    tubo_recipiente = 'Tubo rojo o verde (heparina)'
WHERE codigo = 'CL';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría (O-cresolftaleína)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'CA';

-- Perfil Tiroideo
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoensayo quimioluminiscente (CLIA)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'TSH';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoensayo quimioluminiscente (CLIA)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'T4';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoensayo quimioluminiscente (CLIA)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'T3';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoensayo quimioluminiscente (CLIA)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'T4L';

-- Diabetes
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Sangre total con EDTA',
    metodologia = 'HPLC (Cromatografía líquida de alta resolución)',
    tubo_recipiente = 'Tubo morado (EDTA)'
WHERE codigo = 'HBA1C';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero en ayunas',
    metodologia = 'Inmunoensayo quimioluminiscente',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante, refrigerado)'
WHERE codigo = 'INS';

-- Hierro y Anemia
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría (Ferrozina)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'FE';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoensayo quimioluminiscente',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'FER';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoensayo quimioluminiscente',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'B12';

-- Enzimas
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría cinética UV',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'CPK';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría enzimática',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'AMS';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Espectrofotometría enzimática',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'LIP';

-- Inflamación
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoturbidimetría',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'PCR';

-- Inmunología
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoturbidimetría',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'FR';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoensayo quimioluminiscente',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'IGE';

-- Hormonas
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoensayo quimioluminiscente (CLIA)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'PRL';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero (8:00 AM)',
    metodologia = 'Inmunoensayo quimioluminiscente',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'CORT';

-- Vitaminas
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoensayo quimioluminiscente',
    tubo_recipiente = 'Tubo rojo (proteger de la luz)'
WHERE codigo = 'VITD';

-- Marcadores Tumorales
UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoensayo quimioluminiscente (CLIA)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'CA125';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoensayo quimioluminiscente (CLIA)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'CA199';

UPDATE estudios_laboratorio SET 
    tipo_muestra = 'Suero',
    metodologia = 'Inmunoensayo quimioluminiscente (CLIA)',
    tubo_recipiente = 'Tubo rojo (sin anticoagulante)'
WHERE codigo = 'CEA';

-- =====================================================
-- Verificar campos agregados
-- =====================================================
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'estudios_laboratorio'
  AND column_name IN ('tipo_muestra', 'metodologia', 'tubo_recipiente')
ORDER BY column_name;

-- Ver ejemplos actualizados
SELECT codigo, nombre, tipo_muestra, metodologia, tubo_recipiente
FROM estudios_laboratorio
WHERE tipo_muestra IS NOT NULL
ORDER BY codigo
LIMIT 10;
