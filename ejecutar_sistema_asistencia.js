const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function ejecutarSistemaAsistencia() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase PostgreSQL\n');

        // 1. Agregar campos necesarios a tabla citas
        console.log('📝 Agregando campos a tabla citas...');
        await client.query(`
            ALTER TABLE citas
            ADD COLUMN IF NOT EXISTS folio_atencion INTEGER,
            ADD COLUMN IF NOT EXISTS fecha_hora_llegada TIMESTAMP,
            ADD COLUMN IF NOT EXISTS atendido_por UUID REFERENCES usuarios(id);
        `);
        console.log('   ✅ Campos agregados\n');

        // 2. Crear índices
        console.log('📝 Creando índices...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_citas_folio_atencion ON citas(folio_atencion);
            CREATE INDEX IF NOT EXISTS idx_citas_fecha_llegada ON citas(fecha_hora_llegada);
        `);
        console.log('   ✅ Índices creados\n');

        // 3. Crear vista para lista de trabajo
        console.log('📝 Creando vista lista_trabajo_diaria...');
        await client.query(`
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
            GROUP BY c.id, c.folio_atencion, c.paciente_nombre, c.fecha_hora, c.fecha_hora_llegada, c.estado, c.total, c.pagado
            ORDER BY c.folio_atencion ASC;
        `);
        console.log('   ✅ Vista creada\n');

        // 4. Verificar
        console.log('🔍 Verificando estructura...\n');

        const columnas = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'citas' 
            AND column_name IN ('folio_atencion', 'fecha_hora_llegada', 'atendido_por')
            ORDER BY column_name;
        `);

        console.log('📊 Columnas agregadas a tabla citas:');
        columnas.rows.forEach(col => {
            console.log(`   ✓ ${col.column_name} (${col.data_type})`);
        });
        console.log('');

        // 5. Probar vista
        const vistaTest = await client.query(`
            SELECT COUNT(*) as total FROM lista_trabajo_diaria;
        `);

        console.log(`📋 Vista lista_trabajo_diaria: ${vistaTest.rows[0].total} registros hoy\n`);

        console.log('═══════════════════════════════════════════════════\n');
        console.log('✅ SISTEMA DE ASISTENCIA CONFIGURADO EXITOSAMENTE\n');
        console.log('🎉 Ya puedes usar el botón "Verificar Asistencia"\n');
        console.log('═══════════════════════════════════════════════════\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('\n📌 Detalles:', err);
    } finally {
        await client.end();
    }
}

ejecutarSistemaAsistencia();
