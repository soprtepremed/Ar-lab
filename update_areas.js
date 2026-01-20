const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function migrateAreas() {
    try {
        console.log('Connecting...');
        await client.connect();

        // 1. Add 'area' column if it doesn't exist
        console.log('Adding area column...');
        await client.query(`ALTER TABLE estudios_laboratorio ADD COLUMN IF NOT EXISTS area VARCHAR(100);`);

        // 2. Update mapping
        const mappings = {
            'QUIMICA CLINICA': [
                'Química Sanguínea', 'Perfil Lipídico', 'Función Renal', 'Pruebas Hepáticas',
                'Enzimas', 'Electrolitos', 'Diabetes', 'Inflamación'
            ],
            'INMUNOLOGIA': [
                'Inmunología', 'Perfil Tiroideo', 'Hormonas', 'Marcadores Tumorales'
            ],
            'HEMATOLOGIA': [
                'Hierro y Anemia'
            ],
            'PRUEBAS ESPECIALES': [
                'Vitaminas'
            ],
            'URIANALISIS': [] // None yet, but key exists
        };

        for (const [area, tags] of Object.entries(mappings)) {
            if (tags.length > 0) {
                const list = tags.map(t => `'${t}'`).join(', ');
                const query = `UPDATE estudios_laboratorio SET area = '${area}' WHERE categoria IN (${list});`;
                console.log(`Updating ${area}...`);
                await client.query(query);
            }
        }

        // Default catch-all
        await client.query(`UPDATE estudios_laboratorio SET area = 'QUIMICA CLINICA' WHERE area IS NULL;`);

        console.log('✅ Migration complete.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

migrateAreas();
