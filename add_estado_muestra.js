const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function addEstadoMuestra() {
    try {
        console.log('Connecting...');
        await client.connect();

        // 1. Add estado_muestra column to citas_estudios
        console.log('Adding estado_muestra column...');
        await client.query(`
            ALTER TABLE citas_estudios 
            ADD COLUMN IF NOT EXISTS estado_muestra TEXT DEFAULT 'pendiente'
        `);

        // 2. Update existing records to 'pendiente' if null
        await client.query(`
            UPDATE citas_estudios 
            SET estado_muestra = 'pendiente' 
            WHERE estado_muestra IS NULL
        `);

        console.log('✅ Column estado_muestra added successfully!');
        console.log('Possible values: pendiente, tomada');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

addEstadoMuestra();
