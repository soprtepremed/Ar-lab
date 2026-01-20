const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function resetCompleto() {
    try {
        console.log('Connecting...');
        await client.connect();

        // 1. Reset all estado_muestra in citas_estudios to 'pendiente'
        console.log('Resetting estado_muestra in citas_estudios...');
        const r1 = await client.query(`
            UPDATE citas_estudios 
            SET estado_muestra = 'pendiente'
            WHERE estado_muestra != 'pendiente' OR estado_muestra IS NULL
        `);
        console.log(`  ✅ Reset ${r1.rowCount} citas_estudios records`);

        // 2. Reset all citas to 'llamado' (waiting room, already called)
        console.log('Resetting citas to sala de espera...');
        const r2 = await client.query(`
            UPDATE citas 
            SET estado = 'llamado'
            WHERE estado IN ('completada', 'muestra_tomada', 'en_proceso', 'muestra_parcial')
            RETURNING id, paciente_nombre
        `);
        console.log(`  ✅ ${r2.rowCount} pacientes regresados a Sala de Espera:`);
        r2.rows.forEach(p => console.log(`    - ${p.paciente_nombre}`));

        console.log('\n✅ Reset completo. Todos los pacientes están en Sala de Espera con muestras pendientes.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

resetCompleto();
