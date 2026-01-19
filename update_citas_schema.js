const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function updateSchema() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase');

        // Agregar columnas faltantes a la tabla 'citas'
        const query = `
            ALTER TABLE citas 
            ADD COLUMN IF NOT EXISTS comprobante_notas TEXT,
            ADD COLUMN IF NOT EXISTS comprobante_comentarios TEXT,
            ADD COLUMN IF NOT EXISTS operador_pago VARCHAR(200),
            ADD COLUMN IF NOT EXISTS folio_venta VARCHAR(100),
            ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50),
            ADD COLUMN IF NOT EXISTS total DECIMAL(12,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS pagado DECIMAL(12,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
            ADD COLUMN IF NOT EXISTS diagnostico TEXT,
            ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(100),
            ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(100),
            ADD COLUMN IF NOT EXISTS primer_apellido VARCHAR(100),
            ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(100);
        `;

        await client.query(query);
        console.log('✅ Columnas agregadas exitosamente a la tabla citas');

    } catch (err) {
        console.error('❌ Error al actualizar esquema:', err.message);
    } finally {
        await client.end();
    }
}

updateSchema();
