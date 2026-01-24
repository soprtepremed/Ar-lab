const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function setup() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase');

        // Crear tabla usuarios
        await client.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                usuario VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(100) NOT NULL,
                rol VARCHAR(20) DEFAULT 'operador',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla usuarios creada');

        // Crear tabla citas
        await client.query(`
            CREATE TABLE IF NOT EXISTS citas (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                paciente_nombre VARCHAR(200) NOT NULL,
                paciente_telefono VARCHAR(20),
                paciente_email VARCHAR(100),
                fecha_hora TIMESTAMP NOT NULL,
                tipo_servicio VARCHAR(50) DEFAULT 'laboratorio',
                notas TEXT,
                estado VARCHAR(20) DEFAULT 'pendiente',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla citas creada');

        // Insertar usuario admin
        await client.query(`
            INSERT INTO usuarios (usuario, password, rol) 
            VALUES ('ADOLFO RUIZ', '9611062651', 'admin')
            ON CONFLICT (usuario) DO UPDATE SET password = '9611062651', rol = 'admin';
        `);
        console.log('✅ Usuario ADOLFO RUIZ creado/actualizado como admin');

        // Verificar
        const result = await client.query('SELECT * FROM usuarios');
        console.log('📋 Usuarios en la base de datos:', result.rows);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

setup();
