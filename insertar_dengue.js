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

        const insertedIds = {};

        // Analitos
        const analitos = [
            { codigo: 'DENG-IGG', nombre: 'Ac. Totales vs. Dengue (IgG)' },
            { codigo: 'DENG-IGM', nombre: 'Ac. Totales vs. Dengue (IgM)' },
            { codigo: 'DENG-NS1', nombre: 'Dengue NS1' }
        ];

        console.log('📦 Insertando analitos de Dengue...');
        for (const a of analitos) {
            const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = $1`, [a.codigo]);
            if (check.rows.length > 0) {
                insertedIds[a.codigo] = check.rows[0].id;
                console.log(`   ⚠️ ${a.codigo} ya existe`);
            } else {
                const res = await client.query(`
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, activo,
                        tipo_referencia, rango_referencia,
                        metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING id
                `, [
                    a.codigo, a.nombre, 'Inmunología', 100, true,
                    'cualitativo', 'NO REACTIVO',
                    'Inmunocromatografía', 'Suero', 'Tubo Rojo', 'Mismo día',
                    'No requiere preparación especial.'
                ]);
                insertedIds[a.codigo] = res.rows[0].id;
                console.log(`   ✅ ${a.codigo}: ${a.nombre}`);
            }
        }

        // Perfil
        let perfilId;
        const perfilCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'DENGUE-PERFIL'`);
        if (perfilCheck.rows.length > 0) {
            perfilId = perfilCheck.rows[0].id;
            console.log('\n   ⚠️ DENGUE-PERFIL ya existe');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo, es_perfil,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id
            `, [
                'DENGUE-PERFIL', 'Panel Dengue (IgG, IgM, NS1)', 'Inmunología', 250, true, true,
                'Inmunocromatografía', 'Suero', 'Tubo Rojo', 'Mismo día',
                'Panel completo para diagnóstico de Dengue. No requiere preparación especial.'
            ]);
            perfilId = res.rows[0].id;
            console.log('\n   ✅ DENGUE-PERFIL creado');
        }

        // Relaciones
        console.log('\n📦 Creando relaciones...');
        const codigos = ['DENG-IGG', 'DENG-IGM', 'DENG-NS1'];
        for (let i = 0; i < codigos.length; i++) {
            const compId = insertedIds[codigos[i]];
            const check = await client.query(
                `SELECT perfil_id FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`,
                [perfilId, compId]
            );
            if (check.rows.length === 0) {
                await client.query(
                    `INSERT INTO estudio_componentes (perfil_id, componente_id, orden) VALUES ($1, $2, $3)`,
                    [perfilId, compId, i + 1]
                );
                console.log(`   ✅ Orden ${i + 1}: ${codigos[i]}`);
            }
        }

        console.log('\n========================================');
        console.log('✅ PANEL DENGUE INSERTADO');
        console.log('========================================');
        console.log('📦 DENGUE-PERFIL: Panel completo');
        console.log('   - DENG-IGG: Anticuerpos IgG');
        console.log('   - DENG-IGM: Anticuerpos IgM');
        console.log('   - DENG-NS1: Antígeno NS1');
        console.log('📊 Referencia: NO REACTIVO');
        console.log('🔬 Método: Inmunocromatografía');
        console.log('💰 Precio: $250');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
