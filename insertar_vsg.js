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

        // Insertar estudio VSG
        const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'VSG'`);
        let estudioId;

        if (check.rows.length > 0) {
            estudioId = check.rows[0].id;
            console.log('⚠️ VSG ya existe, usando ID existente');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo,
                    unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING id
            `, [
                'VSG', 'Sedimentación Globular (VSG, ESR)', 'Hematología', 50, true,
                'mm/h', 'rango', 0, 20, '0 - 20',
                'Westergreen', 'Sangre total EDTA', 'Tubo Morado', 'Mismo día',
                'No requiere preparación especial.'
            ]);
            estudioId = res.rows[0].id;
            console.log('✅ VSG: Sedimentación Globular insertada');
        }

        // Referencias por edad/sexo de UPC
        console.log('\n📊 Insertando referencias por edad/sexo (UPC)...');
        const refs = [
            // Niños (ambos sexos)
            { desc: '0-15 años', min_dias: 0, max_dias: 5475, sexo: null, valor_min: 0, valor_max: 10 },
            // Hombres
            { desc: 'Hombres 16-50 años', min_dias: 5476, max_dias: 18250, sexo: 'M', valor_min: 0, valor_max: 15 },
            { desc: 'Hombres >51 años', min_dias: 18251, max_dias: 36500, sexo: 'M', valor_min: 0, valor_max: 20 },
            // Mujeres
            { desc: 'Mujeres 16-50 años', min_dias: 5476, max_dias: 18250, sexo: 'F', valor_min: 0, valor_max: 20 },
            { desc: 'Mujeres >51 años', min_dias: 18251, max_dias: 36500, sexo: 'F', valor_min: 0, valor_max: 30 }
        ];

        for (let i = 0; i < refs.length; i++) {
            const r = refs[i];
            const checkRef = await client.query(
                `SELECT id FROM valores_referencia WHERE estudio_id = $1 AND descripcion = $2`,
                [estudioId, r.desc]
            );
            if (checkRef.rows.length === 0) {
                await client.query(`
                    INSERT INTO valores_referencia (estudio_id, edad_min_dias, edad_max_dias, sexo, valor_min, valor_max, descripcion, orden)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [estudioId, r.min_dias, r.max_dias, r.sexo, r.valor_min, r.valor_max, r.desc, i]);
                const sexoIcon = r.sexo === 'M' ? '♂️' : (r.sexo === 'F' ? '♀️' : '⚥');
                console.log(`   ✅ ${sexoIcon} ${r.desc}: ${r.valor_min}-${r.valor_max} mm/h`);
            } else {
                console.log(`   ⚠️ ${r.desc} ya existe`);
            }
        }

        console.log('\n========================================');
        console.log('✅ VSG INSERTADA (DATOS UPC)');
        console.log('========================================');
        console.log('📦 Código: VSG');
        console.log('📊 Referencias: 5 rangos por edad/sexo');
        console.log('🔬 Método: Westergreen');
        console.log('🧪 Tubo: Morado (EDTA)');
        console.log('💰 Precio: $50');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
