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

        // Definir analitos del perfil tiroideo
        const analitos = [
            { codigo: 'PT-T3CAP', nombre: 'T3 Captación', unidades: '%', ref_min: 24.00, ref_max: 35.00, ref_texto: '24.00 - 35.00' },
            { codigo: 'PT-T3T', nombre: 'T3 Total', unidades: 'ng/dL', ref_min: 0.97, ref_max: 1.69, ref_texto: '0.97 - 1.69' },
            { codigo: 'PT-T3L', nombre: 'T3 Libre', unidades: 'pg/mL', ref_min: 2.77, ref_max: 5.27, ref_texto: '2.77 - 5.27' },
            { codigo: 'PT-T4T', nombre: 'T4 Total', unidades: 'ug/dL', ref_min: 5.53, ref_max: 11.00, ref_texto: '5.53 - 11.00' },
            { codigo: 'PT-T4L', nombre: 'T4 Libre', unidades: 'ng/dL', ref_min: 0.78, ref_max: 2.19, ref_texto: '0.78 - 2.19' },
            { codigo: 'PT-TSH', nombre: 'Hormona Estimulante de Tiroides (TSH)', unidades: 'uUI/mL', ref_min: 0.35, ref_max: 4.94, ref_texto: '0.35 - 4.94' }
        ];

        // Referencias por edad para TSH
        const refsTSH = [
            { desc: '0-1 mes', min_dias: 0, max_dias: 30, valor_min: 1.0, valor_max: 10.9 },
            { desc: '2 meses - 4 años', min_dias: 31, max_dias: 1460, valor_min: 0.5, valor_max: 6.5 },
            { desc: '5-15 años', min_dias: 1461, max_dias: 5475, valor_min: 0.4, valor_max: 5.0 },
            { desc: 'Adultos', min_dias: 5476, max_dias: null, valor_min: 0.35, valor_max: 5.0 }
        ];

        // Referencias por edad para T4 Total
        const refsT4T = [
            { desc: '0-1 mes', min_dias: 0, max_dias: 30, valor_min: 8.2, valor_max: 16 },
            { desc: '2-11 meses', min_dias: 31, max_dias: 335, valor_min: 6.5, valor_max: 12 },
            { desc: '1-5 años', min_dias: 336, max_dias: 1825, valor_min: 5.6, valor_max: 13 },
            { desc: '6-14 años', min_dias: 1826, max_dias: 5110, valor_min: 6.4, valor_max: 13 },
            { desc: 'Adultos (15+)', min_dias: 5111, max_dias: null, valor_min: 4.5, valor_max: 12 }
        ];

        // 1. Insertar analitos individuales
        console.log('📦 Insertando analitos...');
        const insertedIds = {};

        for (const a of analitos) {
            // Verificar si ya existe
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
                    a.codigo, a.nombre, 'Hormonal', 100, true,
                    a.unidades, 'rango', a.ref_min, a.ref_max, a.ref_texto,
                    'Electroquimioluminiscencia', 'Suero', 'Tubo Rojo', 'Mismo día'
                ]);
                insertedIds[a.codigo] = res.rows[0].id;
                console.log(`   ✅ ${a.codigo}: ${a.nombre}`);
            }
        }

        // 2. Insertar perfil padre
        console.log('\n📦 Insertando perfil padre...');
        let perfilId;
        const perfilCheck = await client.query(
            `SELECT id FROM estudios_laboratorio WHERE codigo = 'PT-PERFIL'`
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
                'PT-PERFIL', 'Perfil Tiroideo', 'Hormonal', 100, true, true,
                'Electroquimioluminiscencia', 'Suero', 'Tubo Rojo', 'Mismo día'
            ]);
            perfilId = perfilRes.rows[0].id;
            console.log('   ✅ PT-PERFIL: Perfil Tiroideo');
        }

        // 3. Crear relaciones en estudio_componentes
        console.log('\n📦 Creando relaciones perfil-componentes...');
        let orden = 1;
        for (const a of analitos) {
            // Verificar si ya existe la relación
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

        // 4. Insertar referencias por edad para TSH
        console.log('\n📊 Insertando referencias por edad (TSH)...');
        const tshId = insertedIds['PT-TSH'];
        for (let i = 0; i < refsTSH.length; i++) {
            const r = refsTSH[i];
            // Verificar si ya existe
            const check = await client.query(
                `SELECT id FROM valores_referencia WHERE estudio_id = $1 AND descripcion = $2`,
                [tshId, r.desc]
            );
            if (check.rows.length === 0) {
                await client.query(`
                    INSERT INTO valores_referencia (estudio_id, edad_min_dias, edad_max_dias, valor_min, valor_max, descripcion, orden)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [tshId, r.min_dias, r.max_dias, r.valor_min, r.valor_max, r.desc, i]);
                console.log(`   ✅ TSH ${r.desc}: ${r.valor_min}-${r.valor_max}`);
            }
        }

        // 5. Insertar referencias por edad para T4 Total
        console.log('\n📊 Insertando referencias por edad (T4 Total)...');
        const t4tId = insertedIds['PT-T4T'];
        for (let i = 0; i < refsT4T.length; i++) {
            const r = refsT4T[i];
            const check = await client.query(
                `SELECT id FROM valores_referencia WHERE estudio_id = $1 AND descripcion = $2`,
                [t4tId, r.desc]
            );
            if (check.rows.length === 0) {
                await client.query(`
                    INSERT INTO valores_referencia (estudio_id, edad_min_dias, edad_max_dias, valor_min, valor_max, descripcion, orden)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [t4tId, r.min_dias, r.max_dias, r.valor_min, r.valor_max, r.desc, i]);
                console.log(`   ✅ T4T ${r.desc}: ${r.valor_min}-${r.valor_max}`);
            }
        }

        console.log('\n========================================');
        console.log('✅ PERFIL TIROIDEO INSERTADO');
        console.log('========================================');
        console.log('📦 Perfil: PT-PERFIL');
        console.log('📦 Analitos: 6');
        console.log('📊 Referencias por edad: TSH (4), T4T (5)');
        console.log('💰 Precio: $100');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
