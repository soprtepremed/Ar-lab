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

        const check = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'DIMED'`);

        if (check.rows.length > 0) {
            console.log('⚠️ DIMED ya existe');
        } else {
            await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo,
                    unidades, tipo_referencia, referencia_max, rango_referencia,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `, [
                'DIMED', 'Dímero D', 'Coagulación', 100, true,
                'ng/mL', 'rango', 250, '< 250',
                'Inmunoensayo turbidimétrico', 'Plasma citratado', 'Tubo Celeste', 'Mismo día',
                'No requiere preparación especial. Valores < 250 ng/mL excluyen trombosis venosa profunda y TEP.'
            ]);
            console.log('✅ DIMED: Dímero D insertado');
        }

        console.log('\n========================================');
        console.log('✅ DÍMERO D INSERTADO');
        console.log('========================================');
        console.log('📦 Código: DIMED');
        console.log('📊 Referencia: < 250 ng/mL');
        console.log('🔬 Método: Inmunoensayo turbidimétrico');
        console.log('🧪 Tubo: Azul Cielo (citrato)');
        console.log('💰 Precio: $100');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
