const { Client } = require('pg');

const client = new Client({
    host: '2600:1f16:1cd0:3328:b828:370d:ea32:6ff0',
    port: 5432,
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

async function runUpdate() {
    try {
        console.log('Conectando a Supabase vía IPv6 directa...');
        await client.connect();
        console.log('✅ Conectado exitosamente');

        console.log('Aplicando cambios en la tabla...');
        await client.query('ALTER TABLE citas ADD COLUMN IF NOT EXISTS paciente_sexo VARCHAR(20)');
        await client.query("COMMENT ON COLUMN citas.paciente_sexo IS 'Género/Sexo del paciente (Masculino, Femenino, Otro)'");

        console.log('✅ Cambio aplicado exitosamente');

        const result = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'citas' AND column_name = 'paciente_sexo'");
        console.log('Verificación:', result.rows);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

runUpdate();
