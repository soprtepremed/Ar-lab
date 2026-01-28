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

        const categoria = 'Inmunología';
        const tipoMuestra = 'Sangre venosa';
        const tuboRecipiente = 'Tubo Lila (EDTA)';
        const metodologia = 'Hemaglutinación directa';
        const area = 'Inmunología';

        // Analitos con opciones de dropdown
        const analitos = [
            {
                codigo: 'GS-TIPO',
                nombre: 'Grupo Sanguíneo',
                opciones: ["O", "A", "A2", "AB", "B"],
                orden: 1
            },
            {
                codigo: 'GS-RH',
                nombre: 'Factor RH',
                opciones: ["NEGATIVO", "POSITIVO"],
                orden: 2
            }
        ];

        console.log('🔍 Verificando analitos existentes...\n');
        const analitoIds = [];

        for (const a of analitos) {
            const checkQuery = `SELECT id FROM estudios_laboratorio WHERE codigo = $1`;
            const checkRes = await client.query(checkQuery, [a.codigo]);

            // Estructura para dropdown
            const definicionParametros = JSON.stringify({
                tipo_input: "lista",
                opciones: a.opciones
            });

            if (checkRes.rows.length > 0) {
                console.log(`   🔄 ${a.codigo} - ${a.nombre} (ACTUALIZANDO)`);
                const updateQuery = `
                    UPDATE estudios_laboratorio SET
                        nombre = $2, categoria = $3, tipo_muestra = $4,
                        tubo_recipiente = $5, metodologia = $6, area = $7,
                        tipo_referencia = 'texto', referencia_texto = $8
                    WHERE codigo = $1
                `;
                await client.query(updateQuery, [
                    a.codigo, a.nombre, categoria, tipoMuestra,
                    tuboRecipiente, metodologia, area, a.opciones.join(' / ')
                ]);
                analitoIds.push({ id: checkRes.rows[0].id, orden: a.orden, nombre: a.nombre });
            } else {
                console.log(`   📝 ${a.codigo} - ${a.nombre} (CREANDO NUEVO)`);
                const insertQuery = `
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, es_perfil, tipo_muestra, 
                        tubo_recipiente, metodologia, area, activo,
                        tipo_referencia, referencia_texto
                    )
                    VALUES ($1, $2, $3, 0, false, $4, $5, $6, $7, true, 'texto', $8)
                    RETURNING id
                `;
                const insertRes = await client.query(insertQuery, [
                    a.codigo, a.nombre, categoria, tipoMuestra, tuboRecipiente,
                    metodologia, area, a.opciones.join(' / ')
                ]);
                analitoIds.push({ id: insertRes.rows[0].id, orden: a.orden, nombre: a.nombre });
            }
        }

        // Buscar o crear perfil
        console.log('\n📦 Buscando/Creando perfil Grupo Sanguíneo...');
        let perfilId;
        const checkPerfilQuery = `SELECT id FROM estudios_laboratorio WHERE codigo = 'GS-PERFIL' OR (nombre ILIKE '%grupo sangu%' AND es_perfil = true)`;
        const checkPerfilRes = await client.query(checkPerfilQuery);

        if (checkPerfilRes.rows.length > 0) {
            perfilId = checkPerfilRes.rows[0].id;
            console.log(`   ✅ Perfil existente encontrado (ID: ${perfilId})`);
        } else {
            const perfilQuery = `
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, es_perfil, tipo_muestra, 
                    tubo_recipiente, metodologia, area, activo
                )
                VALUES ('GS-PERFIL', 'Grupo Sanguíneo y Factor RH', $1, 80, true, $2, $3, $4, $5, true)
                RETURNING id
            `;
            const perfilRes = await client.query(perfilQuery, [categoria, tipoMuestra, tuboRecipiente, metodologia, area]);
            perfilId = perfilRes.rows[0].id;
            console.log(`   📝 Perfil creado: GS-PERFIL (ID: ${perfilId})`);
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
                await client.query(
                    `UPDATE estudio_componentes SET orden = $3 WHERE perfil_id = $1 AND componente_id = $2`,
                    [perfilId, a.id, a.orden]
                );
                console.log(`   🔄 Orden actualizado: ${a.nombre} (orden ${a.orden})`);
            }
        }

        console.log('\n========================================');
        console.log('✅ GRUPO SANGUÍNEO COMPLETADO');
        console.log('========================================');
        console.log('📦 Perfil: Grupo Sanguíneo y Factor RH ($80)');
        console.log('🧪 Analitos: 2 (con opciones dropdown)');
        console.log('   - Grupo Sanguíneo: O / A / A2 / AB / B');
        console.log('   - Factor RH: NEGATIVO / POSITIVO');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
