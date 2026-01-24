const { Client } = require('pg');

const client = new Client({
    host: '2600:1f16:1cd0:3328:b828:370d:ea32:6ff0',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    console.log('Intentando conectar via IPv6 directa...');
    try {
        await client.connect();
        console.log('✅ Conectado exitosamente via IPv6.');
        const res = await client.query('SELECT current_database(), now()');
        console.log('📊 Resultado:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('❌ Falló la conexión IPv6:', err.message);
        console.log('Probando fallback con DNS lookup manual...');

        // Fallback: Si Node no maneja bien IPv6 en el host, a veces usar '::' o similar ayuda.
        // Pero intentemos resolver el DNS a ver qué pasa en este entorno.
        require('dns').lookup('db.ebihobjrwcwtjfazcjmv.supabase.co', (err, address, family) => {
            console.log('DNS Lookup:', address, 'Family: IPv' + family);
        });
    }
}

main();
