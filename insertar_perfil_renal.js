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

        // 1. Agregar columna es_perfil_incluido
        console.log('📦 Verificando columna es_perfil_incluido...');
        const colCheck = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'estudio_componentes' AND column_name = 'es_perfil_incluido'
        `);

        if (colCheck.rows.length === 0) {
            await client.query(`
                ALTER TABLE estudio_componentes 
                ADD COLUMN es_perfil_incluido BOOLEAN DEFAULT FALSE
            `);
            console.log('   ✅ Columna es_perfil_incluido agregada\n');
        } else {
            console.log('   ⚠️ Columna ya existe\n');
        }

        const insertedIds = {};

        // 2. Insertar analitos del Perfil Renal (sin EGO que ya existe)
        const analitos = [
            {
                codigo: 'CREAT', nombre: 'Creatinina', unidades: 'mg/dL', metodo: 'Cinético',
                refs: [{ sexo: 'F', min: 0.5, max: 1.1 }, { sexo: 'M', min: 0.6, max: 1.35 }]
            },
            {
                codigo: 'UREA', nombre: 'Urea', unidades: 'mg/dL', metodo: 'Cinético',
                ref_min: 13, ref_max: 43, rango: '13 - 43'
            },
            {
                codigo: 'BUN', nombre: 'Nitrógeno Ureico (BUN)', unidades: 'mg/dL', metodo: 'Calculado (Urea/2.14)',
                ref_min: 6, ref_max: 20, rango: '6 - 20', es_calculado: true
            },
            {
                codigo: 'PROT-TOT', nombre: 'Proteínas Totales', unidades: 'g/dL', metodo: 'Colorimétrico',
                ref_min: 6.0, ref_max: 8.3, rango: '6.0 - 8.3'
            },
            {
                codigo: 'MICROALB', nombre: 'Microalbuminuria', unidades: 'mg/dL', metodo: 'Turbidimetría',
                ref_min: 0, ref_max: 3, rango: '0 - 3'
            }
        ];

        console.log('📦 Insertando analitos del Perfil Renal...\n');

        for (const a of analitos) {
            const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = $1`, [a.codigo]);

            if (check.rows.length > 0) {
                insertedIds[a.codigo] = check.rows[0].id;
                console.log(`   ⚠️ ${a.codigo} ya existe`);
            } else {
                const rangoRef = a.rango || (a.refs ? `♀${a.refs[0].min}-${a.refs[0].max} / ♂${a.refs[1].min}-${a.refs[1].max}` : null);
                const refMin = a.ref_min !== undefined ? a.ref_min : (a.refs ? a.refs[0].min : null);
                const refMax = a.ref_max !== undefined ? a.ref_max : (a.refs ? a.refs[0].max : null);

                const res = await client.query(`
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, activo,
                        unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                        metodo, tipo_muestra, tubo_recipiente, tiempo_entrega
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    RETURNING id
                `, [
                    a.codigo, a.nombre, 'Química Clínica', 0, true,
                    a.unidades, 'rango', refMin, refMax, rangoRef,
                    a.metodo, a.codigo === 'MICROALB' ? 'Orina' : 'Suero',
                    a.codigo === 'MICROALB' ? 'Frasco estéril' : 'Tubo Rojo', 'Mismo día'
                ]);
                insertedIds[a.codigo] = res.rows[0].id;
                const icon = a.es_calculado ? '🧮' : '✅';
                console.log(`   ${icon} ${a.codigo}: ${a.nombre}`);

                // Refs por sexo
                if (a.refs) {
                    for (let i = 0; i < a.refs.length; i++) {
                        const r = a.refs[i];
                        await client.query(`
                            INSERT INTO valores_referencia (estudio_id, sexo, valor_min, valor_max, descripcion, orden)
                            VALUES ($1, $2, $3, $4, $5, $6)
                        `, [res.rows[0].id, r.sexo, r.min, r.max, r.sexo === 'F' ? 'Mujeres' : 'Hombres', i + 1]);
                    }
                    console.log(`      📊 Refs por sexo agregadas`);
                }
            }
        }

        // Obtener ID del EGO existente
        const egoRes = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'EGO'`);
        if (egoRes.rows.length > 0) {
            insertedIds['EGO'] = egoRes.rows[0].id;
            console.log('   ✅ EGO encontrado (perfil existente)');
        }

        // 3. Crear Perfil Renal
        const perfilCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'PERF-RENAL'`);
        let perfilId;
        if (perfilCheck.rows.length > 0) {
            perfilId = perfilCheck.rows[0].id;
            console.log('\n⚠️ PERF-RENAL ya existe');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo, es_perfil,
                    tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `, [
                'PERF-RENAL', 'Perfil Renal', 'Química Clínica', 350, true, true,
                'Suero + Orina', 'Tubo Rojo + Frasco', 'Mismo día',
                'Requiere muestra de sangre y orina reciente.'
            ]);
            perfilId = res.rows[0].id;
            console.log('\n✅ PERF-RENAL (Perfil) creado');
        }

        // 4. Crear relaciones con marca de perfil incluido
        console.log('\n📦 Creando relaciones...');
        const componentes = [
            { codigo: 'CREAT', es_perfil: false },
            { codigo: 'UREA', es_perfil: false },
            { codigo: 'BUN', es_perfil: false },
            { codigo: 'PROT-TOT', es_perfil: false },
            { codigo: 'EGO', es_perfil: true },  // ← PERFIL INCLUIDO
            { codigo: 'MICROALB', es_perfil: false }
        ];

        for (let i = 0; i < componentes.length; i++) {
            const c = componentes[i];
            const compId = insertedIds[c.codigo];
            if (compId) {
                const check = await client.query(
                    `SELECT perfil_id FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`,
                    [perfilId, compId]
                );
                if (check.rows.length === 0) {
                    await client.query(
                        `INSERT INTO estudio_componentes (perfil_id, componente_id, orden, es_perfil_incluido) 
                         VALUES ($1, $2, $3, $4)`,
                        [perfilId, compId, i + 1, c.es_perfil]
                    );
                    const icon = c.es_perfil ? '📦' : '✅';
                    console.log(`   ${icon} Orden ${i + 1}: ${c.codigo}${c.es_perfil ? ' (PERFIL INCLUIDO)' : ''}`);
                }
            }
        }

        console.log('\n========================================');
        console.log('✅ PERFIL RENAL + PERFILES ANIDADOS');
        console.log('========================================');
        console.log('📦 PERF-RENAL: 6 componentes');
        console.log('   - CREAT, UREA, BUN, PROT-TOT, MICROALB');
        console.log('   - EGO (perfil incluido, expansión dinámica)');
        console.log('🔧 Columna es_perfil_incluido agregada');
        console.log('💰 Precio: $350');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
