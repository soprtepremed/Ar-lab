const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.ebihobjrwcwtjfazcjmv:RDF6lvPNdCZWFeAT@aws-1-us-east-2.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase PostgreSQL');

        const sql = `
            ALTER TABLE citas 
            ADD COLUMN IF NOT EXISTS piso VARCHAR(50),
            ADD COLUMN IF NOT EXISTS servicio VARCHAR(100),
            ADD COLUMN IF NOT EXISTS expediente_numero VARCHAR(50),
            ADD COLUMN IF NOT EXISTS medico_nombre VARCHAR(200);

            CREATE INDEX IF NOT EXISTS idx_citas_piso ON citas(piso);
            CREATE INDEX IF NOT EXISTS idx_citas_servicio ON citas(servicio);
            CREATE INDEX IF NOT EXISTS idx_citas_expediente ON citas(expediente_numero);
            CREATE INDEX IF NOT EXISTS idx_citas_medico ON citas(medico_nombre);
        `;

        console.log('⏳ Ejecutando migración hospitalaria...');
        await client.query(sql);
        console.log('✅ Estructura de hospitalización creada exitosamente.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
        console.log('👋 Desconectado.');
    }
}

main();
