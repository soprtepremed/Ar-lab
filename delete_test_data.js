const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function eliminarDatosPrueba() {
    try {
        console.log('Connecting...');
        await client.connect();

        // 1. Delete all records from citas_estudios (child table first)
        console.log('Deleting citas_estudios...');
        const r1 = await client.query(`DELETE FROM citas_estudios`);
        console.log(`  ✅ Deleted ${r1.rowCount} records from citas_estudios`);

        // 2. Delete all records from citas (parent table)
        console.log('Deleting citas...');
        const r2 = await client.query(`DELETE FROM citas`);
        console.log(`  ✅ Deleted ${r2.rowCount} records from citas`);

        console.log('\n✅ Base de datos (citas) limpiada correctamente.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

eliminarDatosPrueba();
