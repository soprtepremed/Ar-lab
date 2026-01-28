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

        // Todos los analitos del perfil coprológico
        const analitos = [
            // Examen físico
            { codigo: 'COPRO-ASPECTO', nombre: 'Aspecto (heces)', tipo: 'cualitativo', ref: 'AMORFA', grupo: 'Examen Físico' },
            { codigo: 'COPRO-CONSIST', nombre: 'Consistencia (heces)', tipo: 'cualitativo', ref: 'COMPACTA', grupo: 'Examen Físico' },
            { codigo: 'COPRO-COLOR', nombre: 'Color (heces)', tipo: 'cualitativo', ref: 'CAFÉ', grupo: 'Examen Físico' },
            { codigo: 'COPRO-OLOR', nombre: 'Olor (heces)', tipo: 'cualitativo', ref: 'SUIGENERIS', grupo: 'Examen Físico' },
            { codigo: 'COPRO-PH', nombre: 'pH (heces)', tipo: 'rango', ref_min: 6.5, ref_max: 7.5, ref: '6.5 - 7.5', grupo: 'Examen Físico' },
            // Pruebas inmunológicas
            { codigo: 'ROTAVIRUS', nombre: 'Rotavirus en heces', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Inmunología' },
            { codigo: 'ADENOVIRUS', nombre: 'Adenovirus en heces', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Inmunología' },
            { codigo: 'AZUC-RED', nombre: 'Azúcares Reductores', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Química' },
            { codigo: 'SANGRE-OCULTA', nombre: 'Sangre Oculta en Heces', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Química' },
            // Coproparasitoscópico
            { codigo: 'CPS-CEL-EPIT', nombre: 'Células Epiteliales (CPS)', tipo: 'rango', ref_min: 0, ref_max: 1, ref: '0 - 1', unidades: 'xCampo', grupo: 'Microscopía' },
            { codigo: 'CPS-LEUCO', nombre: 'Leucocitos (CPS)', tipo: 'rango', ref_min: 0, ref_max: 1, ref: '0 - 1', unidades: 'xCampo', grupo: 'Microscopía' },
            { codigo: 'CPS-ERITRO', nombre: 'Eritrocitos (CPS)', tipo: 'rango', ref_min: 0, ref_max: 1, ref: '0 - 1', unidades: 'xCampo', grupo: 'Microscopía' },
            { codigo: 'CPS-LEVAD', nombre: 'Levaduras (CPS)', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Microscopía' },
            { codigo: 'CPS-MOCO', nombre: 'Moco Fecal', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Microscopía' },
            { codigo: 'CPS-GRASAS', nombre: 'Grasas (CPS)', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Microscopía' },
            { codigo: 'CPS-PIOCITOS', nombre: 'Piocitos (CPS)', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Microscopía' },
            { codigo: 'CPS-CRISTALES', nombre: 'Cristales (CPS)', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Microscopía' },
            { codigo: 'CPS-HB', nombre: 'Hemoglobina (CPS)', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Microscopía' },
            { codigo: 'CPS-JABONES', nombre: 'Jabones (CPS)', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Microscopía' },
            { codigo: 'CPS-ALMIDON', nombre: 'Almidón (CPS)', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Microscopía' },
            { codigo: 'CPS-RESTOS-AN', nombre: 'Restos Animales (CPS)', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Microscopía' },
            { codigo: 'CPS-RESTOS-VEG', nombre: 'Restos Vegetales (CPS)', tipo: 'cualitativo', ref: 'NEGATIVO', grupo: 'Microscopía' }
        ];

        console.log('📦 Insertando analitos del Perfil Coprológico...\n');

        for (const a of analitos) {
            const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = $1`, [a.codigo]);

            if (check.rows.length > 0) {
                insertedIds[a.codigo] = check.rows[0].id;
                console.log(`   ⚠️ ${a.codigo} ya existe`);
            } else {
                const res = await client.query(`
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, activo,
                        unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                        metodo, tipo_muestra, tubo_recipiente, tiempo_entrega
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    RETURNING id
                `, [
                    a.codigo, a.nombre, 'Coprología', 0, true,
                    a.unidades || null, a.tipo, a.ref_min || null, a.ref_max || null, a.ref,
                    'Microscopía', 'Heces', 'Frasco estéril', 'Mismo día'
                ]);
                insertedIds[a.codigo] = res.rows[0].id;
                console.log(`   ✅ ${a.codigo}`);
            }
        }

        // Perfil padre
        const perfilCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'COPRO'`);
        let perfilId;
        if (perfilCheck.rows.length > 0) {
            perfilId = perfilCheck.rows[0].id;
            console.log('\n⚠️ COPRO ya existe');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo, es_perfil,
                    tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `, [
                'COPRO', 'Perfil Coprológico Completo', 'Coprología', 150, true, true,
                'Heces', 'Frasco estéril', 'Mismo día',
                'Muestra fresca de heces (2-5g). No contaminar con orina. Entregar en máx 2 horas.'
            ]);
            perfilId = res.rows[0].id;
            console.log('\n✅ COPRO (Perfil) creado');
        }

        // Relaciones
        console.log('\n📦 Creando relaciones...');
        let orden = 0;
        for (const a of analitos) {
            orden++;
            const compId = insertedIds[a.codigo];
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
        console.log('✅ PERFIL COPROLÓGICO INSERTADO');
        console.log('========================================');
        console.log('📦 COPRO: Perfil Coprológico Completo');
        console.log('📊 22 analitos: Físico + Inmuno + CPS');
        console.log('💰 Precio: $150');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
