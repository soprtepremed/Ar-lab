const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

// Lista de estudios de laboratorio
const estudios = [
    // Química Sanguínea Básica
    { nombre: 'Glucosa sérica', categoria: 'Química Sanguínea', codigo: 'GLU' },
    { nombre: 'Urea sérica', categoria: 'Química Sanguínea', codigo: 'UREA' },
    { nombre: 'Nitrógeno ureico sérico (BUN)', categoria: 'Química Sanguínea', codigo: 'BUN' },
    { nombre: 'Creatinina sérica', categoria: 'Química Sanguínea', codigo: 'CREA' },
    { nombre: 'Ácido úrico sérico', categoria: 'Química Sanguínea', codigo: 'AU' },

    // Perfil de Lípidos
    { nombre: 'Colesterol total', categoria: 'Perfil Lipídico', codigo: 'COL' },
    { nombre: 'Colesterol de alta densidad (HDL)', categoria: 'Perfil Lipídico', codigo: 'HDL' },
    { nombre: 'Colesterol de baja densidad (LDL)', categoria: 'Perfil Lipídico', codigo: 'LDL' },
    { nombre: 'Colesterol de muy baja densidad (VLDL)', categoria: 'Perfil Lipídico', codigo: 'VLDL' },
    { nombre: 'Triglicéridos', categoria: 'Perfil Lipídico', codigo: 'TG' },
    { nombre: 'Índice aterogénico', categoria: 'Perfil Lipídico', codigo: 'IA' },
    { nombre: 'Lípidos totales', categoria: 'Perfil Lipídico', codigo: 'LT' },

    // Pruebas Hepáticas
    { nombre: 'Bilirrubina total', categoria: 'Pruebas Hepáticas', codigo: 'BT' },
    { nombre: 'Bilirrubina conjugada (Directa)', categoria: 'Pruebas Hepáticas', codigo: 'BD' },
    { nombre: 'Bilirrubina no conjugada (Indirecta)', categoria: 'Pruebas Hepáticas', codigo: 'BI' },
    { nombre: 'Proteínas totales', categoria: 'Pruebas Hepáticas', codigo: 'PT' },
    { nombre: 'Albúmina sérica', categoria: 'Pruebas Hepáticas', codigo: 'ALB' },
    { nombre: 'Globulina', categoria: 'Pruebas Hepáticas', codigo: 'GLOB' },
    { nombre: 'Relación albúmina - globulina', categoria: 'Pruebas Hepáticas', codigo: 'RAG' },
    { nombre: 'Aspartato aminotransferasa (AST o TGO)', categoria: 'Pruebas Hepáticas', codigo: 'AST' },
    { nombre: 'Alanina aminotransferasa (ALT o TGP)', categoria: 'Pruebas Hepáticas', codigo: 'ALT' },
    { nombre: 'Fosfatasa alcalina (ALP)', categoria: 'Pruebas Hepáticas', codigo: 'ALP' },
    { nombre: 'Gamma-glutamil transpeptidasa (GGT)', categoria: 'Pruebas Hepáticas', codigo: 'GGT' },
    { nombre: 'Deshidrogenasa láctica (DHL)', categoria: 'Pruebas Hepáticas', codigo: 'DHL' },

    // Enzimas
    { nombre: 'Creatinfosfoquinasa (CPK)', categoria: 'Enzimas', codigo: 'CPK' },
    { nombre: 'Amilasa en suero', categoria: 'Enzimas', codigo: 'AMS' },
    { nombre: 'Lipasa sérica', categoria: 'Enzimas', codigo: 'LIP' },
    { nombre: 'Relación amilasa/lipasa', categoria: 'Enzimas', codigo: 'RAL' },

    // Electrolitos
    { nombre: 'Sodio sérico', categoria: 'Electrolitos', codigo: 'NA' },
    { nombre: 'Potasio sérico', categoria: 'Electrolitos', codigo: 'K' },
    { nombre: 'Cloro sérico', categoria: 'Electrolitos', codigo: 'CL' },
    { nombre: 'Calcio en suero', categoria: 'Electrolitos', codigo: 'CA' },
    { nombre: 'Fósforo sérico', categoria: 'Electrolitos', codigo: 'P' },
    { nombre: 'Magnesio', categoria: 'Electrolitos', codigo: 'MG' },

    // Hierro y Anemia
    { nombre: 'Hierro sérico', categoria: 'Hierro y Anemia', codigo: 'FE' },
    { nombre: 'Ferritina', categoria: 'Hierro y Anemia', codigo: 'FER' },
    { nombre: 'Vitamina B 12', categoria: 'Hierro y Anemia', codigo: 'B12' },

    // Función Renal
    { nombre: 'Relación BUN/Creatinina', categoria: 'Función Renal', codigo: 'RBC' },
    { nombre: 'Microalbuminuria', categoria: 'Función Renal', codigo: 'MAU' },

    // Perfil Tiroideo
    { nombre: 'TSH', categoria: 'Perfil Tiroideo', codigo: 'TSH' },
    { nombre: 'T4', categoria: 'Perfil Tiroideo', codigo: 'T4' },
    { nombre: 'T3', categoria: 'Perfil Tiroideo', codigo: 'T3' },
    { nombre: 'T4 libre', categoria: 'Perfil Tiroideo', codigo: 'T4L' },
    { nombre: 'T3 libre', categoria: 'Perfil Tiroideo', codigo: 'T3L' },
    { nombre: 'Tiroxina libre', categoria: 'Perfil Tiroideo', codigo: 'TL' },
    { nombre: 'Anticuerpos antitiroideos', categoria: 'Perfil Tiroideo', codigo: 'AAT' },
    { nombre: 'Yodo proteico', categoria: 'Perfil Tiroideo', codigo: 'YP' },

    // Diabetes
    { nombre: 'Insulina', categoria: 'Diabetes', codigo: 'INS' },
    { nombre: 'Índice HOMA', categoria: 'Diabetes', codigo: 'HOMA' },
    { nombre: 'HbA1c (Hemoglobina glucosilada)', categoria: 'Diabetes', codigo: 'HBA1C' },

    // Inflamación e Inmunología
    { nombre: 'Proteína C reactiva', categoria: 'Inflamación', codigo: 'PCR' },
    { nombre: 'Factor reumatoide', categoria: 'Inmunología', codigo: 'FR' },
    { nombre: 'Inmunoglobulina IgE', categoria: 'Inmunología', codigo: 'IGE' },

    // Hormonas
    { nombre: 'Prolactina', categoria: 'Hormonas', codigo: 'PRL' },
    { nombre: 'Cortisol', categoria: 'Hormonas', codigo: 'CORT' },

    // Vitaminas
    { nombre: 'Vitamina D1 25 hidroxi', categoria: 'Vitaminas', codigo: 'VITD' },

    // Marcadores Tumorales
    { nombre: 'CA-125', categoria: 'Marcadores Tumorales', codigo: 'CA125' },
    { nombre: 'CA-19-9', categoria: 'Marcadores Tumorales', codigo: 'CA199' },
    { nombre: 'Antígeno carcinoembrionario (CEA)', categoria: 'Marcadores Tumorales', codigo: 'CEA' },
];

async function crearTablaEstudios() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase');

        // Crear tabla estudios_laboratorio
        await client.query(`
            CREATE TABLE IF NOT EXISTS estudios_laboratorio (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                codigo VARCHAR(20) UNIQUE,
                nombre VARCHAR(200) NOT NULL,
                categoria VARCHAR(100),
                descripcion TEXT,
                precio DECIMAL(10,2),
                tiempo_entrega VARCHAR(50),
                requiere_ayuno BOOLEAN DEFAULT false,
                activo BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla estudios_laboratorio creada');

        // Insertar estudios
        for (const estudio of estudios) {
            await client.query(`
                INSERT INTO estudios_laboratorio (codigo, nombre, categoria)
                VALUES ($1, $2, $3)
                ON CONFLICT (codigo) DO UPDATE SET nombre = $2, categoria = $3;
            `, [estudio.codigo, estudio.nombre, estudio.categoria]);
        }
        console.log(`✅ ${estudios.length} estudios insertados`);

        // Verificar
        const result = await client.query('SELECT COUNT(*) as total FROM estudios_laboratorio');
        console.log(`📋 Total de estudios en la base de datos: ${result.rows[0].total}`);

        // Mostrar por categoría
        const categorias = await client.query(`
            SELECT categoria, COUNT(*) as cantidad 
            FROM estudios_laboratorio 
            GROUP BY categoria 
            ORDER BY categoria
        `);
        console.log('\n📊 Estudios por categoría:');
        categorias.rows.forEach(cat => {
            console.log(`   - ${cat.categoria}: ${cat.cantidad}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

crearTablaEstudios();
