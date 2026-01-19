// Script para agregar columna cedula a medicos_referentes
const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function addCedulaColumn() {
    try {
        console.log('🔌 Conectando a Supabase PostgreSQL...');
        await client.connect();
        console.log('✅ Conectado');

        // Agregar columna cedula
        console.log('🔧 Agregando columna cedula a medicos_referentes...');
        await client.query(`
            ALTER TABLE medicos_referentes 
            ADD COLUMN IF NOT EXISTS cedula VARCHAR(50);
        `);
        console.log('✅ Columna cedula agregada exitosamente');

        // Verificar estructura
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'medicos_referentes'
            ORDER BY ordinal_position;
        `);

        console.log('\n📋 Estructura actual de medicos_referentes:');
        result.rows.forEach(row => {
            console.log(`   - ${row.column_name}: ${row.data_type}`);
        });

        await client.end();
        console.log('\n🎉 ¡Listo! Ahora puedes guardar médicos con cédula.');

    } catch (err) {
        console.error('❌ Error:', err.message);
        await client.end();
    }
}

addCedulaColumn();
