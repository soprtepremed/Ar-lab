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

        // Analitos del Perfil Lipídico
        const analitos = [
            {
                codigo: 'COLEST', nombre: 'Colesterol Total', unidades: 'mg/dL', metodo: 'Enzimático',
                ref_min: 0, ref_max: 200, rango: '< 200 (Deseable)'
            },
            {
                codigo: 'TG', nombre: 'Triglicéridos', unidades: 'mg/dL', metodo: 'Enzimático',
                ref_min: 0, ref_max: 150, rango: '< 150'
            },
            {
                codigo: 'HDL', nombre: 'Colesterol HDL', unidades: 'mg/dL', metodo: 'Enzimático',
                refs: [{ sexo: 'F', min: 50, max: 999 }, { sexo: 'M', min: 40, max: 999 }]
            },
            {
                codigo: 'LDL', nombre: 'Colesterol LDL', unidades: 'mg/dL', metodo: 'Calculado (Friedewald)',
                ref_min: 0, ref_max: 100, rango: '< 100 (Óptimo)', es_calculado: true
            },
            {
                codigo: 'VLDL', nombre: 'Colesterol VLDL', unidades: 'mg/dL', metodo: 'Calculado (TG/5)',
                ref_min: 0, ref_max: 30, rango: '< 30', es_calculado: true
            }
        ];

        console.log('📦 Verificando/Insertando analitos del Perfil Lipídico...\n');

        for (const a of analitos) {
            const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = $1`, [a.codigo]);

            if (check.rows.length > 0) {
                insertedIds[a.codigo] = check.rows[0].id;
                console.log(`   ⚠️ ${a.codigo} ya existe (ID: ${check.rows[0].id})`);
            } else {
                const rangoRef = a.rango || (a.refs ? `♀>${a.refs[0].min} / ♂>${a.refs[1].min}` : null);
                const refMin = a.ref_min !== undefined ? a.ref_min : (a.refs ? a.refs[1].min : null);
                const refMax = a.ref_max !== undefined ? a.ref_max : 999;

                const res = await client.query(`
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, activo,
                        unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                        metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                    RETURNING id
                `, [
                    a.codigo, a.nombre, 'Química Clínica', 0, true,
                    a.unidades, 'rango', refMin, refMax, rangoRef,
                    a.metodo, 'Suero', 'Tubo Rojo', 'Mismo día',
                    'Ayuno de 12 horas.'
                ]);
                insertedIds[a.codigo] = res.rows[0].id;
                const icon = a.es_calculado ? '🧮' : '✅';
                console.log(`   ${icon} ${a.codigo}: ${a.nombre} (NUEVO)`);

                // Refs por sexo para HDL
                if (a.refs) {
                    for (let i = 0; i < a.refs.length; i++) {
                        const r = a.refs[i];
                        await client.query(`
                            INSERT INTO valores_referencia (estudio_id, sexo, valor_min, valor_max, descripcion, orden)
                            VALUES ($1, $2, $3, $4, $5, $6)
                        `, [res.rows[0].id, r.sexo, r.min, r.max, r.sexo === 'F' ? 'Mujeres (>50)' : 'Hombres (>40)', i + 1]);
                    }
                    console.log(`      📊 Refs por sexo agregadas`);
                }
            }
        }

        // Perfil Lipídico (padre)
        const perfilCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'PERF-LIP'`);
        let perfilId;
        if (perfilCheck.rows.length > 0) {
            perfilId = perfilCheck.rows[0].id;
            console.log('\n⚠️ PERF-LIP ya existe');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo, es_perfil,
                    tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `, [
                'PERF-LIP', 'Perfil de Lípidos', 'Química Clínica', 250, true, true,
                'Suero', 'Tubo Rojo', 'Mismo día',
                'Ayuno estricto de 12 horas. Evalúa riesgo cardiovascular.'
            ]);
            perfilId = res.rows[0].id;
            console.log('\n✅ PERF-LIP (Perfil) creado');
        }

        // Relaciones
        console.log('\n📦 Verificando relaciones...');
        const orden_analitos = ['COLEST', 'TG', 'HDL', 'LDL', 'VLDL'];
        for (let i = 0; i < orden_analitos.length; i++) {
            const cod = orden_analitos[i];
            const compId = insertedIds[cod];
            if (compId) {
                const check = await client.query(
                    `SELECT perfil_id FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`,
                    [perfilId, compId]
                );
                if (check.rows.length === 0) {
                    await client.query(
                        `INSERT INTO estudio_componentes (perfil_id, componente_id, orden, es_perfil_incluido) 
                         VALUES ($1, $2, $3, $4)`,
                        [perfilId, compId, i + 1, false]
                    );
                    console.log(`   ✅ Orden ${i + 1}: ${cod} (NUEVO)`);
                } else {
                    console.log(`   ⚠️ Orden ${i + 1}: ${cod} (ya existe)`);
                }
            }
        }

        console.log('\n========================================');
        console.log('✅ PERFIL LIPÍDICO INSERTADO');
        console.log('========================================');
        console.log('📦 PERF-LIP: 5 analitos');
        console.log('   - COLEST, TG, HDL, LDL, VLDL');
        console.log('🧮 LDL y VLDL son calculados');
        console.log('♀♂ HDL con refs por sexo');
        console.log('💰 Precio: $250');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
