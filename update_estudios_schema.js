const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function updateSchema() {
    try {
        await client.connect();
        console.log('Conectado. Actualizando esquema para gestión de estudios...');

        // Agregar flags para estudios frecuentes y perfiles
        await client.query('ALTER TABLE estudios_laboratorio ADD COLUMN IF NOT EXISTS es_frecuente BOOLEAN DEFAULT false');
        await client.query('ALTER TABLE estudios_laboratorio ADD COLUMN IF NOT EXISTS es_perfil BOOLEAN DEFAULT false');

        // Crear tabla para componentes de perfiles
        await client.query(`
            CREATE TABLE IF NOT EXISTS estudio_componentes (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                perfil_id UUID REFERENCES estudios_laboratorio(id) ON DELETE CASCADE,
                componente_id UUID REFERENCES estudios_laboratorio(id) ON DELETE CASCADE,
                UNIQUE(perfil_id, componente_id)
            )
        `);

        console.log('✅ Esquema actualizado exitosamente.');
    } catch (err) {
        console.error('❌ Error actualizando esquema:', err);
    } finally {
        await client.end();
    }
}

updateSchema();
