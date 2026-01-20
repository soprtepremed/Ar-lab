const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function listViews() {
    try {
        await client.connect();

        const sql = `
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'public';
        `;

        const res = await client.query(sql);
        console.log('Vistas encontradas:', res.rows.map(r => r.table_name));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

listViews();
