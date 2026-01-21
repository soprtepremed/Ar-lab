const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    console.log('Probando conexión al NUEVO Pooler (IPv4 compatible)...');
    try {
        await client.connect();
        console.log('✅ ¡CONEXIÓN EXITOSA!');

        const res = await client.query('SELECT current_database(), now(), version()');
        console.log('📊 Información del servidor:');
        console.log(`   - BD: ${res.rows[0].current_database}`);
        console.log(`   - Hora: ${res.rows[0].now}`);

        // Aplicar el cambio del sexo de una vez
        console.log('Aplicando columna paciente_sexo...');
        await client.query('ALTER TABLE citas ADD COLUMN IF NOT EXISTS paciente_sexo VARCHAR(20)');
        console.log('✅ Columna asegurada en la tabla citas.');

        await client.end();
    } catch (err) {
        console.error('❌ Error de conexión:', err.message);
        console.error(err);
    }
}

main();
