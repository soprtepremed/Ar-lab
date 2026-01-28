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

        const categoria = 'Hematología';
        const tipoMuestra = 'Sangre venosa';
        const tuboRecipiente = 'Tubo Lila (EDTA)';
        const area = 'Hematología';

        // Mapeo de analitos con sus datos actualizados
        const analitos = [
            { codigo: 'BH-LEU', nombre: 'Leucocitos', unidades: '10³ µ/L', min: 3.56, max: 10.30, orden: 1 },
            { codigo: 'BH-ERI', nombre: 'Eritrocitos', unidades: '10⁶ µ/L', min: 3.87, max: 5.44, orden: 2 },
            { codigo: 'BH-HB', nombre: 'Hemoglobina', unidades: 'g/dL', min: 11.70, max: 16.30, orden: 3 },
            { codigo: 'BH-HTO', nombre: 'Hematocrito', unidades: '%', min: 35.40, max: 49.40, orden: 4 },
            { codigo: 'BH-VCM', nombre: 'Vol. Corpuscular Medio (VCM)', unidades: 'fL', min: 83.30, max: 100.00, orden: 5 },
            { codigo: 'BH-HCM', nombre: 'Hgb. Corpuscular Medio (HCM)', unidades: 'Pg', min: 26.80, max: 33.20, orden: 6 },
            { codigo: 'BH-CHCM', nombre: 'Conc. Media Hgb. Corp (CMHC)', unidades: 'g/dL', min: 31.00, max: 37.00, orden: 7 },
            { codigo: 'BH-PLT', nombre: 'Plaquetas', unidades: '10³ µ/L', min: 167.00, max: 431.00, orden: 8 },
            { codigo: 'BH-VPM', nombre: 'Vol. Plaq. Med. (VPM)', unidades: 'fL', min: 7.20, max: 11.10, orden: 9 },
            // Diferencial Porcentual
            { codigo: 'BH-LIN-P', nombre: 'Linfocitos %', unidades: '%', min: 15.50, max: 48.60, orden: 10 },
            { codigo: 'BH-NEU-P', nombre: 'Neutrófilos %', unidades: '%', min: 39.60, max: 76.10, orden: 11 },
            { codigo: 'BH-MON-P', nombre: 'Monocitos %', unidades: '%', min: 3.40, max: 10.10, orden: 12 },
            { codigo: 'BH-EOS-P', nombre: 'Eosinófilos %', unidades: '%', min: 0.30, max: 5.50, orden: 13 },
            { codigo: 'BH-BAS-P', nombre: 'Basófilos %', unidades: '%', min: 0.00, max: 1.40, orden: 14 },
            // Diferencial Absoluto
            { codigo: 'BH-LIN-A', nombre: 'Linfocitos (abs)', unidades: '10³ µ/L', min: 0.90, max: 5.20, orden: 15 },
            { codigo: 'BH-NEU-A', nombre: 'Neutrófilos (abs)', unidades: '10³ µ/L', min: 1.90, max: 8.00, orden: 16 },
            { codigo: 'BH-MON-A', nombre: 'Monocitos (abs)', unidades: '10³ µ/L', min: 0.16, max: 1.00, orden: 17 },
            { codigo: 'BH-EOS-A', nombre: 'Eosinófilos (abs)', unidades: '10³ µ/L', min: 0.00, max: 0.80, orden: 18 },
            { codigo: 'BH-BAS-A', nombre: 'Basófilos (abs)', unidades: '10³ µ/L', min: 0.00, max: 0.20, orden: 19 }
        ];

        console.log('📝 Actualizando/Creando analitos...\n');
        const analitoIds = [];

        for (const a of analitos) {
            // Verificar si existe
            const checkQuery = `SELECT id FROM estudios_laboratorio WHERE codigo = $1`;
            const checkRes = await client.query(checkQuery, [a.codigo]);

            if (checkRes.rows.length > 0) {
                // ACTUALIZAR existente
                console.log(`   🔄 ${a.codigo} - ${a.nombre} (ACTUALIZANDO)`);
                const updateQuery = `
                    UPDATE estudios_laboratorio SET
                        nombre = $2, unidades = $3, categoria = $4, tipo_muestra = $5,
                        tubo_recipiente = $6, area = $7, tipo_referencia = 'rango',
                        referencia_min = $8, referencia_max = $9
                    WHERE codigo = $1
                `;
                await client.query(updateQuery, [
                    a.codigo, a.nombre, a.unidades, categoria, tipoMuestra,
                    tuboRecipiente, area, a.min, a.max
                ]);
                analitoIds.push({ id: checkRes.rows[0].id, orden: a.orden, nombre: a.nombre });
            } else {
                // CREAR nuevo
                console.log(`   📝 ${a.codigo} - ${a.nombre} (CREANDO NUEVO)`);
                const insertQuery = `
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, es_perfil, tipo_muestra, 
                        tubo_recipiente, unidades, area, activo,
                        tipo_referencia, referencia_min, referencia_max
                    )
                    VALUES ($1, $2, $3, 0, false, $4, $5, $6, $7, true, 'rango', $8, $9)
                    RETURNING id
                `;
                const insertRes = await client.query(insertQuery, [
                    a.codigo, a.nombre, categoria, tipoMuestra, tuboRecipiente,
                    a.unidades, area, a.min, a.max
                ]);
                analitoIds.push({ id: insertRes.rows[0].id, orden: a.orden, nombre: a.nombre });
            }
        }

        // Buscar perfil existente o crear
        console.log('\n📦 Buscando perfil Biometría Hemática existente...');
        let perfilId;
        const checkPerfilQuery = `SELECT id FROM estudios_laboratorio WHERE codigo = 'BH' AND es_perfil = true`;
        const checkPerfilRes = await client.query(checkPerfilQuery);

        if (checkPerfilRes.rows.length > 0) {
            perfilId = checkPerfilRes.rows[0].id;
            console.log(`   ✅ Perfil existente encontrado: BH (ID: ${perfilId})`);
        } else {
            // Crear si no existe
            const perfilQuery = `
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, es_perfil, tipo_muestra, 
                    tubo_recipiente, area, activo
                )
                VALUES ('BH', 'Biometría Hemática Completa', $1, 120, true, $2, $3, $4, true)
                RETURNING id
            `;
            const perfilRes = await client.query(perfilQuery, [categoria, tipoMuestra, tuboRecipiente, area]);
            perfilId = perfilRes.rows[0].id;
            console.log(`   📝 Perfil creado: BH (ID: ${perfilId})`);
        }

        // Crear relaciones
        console.log('\n🔗 Creando relaciones perfil-analitos...');
        for (const a of analitoIds) {
            const checkRelQuery = `SELECT 1 FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`;
            const checkRelRes = await client.query(checkRelQuery, [perfilId, a.id]);

            if (checkRelRes.rows.length === 0) {
                await client.query(
                    `INSERT INTO estudio_componentes (perfil_id, componente_id, orden) VALUES ($1, $2, $3)`,
                    [perfilId, a.id, a.orden]
                );
                console.log(`   ✅ Vinculado: ${a.nombre} (orden ${a.orden})`);
            } else {
                // Actualizar orden si ya existe
                await client.query(
                    `UPDATE estudio_componentes SET orden = $3 WHERE perfil_id = $1 AND componente_id = $2`,
                    [perfilId, a.id, a.orden]
                );
                console.log(`   🔄 Orden actualizado: ${a.nombre} (orden ${a.orden})`);
            }
        }

        console.log('\n========================================');
        console.log('✅ BIOMETRÍA HEMÁTICA COMPLETADA');
        console.log('========================================');
        console.log('📦 Perfil: Biometría Hemática ($150)');
        console.log(`🧪 Analitos procesados: ${analitoIds.length}`);
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
