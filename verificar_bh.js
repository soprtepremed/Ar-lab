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
        console.log('🔍 Verificando analitos existentes de Biometría Hemática...\n');

        // Buscar por códigos BH- o por nombres relacionados
        const query = `
            SELECT codigo, nombre 
            FROM estudios_laboratorio 
            WHERE codigo LIKE 'BH-%' 
               OR nombre ILIKE '%leucocito%'
               OR nombre ILIKE '%eritrocito%'
               OR nombre ILIKE '%hemoglobina%'
               OR nombre ILIKE '%hematocrito%'
               OR nombre ILIKE '%plaqueta%'
               OR nombre ILIKE '%linfocito%'
               OR nombre ILIKE '%neutrofilo%'
               OR nombre ILIKE '%monocito%'
               OR nombre ILIKE '%eosinofilo%'
               OR nombre ILIKE '%basofilo%'
               OR nombre ILIKE '%corpuscular%'
            ORDER BY codigo, nombre
        `;

        const res = await client.query(query);

        if (res.rows.length === 0) {
            console.log('❌ No se encontraron analitos existentes de Biometría Hemática');
        } else {
            console.log(`✅ Encontrados ${res.rows.length} analitos existentes:\n`);
            res.rows.forEach(row => {
                console.log(`   ${row.codigo || '(sin código)'} - ${row.nombre}`);
            });
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
