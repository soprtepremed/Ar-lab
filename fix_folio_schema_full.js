const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Conectando...');
        await client.connect();

        // 1. Drop View
        console.log('Eliminando vista dependiente...');
        await client.query('DROP VIEW IF EXISTS lista_trabajo_diaria;');

        // 2. Alter Column
        console.log('Cambiando tipo de columna...');
        await client.query('ALTER TABLE citas ALTER COLUMN folio_atencion TYPE TEXT USING folio_atencion::text;');

        // 3. Recreate View
        console.log('Recreando vista...');
        const createViewSql = `
            CREATE VIEW lista_trabajo_diaria AS
            SELECT c.id,
                c.folio_atencion,
                c.paciente_nombre,
                c.fecha_hora AS hora_cita,
                c.fecha_hora_llegada,
                c.estado,
                c.total,
                c.pagado,
                string_agg(e.nombre::text, ', '::text) AS estudios_texto,
                string_agg(e.codigo::text, ', '::text) AS codigos_estudios
            FROM citas c
                LEFT JOIN citas_estudios ce ON c.id = ce.cita_id
                LEFT JOIN estudios_laboratorio e ON ce.estudio_id = e.id
            WHERE (c.estado::text = ANY (ARRAY['verificada'::character varying, 'en_proceso'::character varying]::text[])) 
                AND date(c.fecha_hora_llegada) = CURRENT_DATE
            GROUP BY c.id, c.folio_atencion, c.paciente_nombre, c.fecha_hora, c.fecha_hora_llegada, c.estado, c.total, c.pagado
            ORDER BY c.folio_atencion;
        `;
        await client.query(createViewSql);

        console.log('✅ Proceso completado exitosamente!');

    } catch (err) {
        console.error('❌ Error fatal:', err);
    } finally {
        await client.end();
    }
}

run();
