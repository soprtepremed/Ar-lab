const { Client } = require('pg');

const regions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'sa-east-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
    'ap-southeast-1', 'ap-southeast-2', 'ca-central-1'
];

async function testRegions() {
    const projectRef = 'ebihobjrwcwtjfazcjmv';
    const password = 'RDF6lvPNdCZWFeAT';

    for (const region of regions) {
        const host = `aws-0-${region}.pooler.supabase.com`;
        console.log(`Checking region: ${region}...`);

        const configs = [
            { user: `postgres.${projectRef}`, port: 6543, note: 'Supavisor' },
            { user: 'postgres', port: 5432, note: 'Direct-like via Pooler' }
        ];

        for (const config of configs) {
            const client = new Client({
                host: host,
                port: config.port,
                user: config.user,
                password: password,
                database: 'postgres',
                ssl: { rejectUnauthorized: false },
                connectionTimeoutMillis: 3000
            });

            try {
                await client.connect();
                console.log(`✅ SUCCESS! Found connection:`);
                console.log(`Region: ${region}`);
                console.log(`Host: ${host}`);
                console.log(`Port: ${config.port}`);
                console.log(`User: ${config.user}`);

                const res = await client.query('SELECT NOW()');
                console.log('🕒 Server Time:', res.rows[0].now);

                // If we found it, let's also apply the gender column fix if requested
                console.log('Ensuring paciente_sexo column exists...');
                await client.query('ALTER TABLE citas ADD COLUMN IF NOT EXISTS paciente_sexo VARCHAR(20)');
                console.log('✅ Column ensured.');

                await client.end();
                return;
            } catch (err) {
                // console.log(`  - ${config.note} failed: ${err.message}`);
            }
        }
    }
    console.log('❌ Could not establish a PostgreSQL connection through any regional pooler.');
}

testRegions();
