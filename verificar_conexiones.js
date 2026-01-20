const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function verificarYCrearConexiones() {
    try {
        await client.connect();
        console.log('✅ Conectado a Supabase PostgreSQL\n');

        // =====================================================
        // 1. VERIFICAR TABLAS EXISTENTES
        // =====================================================
        console.log('📋 Verificando tablas existentes...\n');

        const tablasExistentes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);

        console.log('Tablas encontradas:');
        tablasExistentes.rows.forEach(t => console.log(`   ✓ ${t.table_name}`));
        console.log('');

        // =====================================================
        // 2. TABLA: usuarios
        // =====================================================
        console.log('🔧 Verificando tabla: usuarios');
        await client.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                usuario VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(100) NOT NULL,
                rol VARCHAR(20) DEFAULT 'operador',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ Tabla usuarios verificada\n');

        // =====================================================
        // 3. TABLA: estudios_laboratorio
        // =====================================================
        console.log('🔧 Verificando tabla: estudios_laboratorio');
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
                indicaciones TEXT,
                tipo_muestra VARCHAR(100),
                metodologia VARCHAR(200),
                tubo_recipiente VARCHAR(150),
                activo BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ Tabla estudios_laboratorio verificada\n');

        // =====================================================
        // 4. TABLA: medicos_referentes
        // =====================================================
        console.log('🔧 Verificando tabla: medicos_referentes');
        await client.query(`
            CREATE TABLE IF NOT EXISTS medicos_referentes (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                especialidad VARCHAR(100),
                telefono VARCHAR(20),
                email VARCHAR(100),
                activo BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ Tabla medicos_referentes verificada\n');

        // =====================================================
        // 5. TABLA: citas (EXTENDIDA)
        // =====================================================
        console.log('🔧 Verificando tabla: citas');
        await client.query(`
            CREATE TABLE IF NOT EXISTS citas (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                paciente_nombre VARCHAR(200) NOT NULL,
                paciente_telefono VARCHAR(20),
                paciente_email VARCHAR(100),
                fecha_hora TIMESTAMP NOT NULL,
                tipo_servicio VARCHAR(50) DEFAULT 'laboratorio',
                notas TEXT,
                estado VARCHAR(20) DEFAULT 'pendiente',
                
                -- Campos extendidos del paciente
                primer_nombre VARCHAR(100),
                segundo_nombre VARCHAR(100),
                primer_apellido VARCHAR(100),
                segundo_apellido VARCHAR(100),
                fecha_nacimiento DATE,
                diagnostico TEXT,
                
                -- Campos de pago
                total DECIMAL(10,2),
                subtotal DECIMAL(10,2),
                pagado DECIMAL(10,2),
                metodo_pago VARCHAR(50),
                folio_venta INTEGER,
                
                -- Médico referente
                medico_referente_nombre VARCHAR(200),
                
                creado_por UUID REFERENCES usuarios(id),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ Tabla citas verificada\n');

        // =====================================================
        // 6. TABLA: citas_estudios (RELACIÓN)
        // =====================================================
        console.log('🔧 Verificando tabla: citas_estudios');
        await client.query(`
            CREATE TABLE IF NOT EXISTS citas_estudios (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                cita_id UUID REFERENCES citas(id) ON DELETE CASCADE,
                estudio_id UUID REFERENCES estudios_laboratorio(id),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ Tabla citas_estudios verificada\n');

        // =====================================================
        // 7. TABLA: configuracion_laboratorio
        // =====================================================
        console.log('🔧 Verificando tabla: configuracion_laboratorio');
        await client.query(`
            CREATE TABLE IF NOT EXISTS configuracion_laboratorio (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                nombre_laboratorio VARCHAR(200) DEFAULT 'Ar Lab',
                direccion TEXT,
                telefono VARCHAR(20),
                email VARCHAR(100),
                responsable_sanitario VARCHAR(200),
                cedula_profesional VARCHAR(50),
                logo_url TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ Tabla configuracion_laboratorio verificada\n');

        // =====================================================
        // 8. TABLA: resultados_laboratorio
        // =====================================================
        console.log('🔧 Verificando tabla: resultados_laboratorio');
        await client.query(`
            CREATE TABLE IF NOT EXISTS resultados_laboratorio (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                cita_id UUID REFERENCES citas(id),
                estudio_id UUID REFERENCES estudios_laboratorio(id),
                resultado VARCHAR(200),
                unidades VARCHAR(50),
                valor_referencia TEXT,
                observaciones TEXT,
                estado VARCHAR(50) DEFAULT 'pendiente',
                realizado_por UUID REFERENCES usuarios(id),
                fecha_realizacion TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ Tabla resultados_laboratorio verificada\n');

        // =====================================================
        // 9. TABLA: caja_diaria
        // =====================================================
        console.log('🔧 Verificando tabla: caja_diaria');
        await client.query(`
            CREATE TABLE IF NOT EXISTS caja_diaria (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                fecha DATE NOT NULL,
                folio_venta INTEGER,
                concepto VARCHAR(200),
                tipo VARCHAR(50),
                metodo_pago VARCHAR(50),
                ingreso DECIMAL(10,2) DEFAULT 0,
                egreso DECIMAL(10,2) DEFAULT 0,
                saldo DECIMAL(10,2),
                cita_id UUID REFERENCES citas(id),
                usuario_id UUID REFERENCES usuarios(id),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ Tabla caja_diaria verificada\n');

        // =====================================================
        // 10. CREAR ÍNDICES
        // =====================================================
        console.log('🔧 Creando índices...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_hora);
            CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
            CREATE INDEX IF NOT EXISTS idx_citas_estudios_cita ON citas_estudios(cita_id);
            CREATE INDEX IF NOT EXISTS idx_citas_estudios_estudio ON citas_estudios(estudio_id);
            CREATE INDEX IF NOT EXISTS idx_caja_fecha ON caja_diaria(fecha);
        `);
        console.log('   ✅ Índices creados\n');

        // =====================================================
        // 11. HABILITAR RLS (Row Level Security)
        // =====================================================
        console.log('🔧 Configurando Row Level Security...');

        const tablas = [
            'usuarios',
            'citas',
            'estudios_laboratorio',
            'medicos_referentes',
            'citas_estudios',
            'configuracion_laboratorio',
            'resultados_laboratorio',
            'caja_diaria'
        ];

        for (const tabla of tablas) {
            await client.query(`ALTER TABLE ${tabla} ENABLE ROW LEVEL SECURITY;`);
            await client.query(`
                DROP POLICY IF EXISTS "Permitir todo en ${tabla}" ON ${tabla};
                CREATE POLICY "Permitir todo en ${tabla}" ON ${tabla} FOR ALL USING (true);
            `);
        }
        console.log('   ✅ RLS configurado para todas las tablas\n');

        // =====================================================
        // 12. INSERTAR CONFIGURACIÓN INICIAL
        // =====================================================
        console.log('🔧 Verificando configuración inicial...');

        const configCount = await client.query('SELECT COUNT(*) as total FROM configuracion_laboratorio');
        if (parseInt(configCount.rows[0].total) === 0) {
            await client.query(`
                INSERT INTO configuracion_laboratorio (
                    nombre_laboratorio,
                    responsable_sanitario,
                    cedula_profesional,
                    direccion,
                    telefono
                ) VALUES (
                    'Ar Lab',
                    'QFB Adolfo Ruiz López',
                    '12345678',
                    'Dirección del laboratorio',
                    '961-106-2651'
                );
            `);
            console.log('   ✅ Configuración inicial creada\n');
        } else {
            console.log('   ✓ Configuración ya existe\n');
        }

        // =====================================================
        // 13. VERIFICAR USUARIOS
        // =====================================================
        console.log('🔧 Verificando usuarios...');

        await client.query(`
            INSERT INTO usuarios (usuario, password, rol) 
            VALUES ('ADOLFO RUIZ', '9611062651', 'admin')
            ON CONFLICT (usuario) DO UPDATE SET password = '9611062651', rol = 'admin';
        `);
        console.log('   ✅ Usuario admin verificado\n');

        // =====================================================
        // 14. RESUMEN FINAL
        // =====================================================
        console.log('📊 RESUMEN DEL SISTEMA\n');
        console.log('═══════════════════════════════════════════════════\n');

        const resumen = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM usuarios) as usuarios,
                (SELECT COUNT(*) FROM citas) as citas,
                (SELECT COUNT(*) FROM estudios_laboratorio) as estudios,
                (SELECT COUNT(*) FROM medicos_referentes) as medicos,
                (SELECT COUNT(*) FROM configuracion_laboratorio) as config;
        `);

        const r = resumen.rows[0];
        console.log(`   👥 Usuarios registrados: ${r.usuarios}`);
        console.log(`   📅 Citas registradas: ${r.citas}`);
        console.log(`   🧪 Estudios disponibles: ${r.estudios}`);
        console.log(`   👨‍⚕️ Médicos referentes: ${r.medicos}`);
        console.log(`   ⚙️ Configuraciones: ${r.config}`);
        console.log('');

        console.log('═══════════════════════════════════════════════════\n');
        console.log('✅ TODAS LAS CONEXIONES Y TABLAS VERIFICADAS\n');
        console.log('🎉 Sistema listo para operar!\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('\n📌 Detalles:', err);
    } finally {
        await client.end();
    }
}

verificarYCrearConexiones();
