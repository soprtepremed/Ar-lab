const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function clearPatients() {
    try {
        console.log('Connecting...');
        await client.connect();

        console.log('Deleting citas_estudios...');
        await client.query('DELETE FROM citas_estudios;');

        console.log('Deleting citas (Patients)...');
        await client.query('DELETE FROM citas;');

        console.log('✅ All patients and appointments deleted successfully.');

    } catch (err) {
        console.error('Error clearing database:', err);
    } finally {
        await client.end();
    }
}

clearPatients();
