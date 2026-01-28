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
        const tipoMuestra = 'Orina';
        const tuboRecipiente = 'Frasco Estéril';
        const area = 'Uroanálisis';

        // UROANALISIS (Tira reactiva)
        const analitos = [
            { codigo: 'EGO-ASP', nombre: 'Aspecto', unidades: '', ref: 'Transparente', tipo: 'texto', orden: 1 },
            { codigo: 'EGO-COL', nombre: 'Color', unidades: '', ref: 'Amarillo', tipo: 'texto', orden: 2 },
            { codigo: 'EGO-DEN', nombre: 'Densidad', unidades: '', ref: '1.005 - 1.03', tipo: 'texto', orden: 3 },
            { codigo: 'EGO-PH', nombre: 'pH', unidades: '', ref: '4.5 - 8.00', tipo: 'texto', orden: 4 },
            { codigo: 'EGO-NIT', nombre: 'Nitritos', unidades: '', ref: 'NEGATIVO', tipo: 'texto', orden: 5 },
            { codigo: 'EGO-GLU', nombre: 'Glucosa', unidades: 'mg/dl', ref: 'NEGATIVO', tipo: 'texto', orden: 6 },
            { codigo: 'EGO-LEU TIRA', nombre: 'Leucocitos (Tira)', unidades: 'u/L', ref: 'NEGATIVO', tipo: 'texto', orden: 7 },
            { codigo: 'EGO-PRO', nombre: 'Proteínas', unidades: 'mg/dl', ref: 'NEGATIVO', tipo: 'texto', orden: 8 },
            { codigo: 'EGO-CET', nombre: 'Cuerpos Cetónicos', unidades: 'mg/dl', ref: 'NEGATIVO', tipo: 'texto', orden: 9 },
            { codigo: 'EGO-URO', nombre: 'Urobilinógeno', unidades: 'mg/dl', ref: 'Normal', tipo: 'texto', orden: 10 },
            { codigo: 'EGO-BIL', nombre: 'Bilirrubinas', unidades: 'mg/dl', ref: 'NEGATIVO', tipo: 'texto', orden: 11 },
            { codigo: 'EGO-HB', nombre: 'Hemoglobina', unidades: 'mg/dl', ref: 'NEGATIVO', tipo: 'texto', orden: 12 },
            // EXAMEN MICROSCOPICO
            { codigo: 'EGO-LEU', nombre: 'Leucocitos', unidades: '/C', ref: '0 - 5', tipo: 'texto', orden: 13 },
            { codigo: 'EGO-SED-PIO', nombre: 'Piocitos', unidades: '/C', ref: '0', tipo: 'texto', orden: 14 },
            { codigo: 'EGO-SED-ERI', nombre: 'Eritrocitos', unidades: '/C', ref: '0 - 2', tipo: 'texto', orden: 15 },
            { codigo: 'EGO-SED-CEP', nombre: 'Células Epiteliales', unidades: '/C', ref: '0 - 1', tipo: 'texto', orden: 16 },
            { codigo: 'EGO-SED-CTR', nombre: 'Células del Túbulo Renal', unidades: '/C', ref: '0', tipo: 'texto', orden: 17 },
            { codigo: 'EGO-SED-CEE', nombre: 'Células del Epitelio Escamoso', unidades: '', ref: 'ESCASAS', tipo: 'texto', orden: 18 },
            { codigo: 'EGO-SED-BAC', nombre: 'Bacterias', unidades: '', ref: 'AUSENTES', tipo: 'texto', orden: 19 },
            { codigo: 'EGO-SED-LEV', nombre: 'Levaduras', unidades: '', ref: 'AUSENTES', tipo: 'texto', orden: 20 },
            { codigo: 'EGO-SED-CAM', nombre: 'Cristales Amorfos', unidades: '', ref: 'AUSENTES', tipo: 'texto', orden: 21 },
            { codigo: 'EGO-SED-CAU', nombre: 'Cristales de Ácido Úrico', unidades: '', ref: 'AUSENTES', tipo: 'texto', orden: 22 },
            { codigo: 'EGO-SED-COC', nombre: 'Cristales de Oxalato de Calcio', unidades: '', ref: 'AUSENTES', tipo: 'texto', orden: 23 },
            { codigo: 'EGO-SED-FIL', nombre: 'Filamentos Mucoides', unidades: '', ref: 'AUSENTES', tipo: 'texto', orden: 24 },
            { codigo: 'EGO-SED-CGR', nombre: 'Cilindros Granulosos', unidades: '', ref: 'AUSENTES', tipo: 'texto', orden: 25 },
            { codigo: 'EGO-SED-CHI', nombre: 'Cilindros Hialinos', unidades: '', ref: 'AUSENTES', tipo: 'texto', orden: 26 }
        ];

        console.log('📝 Actualizando/Creando analitos EGO...\n');
        const analitoIds = [];
        let actualizados = 0, creados = 0;

        for (const a of analitos) {
            const checkQuery = `SELECT id FROM estudios_laboratorio WHERE codigo = $1`;
            const checkRes = await client.query(checkQuery, [a.codigo]);

            if (checkRes.rows.length > 0) {
                // ACTUALIZAR
                const updateQuery = `
                    UPDATE estudios_laboratorio SET
                        nombre = $2, unidades = $3, categoria = $4, tipo_muestra = $5,
                        tubo_recipiente = $6, area = $7, tipo_referencia = 'texto', referencia_texto = $8
                    WHERE codigo = $1
                `;
                await client.query(updateQuery, [
                    a.codigo, a.nombre, a.unidades, categoria, tipoMuestra, tuboRecipiente, area, a.ref
                ]);
                analitoIds.push({ id: checkRes.rows[0].id, orden: a.orden, nombre: a.nombre });
                actualizados++;
            } else {
                // CREAR
                const insertQuery = `
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, es_perfil, tipo_muestra, 
                        tubo_recipiente, unidades, area, activo, tipo_referencia, referencia_texto
                    )
                    VALUES ($1, $2, $3, 0, false, $4, $5, $6, $7, true, 'texto', $8)
                    RETURNING id
                `;
                const insertRes = await client.query(insertQuery, [
                    a.codigo, a.nombre, categoria, tipoMuestra, tuboRecipiente, a.unidades, area, a.ref
                ]);
                analitoIds.push({ id: insertRes.rows[0].id, orden: a.orden, nombre: a.nombre });
                creados++;
            }
        }

        console.log(`   🔄 Actualizados: ${actualizados}`);
        console.log(`   📝 Creados: ${creados}`);

        // Buscar perfil EGO existente
        console.log('\n📦 Buscando perfil EGO...');
        const checkPerfilQuery = `SELECT id FROM estudios_laboratorio WHERE codigo = 'EGO' AND es_perfil = true`;
        const checkPerfilRes = await client.query(checkPerfilQuery);

        let perfilId;
        if (checkPerfilRes.rows.length > 0) {
            perfilId = checkPerfilRes.rows[0].id;
            console.log(`   ✅ Perfil existente: EGO (ID: ${perfilId})`);
        } else {
            console.log('   ❌ Perfil no encontrado, creando...');
            const perfilRes = await client.query(`
                INSERT INTO estudios_laboratorio (codigo, nombre, categoria, precio, es_perfil, tipo_muestra, tubo_recipiente, area, activo)
                VALUES ('EGO', 'Examen General de Orina', $1, 80, true, $2, $3, $4, true)
                RETURNING id
            `, [categoria, tipoMuestra, tuboRecipiente, area]);
            perfilId = perfilRes.rows[0].id;
        }

        // Crear/Actualizar relaciones
        console.log('\n🔗 Creando relaciones perfil-analitos...');
        let relacionesNuevas = 0, relacionesActualizadas = 0;

        for (const a of analitoIds) {
            const checkRelQuery = `SELECT 1 FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`;
            const checkRelRes = await client.query(checkRelQuery, [perfilId, a.id]);

            if (checkRelRes.rows.length === 0) {
                await client.query(
                    `INSERT INTO estudio_componentes (perfil_id, componente_id, orden) VALUES ($1, $2, $3)`,
                    [perfilId, a.id, a.orden]
                );
                relacionesNuevas++;
            } else {
                await client.query(
                    `UPDATE estudio_componentes SET orden = $3 WHERE perfil_id = $1 AND componente_id = $2`,
                    [perfilId, a.id, a.orden]
                );
                relacionesActualizadas++;
            }
        }

        console.log(`   ✅ Relaciones nuevas: ${relacionesNuevas}`);
        console.log(`   🔄 Relaciones actualizadas: ${relacionesActualizadas}`);

        console.log('\n========================================');
        console.log('✅ EXAMEN GENERAL DE ORINA COMPLETADO');
        console.log('========================================');
        console.log('📦 Perfil: EGO - Examen General de Orina');
        console.log(`🧪 Analitos actualizados: ${actualizados}`);
        console.log(`📝 Analitos creados: ${creados}`);
        console.log(`🔗 Total relaciones: ${analitoIds.length}`);
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
