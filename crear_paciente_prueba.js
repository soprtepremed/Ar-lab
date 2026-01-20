const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function crearPacientePrueba() {
    try {
        console.log('Connecting...');
        await client.connect();

        // 1. Get Study IDs
        console.log('Fetching study IDs...');
        const codes = ['GLU', 'UREA', 'CREA', 'AU', 'COL'];
        const resEstudios = await client.query(`
            SELECT id, nombre, codigo, precio 
            FROM estudios_laboratorio 
            WHERE codigo = ANY($1)
        `, [codes]);

        if (resEstudios.rows.length === 0) {
            console.error('❌ No se encontraron los estudios. Verifica los códigos.');
            return;
        }

        const estudios = resEstudios.rows;
        console.log('Studies found:', estudios.map(e => e.nombre));

        let total = estudios.reduce((sum, e) => sum + parseFloat(e.precio || 0), 0);

        // 2. Create Appointment (Cita) - Estado: 'verificada' (Waiting Room)
        // Set date to 2026-01-20
        const fechaEspecifica = '2026-01-20 09:00:00-06';

        console.log('Creating appointment for 2026-01-20...');
        const resCita = await client.query(`
            INSERT INTO citas (
                paciente_nombre, 
                paciente_telefono, 
                fecha_nacimiento, 
                fecha_hora,
                estado,
                total,
                pagado,
                metodo_pago,
                folio_atencion
            ) VALUES (
                'Martha Prueba Resultados',
                '555-000-1111',
                '1985-05-15',
                $1,
                'verificada',
                $2,
                $2,
                'Efectivo',
                '260120-001'
            ) RETURNING id`,
            [fechaEspecifica, total]
        );

        const citaId = resCita.rows[0].id;
        console.log(`✅ Cita created with ID: ${citaId}`);

        // 3. Link Studies
        console.log('Linking studies...');
        for (const est of estudios) {
            await client.query(`
                INSERT INTO citas_estudios (cita_id, estudio_id, estado_muestra)
                VALUES ($1, $2, 'pendiente')
            `, [citaId, est.id]);
        }

        console.log('✅ Studies linked successfully.');
        console.log('Paciente "Martha Prueba Resultados" listo en SALA DE ESPERA.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

crearPacientePrueba();
