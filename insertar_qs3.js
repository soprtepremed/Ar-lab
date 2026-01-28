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

        // Datos del perfil
        const categoria = 'Química Clínica';
        const tipoMuestra = 'Suero';
        const tuboRecipiente = 'Tubo Rojo';
        const area = 'Química Clínica';

        // Analitos a vincular (con sus datos por si no existen)
        const analitos = [
            {
                nombre: 'Glucosa',
                codigo: 'QS-GLU',
                unidades: 'mg/dl',
                tipo_referencia: 'rango',
                referencia_min: 74,
                referencia_max: 106,
                orden: 1
            },
            {
                nombre: 'Colesterol',
                codigo: 'QS-COL',
                unidades: 'mg/dl',
                tipo_referencia: 'texto',
                referencia_texto: 'DESEABLE: <200, LIMÍTROFE: 200-239, ALTO: >240',
                orden: 2
            },
            {
                nombre: 'Triglicéridos',
                codigo: 'QS-TRI',
                unidades: 'mg/dl',
                tipo_referencia: 'rango',
                referencia_min: 0,
                referencia_max: 150,
                orden: 3
            }
        ];

        console.log('🔍 Verificando analitos existentes...\n');
        const analitoIds = [];

        for (const a of analitos) {
            // Buscar si existe por código
            const checkQuery = `SELECT id, codigo, nombre FROM estudios_laboratorio WHERE codigo = $1`;
            const checkRes = await client.query(checkQuery, [a.codigo]);

            if (checkRes.rows.length > 0) {
                // Ya existe, usar ID existente
                console.log(`   ✅ ${a.codigo} - ${a.nombre} (YA EXISTE, reutilizando)`);
                analitoIds.push({ id: checkRes.rows[0].id, orden: a.orden, nombre: a.nombre });
            } else {
                // No existe, crear nuevo
                console.log(`   📝 ${a.codigo} - ${a.nombre} (CREANDO NUEVO)`);
                const insertQuery = `
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, es_perfil, tipo_muestra, 
                        tubo_recipiente, unidades, area, activo,
                        tipo_referencia, referencia_min, referencia_max, referencia_texto
                    )
                    VALUES ($1, $2, $3, 0, false, $4, $5, $6, $7, true, $8, $9, $10, $11)
                    RETURNING id
                `;
                const insertRes = await client.query(insertQuery, [
                    a.codigo, a.nombre, categoria, tipoMuestra, tuboRecipiente,
                    a.unidades, area, a.tipo_referencia,
                    a.referencia_min || null, a.referencia_max || null, a.referencia_texto || null
                ]);
                analitoIds.push({ id: insertRes.rows[0].id, orden: a.orden, nombre: a.nombre });
            }
        }

        // Crear perfil padre
        console.log('\n📦 Creando perfil Química Sanguínea 3 Elementos...');
        const perfilQuery = `
            INSERT INTO estudios_laboratorio (
                codigo, nombre, categoria, precio, es_perfil, tipo_muestra, 
                tubo_recipiente, area, activo
            )
            VALUES ('QS3-PERFIL', 'Química Sanguínea 3 Elementos', $1, 150, true, $2, $3, $4, true)
            ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
            RETURNING id
        `;
        const perfilRes = await client.query(perfilQuery, [
            categoria, tipoMuestra, tuboRecipiente, area
        ]);
        const perfilId = perfilRes.rows[0].id;
        console.log(`   ✅ QS3-PERFIL creado (ID: ${perfilId})`);

        // Crear relaciones
        console.log('\n🔗 Creando relaciones perfil-analitos...');
        for (const a of analitoIds) {
            // Verificar si la relación ya existe
            const checkRelQuery = `SELECT 1 FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`;
            const checkRelRes = await client.query(checkRelQuery, [perfilId, a.id]);

            if (checkRelRes.rows.length === 0) {
                const relacionQuery = `
                    INSERT INTO estudio_componentes (perfil_id, componente_id, orden)
                    VALUES ($1, $2, $3)
                `;
                await client.query(relacionQuery, [perfilId, a.id, a.orden]);
                console.log(`   ✅ Vinculado: ${a.nombre} (orden ${a.orden})`);
            } else {
                console.log(`   ⏭️ Relación ya existe: ${a.nombre}`);
            }
        }

        console.log('\n========================================');
        console.log('✅ INSERCIÓN COMPLETADA EXITOSAMENTE');
        console.log('========================================');
        console.log('📦 Perfil: Química Sanguínea 3 Elementos ($150)');
        console.log(`🧪 Analitos vinculados: ${analitoIds.length}`);
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
