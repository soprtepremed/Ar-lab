
const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function checkCount() {
    try {
        await client.connect();
        const res = await client.query('SELECT COUNT(*) FROM estudios_laboratorio');
        console.log('COUNT:', res.rows[0].count);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

checkCount();
