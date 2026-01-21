
// require('dotenv').config(); // Not needed as we hardcoded the values
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ebihobjrwcwtjfazcjmv.supabase.co';
const supabaseKey = 'sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd';

const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        const updates = [
            // PERFIL COPROLOGICO & COPROPARASITOSCOPICO
            // Físico - Químico
            { nombre: 'Copro: Aspecto', unidades: '', ref: 'AMORFA' },
            { nombre: 'Copro: Consistencia', unidades: '', ref: 'COMPACTA' },
            { nombre: 'Copro: Color', unidades: '', ref: 'CAFÉ' },
            { nombre: 'Copro: Olor', unidades: '', ref: 'SUIGENERIS' },
            { nombre: 'Copro: PH', unidades: '', ref: '7.00' },

            // Especiales Coprológico
            { nombre: 'Copro: Rotavirus', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Copro: Adenovirus', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Copro: Azúcares Reductores', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Sangre Oculta en Heces', unidades: '', ref: 'NEGATIVO' },

            // Microscópico (Prefijo Copro para distinguir de orina)
            { nombre: 'Copro: Células Epiteliales', unidades: '/C', ref: '0 - 1' },
            { nombre: 'Copro: Leucocitos', unidades: '/C', ref: '0 - 1' },
            { nombre: 'Copro: Eritrocitos', unidades: '/C', ref: '0 - 1' },
            { nombre: 'Copro: Levaduras', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Moco Fecal', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Copro: Grasas', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Copro: Piocitos', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Copro: Cristales', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Copro: Hemoglobina', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Copro: Jabones', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Copro: Almidón', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Copro: Restos Animales', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Copro: Restos Vegetales', unidades: '', ref: 'NEGATIVO' },

            // Serial (Cerreza del pastel)
            { nombre: 'Coproparasitoscópico 1', unidades: '', ref: 'NO SE OBSERVAN PARASITO AL MOMENTO DEL ESTUDIO' },
            { nombre: 'Coproparasitoscópico 2', unidades: '', ref: 'NO SE OBSERVAN PARASITO AL MOMENTO DEL ESTUDIO' },
            { nombre: 'Coproparasitoscópico 3', unidades: '', ref: 'NO SE OBSERVAN PARASITO AL MOMENTO DEL ESTUDIO' },

            // AMIBA EN FRESCO
            { nombre: 'Amiba: Aspecto', unidades: '', ref: 'AMORFA' },
            { nombre: 'Amiba: Consistencia', unidades: '', ref: 'COMPACTA' },
            { nombre: 'Amiba: Color', unidades: '', ref: 'CAFÉ' },
            { nombre: 'Amiba: Olor', unidades: '', ref: 'SUIGENERIS' },
            { nombre: 'Amiba: PH', unidades: '', ref: '7.00' },
            { nombre: 'Amiba en Fresco', unidades: '', ref: 'NEGATIVO' },

            // FROTIS DE HECES
            { nombre: 'Frotis de Heces: Aspecto', unidades: '', ref: 'AMORFA' },
            { nombre: 'Frotis de Heces: Consistencia', unidades: '', ref: 'COMPACTA' },
            { nombre: 'Frotis de Heces: Color', unidades: '', ref: 'CAFÉ' },
            { nombre: 'Frotis de Heces: Olor', unidades: '', ref: 'SUIGENERIS' },

            { nombre: 'Frotis de Heces: Coproparasitoscópico', unidades: '', ref: 'NO SE OBSERVAN PARASITOS A LA HORA DEL ESTUDIO' },
            { nombre: 'Frotis de Heces: Células Epiteliales', unidades: '/C', ref: '0 - 1' },
            { nombre: 'Frotis de Heces: Leucocitos', unidades: '/C', ref: '1 - 2' },
            { nombre: 'Frotis de Heces: Eritrocitos', unidades: '/C', ref: '0 - 1' },
            { nombre: 'Frotis de Heces: Bacterias', unidades: '', ref: 'EQUILIBRADA' },
            { nombre: 'Frotis de Heces: Moco Fecal', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Frotis de Heces: Grasas', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Frotis de Heces: Piocitos', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Frotis de Heces: Cristales', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Frotis de Heces: Almidón', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Frotis de Heces: Restos Animales', unidades: '', ref: 'NEGATIVO' },
            { nombre: 'Frotis de Heces: Restos Vegetales', unidades: '', ref: 'NEGATIVO' }
        ];

        for (const up of updates) {
            console.log(`Processing ${up.nombre}...`);

            // 1. Check if it exists
            const checkQuery = `SELECT id FROM estudios_laboratorio WHERE nombre ILIKE $1`;
            const checkRes = await client.query(checkQuery, [`%${up.nombre}%`]);

            if (checkRes.rows.length > 0) {
                // UPDATE existing
                console.log(`   -> Updating existing record(s)`);
                const updateQuery = `
                    UPDATE estudios_laboratorio 
                    SET rango_referencia = $1, unidades = $2 
                    WHERE nombre ILIKE $3`;
                await client.query(updateQuery, [up.ref, up.unidades, `%${up.nombre}%`]);
            } else {
                // INSERT new
                console.log(`   -> Creating NEW study`);
                const insertQuery = `
                    INSERT INTO estudios_laboratorio (nombre, categoria, rango_referencia, unidades, precio, activo)
                    VALUES ($1, 'General', $2, $3, 0, true)
                `;
                // Remove loose wildcards for insertion name, use exact name from update object
                // We use up.nombre directly which is cleaner: e.g. "Tífico O"
                await client.query(insertQuery, [up.nombre, up.ref, up.unidades]);
            }
        }

        console.log('Updates finished.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

run();
