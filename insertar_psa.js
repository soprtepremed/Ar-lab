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

        const codigo = 'HOR-PSA';
        const nombre = 'Antígeno Prostático Específico (PSA)';
        const categoria = 'Marcadores Tumorales';
        const tipoMuestra = 'Suero';
        const tuboRecipiente = 'Tubo Rojo';
        const metodologia = 'Electroquimioluminiscencia';
        const area = 'Hormonal';
        const unidades = 'ng/mL';
        const precio = 200;

        // Referencia con rangos por edad
        const referenciaTexto = `< 40 años: 0.0 - 4.0 ng/mL | ≥ 40 años: 0.0 - 5.0 ng/mL`;
        const indicaciones = 'No especiales. Evitar tacto rectal, eyaculación y ejercicio intenso previo.';

        console.log('🔍 Verificando si existe...');
        const checkQuery = `SELECT id FROM estudios_laboratorio WHERE codigo = $1`;
        const checkRes = await client.query(checkQuery, [codigo]);

        if (checkRes.rows.length > 0) {
            console.log('   🔄 Actualizando estudio existente...');
            await client.query(`
                UPDATE estudios_laboratorio SET
                    nombre = $2, categoria = $3, precio = $4, tipo_muestra = $5,
                    tubo_recipiente = $6, metodologia = $7, area = $8, unidades = $9,
                    tipo_referencia = 'texto', referencia_texto = $10, indicaciones = $11
                WHERE codigo = $1
            `, [codigo, nombre, categoria, precio, tipoMuestra, tuboRecipiente, metodologia, area, unidades, referenciaTexto, indicaciones]);
        } else {
            console.log('   📝 Creando nuevo estudio...');
            await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, es_perfil, tipo_muestra, 
                    tubo_recipiente, metodologia, area, unidades, activo,
                    tipo_referencia, referencia_texto, indicaciones
                )
                VALUES ($1, $2, $3, $4, false, $5, $6, $7, $8, $9, true, 'texto', $10, $11)
            `, [codigo, nombre, categoria, precio, tipoMuestra, tuboRecipiente, metodologia, area, unidades, referenciaTexto, indicaciones]);
        }

        console.log('\n========================================');
        console.log('✅ PSA COMPLETADO');
        console.log('========================================');
        console.log(`📋 Código: ${codigo}`);
        console.log(`📦 Estudio: ${nombre}`);
        console.log(`💰 Precio: $${precio}`);
        console.log(`📊 Referencia: ${referenciaTexto}`);
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
