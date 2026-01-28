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

    console.log('📋 Estructura de valores_referencia:\n');
    const cols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'valores_referencia' 
        ORDER BY ordinal_position
    `);
    cols.rows.forEach(r => console.log(`   ${r.column_name}: ${r.data_type}`));

    console.log('\n📊 Datos actuales:');
    const datos = await client.query(`SELECT * FROM valores_referencia LIMIT 5`);
    datos.rows.forEach(r => {
        console.log(`   ${r.descripcion}: ${r.valor_min}-${r.valor_max} (dias ${r.edad_min_dias}-${r.edad_max_dias || '∞'})`);
    });

    await client.end();
}

run().catch(e => { console.error(e.message); });
