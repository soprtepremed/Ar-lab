const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

// Mapa de indicaciones por estudio o categoría
const indicacionesMap = {
    // Química y Perfiles básicos
    'Glucosa sérica': 'Ayuno de 8 a 12 horas. No ingerir bebidas alcohólicas 24h antes.',
    'Perfil de Lípidos': 'Ayuno obligartorio de 12 a 14 horas. Cena ligera la noche anterior.',
    'Química Sanguínea': 'Ayuno de 8 a 12 horas.',

    // Orina
    'Examen General de Orina': 'Primera orina de la mañana (chorro medio), previo aseo genital.',
    'Urocultivo': 'Primera orina de la mañana, previo aseo estricto, recolectar en frasco estéril. Sin antibióticos 72h antes.',

    // Hormonas
    'Perfil Tiroideo': 'Ayuno de 8 horas. Si toma medicamento tiroideo, preguntar al médico si debe suspenderlo.',
    'Prolactina': 'Ayuno de 8 horas. Reposo de 20 min antes de la toma. Abstinencia sexual 48h antes.',
    'Cortisol': 'Toma exacta a las 8:00 AM (matutino) o 4:00 PM (vespertino). Reposo previo.',

    // Otros
    'Antígeno Prostático (PSA)': 'Ayuno 4h. Abstinencia sexual 48h. No tacto rectal en 3 días previos.',
    'Sangre Oculta en Heces': 'Dieta libre de carnes rojas, embutidos y betabel 3 días antes.',
    'Cultivo Faríngeo': 'Ayuno 8h. No aseo bucal (lavado de dientes) antes de la toma.',

    // Default
    'DEFAULT': 'Ayuno general de 8 horas.'
};

async function actualizarIndicaciones() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase');

        // Agregar columna indicaciones
        await client.query(`
            ALTER TABLE estudios_laboratorio 
            ADD COLUMN IF NOT EXISTS indicaciones TEXT;
        `);
        console.log('✅ Columna indicaciones agregada');

        const { rows: estudios } = await client.query('SELECT id, nombre, categoria FROM estudios_laboratorio');

        for (const estudio of estudios) {
            let indicacion = indicacionesMap[estudio.nombre];

            // Si no hay indicación directa, buscar por categoría
            if (!indicacion) {
                if (estudio.categoria.includes('Lipídico')) indicacion = indicacionesMap['Perfil de Lípidos'];
                else if (estudio.categoria.includes('Química')) indicacion = indicacionesMap['Química Sanguínea'];
                else if (estudio.categoria.includes('Hormonas')) indicacion = 'Ayuno de 8 horas. Evitar estrés.';
                else if (estudio.categoria.includes('Orina')) indicacion = indicacionesMap['Examen General de Orina'];
                else indicacion = indicacionesMap['DEFAULT'];
            }

            await client.query('UPDATE estudios_laboratorio SET indicaciones = $1 WHERE id = $2', [indicacion, estudio.id]);
        }

        console.log('✅ Indicaciones actualizadas en todos los estudios');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

actualizarIndicaciones();
