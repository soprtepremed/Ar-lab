ALTER TABLE estudios_laboratorio 
ADD COLUMN IF NOT EXISTS formula text;

COMMENT ON COLUMN estudios_laboratorio.formula IS 'Formula for calculated analytes. Use study codes in brackets, e.g., [CREA]/28.3';
