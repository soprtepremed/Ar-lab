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

        // Tiempos de Coagulación
        const estudios = [
            {
                codigo: 'TP',
                nombre: 'Tiempo de Protrombina',
                unidades: 'seg',
                ref_min: 11.0,
                ref_max: 15.0,
                rango: '11.0 - 15.0',
                metodo: 'Coagulométrico',
                es_calculado: false
            },
            {
                codigo: 'TPT',
                nombre: 'Tiempo de Tromboplastina Parcial',
                unidades: 'seg',
                ref_min: 20,
                ref_max: 40,
                rango: '20 - 40',
                metodo: 'Coagulométrico',
                es_calculado: false
            },
            {
                codigo: 'INR',
                nombre: 'Índice Internacional Normalizado',
                unidades: null,
                ref_min: 1.0,
                ref_max: 2.0,
                rango: '1.0 - 2.0',
                metodo: 'Calculado (TP paciente / TP control)^ISI',
                es_calculado: true
            },
            {
                codigo: 'PCT',
                nombre: 'Procalcitonina',
                unidades: 'ng/mL',
                ref_min: 0,
                ref_max: 0.5,
                rango: '< 0.5',
                metodo: 'Electroquimioluminiscencia',
                es_calculado: false
            }
        ];

        console.log('📦 Insertando estudios de coagulación + PCT...\n');

        for (const e of estudios) {
            const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = $1`, [e.codigo]);

            if (check.rows.length > 0) {
                insertedIds[e.codigo] = check.rows[0].id;
                console.log(`⚠️ ${e.codigo} ya existe`);
            } else {
                const categoria = e.codigo === 'PCT' ? 'Inmunología' : 'Coagulación';
                const res = await client.query(`
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, activo,
                        unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                        metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                    RETURNING id
                `, [
                    e.codigo, e.nombre, categoria, e.codigo === 'PCT' ? 200 : 80, true,
                    e.unidades, 'rango', e.ref_min, e.ref_max, e.rango,
                    e.metodo, e.codigo === 'PCT' ? 'Suero' : 'Plasma citratado',
                    e.codigo === 'PCT' ? 'Tubo Rojo' : 'Tubo Celeste',
                    'Mismo día',
                    e.es_calculado ? 'Calculado a partir del TP. Usado para control de anticoagulantes.' : 'No requiere preparación especial.'
                ]);
                insertedIds[e.codigo] = res.rows[0].id;
                const icon = e.es_calculado ? '🧮' : '✅';
                console.log(`${icon} ${e.codigo}: ${e.nombre} (${e.rango} ${e.unidades || ''})`);
            }
        }

        // Perfil de coagulación
        const perfilCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'COAG-PERFIL'`);
        let perfilId;
        if (perfilCheck.rows.length > 0) {
            perfilId = perfilCheck.rows[0].id;
            console.log('\n⚠️ COAG-PERFIL ya existe');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo, es_perfil,
                    tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `, [
                'COAG-PERFIL', 'Tiempos de Coagulación (TP, TPT, INR)', 'Coagulación', 180, true, true,
                'Plasma citratado', 'Tubo Celeste', 'Mismo día',
                'Incluye TP, TPT e INR. Usado para evaluación de hemostasia y control de anticoagulantes.'
            ]);
            perfilId = res.rows[0].id;
            console.log('\n✅ COAG-PERFIL creado');
        }

        // Relaciones del perfil
        console.log('\n📦 Creando relaciones del perfil...');
        const coagCodes = ['TP', 'TPT', 'INR'];
        for (let i = 0; i < coagCodes.length; i++) {
            const compId = insertedIds[coagCodes[i]];
            if (compId) {
                const check = await client.query(
                    `SELECT perfil_id FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`,
                    [perfilId, compId]
                );
                if (check.rows.length === 0) {
                    await client.query(
                        `INSERT INTO estudio_componentes (perfil_id, componente_id, orden) VALUES ($1, $2, $3)`,
                        [perfilId, compId, i + 1]
                    );
                    console.log(`   ✅ Orden ${i + 1}: ${coagCodes[i]}`);
                }
            }
        }

        console.log('\n========================================');
        console.log('✅ TIEMPOS DE COAGULACIÓN + PCT INSERTADOS');
        console.log('========================================');
        console.log('📦 TP: Tiempo de Protrombina (11-15 seg)');
        console.log('📦 TPT: Tiempo de Tromboplastina (20-40 seg)');
        console.log('🧮 INR: Calculado (1.0-2.0)');
        console.log('📦 PCT: Procalcitonina (<0.5 ng/mL)');
        console.log('📦 COAG-PERFIL: Panel completo');
        console.log('🧪 Tubo: Celeste (citrato) para coag, Rojo para PCT');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
