const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.ebihobjrwcwtjfazcjmv:RDF6lvPNdCZWFeAT@aws-1-us-east-2.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function seedPatients() {
    try {
        console.log('Connecting...');
        await client.connect();

        // 1. Get Studies
        const resEstudios = await client.query("SELECT id, nombre, precio FROM estudios_laboratorio WHERE activo = true");
        const estudios = resEstudios.rows;

        if (estudios.length < 3) {
            console.error('Not enough studies found to seed data.');
            return;
        }

        console.log(`Found ${estudios.length} studies.`);

        // 2. Define Patients (Date: 2026-01-19)
        const targetDate = '2026-01-19';

        const patients = [
            {
                nombre: 'Sofía Ramírez Torres',
                primer_nombre: 'Sofía',
                primer_apellido: 'Ramírez',
                segundo_apellido: 'Torres',
                telefono: '5512345678',
                fecha: `${targetDate}T08:00:00`,
                fecha_nacimiento: '1995-03-12',
                estudiosIndices: [0, 4]
            },
            {
                nombre: 'Miguel Ángel Castillo',
                primer_nombre: 'Miguel',
                segundo_nombre: 'Ángel',
                primer_apellido: 'Castillo',
                telefono: '5587654321',
                fecha: `${targetDate}T09:15:00`,
                fecha_nacimiento: '1982-07-25',
                estudiosIndices: [2]
            },
            {
                nombre: 'Valentina Herrera Diaz',
                primer_nombre: 'Valentina',
                primer_apellido: 'Herrera',
                segundo_apellido: 'Diaz',
                telefono: '5544332211',
                fecha: `${targetDate}T10:45:00`,
                fecha_nacimiento: '2001-11-05',
                estudiosIndices: [1, 3, 5]
            }
        ];

        let counter = 1;
        for (const p of patients) {
            const folioAtencion = `260119-00${counter}`;
            const folioVenta = Math.floor(Date.now() / 1000) + counter;

            const insertCitaText = `
                INSERT INTO citas (
                    paciente_nombre,
                    primer_nombre,
                    segundo_nombre,
                    primer_apellido,
                    segundo_apellido,
                    paciente_telefono, 
                    fecha_hora, 
                    fecha_nacimiento,
                    estado, 
                    tipo_servicio,
                    folio_atencion,
                    folio_venta,
                    metodo_pago,
                    total,
                    pagado
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'verificada', 'laboratorio', $9, $10, 'efectivo', 0, 0) 
                RETURNING id;
            `;

            const values = [
                p.nombre,
                p.primer_nombre,
                p.segundo_nombre || null,
                p.primer_apellido,
                p.segundo_apellido || null,
                p.telefono,
                p.fecha,
                p.fecha_nacimiento,
                folioAtencion,
                folioVenta
            ];

            const resCita = await client.query(insertCitaText, values);
            const citaId = resCita.rows[0].id;
            console.log(`Created patient: ${p.nombre} (ID: ${citaId})`);

            // Insert Estudios
            let total = 0;
            for (const idx of p.estudiosIndices) {
                if (estudios[idx]) {
                    const est = estudios[idx];
                    await client.query(
                        "INSERT INTO citas_estudios (cita_id, estudio_id) VALUES ($1, $2)",
                        [citaId, est.id]
                    );
                    total += parseFloat(est.precio);
                }
            }

            // Update total
            await client.query("UPDATE citas SET total = $1, pagado = $1 WHERE id = $2", [total, citaId]);
            counter++;
        }

        console.log('✅ 3 Verified Patients created for ' + targetDate);

    } catch (err) {
        console.error('Error seeding:', err);
    } finally {
        await client.end();
    }
}

seedPatients();
