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

        // Analitos del Perfil Hepático
        const analitos = [
            {
                codigo: 'ALT', nombre: 'Alanino Aminotransferasa (TGP)', unidades: 'U/L', metodo: 'Enzimático',
                refs: [{ sexo: 'F', min: 9, max: 52 }, { sexo: 'M', min: 21, max: 72 }]
            },
            {
                codigo: 'AST', nombre: 'Aspartato Aminotransferasa (TGO)', unidades: 'U/L', metodo: 'Enzimático',
                refs: [{ sexo: 'F', min: 14, max: 36 }, { sexo: 'M', min: 17, max: 59 }]
            },
            {
                codigo: 'BT', nombre: 'Bilirrubina Total', unidades: 'mg/dL', metodo: 'Colorimétrico',
                ref_min: 0.2, ref_max: 1.0, rango: '0.2 - 1.0'
            },
            {
                codigo: 'BD', nombre: 'Bilirrubina Directa', unidades: 'mg/dL', metodo: 'Colorimétrico',
                ref_min: 0.0, ref_max: 0.2, rango: '0.0 - 0.2'
            },
            {
                codigo: 'BI', nombre: 'Bilirrubina Indirecta', unidades: 'mg/dL', metodo: 'Calculado (BT-BD)',
                ref_min: 0.0, ref_max: 1.0, rango: '0.0 - 1.0', es_calculado: true
            },
            {
                codigo: 'FA', nombre: 'Fosfatasa Alcalina', unidades: 'U/L', metodo: 'Colorimétrico',
                refs: [{ sexo: 'F', min: 35, max: 105 }, { sexo: 'M', min: 40, max: 130 }]
            },
            {
                codigo: 'GGT', nombre: 'Gamma Glutamil Transpeptidasa', unidades: 'U/L', metodo: 'Enzimático',
                refs: [{ sexo: 'F', min: 9, max: 36 }, { sexo: 'M', min: 12, max: 64 }]
            }
        ];

        console.log('📦 Insertando analitos del Perfil Hepático...\n');

        for (const a of analitos) {
            const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = $1`, [a.codigo]);

            if (check.rows.length > 0) {
                insertedIds[a.codigo] = check.rows[0].id;
                console.log(`   ⚠️ ${a.codigo} ya existe`);
            } else {
                // Para analitos sin refs por sexo
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
                    a.metodo, 'Suero', 'Tubo Rojo', 'Mismo día'
                ]);
                insertedIds[a.codigo] = res.rows[0].id;
                const icon = a.es_calculado ? '🧮' : '✅';
                console.log(`   ${icon} ${a.codigo}: ${a.nombre}`);

                // Si tiene refs por sexo, insertar en valores_referencia
                if (a.refs) {
                    for (let i = 0; i < a.refs.length; i++) {
                        const r = a.refs[i];
                        const desc = r.sexo === 'F' ? 'Mujeres' : 'Hombres';
                        await client.query(`
                            INSERT INTO valores_referencia (estudio_id, sexo, valor_min, valor_max, descripcion, orden)
                            VALUES ($1, $2, $3, $4, $5, $6)
                        `, [res.rows[0].id, r.sexo, r.min, r.max, desc, i + 1]);
                    }
                    console.log(`      📊 Refs por sexo agregadas`);
                }
            }
        }

        // Perfil Hepático (padre)
        const perfilCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'PERF-HEP'`);
        let perfilId;
        if (perfilCheck.rows.length > 0) {
            perfilId = perfilCheck.rows[0].id;
            console.log('\n⚠️ PERF-HEP ya existe');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo, es_perfil,
                    tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `, [
                'PERF-HEP', 'Perfil Hepático', 'Química Clínica', 350, true, true,
                'Suero', 'Tubo Rojo', 'Mismo día',
                'Ayuno de 9 horas. Evalúa función hepática.'
            ]);
            perfilId = res.rows[0].id;
            console.log('\n✅ PERF-HEP (Perfil) creado');
        }

        // Relaciones del perfil
        console.log('\n📦 Creando relaciones...');
        const orden_analitos = ['ALT', 'AST', 'BT', 'BD', 'BI', 'FA', 'GGT'];
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
                        `INSERT INTO estudio_componentes (perfil_id, componente_id, orden) VALUES ($1, $2, $3)`,
                        [perfilId, compId, i + 1]
                    );
                }
            }
        }
        console.log(`   ✅ 7 componentes vinculados`);

        console.log('\n========================================');
        console.log('✅ PERFIL HEPÁTICO INSERTADO (UPC)');
        console.log('========================================');
        console.log('📦 PERF-HEP: Perfil Hepático');
        console.log('📊 7 analitos: ALT, AST, BT, BD, BI, FA, GGT');
        console.log('🧮 BI es calculado (BT-BD)');
        console.log('♀♂ 4 con refs por sexo');
        console.log('🧪 Tubo: Rojo (Suero)');
        console.log('💰 Precio: $350');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
