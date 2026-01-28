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

        // Nuevo analito: Bacterias
        const bacteriasCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'FH-BACTERIAS'`);
        if (bacteriasCheck.rows.length > 0) {
            insertedIds['FH-BACTERIAS'] = bacteriasCheck.rows[0].id;
            console.log('⚠️ FH-BACTERIAS ya existe');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo,
                    tipo_referencia, rango_referencia,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id
            `, [
                'FH-BACTERIAS', 'Bacterias (Frotis Heces)', 'Coprología', 0, true,
                'cualitativo', 'EQUILIBRADA',
                'Microscopía', 'Heces', 'Frasco estéril', 'Mismo día'
            ]);
            insertedIds['FH-BACTERIAS'] = res.rows[0].id;
            console.log('✅ FH-BACTERIAS insertada (Ref: EQUILIBRADA)');
        }

        // Leucocitos con ref diferente para Frotis
        const leucoCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'FH-LEUCO'`);
        if (leucoCheck.rows.length > 0) {
            insertedIds['FH-LEUCO'] = leucoCheck.rows[0].id;
            console.log('⚠️ FH-LEUCO ya existe');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo,
                    unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING id
            `, [
                'FH-LEUCO', 'Leucocitos (Frotis Heces)', 'Coprología', 0, true,
                '/C', 'rango', 1, 2, '1 - 2',
                'Microscopía', 'Heces', 'Frasco estéril', 'Mismo día'
            ]);
            insertedIds['FH-LEUCO'] = res.rows[0].id;
            console.log('✅ FH-LEUCO insertada (Ref: 1-2 /C)');
        }

        // Perfil Frotis de Heces
        const perfilCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'FROTIS-HECES'`);
        let perfilId;
        if (perfilCheck.rows.length > 0) {
            perfilId = perfilCheck.rows[0].id;
            console.log('\n⚠️ FROTIS-HECES ya existe');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo, es_perfil,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id
            `, [
                'FROTIS-HECES', 'Frotis de Heces', 'Coprología', 100, true, true,
                'Microscopía', 'Heces', 'Frasco estéril', 'Mismo día',
                'Evaluación microscópica de heces. Incluye flora bacteriana.'
            ]);
            perfilId = res.rows[0].id;
            console.log('\n✅ FROTIS-HECES (Perfil) creado');
        }

        // Obtener IDs de analitos existentes del COPRO que se reutilizan
        const reutilizados = ['COPRO-ASPECTO', 'COPRO-CONSIST', 'COPRO-COLOR', 'COPRO-OLOR',
            'CPS-CEL-EPIT', 'CPS-ERITRO', 'CPS-MOCO', 'CPS-GRASAS',
            'CPS-PIOCITOS', 'CPS-CRISTALES', 'CPS-ALMIDON', 'CPS-RESTOS-AN', 'CPS-RESTOS-VEG'];

        for (const cod of reutilizados) {
            const res = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = $1`, [cod]);
            if (res.rows.length > 0) {
                insertedIds[cod] = res.rows[0].id;
            }
        }

        // Crear relaciones del perfil
        console.log('\n📦 Creando relaciones del perfil...');
        const orden_analitos = [
            'COPRO-ASPECTO', 'COPRO-CONSIST', 'COPRO-COLOR', 'COPRO-OLOR',
            'CPS-CEL-EPIT', 'FH-LEUCO', 'CPS-ERITRO', 'FH-BACTERIAS',
            'CPS-MOCO', 'CPS-GRASAS', 'CPS-PIOCITOS', 'CPS-CRISTALES',
            'CPS-ALMIDON', 'CPS-RESTOS-AN', 'CPS-RESTOS-VEG'
        ];

        let orden = 0;
        for (const cod of orden_analitos) {
            orden++;
            const compId = insertedIds[cod];
            if (compId) {
                const check = await client.query(
                    `SELECT perfil_id FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`,
                    [perfilId, compId]
                );
                if (check.rows.length === 0) {
                    await client.query(
                        `INSERT INTO estudio_componentes (perfil_id, componente_id, orden) VALUES ($1, $2, $3)`,
                        [perfilId, compId, orden]
                    );
                }
            }
        }
        console.log(`   ✅ ${orden} componentes vinculados`);

        console.log('\n========================================');
        console.log('✅ FROTIS DE HECES INSERTADO');
        console.log('========================================');
        console.log('📦 FROTIS-HECES: Perfil completo');
        console.log('📊 15 analitos (4 físico + 11 CPS)');
        console.log('⭐ Nuevo: Bacterias (EQUILIBRADA)');
        console.log('💰 Precio: $100');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
