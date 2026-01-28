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

        // Definir analitos del Perfil de Hierro
        const analitos = [
            { codigo: 'PFE-HS', nombre: 'Hierro Sérico', unidades: 'µg/dL', ref_min: 65, ref_max: 170, ref_texto: '65 - 170 (H) / 50 - 170 (M)' },
            { codigo: 'PFE-CTFH', nombre: 'Capacidad Total de Fijación de Hierro', unidades: 'U/L', ref_min: 265, ref_max: 497, ref_texto: '265 - 497' },
            { codigo: 'PFE-SAT', nombre: '% de Saturación de Hierro', unidades: '%', ref_min: 14.8, ref_max: 41.4, ref_texto: '14.8 - 41.4' }
        ];

        // Referencias por edad y sexo para Hierro Sérico (de UPC)
        const refsHierro = [
            // Hombres
            { desc: 'Hombres <1 mes', min_dias: 0, max_dias: 30, sexo: 'M', valor_min: 32, valor_max: 112 },
            { desc: 'Hombres 1-11 meses', min_dias: 31, max_dias: 335, sexo: 'M', valor_min: 27, valor_max: 109 },
            { desc: 'Hombres 1-3 años', min_dias: 336, max_dias: 1095, sexo: 'M', valor_min: 29, valor_max: 91 },
            { desc: 'Hombres 4-6 años', min_dias: 1096, max_dias: 2190, sexo: 'M', valor_min: 52, valor_max: 188 },
            { desc: 'Hombres 7-15 años', min_dias: 2191, max_dias: 5475, sexo: 'M', valor_min: 55, valor_max: 155 },
            { desc: 'Hombres >16 años', min_dias: 5476, max_dias: null, sexo: 'M', valor_min: 65, valor_max: 170 },
            // Mujeres
            { desc: 'Mujeres <1 mes', min_dias: 0, max_dias: 30, sexo: 'F', valor_min: 29, valor_max: 127 },
            { desc: 'Mujeres 1-11 meses', min_dias: 31, max_dias: 335, sexo: 'F', valor_min: 25, valor_max: 126 },
            { desc: 'Mujeres 1-3 años', min_dias: 336, max_dias: 1095, sexo: 'F', valor_min: 25, valor_max: 101 },
            { desc: 'Mujeres 4-6 años', min_dias: 1096, max_dias: 2190, sexo: 'F', valor_min: 52, valor_max: 188 },
            { desc: 'Mujeres 7-15 años', min_dias: 2191, max_dias: 5475, sexo: 'F', valor_min: 55, valor_max: 155 },
            { desc: 'Mujeres >16 años', min_dias: 5476, max_dias: null, sexo: 'F', valor_min: 50, valor_max: 170 }
        ];

        // 1. Insertar analitos individuales
        console.log('📦 Insertando analitos...');
        const insertedIds = {};

        for (const a of analitos) {
            const existCheck = await client.query(
                `SELECT id FROM estudios_laboratorio WHERE codigo = $1`,
                [a.codigo]
            );

            if (existCheck.rows.length > 0) {
                insertedIds[a.codigo] = existCheck.rows[0].id;
                console.log(`   ⚠️ ${a.codigo} ya existe, usando ID existente`);
            } else {
                const res = await client.query(`
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, activo,
                        unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                        metodo, tipo_muestra, tubo_recipiente, tiempo_entrega
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    RETURNING id
                `, [
                    a.codigo, a.nombre, 'Química Clínica', 100, true,
                    a.unidades, 'rango', a.ref_min, a.ref_max, a.ref_texto,
                    'Quimioluminiscencia', 'Suero', 'Tubo Rojo', 'Mismo día'
                ]);
                insertedIds[a.codigo] = res.rows[0].id;
                console.log(`   ✅ ${a.codigo}: ${a.nombre}`);
            }
        }

        // 2. Insertar perfil padre
        console.log('\n📦 Insertando perfil padre...');
        let perfilId;
        const perfilCheck = await client.query(
            `SELECT id FROM estudios_laboratorio WHERE codigo = 'PFE-PERFIL'`
        );

        if (perfilCheck.rows.length > 0) {
            perfilId = perfilCheck.rows[0].id;
            console.log('   ⚠️ Perfil ya existe, usando ID existente');
        } else {
            const perfilRes = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo, es_perfil,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `, [
                'PFE-PERFIL', 'Perfil de Hierro', 'Química Clínica', 100, true, true,
                'Quimioluminiscencia', 'Suero', 'Tubo Rojo', 'Mismo día'
            ]);
            perfilId = perfilRes.rows[0].id;
            console.log('   ✅ PFE-PERFIL: Perfil de Hierro');
        }

        // 3. Crear relaciones en estudio_componentes
        console.log('\n📦 Creando relaciones perfil-componentes...');
        let orden = 1;
        for (const a of analitos) {
            const relCheck = await client.query(
                `SELECT perfil_id FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`,
                [perfilId, insertedIds[a.codigo]]
            );

            if (relCheck.rows.length === 0) {
                await client.query(`
                    INSERT INTO estudio_componentes (perfil_id, componente_id, orden)
                    VALUES ($1, $2, $3)
                `, [perfilId, insertedIds[a.codigo], orden]);
                console.log(`   ✅ Orden ${orden}: ${a.codigo}`);
            } else {
                console.log(`   ⚠️ Relación ya existe: ${a.codigo}`);
            }
            orden++;
        }

        // 4. Insertar referencias por edad para Hierro Sérico
        console.log('\n📊 Insertando referencias por edad (Hierro Sérico)...');
        const hierroId = insertedIds['PFE-HS'];
        for (let i = 0; i < refsHierro.length; i++) {
            const r = refsHierro[i];
            const check = await client.query(
                `SELECT id FROM valores_referencia WHERE estudio_id = $1 AND descripcion = $2`,
                [hierroId, r.desc]
            );
            if (check.rows.length === 0) {
                await client.query(`
                    INSERT INTO valores_referencia (estudio_id, edad_min_dias, edad_max_dias, sexo, valor_min, valor_max, descripcion, orden)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [hierroId, r.min_dias, r.max_dias, r.sexo, r.valor_min, r.valor_max, r.desc, i]);
                console.log(`   ✅ ${r.desc}: ${r.valor_min}-${r.valor_max}`);
            }
        }

        console.log('\n========================================');
        console.log('✅ PERFIL DE HIERRO INSERTADO');
        console.log('========================================');
        console.log('📦 Perfil: PFE-PERFIL');
        console.log('📦 Analitos: 3');
        console.log('📊 Referencias por edad (Hierro): 12 rangos (6H + 6M)');
        console.log('💰 Precio: $100');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
