const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function checkTubos() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT nombre, tubo_recipiente 
            FROM estudios_laboratorio 
            WHERE nombre ILIKE '%Biometría%' 
               OR nombre ILIKE '%Orina%'
               OR nombre ILIKE '%Química%'
               OR nombre ILIKE '%Electrolitos%';
        `);
        console.log('Tubos configurados:');
        res.rows.forEach(row => {
            console.log(`- ${row.nombre}: ${row.tubo_recipiente}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkTubos();
