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
    try {
        await client.connect();

        // Ver estructura actual de estudios_laboratorio
        console.log('📋 Estructura actual de estudios_laboratorio:\n');
        const cols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'estudios_laboratorio' 
            ORDER BY ordinal_position
        `);
        cols.rows.forEach(r => console.log(`   ${r.column_name}: ${r.data_type}`));

        // Ver ejemplo de cómo se guardan referencias actualmente
        console.log('\n📊 Ejemplo de campos de referencia actuales:');
        const ejemplo = await client.query(`
            SELECT codigo, nombre, tipo_referencia, referencia_texto, referencia_min, referencia_max
            FROM estudios_laboratorio 
            WHERE referencia_texto IS NOT NULL OR referencia_min IS NOT NULL
            LIMIT 5
        `);
        ejemplo.rows.forEach(r => {
            console.log(`\n   ${r.codigo}: ${r.nombre}`);
            console.log(`     tipo: ${r.tipo_referencia}`);
            console.log(`     texto: ${r.referencia_texto || '-'}`);
            console.log(`     min/max: ${r.referencia_min || '-'} / ${r.referencia_max || '-'}`);
        });

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
