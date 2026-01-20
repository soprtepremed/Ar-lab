const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function fixPermissions() {
    try {
        console.log('Connecting to database...');
        await client.connect();

        console.log('Disabling RLS on tables...');
        const queries = [
            'ALTER TABLE citas_estudios DISABLE ROW LEVEL SECURITY;',
            'ALTER TABLE estudios_laboratorio DISABLE ROW LEVEL SECURITY;'
        ];

        for (const query of queries) {
            console.log(`Executing: ${query}`);
            await client.query(query);
            console.log('Success.');
        }

    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
        console.log('Connection closed.');
    }
}

fixPermissions();
