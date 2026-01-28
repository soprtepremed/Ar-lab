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

        const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'HBA1C'`);

        if (check.rows.length > 0) {
            console.log('⚠️ HBA1C ya existe');
        } else {
            await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo,
                    unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            `, [
                'HBA1C', 'Hemoglobina Glicosilada (HbA1c)', 'Química Clínica', 100, true,
                '%', 'rango', 4.0, 6.0, '4.0 - 6.0',
                'Espectrofotometría', 'Sangre total EDTA', 'Tubo Morado', 'Mismo día',
                'No requiere ayuno. Control metabólico diabético 8-12 semanas previas. Normal: <5.7%, Prediabetes: 5.7-6.4%, Diabetes: ≥6.5%'
            ]);
            console.log('✅ HBA1C: Hemoglobina Glicosilada insertada');
        }

        console.log('\n========================================');
        console.log('✅ HEMOGLOBINA GLICOSILADA INSERTADA');
        console.log('========================================');
        console.log('📦 Código: HBA1C');
        console.log('📊 Referencia: 4.0 - 6.0%');
        console.log('🔬 Método: Espectrofotometría');
        console.log('🧪 Tubo: Morado (EDTA)');
        console.log('💰 Precio: $100');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
