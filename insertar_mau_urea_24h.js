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

        // ========== MICROALBÚMINA EN ORINA 24H ==========
        console.log('📦 === MICROALBÚMINA EN ORINA 24H ===');

        const mauAnalitos = [
            {
                codigo: 'MAU-CONC',
                nombre: 'Microalbúmina (concentración)',
                unidades: 'mg/L',
                ref_max: 30,
                ref_texto: '< 30',
                formula: null
            },
            {
                codigo: 'MAU-VOL',
                nombre: 'Volumen Retenido',
                unidades: 'mL',
                ref_min: 1200, ref_max: 2000,
                ref_texto: '1200 - 2000',
                formula: null
            },
            {
                codigo: 'MAU-24H',
                nombre: 'Microalbúmina 24h (excreción)',
                unidades: 'mg/24h',
                ref_max: 30,
                ref_texto: '< 30',
                formula: '[MAU-CONC] * [MAU-VOL] / 1000'
            }
        ];

        for (const a of mauAnalitos) {
            const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = $1`, [a.codigo]);
            if (check.rows.length > 0) {
                insertedIds[a.codigo] = check.rows[0].id;
                console.log(`   ⚠️ ${a.codigo} ya existe`);
            } else {
                const res = await client.query(`
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, activo,
                        unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                        metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, formula, indicaciones
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                    RETURNING id
                `, [
                    a.codigo, a.nombre, 'Química Clínica', 100, true,
                    a.unidades, 'rango', a.ref_min || null, a.ref_max || null, a.ref_texto,
                    'Turbidimetría', 'Orina 24h', 'Frasco', 'Mismo día',
                    a.formula, 'Orina de 24h sin ácido, conservar en refrigeración.'
                ]);
                insertedIds[a.codigo] = res.rows[0].id;
                console.log(`   ✅ ${a.codigo}: ${a.nombre}${a.formula ? ' (CALCULADO)' : ''}`);
            }
        }

        // Perfil Microalbúmina
        let mauPerfilId;
        const mauPerfilCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'MAU-PERFIL'`);
        if (mauPerfilCheck.rows.length > 0) {
            mauPerfilId = mauPerfilCheck.rows[0].id;
            console.log('   ⚠️ MAU-PERFIL ya existe');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (codigo, nombre, categoria, precio, activo, es_perfil, metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
            `, ['MAU-PERFIL', 'Albúmina en Orina de 24 Horas (Microalbúmina)', 'Química Clínica', 150, true, true, 'Turbidimetría', 'Orina 24h', 'Frasco', 'Mismo día', 'Orina de 24h sin ácido, conservar en refrigeración.']);
            mauPerfilId = res.rows[0].id;
            console.log('   ✅ MAU-PERFIL creado');
        }

        // Relaciones MAU
        const mauCodigos = ['MAU-CONC', 'MAU-VOL', 'MAU-24H'];
        for (let i = 0; i < mauCodigos.length; i++) {
            const compId = insertedIds[mauCodigos[i]];
            const check = await client.query(`SELECT perfil_id FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`, [mauPerfilId, compId]);
            if (check.rows.length === 0) {
                await client.query(`INSERT INTO estudio_componentes (perfil_id, componente_id, orden) VALUES ($1, $2, $3)`, [mauPerfilId, compId, i + 1]);
            }
        }
        console.log('   ✅ Relaciones creadas');

        // ========== UREA EN ORINA 24H ==========
        console.log('\n📦 === UREA EN ORINA 24H ===');

        const ureaAnalitos = [
            {
                codigo: 'UREA-CONC',
                nombre: 'Urea Urinaria (concentración)',
                unidades: 'mg/dL',
                ref_min: 12, ref_max: 54,
                ref_texto: '12 - 54',
                formula: null
            },
            {
                codigo: 'UREA-VOL',
                nombre: 'Volumen Retenido',
                unidades: 'mL',
                ref_min: 1200, ref_max: 2000,
                ref_texto: '1200 - 2000',
                formula: null
            },
            {
                codigo: 'UREA-24H',
                nombre: 'Urea 24h (excreción total)',
                unidades: 'g/24h',
                ref_min: 26, ref_max: 43,
                ref_texto: '26 - 43',
                formula: '[UREA-CONC] * [UREA-VOL] * 0.01 / 1000'
            }
        ];

        for (const a of ureaAnalitos) {
            const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = $1`, [a.codigo]);
            if (check.rows.length > 0) {
                insertedIds[a.codigo] = check.rows[0].id;
                console.log(`   ⚠️ ${a.codigo} ya existe`);
            } else {
                const res = await client.query(`
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, activo,
                        unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                        metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, formula, indicaciones
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                    RETURNING id
                `, [
                    a.codigo, a.nombre, 'Química Clínica', 100, true,
                    a.unidades, 'rango', a.ref_min || null, a.ref_max || null, a.ref_texto,
                    'Cinético', 'Orina 24h', 'Frasco', 'Mismo día',
                    a.formula, 'Orina de 24h sin ácido, conservar en refrigeración.'
                ]);
                insertedIds[a.codigo] = res.rows[0].id;
                console.log(`   ✅ ${a.codigo}: ${a.nombre}${a.formula ? ' (CALCULADO)' : ''}`);
            }
        }

        // Perfil Urea
        let ureaPerfilId;
        const ureaPerfilCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'UREA-PERFIL'`);
        if (ureaPerfilCheck.rows.length > 0) {
            ureaPerfilId = ureaPerfilCheck.rows[0].id;
            console.log('   ⚠️ UREA-PERFIL ya existe');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (codigo, nombre, categoria, precio, activo, es_perfil, metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
            `, ['UREA-PERFIL', 'Urea en Orina de 24 Horas', 'Química Clínica', 150, true, true, 'Cinético', 'Orina 24h', 'Frasco', 'Mismo día', 'Orina de 24h sin ácido, conservar en refrigeración.']);
            ureaPerfilId = res.rows[0].id;
            console.log('   ✅ UREA-PERFIL creado');
        }

        // Relaciones UREA
        const ureaCodigos = ['UREA-CONC', 'UREA-VOL', 'UREA-24H'];
        for (let i = 0; i < ureaCodigos.length; i++) {
            const compId = insertedIds[ureaCodigos[i]];
            const check = await client.query(`SELECT perfil_id FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`, [ureaPerfilId, compId]);
            if (check.rows.length === 0) {
                await client.query(`INSERT INTO estudio_componentes (perfil_id, componente_id, orden) VALUES ($1, $2, $3)`, [ureaPerfilId, compId, i + 1]);
            }
        }
        console.log('   ✅ Relaciones creadas');

        console.log('\n========================================');
        console.log('✅ ESTUDIOS INSERTADOS');
        console.log('========================================');
        console.log('📦 MAU-PERFIL: Albúmina en Orina 24h');
        console.log('   - MAU-CONC, MAU-VOL, MAU-24H (calculado)');
        console.log('📦 UREA-PERFIL: Urea en Orina 24h');
        console.log('   - UREA-CONC, UREA-VOL, UREA-24H (calculado)');
        console.log('💰 Precio: $150 c/u');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
