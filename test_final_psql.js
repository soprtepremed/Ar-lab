const { Client } = require('pg');

async function test() {
    console.log('Probando conexión al host db con puerto 6543 (Pooler)...');
    const client = new Client({
        host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
        port: 6543,
        user: 'postgres.ebihobjrwcwtjfazcjmv',
        password: 'RDF6lvPNdCZWFeAT',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ ¡ÉXITO! Conexión establecida.');
        const res = await client.query('SELECT version()');
        console.log(res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('❌ Falló:', err.message);

        console.log('\nProbando con IP directa de AWS (us-east-1) para descartar DNS...');
        const client2 = new Client({
            host: '44.216.29.125',
            port: 6543,
            user: 'postgres.ebihobjrwcwtjfazcjmv',
            password: 'RDF6lvPNdCZWFeAT',
            database: 'postgres',
            ssl: { rejectUnauthorized: false }
        });

        try {
            await client2.connect();
            console.log('✅ ¡ÉXITO con IP directa!');
            await client2.end();
        } catch (err2) {
            console.error('❌ También falló con IP directa:', err2.message);
        }
    }
}

test();
