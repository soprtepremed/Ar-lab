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
        await client.query(`
            ALTER TABLE estudios_laboratorio 
            ADD COLUMN IF NOT EXISTS formula text;
        `);

        await client.query(`
            COMMENT ON COLUMN estudios_laboratorio.formula IS 'Formula for calculated analytes. Use study codes in brackets, e.g., [CREA]/28.3';
        `);

        console.log('✅ Cambio aplicado exitosamente');

        const result = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'estudios_laboratorio' AND column_name = 'formula'");
        console.log('Verificación:', result.rows);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

runUpdate();
