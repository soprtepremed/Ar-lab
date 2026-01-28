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
        console.log('🔍 Verificando analitos EGO existentes...\n');

        const query = `
            SELECT codigo, nombre 
            FROM estudios_laboratorio 
            WHERE codigo LIKE 'EGO%' 
               OR nombre ILIKE '%orina%'
               OR nombre ILIKE '%densidad%'
               OR nombre ILIKE '%nitritos%'
               OR nombre ILIKE '%proteinas%'
               OR nombre ILIKE '%cetonico%'
               OR nombre ILIKE '%bilirrubina%'
               OR nombre ILIKE '%urobilinogeno%'
               OR nombre ILIKE '%cilindro%'
               OR nombre ILIKE '%cristal%'
               OR nombre ILIKE '%bacteria%'
               OR nombre ILIKE '%piocito%'
            ORDER BY codigo, nombre
        `;

        const res = await client.query(query);

        if (res.rows.length === 0) {
            console.log('❌ No se encontraron analitos EGO existentes');
        } else {
            console.log(`✅ Encontrados ${res.rows.length} analitos:\n`);
            res.rows.forEach(row => {
                console.log(`   ${row.codigo || '(sin código)'} - ${row.nombre}`);
            });
        }

        // También verificar si existe el perfil EGO
        console.log('\n📦 Verificando perfil EGO...');
        const perfilQuery = `SELECT id, codigo, nombre FROM estudios_laboratorio WHERE (codigo ILIKE '%EGO%' OR nombre ILIKE '%orina%') AND es_perfil = true`;
        const perfilRes = await client.query(perfilQuery);
        if (perfilRes.rows.length > 0) {
            perfilRes.rows.forEach(row => {
                console.log(`   ✅ Perfil: ${row.codigo} - ${row.nombre} (ID: ${row.id})`);
            });
        } else {
            console.log('   ❌ No se encontró perfil EGO');
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
