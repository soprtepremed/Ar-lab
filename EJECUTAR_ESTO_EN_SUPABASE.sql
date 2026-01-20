-- =====================================================
-- SISTEMA DE ASISTENCIA - EJECUTAR EN SUPABASE
-- Copiar y pegar en: SQL Editor de Supabase
-- =====================================================

-- 1. Agregar campos a tabla citas
ALTER TABLE citas
ADD COLUMN IF NOT EXISTS folio_atencion INTEGER,
ADD COLUMN IF NOT EXISTS fecha_hora_llegada TIMESTAMP,
ADD COLUMN IF NOT EXISTS atendido_por BIGINT REFERENCES usuarios(id);

-- ✳️ CAMBIO IMPORTANTE: Convertir folio_atencion a TEXTO para formato 'YYMMDD-NN'
-- Si ya creaste la columna como INTEGER, ejecuta esto:
ALTER TABLE citas ALTER COLUMN folio_atencion TYPE TEXT;

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_citas_folio_atencion ON citas(folio_atencion);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_llegada ON citas(fecha_hora_llegada);

-- 3. Crear vista para lista de trabajo (Opcional, si usas vistas)
DROP VIEW IF EXISTS lista_trabajo_diaria;

CREATE VIEW lista_trabajo_diaria AS
SELECT 
    c.id,
    c.folio_atencion,
    c.paciente_nombre,
    c.fecha_hora as hora_cita,
    c.fecha_hora_llegada,
    c.estado,
    c.total,
    c.pagado,
    STRING_AGG(e.nombre, ', ') as estudios_texto,
    STRING_AGG(e.codigo, ', ') as codigos_estudios
FROM citas c
LEFT JOIN citas_estudios ce ON c.id = ce.cita_id
LEFT JOIN estudios_laboratorio e ON ce.estudio_id = e.id
WHERE c.estado IN ('verificada', 'en_proceso')
  AND DATE(c.fecha_hora_llegada) = CURRENT_DATE
GROUP BY c.id, c.folio_atencion, c.paciente_nombre, c.fecha_hora, c.fecha_hora_llegada, c.estado, c.total, c.pagado;
-- NOTA: El ORDER BY numérico fallará con folios de texto si no se ajusta, pero el orden alfabético suele servir.

-- 4. Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'citas' 
AND column_name = 'folio_atencion';
