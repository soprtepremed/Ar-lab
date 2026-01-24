const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function addColumns() {
    try {
        await client.connect();
        console.log('Conectado. Agregando columnas...');
        await client.query('ALTER TABLE estudios_laboratorio ADD COLUMN IF NOT EXISTS metodologia VARCHAR(200)');
        await client.query('ALTER TABLE estudios_laboratorio ADD COLUMN IF NOT EXISTS tipo_muestra VARCHAR(100)');
        console.log('✅ Columnas agregadas.');
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

addColumns();
