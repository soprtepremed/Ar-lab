// Script para crear la tabla de cierres de caja en Supabase
const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function crearTablaCierresCaja() {
    console.log('🔧 Creando tabla de cierres de caja...\n');

    try {
        await client.connect();

        // Crear tabla cierres_caja
        await client.query(`
            CREATE TABLE IF NOT EXISTS cierres_caja (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                fecha DATE NOT NULL,
                fondo_inicial DECIMAL(10,2) DEFAULT 0,
                total_ventas DECIMAL(10,2) DEFAULT 0,
                total_efectivo DECIMAL(10,2) DEFAULT 0,
                total_tarjeta DECIMAL(10,2) DEFAULT 0,
                total_transferencia DECIMAL(10,2) DEFAULT 0,
                efectivo_contado DECIMAL(10,2),
                diferencia DECIMAL(10,2),
                operador VARCHAR(100),
                notas TEXT,
                estado VARCHAR(20) DEFAULT 'abierta',
                created_at TIMESTAMP DEFAULT NOW(),
                closed_at TIMESTAMP
            );
        `);

        console.log('✅ Tabla cierres_caja creada exitosamente!\n');

        // Habilitar RLS
        await client.query(`ALTER TABLE cierres_caja ENABLE ROW LEVEL SECURITY;`);

        // Crear política de acceso
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir todo en cierres_caja') THEN
                    CREATE POLICY "Permitir todo en cierres_caja" ON cierres_caja FOR ALL USING (true);
                END IF;
            END
            $$;
        `);

        console.log('✅ Políticas de acceso configuradas!\n');

        // Mostrar estructura
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'cierres_caja'
            ORDER BY ordinal_position;
        `);

        console.log('📋 Estructura de la tabla:');
        console.log('   ─────────────────────────────────');
        result.rows.forEach(row => {
            console.log(`   ${row.column_name.padEnd(20)} ${row.data_type}`);
        });
        console.log('   ─────────────────────────────────\n');

        await client.end();
        console.log('✅ Listo para usar apertura/cierre de caja!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        try { await client.end(); } catch (e) { }
    }
}

crearTablaCierresCaja();
