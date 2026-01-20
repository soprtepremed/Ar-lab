const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function regresarASala() {
    try {
        console.log('Connecting...');
        await client.connect();

        const result = await client.query(`
            UPDATE citas 
            SET estado = 'llamado' 
            WHERE estado IN ('completada', 'muestra_tomada', 'en_proceso')
            RETURNING id, paciente_nombre, estado
        `);

        console.log(`✅ Regresados a Sala de Espera: ${result.rowCount} pacientes`);
        result.rows.forEach(p => console.log(` - ${p.paciente_nombre}`));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

regresarASala();
