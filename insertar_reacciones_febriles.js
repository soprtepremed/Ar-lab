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

        // Datos comunes
        const categoria = 'Inmunología';
        const tipoMuestra = 'Suero';
        const tuboRecipiente = 'Tubo Rojo';
        const metodologia = 'Aglutinación macroscópica';
        const tiempoEntrega = 'Mismo día';
        const area = 'Inmunología';

        // 1. Insertar analitos individuales
        const analitos = [
            { codigo: 'RF-TIF-O', nombre: 'Tífico "O"', orden: 1 },
            { codigo: 'RF-TIF-H', nombre: 'Tífico "H"', orden: 2 },
            { codigo: 'RF-PARA-A', nombre: 'Paratífico "A"', orden: 3 },
            { codigo: 'RF-PARA-B', nombre: 'Paratífico "B"', orden: 4 },
            { codigo: 'RF-BRUC', nombre: 'Ac. vs Brucella Abortus', orden: 5 },
            { codigo: 'RF-PROT', nombre: 'Proteus OX-19', orden: 6 }
        ];

        console.log('📝 Insertando analitos individuales...');
        const analitoIds = [];

        for (const a of analitos) {
            const insertQuery = `
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, es_perfil, tipo_muestra, 
                    tubo_recipiente, metodologia, tiempo_entrega, area, activo,
                    tipo_referencia, referencia_texto
                )
                VALUES ($1, $2, $3, 0, false, $4, $5, $6, $7, $8, true, 'texto', 'NEGATIVO')
                ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
                RETURNING id
            `;
            const res = await client.query(insertQuery, [
                a.codigo, a.nombre, categoria, tipoMuestra,
                tuboRecipiente, metodologia, tiempoEntrega, area
            ]);
            analitoIds.push({ id: res.rows[0].id, orden: a.orden, nombre: a.nombre });
            console.log(`   ✅ ${a.codigo} - ${a.nombre}`);
        }

        // 2. Insertar perfil padre
        console.log('\n📦 Insertando perfil padre...');
        const perfilQuery = `
            INSERT INTO estudios_laboratorio (
                codigo, nombre, categoria, precio, es_perfil, tipo_muestra, 
                tubo_recipiente, metodologia, tiempo_entrega, area, activo
            )
            VALUES ('RF-PERFIL', 'Reacciones Febriles', $1, 100, true, $2, $3, $4, $5, $6, true)
            ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre
            RETURNING id
        `;
        const perfilRes = await client.query(perfilQuery, [
            categoria, tipoMuestra, tuboRecipiente, metodologia, tiempoEntrega, area
        ]);
        const perfilId = perfilRes.rows[0].id;
        console.log(`   ✅ RF-PERFIL - Reacciones Febriles (ID: ${perfilId})`);

        // 3. Crear relaciones en estudio_componentes
        console.log('\n🔗 Creando relaciones perfil-analitos...');
        for (const a of analitoIds) {
            const relacionQuery = `
                INSERT INTO estudio_componentes (perfil_id, componente_id, orden)
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING
            `;
            await client.query(relacionQuery, [perfilId, a.id, a.orden]);
            console.log(`   ✅ Vinculado: ${a.nombre} (orden ${a.orden})`);
        }

        console.log('\n========================================');
        console.log('✅ INSERCIÓN COMPLETADA EXITOSAMENTE');
        console.log('========================================');
        console.log(`📦 1 perfil creado: Reacciones Febriles ($100)`);
        console.log(`🧪 ${analitos.length} analitos creados`);
        console.log(`🔗 ${analitoIds.length} relaciones establecidas`);
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
