// Script para agregar columnas de resultados a la tabla citas_estudios
// Ejecutar con: node agregar_columnas_resultados.js

const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function addResultColumns() {
    try {
        console.log('🔌 Conectando a Supabase PostgreSQL...');
        await client.connect();
        console.log('✅ Conectado');

        // Agregar columnas para resultados
        console.log('🔧 Agregando columnas de resultados a citas_estudios...');

        const queries = [
            `ALTER TABLE citas_estudios ADD COLUMN IF NOT EXISTS valor_resultado TEXT;`,
            `ALTER TABLE citas_estudios ADD COLUMN IF NOT EXISTS estado_resultado VARCHAR(20) DEFAULT 'pendiente';`,
            `ALTER TABLE citas_estudios ADD COLUMN IF NOT EXISTS validado_por VARCHAR(100);`,
            `ALTER TABLE citas_estudios ADD COLUMN IF NOT EXISTS fecha_validacion TIMESTAMPTZ;`,
            `ALTER TABLE citas_estudios ADD COLUMN IF NOT EXISTS resultado TEXT;`
        ];

        for (const query of queries) {
            try {
                await client.query(query);
                console.log('   ✅ Ejecutado:', query.substring(0, 60) + '...');
            } catch (err) {
                if (err.code === '42701') {
                    console.log('   ⚠️ Columna ya existe, continuando...');
                } else {
                    throw err;
                }
            }
        }

        // Agregar columna rango_referencia a estudios si no existe
        console.log('🔧 Agregando columna rango_referencia a estudios...');
        try {
            await client.query(`ALTER TABLE estudios_laboratorio ADD COLUMN IF NOT EXISTS rango_referencia TEXT;`);
            console.log('   ✅ Columna rango_referencia agregada');
        } catch (err) {
            console.log('   ⚠️ Columna ya existe o error:', err.message);
        }

        // Verificar estructura
        console.log('\n📋 Verificando estructura de citas_estudios...');
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'citas_estudios'
            ORDER BY ordinal_position;
        `);

        console.log('Columnas actuales:');
        result.rows.forEach(row => {
            console.log(`   - ${row.column_name}: ${row.data_type}`);
        });

        console.log('\n✅ ¡Migración completada exitosamente!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

addResultColumns();
