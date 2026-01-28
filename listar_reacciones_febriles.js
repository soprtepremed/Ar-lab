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
        console.log('✅ Conectado a Supabase\n');

        // Buscar estudios con nombres similares a Reacciones Febriles
        const busqueda = await client.query(`
            SELECT id, nombre, codigo, rango_referencia 
            FROM estudios_laboratorio 
            WHERE LOWER(nombre) LIKE '%tifico%'
               OR LOWER(nombre) LIKE '%paratifico%'
               OR LOWER(nombre) LIKE '%brucella%'
               OR LOWER(nombre) LIKE '%proteus%'
               OR LOWER(nombre) LIKE '%reacciones%'
               OR LOWER(nombre) LIKE '%febril%'
               OR LOWER(nombre) LIKE '%abortus%'
               OR LOWER(codigo) LIKE '%rf%'
            ORDER BY nombre
        `);

        console.log('📋 Estudios encontrados:\n');
        for (const row of busqueda.rows) {
            console.log(`ID: ${row.id}`);
            console.log(`   Nombre: ${row.nombre}`);
            console.log(`   Código: ${row.codigo || 'N/A'}`);
            console.log(`   Referencia actual: ${row.rango_referencia || '(vacío)'}`);
            console.log('');
        }

        console.log(`\nTotal: ${busqueda.rows.length} estudios`);

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
