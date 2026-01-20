const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function runDebug() {
    try {
        console.log('Connecting...');
        await client.connect();

        const sqlCheck = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'estudios_laboratorio' AND column_name = 'tubo_recipiente';
        `;

        const res = await client.query(sqlCheck);
        if (res.rows.length > 0) {
            console.log('✅ Column tubo_recipiente EXISTS.');
            console.log(res.rows[0]);
        } else {
            console.log('❌ Column tubo_recipiente DOES NOT EXIST.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

runDebug();
