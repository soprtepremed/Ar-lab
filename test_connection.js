const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function checkConnection() {
    try {
        console.log('Intentando conectar a Supabase...');
        await client.connect();
        console.log('✅ Conexión establecida exitosamente.');

        const res = await client.query('SELECT NOW() as now, version()');
        console.log('🕒 Hora del servidor:', res.rows[0].now);
        console.log('ℹ️ Versión:', res.rows[0].version);

        await client.end();
        console.log('✅ Prueba finalizada correctamente.');
    } catch (err) {
        console.error('❌ Error de conexión:', err);
        process.exit(1);
    }
}

checkConnection();
