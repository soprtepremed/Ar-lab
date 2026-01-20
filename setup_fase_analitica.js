const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function setupFaseAnalitica() {
    try {
        console.log('Connecting...');
        await client.connect();

        // 1. Add 'area' column to estudios_laboratorio
        console.log('Adding area column to estudios_laboratorio...');
        await client.query(`
            ALTER TABLE estudios_laboratorio 
            ADD COLUMN IF NOT EXISTS area TEXT DEFAULT 'General'
        `);
        console.log('  ✅ Column added');

        // 2. Update areas based on study type
        console.log('Updating study areas...');

        // Hematología
        await client.query(`
            UPDATE estudios_laboratorio SET area = 'Hematología' 
            WHERE nombre ILIKE '%hemát%' OR nombre ILIKE '%hemograma%' OR codigo = 'BH'
        `);

        // Coagulación
        await client.query(`
            UPDATE estudios_laboratorio SET area = 'Coagulación' 
            WHERE nombre ILIKE '%protrombina%' OR nombre ILIKE '%tromboplastina%' 
            OR codigo IN ('TP', 'TTP')
        `);

        // Química Clínica
        await client.query(`
            UPDATE estudios_laboratorio SET area = 'Química Clínica' 
            WHERE nombre ILIKE '%lípido%' OR nombre ILIKE '%glucosa%' OR nombre ILIKE '%colesterol%'
            OR nombre ILIKE '%bilirrubina%' OR nombre ILIKE '%proteína%' OR nombre ILIKE '%aterogénico%'
            OR codigo = 'LT'
        `);

        // Uroanálisis
        await client.query(`
            UPDATE estudios_laboratorio SET area = 'Uroanálisis' 
            WHERE nombre ILIKE '%orina%' OR codigo = 'EGO'
        `);

        // 3. Show current studies with areas
        const result = await client.query(`
            SELECT id, codigo, nombre, area FROM estudios_laboratorio ORDER BY area, nombre
        `);

        console.log('\n📋 Estudios por Área:');
        let currentArea = '';
        result.rows.forEach(r => {
            if (r.area !== currentArea) {
                currentArea = r.area;
                console.log(`\n  [${currentArea}]`);
            }
            console.log(`    - ${r.codigo || '--'}: ${r.nombre}`);
        });

        console.log('\n✅ Setup completo para Fase Analítica');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

setupFaseAnalitica();
