const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function checkCategories() {
    try {
        console.log('Connecting...');
        await client.connect();

        console.log('Checking existing categories in estudios_laboratorio...');
        const res = await client.query('SELECT DISTINCT categoria FROM estudios_laboratorio');

        console.log('Current Categories:', res.rows.map(r => r.categoria));

        // Check if we need to standardize
        const desiredCategories = [
            'HEMATOLOGIA',
            'QUIMICA CLINICA',
            'URIANALISIS',
            'PRUEBAS ESPECIALES',
            'INMUNOLOGIA'
        ];

        console.log('Target Categories:', desiredCategories);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkCategories();
