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
        console.log('✅ Conectado a Supabase\n');

        // 1. Crear tabla valores_referencia
        console.log('📦 Creando tabla valores_referencia...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS valores_referencia (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                estudio_id UUID REFERENCES estudios_laboratorio(id) ON DELETE CASCADE,
                
                -- Rango de edad en días
                edad_min_dias INT DEFAULT 0,
                edad_max_dias INT,
                
                -- Sexo (opcional)
                sexo VARCHAR(1),
                
                -- Valores de referencia
                valor_min NUMERIC,
                valor_max NUMERIC,
                valor_texto VARCHAR(255),
                
                -- Metadata
                descripcion VARCHAR(100),
                orden INT DEFAULT 0,
                
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('   ✅ Tabla creada');

        // 2. Crear índice
        console.log('📦 Creando índice...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_valores_ref_estudio ON valores_referencia(estudio_id)
        `);
        console.log('   ✅ Índice creado');

        // 3. Crear función para obtener referencia por edad
        console.log('📦 Creando función obtener_referencia...');
        await client.query(`
            CREATE OR REPLACE FUNCTION obtener_referencia(
                p_estudio_id UUID,
                p_edad_dias INT,
                p_sexo VARCHAR(1) DEFAULT NULL
            )
            RETURNS TABLE (
                valor_min NUMERIC, 
                valor_max NUMERIC, 
                valor_texto VARCHAR, 
                descripcion VARCHAR
            )
            AS $$
            BEGIN
                RETURN QUERY
                SELECT vr.valor_min, vr.valor_max, vr.valor_texto, vr.descripcion
                FROM valores_referencia vr
                WHERE vr.estudio_id = p_estudio_id
                  AND p_edad_dias >= vr.edad_min_dias
                  AND (vr.edad_max_dias IS NULL OR p_edad_dias <= vr.edad_max_dias)
                  AND (vr.sexo IS NULL OR vr.sexo = p_sexo)
                ORDER BY vr.orden
                LIMIT 1;
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log('   ✅ Función creada');

        // 4. Insertar datos de ejemplo para Glucosa
        console.log('\n📊 Insertando datos de ejemplo para Glucosa...');

        // Buscar ID de Glucosa
        const glucosaRes = await client.query(`
            SELECT id FROM estudios_laboratorio WHERE codigo = 'QC-GLU' OR nombre ILIKE '%glucosa%' LIMIT 1
        `);

        if (glucosaRes.rows.length > 0) {
            const glucosaId = glucosaRes.rows[0].id;

            // Limpiar datos anteriores si existen
            await client.query(`DELETE FROM valores_referencia WHERE estudio_id = $1`, [glucosaId]);

            // Insertar rangos por edad (de UPC)
            const rangos = [
                { min_dias: 0, max_dias: 0, valor_min: 45, valor_max: 96, desc: 'Cordón umbilical' },
                { min_dias: 1, max_dias: 30, valor_min: 30, valor_max: 60, desc: '0-1 mes' },
                { min_dias: 31, max_dias: 730, valor_min: 50, valor_max: 80, desc: '2 meses - 2 años' },
                { min_dias: 731, max_dias: 5475, valor_min: 60, valor_max: 100, desc: '3-15 años' },
                { min_dias: 5476, max_dias: null, valor_min: 70, valor_max: 100, desc: 'Adultos (>15 años)' }
            ];

            for (let i = 0; i < rangos.length; i++) {
                const r = rangos[i];
                await client.query(`
                    INSERT INTO valores_referencia (estudio_id, edad_min_dias, edad_max_dias, valor_min, valor_max, descripcion, orden)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [glucosaId, r.min_dias, r.max_dias, r.valor_min, r.valor_max, r.desc, i]);
                console.log(`   ✅ ${r.desc}: ${r.valor_min}-${r.valor_max} mg/dL`);
            }
        } else {
            console.log('   ⚠️ No se encontró estudio de Glucosa para ejemplo');
        }

        // 5. Probar la función
        console.log('\n🧪 Probando función obtener_referencia...');
        if (glucosaRes.rows.length > 0) {
            const glucosaId = glucosaRes.rows[0].id;

            const pruebas = [
                { dias: 0, desc: 'Recién nacido (0 días)' },
                { dias: 15, desc: 'Bebé (15 días)' },
                { dias: 365, desc: 'Bebé 1 año (365 días)' },
                { dias: 1825, desc: 'Niño 5 años (1825 días)' },
                { dias: 10950, desc: 'Adulto 30 años (10950 días)' }
            ];

            for (const p of pruebas) {
                const res = await client.query(`SELECT * FROM obtener_referencia($1, $2)`, [glucosaId, p.dias]);
                if (res.rows.length > 0) {
                    const r = res.rows[0];
                    console.log(`   ${p.desc}: ${r.valor_min}-${r.valor_max} (${r.descripcion})`);
                }
            }
        }

        console.log('\n========================================');
        console.log('✅ IMPLEMENTACIÓN COMPLETADA');
        console.log('========================================');
        console.log('📦 Tabla: valores_referencia');
        console.log('📦 Función: obtener_referencia(estudio_id, edad_dias, sexo)');
        console.log('🧪 Datos de prueba: Glucosa con 5 rangos de edad');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
