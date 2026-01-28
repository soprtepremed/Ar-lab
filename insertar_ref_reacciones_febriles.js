const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

// IDs específicos de Reacciones Febriles encontrados
const estudiosFebriles = [
    { id: 'd6bd0587-334c-47f6-8856-0b5272f5bce8', nombre: 'Paratífico "A"' },
    { id: 'a5267e3a-f02f-49be-9105-c2b9b01a0b63', nombre: 'Paratífico "B"' },
    { id: '762e0f51-c81a-4acf-80ca-e5e0ca20ad0a', nombre: 'Tífico "H"' },
    { id: 'b35fccba-8cd5-40e3-be78-1b3ec7b054eb', nombre: 'Tífico "O"' }
];

async function run() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase\n');

        console.log('🔬 Insertando valores de referencia para Reacciones Febriles...\n');

        for (const estudio of estudiosFebriles) {
            // Verificar si ya tiene referencia
            const checkRef = await client.query(
                `SELECT id FROM valores_referencia WHERE estudio_id = $1`,
                [estudio.id]
            );

            if (checkRef.rows.length > 0) {
                console.log(`⚠️  ${estudio.nombre}: Ya tiene valor de referencia`);
                continue;
            }

            // Insertar valor de referencia
            await client.query(`
                INSERT INTO valores_referencia (estudio_id, valor_texto, descripcion, orden)
                VALUES ($1, $2, $3, $4)
            `, [estudio.id, 'Negativo', '< 1:80', 1]);

            console.log(`✅ ${estudio.nombre}: Insertado → Negativo (< 1:80)`);
        }

        // Actualizar campo rango_referencia en estudios_laboratorio
        console.log('\n📝 Actualizando campo rango_referencia...\n');

        for (const estudio of estudiosFebriles) {
            await client.query(`
                UPDATE estudios_laboratorio 
                SET rango_referencia = 'Negativo (< 1:80)'
                WHERE id = $1
            `, [estudio.id]);
            console.log(`   ✅ Actualizado: ${estudio.nombre}`);
        }

        console.log('\n========================================');
        console.log('✅ VALORES DE REFERENCIA COMPLETADOS');
        console.log('========================================');
        console.log('📊 Valor: Negativo (< 1:80)');
        console.log('🔬 Estudios actualizados:');
        estudiosFebriles.forEach(e => console.log(`   - ${e.nombre}`));
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
