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

        const estudios = [
            {
                codigo: 'FR',
                nombre: 'Factor Reumatoide',
                unidades: 'UI/mL',
                ref_min: 0,
                ref_max: 20,
                rango: '0 - 20',
                metodo: 'Turbidimetría'
            },
            {
                codigo: 'PCR',
                nombre: 'Proteína C Reactiva',
                unidades: 'mg/L',
                ref_min: 0,
                ref_max: 6,
                rango: '< 6',
                metodo: 'Turbidimetría'
            },
            {
                codigo: 'ASO',
                nombre: 'Antiestreptolisinas O',
                unidades: 'UI/mL',
                ref_min: 0,
                ref_max: 200,
                rango: '< 200',
                metodo: 'Turbidimetría'
            }
        ];

        console.log('📦 Insertando estudios cuantitativos...\n');

        for (const e of estudios) {
            const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = $1`, [e.codigo]);

            if (check.rows.length > 0) {
                console.log(`⚠️ ${e.codigo} ya existe`);
            } else {
                await client.query(`
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, activo,
                        unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                        metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                `, [
                    e.codigo, e.nombre, 'Inmunología', 80, true,
                    e.unidades, 'rango', e.ref_min, e.ref_max, e.rango,
                    e.metodo, 'Suero', 'Tubo Rojo', 'Mismo día',
                    'No requiere preparación especial.'
                ]);
                console.log(`✅ ${e.codigo}: ${e.nombre} (${e.rango} ${e.unidades})`);
            }
        }

        console.log('\n========================================');
        console.log('✅ 3 ESTUDIOS CUANTITATIVOS INSERTADOS');
        console.log('========================================');
        console.log('📦 FR: Factor Reumatoide (0-20 UI/mL)');
        console.log('📦 PCR: Proteína C Reactiva (<6 mg/L)');
        console.log('📦 ASO: Antiestreptolisinas (<200 UI/mL)');
        console.log('🔬 Método: Turbidimetría');
        console.log('🧪 Tubo: Rojo (Suero)');
        console.log('💰 Precio: $80 c/u');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
