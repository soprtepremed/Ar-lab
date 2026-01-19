const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function actualizarPreciosYSchema() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase');

        // 1. Agregar columnas de pago a la tabla citas
        await client.query(`
            ALTER TABLE citas 
            ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS descuento DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS pagado DECIMAL(10,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50),
            ADD COLUMN IF NOT EXISTS folio_venta SERIAL;
        `);
        console.log('✅ Columnas de pago agregadas a tabla citas');

        // 2. Actualizar precios de estudios (Simulados en MXN)
        // Definir precios base por categoría
        const preciosBase = {
            'Química Sanguínea': 150.00,
            'Perfil Lipídico': 400.00,
            'Pruebas Hepáticas': 250.00,
            'Enzimas': 300.00,
            'Electrolitos': 280.00,
            'Hierro y Anemia': 450.00,
            'Función Renal': 200.00,
            'Perfil Tiroideo': 850.00,
            'Diabetes': 180.00,
            'Inflamación': 220.00,
            'Inmunología': 350.00,
            'Hormonas': 400.00,
            'Vitaminas': 600.00,
            'Marcadores Tumorales': 750.00
        };

        // Precios específicos para estudios comunes
        const preciosEspecificos = {
            'Glucosa sérica': 90.00,
            'Urea sérica': 110.00,
            'Creatinina sérica': 110.00,
            'Colesterol total': 120.00,
            'Triglicéridos': 150.00,
            'Examen General de Orina': 100.00,
            'Biometría Hemática': 220.00,
            'Perfil Tiroideo (Completo)': 950.00,
            'Hemoglobina Glucosilada (HbA1c)': 350.00,
            'Prueba de Embarazo (Sangre)': 250.00
        };

        const { rows: estudios } = await client.query('SELECT id, nombre, categoria FROM estudios_laboratorio');

        for (const estudio of estudios) {
            let precio = preciosEspecificos[estudio.nombre];

            if (!precio) {
                // Si no tiene precio específico, usar el base de la categoría +/- variación aleatoria
                const base = preciosBase[estudio.categoria] || 200.00;
                const variacion = Math.floor(Math.random() * 50);
                precio = base + variacion;
            }

            await client.query('UPDATE estudios_laboratorio SET precio = $1 WHERE id = $2', [precio, estudio.id]);
        }

        console.log('✅ Precios actualizados en estudios_laboratorio');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

actualizarPreciosYSchema();
