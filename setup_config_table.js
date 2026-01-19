const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function setup() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase');

        // 1. Crear tabla de configuración
        await client.query(`
            CREATE TABLE IF NOT EXISTS configuracion_laboratorio (
                id INTEGER PRIMARY KEY DEFAULT 1,
                nombre_laboratorio VARCHAR(200) DEFAULT 'AR LAB',
                responsable_sanitario VARCHAR(200) DEFAULT 'Q.F.B. Adolfo Ruiz',
                cedula_profesional VARCHAR(100) DEFAULT '1234567',
                direccion TEXT DEFAULT 'Calle Principal #123, Veracruz, Ver.',
                telefono VARCHAR(20) DEFAULT '228 123 4567',
                CONSTRAINT single_row CHECK (id = 1)
            );
        `);
        console.log('✅ Tabla configuracion_laboratorio lista');

        // 2. Insertar valores por defecto si no existen
        await client.query(`
            INSERT INTO configuracion_laboratorio (id, nombre_laboratorio, responsable_sanitario, cedula_profesional, direccion, telefono)
            VALUES (1, 'AR LAB', 'Q.F.B. Adolfo Ruiz', '1234567', 'Calle Principal #123, Veracruz, Ver.', '228 123 4567')
            ON CONFLICT (id) DO NOTHING;
        `);
        console.log('✅ Valores por defecto insertados/verificados');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

setup();
