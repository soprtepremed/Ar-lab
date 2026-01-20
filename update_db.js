const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase PostgreSQL');

        // Comando para cambiar el tipo de columna
        const sql = `ALTER TABLE citas ALTER COLUMN folio_atencion TYPE TEXT;`;

        console.log('⏳ Ejecutando:', sql);
        await client.query(sql);
        console.log('✅ Columna folio_atencion convertida a TEXT exitosamente.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
        console.log('👋 Desconectado.');
    }
}

main();
