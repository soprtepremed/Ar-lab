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

        // Texto de referencia para mostrar en reportes
        const referenciaTexto = `SEMANAS DE GESTACIÓN:
3-4: 16-156 | 4-5: 101-4,870 | 5-6: 1,110-31,500
6-7: 2,560-82,300 | 7-8: 23,100-151,000 | 8-9: 27,300-233,000
9-13: 20,900-291,000 | 13-18: 6,140-103,000
18-23: 4,720-80,100 | 23-41: 2,700-78,100`;

        console.log('📝 Insertando estudio HGC...');

        const insertQuery = `
            INSERT INTO estudios_laboratorio (
                codigo, nombre, categoria, precio, es_perfil, tipo_muestra, 
                tubo_recipiente, unidades, activo, area,
                tipo_referencia, referencia_texto
            )
            VALUES ($1, $2, $3, $4, false, $5, $6, $7, true, $8, 'texto', $9)
            ON CONFLICT (codigo) DO UPDATE SET 
                nombre = EXCLUDED.nombre,
                precio = EXCLUDED.precio,
                referencia_texto = EXCLUDED.referencia_texto
            RETURNING id
        `;

        const res = await client.query(insertQuery, [
            'HOR-HGC',
            'Cuantificación de Hormona Gonadotrofinica Coriónica (HGC)',
            'Hormonal',
            100,
            'Suero',
            'Tubo Rojo',
            'mUI/mL',
            'Hormonal',
            referenciaTexto
        ]);

        console.log(`   ✅ HOR-HGC - Cuantificación de Hormona Gonadotrofinica Coriónica (HGC)`);
        console.log(`   📊 ID: ${res.rows[0].id}`);

        console.log('\n========================================');
        console.log('✅ INSERCIÓN COMPLETADA EXITOSAMENTE');
        console.log('========================================');
        console.log('📦 Estudio: HGC ($100)');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
