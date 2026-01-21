const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function actualizarEstructura() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase');

        // Crear tabla de doctores/médicos referentes
        await client.query(`
            CREATE TABLE IF NOT EXISTS medicos_referentes (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                especialidad VARCHAR(100),
                telefono VARCHAR(20),
                email VARCHAR(100),
                clinica VARCHAR(200),
                direccion TEXT,
                activo BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla medicos_referentes creada');

        // Crear tabla de relación citas-estudios
        await client.query(`
            CREATE TABLE IF NOT EXISTS citas_estudios (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                cita_id UUID REFERENCES citas(id) ON DELETE CASCADE,
                estudio_id UUID REFERENCES estudios_laboratorio(id),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla citas_estudios creada');

        // Agregar columna de médico referente a citas
        await client.query(`
            ALTER TABLE citas 
            ADD COLUMN IF NOT EXISTS medico_referente_id UUID REFERENCES medicos_referentes(id),
            ADD COLUMN IF NOT EXISTS medico_referente_nombre VARCHAR(200);
        `);
        console.log('✅ Columnas de médico referente agregadas a citas');

        // Insertar algunos médicos de ejemplo
        await client.query(`
            INSERT INTO medicos_referentes (nombre, especialidad) VALUES
            ('Dr. Juan Pérez González', 'Medicina General'),
            ('Dra. María López Hernández', 'Medicina Interna'),
            ('Dr. Carlos Ramírez Torres', 'Ginecología'),
            ('Dra. Ana García Ruiz', 'Pediatría'),
            ('Dr. Roberto Sánchez Mora', 'Cardiología')
            ON CONFLICT DO NOTHING;
        `);
        console.log('✅ Médicos de ejemplo insertados');

        // Verificar
        const estudios = await client.query('SELECT COUNT(*) as total FROM estudios_laboratorio');
        const medicos = await client.query('SELECT COUNT(*) as total FROM medicos_referentes');

        console.log(`\n📊 Estado de la base de datos:`);
        console.log(`   - Estudios de laboratorio: ${estudios.rows[0].total}`);
        console.log(`   - Médicos referentes: ${medicos.rows[0].total}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

actualizarEstructura();
