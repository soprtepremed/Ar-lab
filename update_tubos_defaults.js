const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function updateTubos() {
    try {
        await client.connect();

        const updates = [
            { pattern: '%Biometría Hemática%', tubo: 'Tubo Lila' },
            { pattern: '%Química Sanguínea%', tubo: 'Tubo Amarillo' },
            { pattern: '%Electrolitos%', tubo: 'Tubo Amarillo' },
            { pattern: '%Examen General de Orina%', tubo: 'Frasco Estéril' },
            { pattern: '%General de Orina%', tubo: 'Frasco Estéril' },
            { pattern: '%Urocultivo%', tubo: 'Frasco Estéril' },
            { pattern: '%Tiempos de Coagulación%', tubo: 'Tubo Azul' },
            { pattern: '%TP%', tubo: 'Tubo Azul' },
            { pattern: '%TTP%', tubo: 'Tubo Azul' },
            { pattern: '%HbA1c%', tubo: 'Tubo Lila' },
            { pattern: '%Hemoglobina Gllicosilada%', tubo: 'Tubo Lila' },
            { pattern: '%Grupo Sanguíneo%', tubo: 'Tubo Lila' },
            { pattern: '%VIH%', tubo: 'Tubo Amarillo' },
            { pattern: '%VDRL%', tubo: 'Tubo Amarillo' },
            { pattern: '%Reacciones Febriles%', tubo: 'Tubo Amarillo' }
        ];

        for (const up of updates) {
            const res = await client.query(`
                UPDATE estudios_laboratorio 
                SET tubo_recipiente = $1 
                WHERE nombre ILIKE $2 AND (tubo_recipiente IS NULL OR tubo_recipiente = '')
            `, [up.tubo, up.pattern]);
            console.log(`Actualizados ${res.rowCount} estudios para patrón '${up.pattern}' con tubo '${up.tubo}'`);
        }

        // Force notify schema reload just in case
        await client.query("NOTIFY pgrst, 'reload config'");
        console.log('Schema cache reload notified.');

    } catch (err) {
        console.error('Error actualizando tubos:', err);
    } finally {
        await client.end();
    }
}

updateTubos();
