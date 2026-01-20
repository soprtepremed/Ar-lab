-- =====================================================
-- Sistema de Asistencia y Folio de Atención
-- =====================================================

-- 1. Agregar campos necesarios a tabla citas
ALTER TABLE citas
ADD COLUMN IF NOT EXISTS folio_atencion INTEGER,
ADD COLUMN IF NOT EXISTS fecha_hora_llegada TIMESTAMP,
ADD COLUMN IF NOT EXISTS atendido_por UUID REFERENCES usuarios(id);

-- 2. Crear función para generar folio secuencial diario
CREATE OR REPLACE FUNCTION generar_folio_atencion()
RETURNS INTEGER AS $$
DECLARE
    nuevo_folio INTEGER;
    fecha_hoy DATE := CURRENT_DATE;
BEGIN
    -- Obtener el último folio del día
    SELECT COALESCE(MAX(folio_atencion), 0) + 1 
    INTO nuevo_folio
    FROM citas
    WHERE DATE(fecha_hora_llegada) = fecha_hoy;
    
    RETURN nuevo_folio;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_citas_folio_atencion ON citas(folio_atencion);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_llegada ON citas(fecha_hora_llegada);

-- 4. Vista para lista de trabajo diaria
CREATE OR REPLACE VIEW lista_trabajo_diaria AS
SELECT 
    c.id,
    c.folio_atencion,
    c.paciente_nombre,
    c.fecha_hora as hora_cita,
    c.fecha_hora_llegada,
    c.estado,
    c.total,
    c.pagado,
    ARRAY_AGG(e.nombre) as estudios,
    ARRAY_AGG(e.codigo) as codigos_estudios,
    STRING_AGG(e.nombre, ', ') as estudios_texto
FROM citas c
LEFT JOIN citas_estudios ce ON c.id = ce.cita_id
LEFT JOIN estudios_laboratorio e ON ce.estudio_id = e.id
WHERE c.estado IN ('verificada', 'en_proceso')
  AND DATE(c.fecha_hora_llegada) = CURRENT_DATE
GROUP BY c.id, c.folio_atencion, c.paciente_nombre, c.fecha_hora, c.fecha_hora_llegada, c.estado, c.total, c.pagado
ORDER BY c.folio_atencion ASC;

-- 5. Verificar
SELECT * FROM lista_trabajo_diaria;
