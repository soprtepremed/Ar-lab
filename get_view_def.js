const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function getViewDefinition() {
    try {
        await client.connect();

        const sql = `
            SELECT pg_get_viewdef('lista_trabajo_diaria', true) as definition;
        `;

        const res = await client.query(sql);
        console.log('Definición de la vista:', res.rows[0].definition);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

getViewDefinition();
