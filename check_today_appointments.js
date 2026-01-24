const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function checkAppointments() {
    try {
        await client.connect();
        console.log('Consultando citas para hoy...');

        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        // Adjust query to handle timezone if necessary, but simple date match is a good start.
        // Assuming database stores timestamp, we cast to date.
        const query = `
            SELECT id, paciente_nombre, fecha_hora, estado, tipo_servicio 
            FROM citas 
            WHERE DATE(fecha_hora AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City') = '${today}'
            ORDER BY fecha_hora ASC;
        `;

        const res = await client.query(query);

        if (res.rows.length === 0) {
            console.log(`No se encontraron citas para hoy (${today}).`);
        } else {
            console.log(`\n📅 Citas encontradas para hoy (${today}):`);
            res.rows.forEach(cita => {
                const hora = new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                console.log(`- [${hora}] ${cita.paciente_nombre} (${cita.tipo_servicio}) - Estado: ${cita.estado}`);
            });
        }

    } catch (err) {
        console.error('Error al consultar citas:', err);
    } finally {
        await client.end();
    }
}

checkAppointments();
