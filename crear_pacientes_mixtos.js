const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function crearPacientesMixtos() {
    try {
        console.log('Connecting...');
        await client.connect();

        const fechaEspecifica = '2026-01-20 10:00:00-06';
        const fechaAtencion = '2026-01-20';

        // 1. Get Studies
        const codes = ['BH', 'EGO', 'TP', 'GLU'];
        const resEstudios = await client.query(`
            SELECT id, nombre, codigo, precio, area 
            FROM estudios_laboratorio 
            WHERE codigo = ANY($1)
        `, [codes]);

        const estudiosMap = {};
        resEstudios.rows.forEach(e => estudiosMap[e.codigo] = e);

        // Define Patients
        const pacientes = [
            {
                nombre: 'Juan Solo Hematologia',
                folio: '260120-002',
                estudios: ['BH']
            },
            {
                nombre: 'Pedro Solo Orina',
                folio: '260120-003',
                estudios: ['EGO']
            },
            {
                nombre: 'Maria Mixta (Coag + Quim)',
                folio: '260120-004',
                estudios: ['TP', 'GLU']
            }
        ];

        for (const p of pacientes) {
            console.log(`Creating patient: ${p.nombre}...`);

            // Calculate total usually, but here just placeholder
            const total = 500;

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
                    $1,
                    '555-000-0000',
                    '1990-01-01',
                    $2,
                    'verificada',
                    $3,
                    $3,
                    'Efectivo',
                    $4
                ) RETURNING id`,
                [p.nombre, fechaEspecifica, total, p.folio]
            );

            const citaId = resCita.rows[0].id;

            // Link Studies
            for (const code of p.estudios) {
                const est = estudiosMap[code];
                if (est) {
                    await client.query(`
                        INSERT INTO citas_estudios (cita_id, estudio_id, estado_muestra)
                        VALUES ($1, $2, 'tomada')
                    `, [citaId, est.id]);
                } else {
                    console.log(`  ⚠️ Study not found: ${code}`);
                }
            }
        }

        console.log('✅ Pacientes creados y listos en FASE ANALÍTICA (muestras tomadas).');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

crearPacientesMixtos();
