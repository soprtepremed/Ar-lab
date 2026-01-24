const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function updateUnits() {
    try {
        await client.connect();
        console.log('Connected. Updating units...');

        // Glucosa -> mg/dL
        await client.query(`UPDATE estudios_laboratorio SET unidad = 'mg/dL' WHERE nombre ILIKE '%GLUCOSA%'`);
        console.log('Glucosa updated.');

        // Creatinina -> mg/dL
        await client.query(`UPDATE estudios_laboratorio SET unidad = 'mg/dL' WHERE nombre ILIKE '%CREATININA%'`);
        console.log('Creatinina updated.');

        // Urea -> mg/dL
        await client.query(`UPDATE estudios_laboratorio SET unidad = 'mg/dL' WHERE nombre ILIKE '%UREA%'`);
        console.log('Urea updated.');

        // BUN (Nitrógeno Ureico) -> mg/dL if exists
        await client.query(`UPDATE estudios_laboratorio SET unidad = 'mg/dL' WHERE nombre ILIKE '%BUN%' OR nombre ILIKE '%NITROGENO UREICO%'`);
        console.log('BUN updated.');

        // Colesterol -> mg/dL
        await client.query(`UPDATE estudios_laboratorio SET unidad = 'mg/dL' WHERE nombre ILIKE '%COLESTEROL%'`);
        console.log('Colesterol updated.');

        // Trigliceridos -> mg/dL
        await client.query(`UPDATE estudios_laboratorio SET unidad = 'mg/dL' WHERE nombre ILIKE '%TRIGLICERIDOS%'`);
        console.log('Trigliceridos updated.');

        // Acido Urico -> mg/dL
        await client.query(`UPDATE estudios_laboratorio SET unidad = 'mg/dL' WHERE nombre ILIKE '%ACIDO URICO%'`);
        console.log('Acido Urico updated.');


    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

updateUnits();
