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

        // 1. Actualizar Glucosa a valores UPC
        console.log('📦 Actualizando valores con UPC...\n');

        await client.query(`
            UPDATE estudios_laboratorio 
            SET referencia_min = 74, referencia_max = 106, rango_referencia = '74 - 106'
            WHERE codigo = 'QS-GLU'
        `);
        console.log('   ✅ Glucosa: 70-100 → 74-106 mg/dL (UPC)');

        await client.query(`
            UPDATE estudios_laboratorio 
            SET referencia_min = 13, referencia_max = 43, rango_referencia = '13 - 43'
            WHERE codigo = 'UREA' OR nombre ILIKE '%urea%'
        `);
        console.log('   ✅ Urea: 15-36 → 13-43 mg/dL (UPC)');

        await client.query(`
            UPDATE estudios_laboratorio 
            SET referencia_min = 6, referencia_max = 20, rango_referencia = '6 - 20'
            WHERE codigo = 'BUN'
        `);
        console.log('   ✅ BUN: 7-20 → 6-20 mg/dL (UPC)');

        // 2. Agregar Ácido Úrico si no existe
        const auCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'AU'`);

        if (auCheck.rows.length > 0) {
            console.log('\n   ⚠️ Ácido Úrico ya existe, actualizando...');
            await client.query(`
                UPDATE estudios_laboratorio 
                SET rango_referencia = '♀2.4-5.7 / ♂3.4-7.0',
                    referencia_min = 2.4, referencia_max = 7.0
                WHERE codigo = 'AU'
            `);
        } else {
            const res = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo,
                    unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING id
            `, [
                'AU', 'Acido Urico', 'Quimica Clinica', 0, true,
                'mg/dL', 'rango', 2.4, 7.0, '♀2.4-5.7 / ♂3.4-7.0',
                'Enzimático', 'Suero', 'Tubo Rojo', 'Mismo día'
            ]);

            // Agregar refs por sexo
            await client.query(`
                INSERT INTO valores_referencia (estudio_id, sexo, valor_min, valor_max, descripcion, orden)
                VALUES ($1, 'F', 2.4, 5.7, 'Mujeres', 1), ($1, 'M', 3.4, 7.0, 'Hombres', 2)
            `, [res.rows[0].id]);

            console.log('\n   ✅ Ácido Úrico AGREGADO (♀2.4-5.7 / ♂3.4-7.0 mg/dL)');
        }

        console.log('\n========================================');
        console.log('✅ QS6 ACTUALIZADA CON VALORES UPC');
        console.log('========================================');
        console.log('📊 Glucosa: 74-106 mg/dL');
        console.log('📊 Urea: 13-43 mg/dL');
        console.log('📊 BUN: 6-20 mg/dL');
        console.log('📊 Creatinina: (sin cambio)');
        console.log('📊 Ácido Úrico: ♀2.4-5.7 / ♂3.4-7.0 mg/dL');
        console.log('📊 Colesterol: (sin cambio)');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
