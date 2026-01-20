const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function undoVerification() {
    try {
        console.log('Connecting...');
        await client.connect();

        // Find the most recent 'verificada' appointment for today
        const res = await client.query(`
            SELECT id, paciente_nombre, folio_atencion 
            FROM citas 
            WHERE estado = 'verificada' 
            ORDER BY fecha_hora_llegada DESC 
            LIMIT 1;
        `);

        if (res.rows.length === 0) {
            console.log('No verified appointments found to undo.');
            return;
        }

        const cita = res.rows[0];
        console.log(`Found verified patient: ${cita.paciente_nombre} (Folio: ${cita.folio_atencion})`);

        // Reset to pendiente
        await client.query(`
            UPDATE citas 
            SET estado = 'pendiente', folio_atencion = NULL, fecha_hora_llegada = NULL 
            WHERE id = $1
        `, [cita.id]);

        console.log('✅ Verification undone. Patient status reset to Pending.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

undoVerification();
