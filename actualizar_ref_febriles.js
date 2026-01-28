const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

// IDs específicos de todos los estudios de Reacciones Febriles
const estudiosFebriles = [
    'd6bd0587-334c-47f6-8856-0b5272f5bce8', // Paratífico "A"
    'a5267e3a-f02f-49be-9105-c2b9b01a0b63', // Paratífico "B"
    '762e0f51-c81a-4acf-80ca-e5e0ca20ad0a', // Tífico "H"
    'b35fccba-8cd5-40e3-be78-1b3ec7b054eb', // Tífico "O"
    'fae4a12c-1f82-4828-9254-637be206ede0', // Ac. vs Brucella Abortus
    'ccd94d64-c8b2-4822-af0d-98e4617ef4d9'  // Proteus OX-19
];

async function run() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase\n');

        for (const id of estudiosFebriles) {
            // Actualizar valores_referencia
            await client.query(`
                UPDATE valores_referencia 
                SET valor_texto = 'Negativo', descripcion = NULL
                WHERE estudio_id = $1
            `, [id]);

            // Actualizar estudios_laboratorio
            await client.query(`
                UPDATE estudios_laboratorio 
                SET rango_referencia = 'Negativo'
                WHERE id = $1
            `, [id]);

            // Obtener nombre del estudio
            const { rows } = await client.query(`SELECT nombre FROM estudios_laboratorio WHERE id = $1`, [id]);
            console.log(`✅ ${rows[0]?.nombre || id}: Negativo`);
        }

        console.log('\n========================================');
        console.log('✅ TODOS LOS VALORES ACTUALIZADOS');
        console.log('========================================');
        console.log('📊 Nuevo valor: Negativo');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
