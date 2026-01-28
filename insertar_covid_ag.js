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

        const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'COVID-AG'`);

        if (check.rows.length > 0) {
            console.log('⚠️ COVID-AG ya existe');
        } else {
            await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo,
                    tipo_referencia, rango_referencia,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
                'COVID-AG', 'Antígeno SARS-CoV-2', 'Inmunología', 150, true,
                'cualitativo', 'NEGATIVO',
                'Inmunocromatografía (Sensibilidad 95.5%, Especificidad 99.2%)',
                'Hisopado nasofaríngeo', 'Hisopo estéril', '30 min',
                'Prueba rápida de detección de antígeno. No requiere ayuno.'
            ]);
            console.log('✅ COVID-AG: Antígeno SARS-CoV-2 insertado');
        }

        console.log('\n========================================');
        console.log('✅ ANTÍGENO SARS-CoV-2 INSERTADO');
        console.log('========================================');
        console.log('📦 Código: COVID-AG');
        console.log('📊 Referencia: NEGATIVO (cualitativo)');
        console.log('🔬 Método: Inmunocromatografía');
        console.log('📈 Sensibilidad: 95.5%');
        console.log('📉 Especificidad: 99.2%');
        console.log('💰 Precio: $150');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
