const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    console.log('🔍 Verificando estudios existentes...\n');

    const { rows } = await client.query(`
        SELECT codigo, nombre 
        FROM estudios_laboratorio 
        WHERE nombre ILIKE '%covid%' 
           OR nombre ILIKE '%sars%'
           OR nombre ILIKE '%coronavirus%'
           OR codigo ILIKE '%COV%'
        ORDER BY nombre
    `);

    if (rows.length === 0) {
        console.log('✅ No hay estudios duplicados de COVID');
    } else {
        console.log('📋 Estudios existentes relacionados:');
        rows.forEach(r => console.log(`   ${r.codigo}: ${r.nombre}`));
    }

    await client.end();
}

run().catch(e => { console.error(e.message); });
