const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        await client.connect();

        console.log("Checking citas_estudios for 'validado' status...");

        // Check counts by status
        const res = await client.query(`
            SELECT estado_muestra, count(*) 
            FROM citas_estudios 
            GROUP BY estado_muestra
        `);
        console.table(res.rows);

        // Check specific validation data
        const resVal = await client.query(`
            SELECT id, estudio_id, estado_muestra, resultados 
            FROM citas_estudios 
            WHERE estado_muestra = 'validado' 
            LIMIT 5
        `);

        console.log("Samples with 'validado':");
        console.log(JSON.stringify(resVal.rows, null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.end();
    }
}

check();
