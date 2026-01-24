-- Add order column to profile components for custom sorting
ALTER TABLE estudio_componentes ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;

-- Optional: Create a function/trigger to auto-increment order if we wanted, 
-- but for now UI-driven updating is fine.
