const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function checkUnits() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT id, nombre, unidad 
            FROM estudios_laboratorio 
            WHERE nombre ILIKE '%GLUCOSA%' 
               OR nombre ILIKE '%UREA%' 
               OR nombre ILIKE '%CREATININA%'
            LIMIT 5
        `);
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkUnits();
