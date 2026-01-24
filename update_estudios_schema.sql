-- Add columns for detailed reference values
ALTER TABLE estudios_laboratorio
ADD COLUMN IF NOT EXISTS unidades TEXT,
ADD COLUMN IF NOT EXISTS tipo_referencia TEXT DEFAULT 'texto', -- 'rango' or 'texto'
ADD COLUMN IF NOT EXISTS referencia_min NUMERIC,
ADD COLUMN IF NOT EXISTS referencia_max NUMERIC,
ADD COLUMN IF NOT EXISTS referencia_texto TEXT;
