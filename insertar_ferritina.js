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

        // Verificar si existe
        const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'FERR'`);
        let estudioId;

        if (check.rows.length > 0) {
            estudioId = check.rows[0].id;
            console.log('⚠️ FERR ya existe, usando ID existente');
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo,
                    unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING id
            `, [
                'FERR', 'Ferritina', 'Inmunología', 100, true,
                'ng/mL', 'rango', 18, 341, '18 - 341',
                'Turbidimetría', 'Suero', 'Tubo Rojo', 'Mismo día', 'No requiere preparación especial.'
            ]);
            estudioId = res.rows[0].id;
            console.log('✅ FERR: Ferritina insertado');
        }

        // Referencias por edad/sexo de UPC
        console.log('\n📊 Insertando referencias por edad/sexo...');
        const refs = [
            // Neonatos/Lactantes (ambos sexos)
            { desc: '4-14 días', min_dias: 4, max_dias: 14, sexo: null, valor_min: 100, valor_max: 717 },
            { desc: '15 días - 5 meses', min_dias: 15, max_dias: 150, sexo: null, valor_min: 14, valor_max: 647 },
            { desc: '6-11 meses', min_dias: 151, max_dias: 335, sexo: null, valor_min: 8, valor_max: 182 },
            // Niños (ambos sexos)
            { desc: '1-4 años', min_dias: 336, max_dias: 1460, sexo: null, valor_min: 5, valor_max: 100 },
            { desc: '5-13 años', min_dias: 1461, max_dias: 4745, sexo: null, valor_min: 14, valor_max: 79 },
            // Mujeres
            { desc: 'Mujeres 14-18 años', min_dias: 4746, max_dias: 6570, sexo: 'F', valor_min: 6, valor_max: 67 },
            { desc: 'Mujeres 19-40 años', min_dias: 6571, max_dias: 14600, sexo: 'F', valor_min: 16, valor_max: 154 },
            { desc: 'Mujeres 41-60 años', min_dias: 14601, max_dias: 21900, sexo: 'F', valor_min: 16, valor_max: 232 },
            { desc: 'Mujeres 61-100 años', min_dias: 21901, max_dias: 36500, sexo: 'F', valor_min: 16, valor_max: 288 },
            // Hombres
            { desc: 'Hombres 14-15 años', min_dias: 4746, max_dias: 5475, sexo: 'M', valor_min: 13, valor_max: 83 },
            { desc: 'Hombres 16-18 años', min_dias: 5476, max_dias: 6570, sexo: 'M', valor_min: 11, valor_max: 172 },
            { desc: 'Hombres 19-59 años', min_dias: 6571, max_dias: 21535, sexo: 'M', valor_min: 38, valor_max: 380 },
            { desc: 'Hombres 60-100 años', min_dias: 21536, max_dias: 36500, sexo: 'M', valor_min: 24, valor_max: 380 }
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
                console.log(`   ✅ ${sexoIcon} ${r.desc}: ${r.valor_min}-${r.valor_max} ng/mL`);
            } else {
                console.log(`   ⚠️ ${r.desc} ya existe`);
            }
        }

        console.log('\n========================================');
        console.log('✅ FERRITINA INSERTADA');
        console.log('========================================');
        console.log('📦 Código: FERR');
        console.log('📊 Referencias: 13 rangos por edad/sexo');
        console.log('🔬 Método: Turbidimetría');
        console.log('💰 Precio: $100');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
