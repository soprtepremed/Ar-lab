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

        const categoria = 'Uroanálisis';
        const tipoMuestra = 'Heces';
        const tuboRecipiente = 'Frasco Estéril';
        const metodologia = 'Microscopía';
        const area = 'Uroanálisis';

        const analitos = [
            { codigo: 'CPS-ASP', nombre: 'Aspecto', ref: 'AMORFA', orden: 1 },
            { codigo: 'CPS-CON', nombre: 'Consistencia', ref: 'COMPACTA', orden: 2 },
            { codigo: 'CPS-COL', nombre: 'Color', ref: 'CAFÉ', orden: 3 },
            { codigo: 'CPS-OLO', nombre: 'Olor', ref: 'SUIGENERIS', orden: 4 },
            { codigo: 'CPS-PH', nombre: 'pH', ref: '7.00', orden: 5 },
            { codigo: 'CPS-1', nombre: 'Coproparasitoscópico 1', ref: 'NO SE OBSERVAN PARÁSITOS AL MOMENTO DEL ESTUDIO', orden: 6 },
            { codigo: 'CPS-2', nombre: 'Coproparasitoscópico 2', ref: 'NO SE OBSERVAN PARÁSITOS AL MOMENTO DEL ESTUDIO', orden: 7 },
            { codigo: 'CPS-3', nombre: 'Coproparasitoscópico 3', ref: 'NO SE OBSERVAN PARÁSITOS AL MOMENTO DEL ESTUDIO', orden: 8 }
        ];

        console.log('🔍 Verificando/Actualizando analitos...\n');
        const analitoIds = [];
        let actualizados = 0, creados = 0;

        for (const a of analitos) {
            const checkQuery = `SELECT id FROM estudios_laboratorio WHERE codigo = $1`;
            const checkRes = await client.query(checkQuery, [a.codigo]);

            if (checkRes.rows.length > 0) {
                await client.query(`
                    UPDATE estudios_laboratorio SET
                        nombre = $2, categoria = $3, tipo_muestra = $4, tubo_recipiente = $5,
                        metodologia = $6, area = $7, tipo_referencia = 'texto', referencia_texto = $8
                    WHERE codigo = $1
                `, [a.codigo, a.nombre, categoria, tipoMuestra, tuboRecipiente, metodologia, area, a.ref]);
                analitoIds.push({ id: checkRes.rows[0].id, orden: a.orden, nombre: a.nombre });
                actualizados++;
            } else {
                const insertRes = await client.query(`
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, es_perfil, tipo_muestra, 
                        tubo_recipiente, metodologia, area, activo, tipo_referencia, referencia_texto
                    )
                    VALUES ($1, $2, $3, 0, false, $4, $5, $6, $7, true, 'texto', $8)
                    RETURNING id
                `, [a.codigo, a.nombre, categoria, tipoMuestra, tuboRecipiente, metodologia, area, a.ref]);
                analitoIds.push({ id: insertRes.rows[0].id, orden: a.orden, nombre: a.nombre });
                creados++;
            }
        }

        console.log(`   🔄 Actualizados: ${actualizados}`);
        console.log(`   📝 Creados: ${creados}`);

        // Buscar o crear perfil
        console.log('\n📦 Buscando/Creando perfil Coproparasitoscópico...');
        let perfilId;
        const checkPerfilQuery = `SELECT id FROM estudios_laboratorio WHERE (codigo = 'CPS-PERFIL' OR nombre ILIKE '%coproparasito%') AND es_perfil = true`;
        const checkPerfilRes = await client.query(checkPerfilQuery);

        if (checkPerfilRes.rows.length > 0) {
            perfilId = checkPerfilRes.rows[0].id;
            console.log(`   ✅ Perfil existente (ID: ${perfilId})`);
        } else {
            const perfilRes = await client.query(`
                INSERT INTO estudios_laboratorio (codigo, nombre, categoria, precio, es_perfil, tipo_muestra, tubo_recipiente, metodologia, area, activo)
                VALUES ('CPS-PERFIL', 'Coproparasitoscópico', $1, 80, true, $2, $3, $4, $5, true)
                RETURNING id
            `, [categoria, tipoMuestra, tuboRecipiente, metodologia, area]);
            perfilId = perfilRes.rows[0].id;
            console.log(`   📝 Perfil creado (ID: ${perfilId})`);
        }

        // Crear relaciones
        console.log('\n🔗 Creando relaciones...');
        for (const a of analitoIds) {
            const checkRelRes = await client.query(`SELECT 1 FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`, [perfilId, a.id]);
            if (checkRelRes.rows.length === 0) {
                await client.query(`INSERT INTO estudio_componentes (perfil_id, componente_id, orden) VALUES ($1, $2, $3)`, [perfilId, a.id, a.orden]);
            } else {
                await client.query(`UPDATE estudio_componentes SET orden = $3 WHERE perfil_id = $1 AND componente_id = $2`, [perfilId, a.id, a.orden]);
            }
        }

        console.log('\n========================================');
        console.log('✅ COPROPARASITOSCÓPICO COMPLETADO');
        console.log('========================================');
        console.log('📦 Perfil: Coproparasitoscópico ($80)');
        console.log(`🧪 Analitos: ${analitoIds.length}`);
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
