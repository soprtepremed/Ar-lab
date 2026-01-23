
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'citas_estudios' AND column_name = 'mostrar_en_reporte') THEN 
        ALTER TABLE citas_estudios ADD COLUMN mostrar_en_reporte BOOLEAN DEFAULT true; 
    END IF; 
END $$;
