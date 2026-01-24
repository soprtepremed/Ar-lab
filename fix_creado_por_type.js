const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function fixColumnType() {
    try {
        await client.connect();

        // Cambiar el tipo de columna a TEXT para soportar IDs como "14"
        // Usamos USING creado_por::text por si hubiera algún dato (aunque probablemente esté vacía)
        await client.query(`
            ALTER TABLE citas 
            ALTER COLUMN creado_por TYPE TEXT;
        `);

        console.log('✅ Columna creado_por modificada a tipo TEXT');

        // Recargar schema cache
        await client.query("NOTIFY pgrst, 'reload config'");
        console.log('✅ Schema cache recargado');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

fixColumnType();
