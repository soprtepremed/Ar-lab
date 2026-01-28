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
        console.log('📦 Actualizando BH con valores UPC...\n');

        // 1. Actualizaciones de rangos simples
        const updates = [
            { codigo: 'BH-VCM', min: 84, max: 104, rango: '84 - 104' },
            { codigo: 'BH-HCM', min: 27, max: 35, rango: '27 - 35' },
            { codigo: 'BH-CHCM', min: 29, max: 35, rango: '29 - 35' },
            { codigo: 'BH-RDW', min: 10, max: 15, rango: '10 - 15' },
            { codigo: 'BH-VPM', min: 7.4, max: 11, rango: '7.4 - 11.0' },
            { codigo: 'BH-LEU', min: 5.0, max: 10.0, rango: '5.0 - 10.0' },
            { codigo: 'BH-NEU-P', min: 40, max: 75, rango: '40 - 75' },
            { codigo: 'BH-LIN-P', min: 20, max: 35, rango: '20 - 35' },
            { codigo: 'BH-MON-P', min: 4, max: 8, rango: '4 - 8' },
            { codigo: 'BH-EOS-P', min: 1, max: 6, rango: '1 - 6' },
            { codigo: 'BH-BAS-P', min: 0, max: 1, rango: '0 - 1' },
            { codigo: 'BH-PLT', min: 150, max: 400, rango: '150 - 400' }
        ];

        for (const u of updates) {
            const res = await client.query(`
                UPDATE estudios_laboratorio 
                SET referencia_min = $1, referencia_max = $2, rango_referencia = $3
                WHERE codigo = $4
            `, [u.min, u.max, u.rango, u.codigo]);
            if (res.rowCount > 0) {
                console.log(`   ✅ ${u.codigo}: ${u.rango}`);
            } else {
                console.log(`   ⚠️ ${u.codigo}: no encontrado`);
            }
        }

        // 2. Actualizar con refs por sexo (Eritrocitos, Hemoglobina, Hematocrito)
        console.log('\n📊 Actualizando refs por sexo...\n');

        const porSexo = [
            { codigo: 'BH-ERI', f_min: 4.0, f_max: 5.5, m_min: 4.5, m_max: 6.5, rango: '♀4.0-5.5 / ♂4.5-6.5' },
            { codigo: 'BH-HB', f_min: 12.5, f_max: 16.8, m_min: 13.5, m_max: 18.0, rango: '♀12.5-16.8 / ♂13.5-18.0' },
            { codigo: 'BH-HTO', f_min: 36, f_max: 46, m_min: 40, m_max: 54, rango: '♀36-46 / ♂40-54' }
        ];

        for (const s of porSexo) {
            // Actualizar rango display
            await client.query(`
                UPDATE estudios_laboratorio 
                SET rango_referencia = $1, referencia_min = $2, referencia_max = $3
                WHERE codigo = $4
            `, [s.rango, s.f_min, s.m_max, s.codigo]);

            // Obtener ID
            const idRes = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = $1`, [s.codigo]);
            if (idRes.rows.length > 0) {
                const estudioId = idRes.rows[0].id;

                // Eliminar refs anteriores
                await client.query(`DELETE FROM valores_referencia WHERE estudio_id = $1`, [estudioId]);

                // Insertar nuevas refs
                await client.query(`
                    INSERT INTO valores_referencia (estudio_id, sexo, valor_min, valor_max, descripcion, orden)
                    VALUES ($1, 'F', $2, $3, 'Mujeres', 1), ($1, 'M', $4, $5, 'Hombres', 2)
                `, [estudioId, s.f_min, s.f_max, s.m_min, s.m_max]);

                console.log(`   ✅ ${s.codigo}: ${s.rango}`);
            }
        }

        // 3. Agregar analitos faltantes
        console.log('\n➕ Agregando analitos faltantes...\n');

        const nuevos = [
            { codigo: 'BH-BLASTOS', nombre: 'Blastos', min: 0, max: 0, rango: '0', unidades: '%' },
            { codigo: 'BH-BANDAS', nombre: 'Bandas', min: 0, max: 6, rango: '0 - 6', unidades: '%' }
        ];

        for (const n of nuevos) {
            const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = $1`, [n.codigo]);
            if (check.rows.length === 0) {
                await client.query(`
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, activo,
                        unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                        metodo, tipo_muestra, tubo_recipiente, tiempo_entrega
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                `, [
                    n.codigo, n.nombre, 'Hematologia', 0, true,
                    n.unidades, 'rango', n.min, n.max, n.rango,
                    'Microscopia', 'Sangre EDTA', 'Tubo Morado', 'Mismo dia'
                ]);
                console.log(`   ✅ ${n.codigo}: ${n.nombre} (NUEVO)`);
            } else {
                console.log(`   ⚠️ ${n.codigo}: ya existe`);
            }
        }

        console.log('\n========================================');
        console.log('✅ BH ACTUALIZADA CON VALORES UPC');
        console.log('========================================');
        console.log('📊 12 rangos actualizados');
        console.log('♀♂ 3 con refs por sexo (ERI, HB, HTO)');
        console.log('➕ 2 analitos nuevos (Blastos, Bandas)');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
