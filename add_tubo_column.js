const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function addColumn() {
    try {
        console.log('Connecting...');
        await client.connect();

        console.log('Adding column tubo_recipiente...');
        const sql = `ALTER TABLE estudios_laboratorio ADD COLUMN IF NOT EXISTS tubo_recipiente VARCHAR(150);`;

        await client.query(sql);
        console.log('✅ Column added successfully.');

        // Optional: Update some defaults
        console.log('Updating defaults...');
        await client.query("UPDATE estudios_laboratorio SET tubo_recipiente = 'Tubo Rojo' WHERE tubo_recipiente IS NULL;");
        console.log('✅ Defaults updated.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

addColumn();
