const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:RDF6lvPNdCZWFeAT@db.ebihobjrwcwtjfazcjmv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

async function addNewStudies() {
    try {
        console.log('Connecting...');
        await client.connect();

        // Nuevos estudios a agregar con tubo específico
        const newStudies = [
            {
                codigo: 'BH',
                nombre: 'Biometría Hemática (Hemograma)',
                precio: 180,
                categoria: 'Hematología',
                area: 'HEMATOLOGIA',
                tubo_recipiente: 'Tubo Lila (EDTA)'
            },
            {
                codigo: 'TP',
                nombre: 'Tiempo de Protrombina',
                precio: 120,
                categoria: 'Coagulación',
                area: 'HEMATOLOGIA',
                tubo_recipiente: 'Tubo Celeste (Citrato)'
            },
            {
                codigo: 'TTP',
                nombre: 'Tiempo de Tromboplastina Parcial',
                precio: 130,
                categoria: 'Coagulación',
                area: 'HEMATOLOGIA',
                tubo_recipiente: 'Tubo Celeste (Citrato)'
            },
            {
                codigo: 'EGO',
                nombre: 'Examen General de Orina',
                precio: 90,
                categoria: 'Urianálisis',
                area: 'URIANALISIS',
                tubo_recipiente: 'Recipiente Estéril (Orina)'
            }
        ];

        for (const study of newStudies) {
            // Check if already exists
            const exists = await client.query(
                'SELECT id FROM estudios_laboratorio WHERE codigo = $1',
                [study.codigo]
            );

            if (exists.rows.length > 0) {
                console.log(`Estudio ${study.codigo} ya existe. Actualizando tubo_recipiente...`);
                await client.query(
                    'UPDATE estudios_laboratorio SET tubo_recipiente = $1 WHERE codigo = $2',
                    [study.tubo_recipiente, study.codigo]
                );
            } else {
                console.log(`Creando estudio: ${study.nombre}...`);
                await client.query(`
                    INSERT INTO estudios_laboratorio (codigo, nombre, precio, categoria, area, tubo_recipiente, activo)
                    VALUES ($1, $2, $3, $4, $5, $6, true)
                `, [study.codigo, study.nombre, study.precio, study.categoria, study.area, study.tubo_recipiente]);
            }
        }

        // Ahora agregar estos estudios a los pacientes existentes
        // Buscar los pacientes del día
        const patients = await client.query(`
            SELECT id, paciente_nombre FROM citas 
            WHERE fecha_hora::date = '2026-01-19'
            ORDER BY fecha_hora
        `);

        console.log(`\nEncontrados ${patients.rows.length} pacientes.`);

        // Asignar estudios variados a cada paciente
        const studyAssignments = [
            ['BH', 'TP'],           // Paciente 1: Hematología + Coagulación
            ['EGO', 'TTP'],         // Paciente 2: Orina + Coagulación  
            ['BH', 'TP', 'TTP', 'EGO'] // Paciente 3: Todos
        ];

        for (let i = 0; i < patients.rows.length && i < studyAssignments.length; i++) {
            const patient = patients.rows[i];
            const codes = studyAssignments[i];

            for (const code of codes) {
                const studyRes = await client.query(
                    'SELECT id FROM estudios_laboratorio WHERE codigo = $1',
                    [code]
                );

                if (studyRes.rows.length > 0) {
                    // Check if already assigned
                    const alreadyAssigned = await client.query(
                        'SELECT id FROM citas_estudios WHERE cita_id = $1 AND estudio_id = $2',
                        [patient.id, studyRes.rows[0].id]
                    );

                    if (alreadyAssigned.rows.length === 0) {
                        await client.query(
                            'INSERT INTO citas_estudios (cita_id, estudio_id) VALUES ($1, $2)',
                            [patient.id, studyRes.rows[0].id]
                        );
                        console.log(`✓ Asignado ${code} a ${patient.paciente_nombre}`);
                    }
                }
            }
        }

        console.log('\n✅ Estudios agregados exitosamente.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

addNewStudies();
