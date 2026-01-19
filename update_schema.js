const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function updateSchema() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase');

        // Actualizar tabla citas con nuevos campos
        await client.query(`
            ALTER TABLE citas 
            ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(100),
            ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(100),
            ADD COLUMN IF NOT EXISTS primer_apellido VARCHAR(100),
            ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(100),
            ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
            ADD COLUMN IF NOT EXISTS diagnostico TEXT;
        `);
        console.log('✅ Tabla citas actualizada con nuevos campos');

        // Verificar estructura
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'citas'
            ORDER BY ordinal_position;
        `);
        console.log('📋 Estructura de tabla citas:');
        result.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

updateSchema();
