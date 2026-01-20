const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function resetToPending() {
    try {
        console.log('Connecting...');
        await client.connect();

        const targetDate = '2026-01-19';

        // Update all citas on this date to 'pendiente'
        const res = await client.query(`
            UPDATE citas 
            SET estado = 'pendiente' 
            WHERE fecha_hora::date = $1
        `, [targetDate]);

        console.log(`✅ Updated ${res.rowCount} patients to 'pendiente' (Not Verified).`);

    } catch (err) {
        console.error('Error updating:', err);
    } finally {
        await client.end();
    }
}

resetToPending();
