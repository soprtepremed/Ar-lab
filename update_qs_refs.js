const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function updateRefValues() {
    try {
        console.log('Connecting to database...');
        await client.connect();

        const updates = [
            { nombre: 'Glucosa sérica', unidades: 'mg/dl', referencia: '74 - 106' },
            { nombre: 'Urea sérica', unidades: 'mg/dl', referencia: '15 - 36' },
            { nombre: 'Nitrógeno ureico (BUN)', unidades: 'mg/dl', referencia: '9 - 23' },
            { nombre: 'Creatinina sérica', unidades: 'mg/dl', referencia: '0.52 - 1.4' },
            { nombre: 'Ácido úrico', unidades: 'mg/dl', referencia: '2.6 - 7.2' },
            { nombre: 'Colesterol total', unidades: 'mg/dl', referencia: 'DESEABLE: MENOR A 200\nLIMITROFE: 200-239\nALTO: MAYOR A 240' },
            { nombre: 'Triglicéridos', unidades: 'mg/dl', referencia: '0 - 150' }
        ];

        for (const up of updates) {
            // Updated query to use CASE insensitive search just in case
            const query = `
                UPDATE estudios_laboratorio 
                SET unidades = $1, referencia = $2
                WHERE nombre ILIKE $3
            `;
            // Using ILIKE with wildcards to be safer
            const searchName = `%${propName(up.nombre)}%`;

            // Actually, let's try exact match first or broad match
            // The names might differ slightly (acentos, case).
            // Let's rely on the names I see in previous logs or context if possible.
            // Assuming the names provided in the previous user request matched the DB.

            // Let's use exact names from the previous image context if possible, 
            // but standardizing to what is likely in DB.

            console.log(`Updating ${up.nombre}...`);
            await client.query(query, [up.unidades, up.referencia, up.nombre]);
        }

        console.log('Updates completed.');

    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
        console.log('Connection closed.');
    }
}

function propName(name) {
    return name;
}

updateRefValues();
