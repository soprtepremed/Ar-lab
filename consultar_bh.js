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

        const res = await client.query(`
            SELECT codigo, nombre, rango_referencia, unidades, referencia_min, referencia_max
            FROM estudios_laboratorio 
            WHERE codigo ILIKE '%BH%'
               OR codigo ILIKE '%HB%'
               OR codigo ILIKE '%HTO%'
               OR codigo ILIKE '%WBC%'
               OR codigo ILIKE '%RBC%'
               OR codigo ILIKE '%PLT%'
               OR codigo ILIKE '%HGB%'
               OR codigo ILIKE '%MCV%'
               OR codigo ILIKE '%MCH%'
               OR nombre ILIKE '%hemoglobina%'
               OR nombre ILIKE '%hematocrito%'
               OR nombre ILIKE '%leucocito%'
               OR nombre ILIKE '%eritrocito%'
               OR nombre ILIKE '%plaqueta%'
            ORDER BY codigo
        `);

        console.log('🔍 VALORES ACTUALES EN BD (Biometria Hematica):\n');
        console.log('Codigo\t\t\tNombre\t\t\t\tRango Ref');
        console.log('─'.repeat(80));

        for (const row of res.rows) {
            const rango = row.rango_referencia || `${row.referencia_min || ''} - ${row.referencia_max || ''}`;
            const nombre = row.nombre.substring(0, 25);
            console.log(`${row.codigo}\t\t${nombre}\t\t${rango}`);
        }

        console.log('\n' + '─'.repeat(80));
        console.log(`Total: ${res.rows.length} estudios encontrados`);

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
