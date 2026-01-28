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

        // Verificar si ya existe
        const existCheck = await client.query(
            `SELECT id FROM estudios_laboratorio WHERE codigo = 'INS-SUERO'`
        );

        let estudioId;
        if (existCheck.rows.length > 0) {
            estudioId = existCheck.rows[0].id;
            console.log('⚠️ INS-SUERO ya existe, usando ID existente');
        } else {
            // Insertar estudio
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo,
                    unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING id
            `, [
                'INS-SUERO', 'Insulina en Suero', 'Hormonal', 100, true,
                'µU/mL', 'rango', 5.0, 25.0, '5.0 - 25.0',
                'Electroquimioluminiscencia', 'Suero', 'Tubo Rojo', 'Mismo día', 'Ayuno de 8 horas'
            ]);
            estudioId = res.rows[0].id;
            console.log('✅ INS-SUERO: Insulina en Suero insertado');
        }

        // Insertar referencias por edad
        console.log('\n📊 Insertando referencias por edad...');
        const refs = [
            { desc: '0-1 mes', min_dias: 0, max_dias: 30, valor_min: 3.0, valor_max: 20.0 },
            { desc: '2 meses - 1 año', min_dias: 31, max_dias: 365, valor_min: 4.0, valor_max: 15.0 },
            { desc: '2-11 años', min_dias: 366, max_dias: 4015, valor_min: 3.0, valor_max: 17.0 },
            { desc: 'Adultos (12+)', min_dias: 4016, max_dias: null, valor_min: 5.0, valor_max: 25.0 }
        ];

        for (let i = 0; i < refs.length; i++) {
            const r = refs[i];
            const check = await client.query(
                `SELECT id FROM valores_referencia WHERE estudio_id = $1 AND descripcion = $2`,
                [estudioId, r.desc]
            );
            if (check.rows.length === 0) {
                await client.query(`
                    INSERT INTO valores_referencia (estudio_id, edad_min_dias, edad_max_dias, valor_min, valor_max, descripcion, orden)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [estudioId, r.min_dias, r.max_dias, r.valor_min, r.valor_max, r.desc, i]);
                console.log(`   ✅ ${r.desc}: ${r.valor_min}-${r.valor_max} µU/mL`);
            } else {
                console.log(`   ⚠️ ${r.desc} ya existe`);
            }
        }

        console.log('\n========================================');
        console.log('✅ INSULINA EN SUERO INSERTADA');
        console.log('========================================');
        console.log('📦 Código: INS-SUERO');
        console.log('📊 Referencias por edad: 4 rangos');
        console.log('💰 Precio: $100');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
