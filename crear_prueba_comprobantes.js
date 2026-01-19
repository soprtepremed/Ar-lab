const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function seedData() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase');

        // 1. Obtener algunos estudios para las citas
        const { rows: estudios } = await client.query('SELECT id, nombre, precio FROM estudios_laboratorio LIMIT 10');
        if (estudios.length < 5) {
            console.log('❌ No hay suficientes estudios para crear pruebas satisfactorias.');
            return;
        }

        const estudio1 = estudios[0]; // Colesterol total - 120
        const estudio2 = estudios[4]; // Triglicéridos - 150
        const estudio3 = estudios[1]; // HDL - 408
        const estudio4 = estudios[2]; // LDL - 423

        console.log('🧪 Preparando 3 casos de prueba...');

        // CASO 1: Juan Carlos Bodoque - Efectivo - Completo
        const cita1 = await client.query(`
            INSERT INTO citas (
                paciente_nombre, paciente_telefono, fecha_hora, total, subtotal, pagado, 
                metodo_pago, folio_venta, estado, tipo_servicio, primer_nombre, primer_apellido
            ) VALUES (
                'Juan Carlos Bodoque', '2281001122', NOW() - INTERVAL '2 hours',
                270.00, 270.00, 270.00, 'efectivo', 1001, 'completada', 'laboratorio',
                'Juan Carlos', 'Bodoque'
            ) RETURNING id
        `);
        const id1 = cita1.rows[0].id;
        await client.query('INSERT INTO citas_estudios (cita_id, estudio_id) VALUES ($1, $2), ($1, $3)', [id1, estudio1.id, estudio2.id]);
        console.log('✅ Caso 1 creado: Juan Carlos Bodoque (Efectivo)');

        // CASO 2: Tulio Triviño - Tarjeta - Completo (Gasto Mayor)
        const total2 = parseFloat(estudio3.precio) + parseFloat(estudio4.precio);
        const cita2 = await client.query(`
            INSERT INTO citas (
                paciente_nombre, paciente_telefono, fecha_hora, total, subtotal, pagado, 
                metodo_pago, folio_venta, estado, tipo_servicio, primer_nombre, primer_apellido
            ) VALUES (
                'Tulio Triviño', '2283003344', NOW() - INTERVAL '1 day',
                $1, $1, $1, 'tarjeta', 1002, 'completada', 'laboratorio',
                'Tulio', 'Triviño'
            ) RETURNING id
        `, [total2]);
        const id2 = cita2.rows[0].id;
        await client.query('INSERT INTO citas_estudios (cita_id, estudio_id) VALUES ($1, $2), ($1, $3)', [id2, estudio3.id, estudio4.id]);
        console.log('✅ Caso 2 creado: Tulio Triviño (Tarjeta)');

        // CASO 3: Patana Tufillo - Transferencia - Pendiente
        const cita3 = await client.query(`
            INSERT INTO citas (
                paciente_nombre, paciente_telefono, fecha_hora, total, subtotal, pagado, 
                metodo_pago, folio_venta, estado, tipo_servicio, primer_nombre, primer_apellido
            ) VALUES (
                'Patana Tufillo', '2285005566', NOW() - INTERVAL '30 minutes',
                120.00, 120.00, 0.00, 'transferencia', 1003, 'pendiente', 'laboratorio',
                'Patana', 'Tufillo'
            ) RETURNING id
        `);
        const id3 = cita3.rows[0].id;
        await client.query('INSERT INTO citas_estudios (cita_id, estudio_id) VALUES ($1, $2)', [id3, estudio1.id]);
        console.log('✅ Caso 3 creado: Patana Tufillo (Pendiente)');

        console.log('\n🌟 ¡Datos de prueba creados exitosamente!');

    } catch (err) {
        console.error('❌ Error al insertar datos:', err.message);
    } finally {
        await client.end();
    }
}

seedData();
