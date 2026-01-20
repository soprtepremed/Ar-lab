
const { Client } = require('pg');

// Configuración de conexión (usando la misma que scripts anteriores exitosos)
const connectionString = 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres';

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function addResultsColumn() {
    try {
        await client.connect();

        console.log('Conectado a la base de datos...');

        console.log('Conectado a la base de datos...');

        // 1. Añadir columnas faltantes a 'estudios_laboratorio'
        const query = `
            ALTER TABLE estudios_laboratorio 
            ADD COLUMN IF NOT EXISTS unidades TEXT DEFAULT '',
            ADD COLUMN IF NOT EXISTS referencia TEXT DEFAULT '';
        `;

        await client.query(query);
        console.log("✅ Columnas 'unidades' y 'referencia' agregadas a 'estudios_laboratorio'.");

        // 2. Refrescar API Supabase
        await client.query(`NOTIFY pgrst, 'reload config';`);
        console.log("✅ Caché de API refrescado.");



        console.log("Columnas actuales en citas_estudios:");
        res.rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type})`);
        });

    } catch (err) {
        console.error('Error alterando la tabla:', err);
    } finally {
        await client.end();
    }
}

addResultsColumn();
