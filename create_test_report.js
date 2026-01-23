const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function createTestPatient() {
    try {
        await client.connect();
        console.log('Connected to DB...');

        // 1. Get IDs for some real studies to link (Glucosa, Urea, Creatinina, Perfil Header if exists)
        // We'll search for them. If not found, we might skip or fail, but let's assume standard catalog exists.
        const studiesRes = await client.query(`
            SELECT id, nombre, es_perfil 
            FROM estudios_laboratorio 
            WHERE nombre ILIKE '%GLUCOSA%' 
               OR nombre ILIKE '%UREA%' 
               OR nombre ILIKE '%CREATININA%'
               OR nombre ILIKE '%Q.S%' -- Trying to find a profile header
               OR nombre ILIKE '%QUIMICA SANGUINEA%'
            LIMIT 10
        `);

        const studies = studiesRes.rows;
        if (studies.length === 0) {
            console.error('No studies found in DB to link!');
            return;
        }

        // 2. Create Appointment (Cita) with ALL fields
        const folioVenta = Math.floor(Date.now() / 1000);
        const insertCitaText = `
            INSERT INTO citas (
                paciente_nombre, paciente_telefono, paciente_email,
                fecha_hora, tipo_servicio, estado,
                fecha_nacimiento, paciente_sexo,
                procedencia, servicio, cama, diagnostico, medico_referente,
                folio_venta, folio_atencion, expediente_numero
            ) VALUES (
                'JUAN PÉREZ PRUEBA COMPLETA', '5512345678', 'test@arlab.com',
                NOW(), 'laboratorio', 'completado',
                '1980-01-01', 'Masculino',
                'URGENCIAS', 'LABORATORIO', '304-B', 'DIABETES TIPO 2 DESCOMPENSADA', 'DR. ROBERTO GÓMEZ',
                $1, $2, 'EXP-001'
            ) RETURNING id;
        `;
        // Folio diario fake: 260123-99
        const folioDiario = `TEST-${new Date().getDate()}${new Date().getMonth() + 1}-01`;

        const citaRes = await client.query(insertCitaText, [folioVenta, folioDiario]);
        const citaId = citaRes.rows[0].id;
        console.log(`Cita created with ID: ${citaId}`);

        // 3. Insert Results for the found studies
        for (const study of studies) {
            let valor = '0';
            let estado = 'validado';

            if (study.nombre.toUpperCase().includes('GLUCOSA')) valor = '185'; // High
            if (study.nombre.toUpperCase().includes('UREA')) valor = '45'; // Normal-ish
            if (study.nombre.toUpperCase().includes('CREATININA')) valor = '1.2';

            // If it's a profile header, ensure no result
            if (study.es_perfil) {
                valor = null;
                estado = 'validado';
            }

            await client.query(`
                INSERT INTO citas_estudios (cita_id, estudio_id, valor_resultado, estado_resultado, resultado)
                VALUES ($1, $2, $3, $4, $5)
            `, [citaId, study.id, valor, estado, 'FINAL']);
        }

        console.log('Results inserted successfully.');
        console.log('==========================================');
        console.log(`LINK PARA VER REPORTE: reporte.html?id=${citaId}`);
        console.log('==========================================');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

createTestPatient();
