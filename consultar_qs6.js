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

        // Buscar QS6 o analitos típicos de QS6
        const res = await client.query(`
            SELECT codigo, nombre, rango_referencia, unidades, referencia_min, referencia_max
            FROM estudios_laboratorio 
            WHERE codigo IN ('GLU', 'UREA', 'BUN', 'CREAT', 'AU', 'COLEST', 'TG')
               OR nombre ILIKE '%glucosa%'
               OR nombre ILIKE '%acido urico%'
               OR nombre ILIKE '%ácido úrico%'
               OR codigo ILIKE '%QS%'
            ORDER BY codigo
        `);

        console.log('🔍 VALORES ACTUALES EN BD (Química Sanguínea):\n');
        console.log('Codigo\t\tRango Ref\t\tUnidades');
        console.log('─'.repeat(60));

        for (const row of res.rows) {
            const rango = row.rango_referencia || `${row.referencia_min} - ${row.referencia_max}`;
            console.log(`${row.codigo}\t\t${rango}\t\t${row.unidades || ''}`);
        }

        console.log('\n' + '─'.repeat(60));
        console.log(`Total: ${res.rows.length} estudios encontrados`);

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
