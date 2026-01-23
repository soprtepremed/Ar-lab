const { Client } = require('pg');

const client = new Client({
    host: '2600:1f16:1cd0:3328:b828:370d:ea32:6ff0',
    port: 5432,
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

async function reloadSchema() {
    try {
        console.log('Conectando para recargar schema cache...');
        await client.connect();
        await client.query("NOTIFY pgrst, 'reload config'");
        console.log('✅ Notificación de recarga enviada (PGRST)');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

reloadSchema();
