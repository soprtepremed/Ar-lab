const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function agregarCamposEstudios() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase');

        // Agregar nuevos campos a la tabla estudios_laboratorio
        console.log('\n📝 Agregando nuevos campos...');

        await client.query(`
            ALTER TABLE estudios_laboratorio 
            ADD COLUMN IF NOT EXISTS tipo_muestra VARCHAR(100),
            ADD COLUMN IF NOT EXISTS metodologia VARCHAR(200),
            ADD COLUMN IF NOT EXISTS tubo_recipiente VARCHAR(150);
        `);

        console.log('✅ Campos agregados exitosamente:');
        console.log('   - tipo_muestra (VARCHAR 100)');
        console.log('   - metodologia (VARCHAR 200)');
        console.log('   - tubo_recipiente (VARCHAR 150)');

        // Verificar la estructura actualizada
        const columnas = await client.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'estudios_laboratorio'
            ORDER BY ordinal_position;
        `);

        console.log('\n📋 Estructura completa de la tabla estudios_laboratorio:');
        columnas.rows.forEach(col => {
            const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
            console.log(`   - ${col.column_name}: ${col.data_type}${length}`);
        });

        // Actualizar algunos ejemplos para demostración
        console.log('\n🔄 Actualizando ejemplos...');

        const ejemplos = [
            {
                codigo: 'GLU',
                tipo_muestra: 'Suero o plasma',
                metodologia: 'Espectrofotometría enzimática (Glucosa oxidasa)',
                tubo_recipiente: 'Tubo rojo (sin anticoagulante) o tubo gris (fluoruro)'
            },
            {
                codigo: 'HBA1C',
                tipo_muestra: 'Sangre total con EDTA',
                metodologia: 'HPLC (Cromatografía líquida de alta resolución)',
                tubo_recipiente: 'Tubo morado (EDTA)'
            },
            {
                codigo: 'COL',
                tipo_muestra: 'Suero',
                metodologia: 'Espectrofotometría enzimática (CHOD-PAP)',
                tubo_recipiente: 'Tubo rojo (sin anticoagulante)'
            },
            {
                codigo: 'CREA',
                tipo_muestra: 'Suero o plasma',
                metodologia: 'Espectrofotometría (Método de Jaffé)',
                tubo_recipiente: 'Tubo rojo o verde (heparina)'
            },
            {
                codigo: 'TSH',
                tipo_muestra: 'Suero',
                metodologia: 'Inmunoensayo quimioluminiscente',
                tubo_recipiente: 'Tubo rojo (sin anticoagulante)'
            }
        ];

        for (const ejemplo of ejemplos) {
            await client.query(`
                UPDATE estudios_laboratorio 
                SET tipo_muestra = $1, 
                    metodologia = $2, 
                    tubo_recipiente = $3
                WHERE codigo = $4
            `, [ejemplo.tipo_muestra, ejemplo.metodologia, ejemplo.tubo_recipiente, ejemplo.codigo]);
        }

        console.log(`✅ ${ejemplos.length} estudios actualizados con ejemplos`);

        // Mostrar estudios actualizados
        const resultado = await client.query(`
            SELECT codigo, nombre, tipo_muestra, metodologia, tubo_recipiente
            FROM estudios_laboratorio
            WHERE tipo_muestra IS NOT NULL
            ORDER BY codigo
        `);

        console.log('\n📊 Estudios con información técnica agregada:');
        resultado.rows.forEach(est => {
            console.log(`\n   ${est.codigo} - ${est.nombre}`);
            console.log(`   └─ Muestra: ${est.tipo_muestra}`);
            console.log(`   └─ Metodología: ${est.metodologia}`);
            console.log(`   └─ Tubo: ${est.tubo_recipiente}`);
        });

        console.log('\n✅ ¡Proceso completado exitosamente!');
        console.log('\n💡 Nota: Puedes actualizar el resto de estudios directamente en la base de datos');
        console.log('   o desde la interfaz de configuración del sistema.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

agregarCamposEstudios();
