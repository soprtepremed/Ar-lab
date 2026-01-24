const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function addColumna() {
    try {
        await client.connect();

        // Agregar columna creado_por
        await client.query(`
            ALTER TABLE citas 
            ADD COLUMN IF NOT EXISTS creado_por UUID;
        `);

        console.log('✅ Columna creado_por agregada a la tabla citas');

        // Recargar schema cache
        await client.query("NOTIFY pgrst, 'reload config'");
        console.log('✅ Schema chache recargado');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

addColumna();
