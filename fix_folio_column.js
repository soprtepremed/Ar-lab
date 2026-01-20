const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function fixSchema() {
    try {
        console.log('Conectando a la base de datos...');
        await client.connect();

        console.log('Ejecutando cambio de columna folio_atencion a TEXT...');
        // Altering the column type to TEXT to allow 'YYMMDD-NN' format
        // We use USING folio_atencion::text to handle any existing data conversion if needed, 
        // though if it failed insert index, it might be empty or valid ints.
        const sql = `ALTER TABLE citas ALTER COLUMN folio_atencion TYPE TEXT;`;

        await client.query(sql);
        console.log('✅ Columna folio_atencion actualizada a TEXT correctamente.');

    } catch (err) {
        console.error('❌ Error actualizando esquema:', err.message);
    } finally {
        await client.end();
        console.log('Desconectado.');
    }
}

fixSchema();
