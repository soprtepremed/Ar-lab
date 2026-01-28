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

        // Obtener ID de Creatinina existente
        const creaCheck = await client.query(`SELECT id FROM estudios_laboratorio WHERE codigo = 'CREA'`);
        if (creaCheck.rows.length === 0) {
            console.log('❌ Error: No existe CREA en la base de datos');
            return;
        }
        const creaId = creaCheck.rows[0].id;
        console.log('✅ Usando Creatinina existente (CREA) ID:', creaId);

        // Definir analitos nuevos
        const analitos = [
            {
                codigo: 'DEP-CREAO',
                nombre: 'Creatinina Urinaria',
                unidades: 'mg/dL',
                ref_min: 45, ref_max: 106,
                ref_texto: '45 - 106',
                formula: null
            },
            {
                codigo: 'DEP-VOL24',
                nombre: 'Volumen Urinario 24 hrs',
                unidades: 'mL/24hrs',
                ref_min: 1200, ref_max: 2000,
                ref_texto: '1200 - 2000',
                formula: null
            },
            {
                codigo: 'DEP-VOLMIN',
                nombre: 'Volumen Urinario por Minuto',
                unidades: 'mL/min',
                ref_min: 0.85, ref_max: 1.4,
                ref_texto: '0.85 - 1.4',
                formula: '[DEP-VOL24] / 1440'
            },
            {
                codigo: 'DEP-CALC',
                nombre: 'Depuración de Creatinina',
                unidades: 'mL/min',
                ref_min: 88, ref_max: 133,
                ref_texto: '88 - 133',
                formula: '([DEP-CREAO] * [DEP-VOLMIN]) / [CREA]'
            }
        ];

        // Referencias por sexo para Depuración (de UPC)
        const refsDepuracion = [
            { desc: 'Mujeres', sexo: 'F', valor_min: 88, valor_max: 120 },
            { desc: 'Hombres', sexo: 'M', valor_min: 97, valor_max: 133 }
        ];

        // 1. Insertar analitos
        console.log('\n📦 Insertando analitos...');
        const insertedIds = { 'CREA': creaId };

        for (const a of analitos) {
            const existCheck = await client.query(
                `SELECT id FROM estudios_laboratorio WHERE codigo = $1`,
                [a.codigo]
            );

            if (existCheck.rows.length > 0) {
                insertedIds[a.codigo] = existCheck.rows[0].id;
                console.log(`   ⚠️ ${a.codigo} ya existe`);
            } else {
                const res = await client.query(`
                    INSERT INTO estudios_laboratorio (
                        codigo, nombre, categoria, precio, activo,
                        unidades, tipo_referencia, referencia_min, referencia_max, rango_referencia,
                        metodo, tipo_muestra, tubo_recipiente, tiempo_entrega,
                        formula, indicaciones
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                    RETURNING id
                `, [
                    a.codigo, a.nombre, 'Química Clínica', 100, true,
                    a.unidades, 'rango', a.ref_min, a.ref_max, a.ref_texto,
                    'Cinético', 'Suero + Orina 24h', 'Tubo Rojo + Frasco', 'Mismo día',
                    a.formula, 'Sangre y orina de 24h sin ácido, conservar en refrigeración. Medir peso y talla.'
                ]);
                insertedIds[a.codigo] = res.rows[0].id;
                console.log(`   ✅ ${a.codigo}: ${a.nombre}${a.formula ? ' (CALCULADO)' : ''}`);
            }
        }

        // 2. Insertar perfil padre
        console.log('\n📦 Insertando perfil padre...');
        let perfilId;
        const perfilCheck = await client.query(
            `SELECT id FROM estudios_laboratorio WHERE codigo = 'DEP-PERFIL'`
        );

        if (perfilCheck.rows.length > 0) {
            perfilId = perfilCheck.rows[0].id;
            console.log('   ⚠️ Perfil ya existe');
        } else {
            const perfilRes = await client.query(`
                INSERT INTO estudios_laboratorio (
                    codigo, nombre, categoria, precio, activo, es_perfil,
                    metodo, tipo_muestra, tubo_recipiente, tiempo_entrega, indicaciones
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id
            `, [
                'DEP-PERFIL', 'Depuración de Creatinina en Orina 24 hrs', 'Química Clínica', 150, true, true,
                'Cinético', 'Suero + Orina 24h', 'Tubo Rojo + Frasco', 'Mismo día',
                'Sangre y orina de 24h sin ácido, conservar en refrigeración. Medir peso y talla.'
            ]);
            perfilId = perfilRes.rows[0].id;
            console.log('   ✅ DEP-PERFIL: Perfil creado');
        }

        // 3. Crear relaciones (incluir CREA existente)
        console.log('\n📦 Creando relaciones...');
        const componentes = ['CREA', 'DEP-CREAO', 'DEP-VOL24', 'DEP-VOLMIN', 'DEP-CALC'];
        let orden = 1;
        for (const codigo of componentes) {
            const compId = insertedIds[codigo];
            const relCheck = await client.query(
                `SELECT perfil_id FROM estudio_componentes WHERE perfil_id = $1 AND componente_id = $2`,
                [perfilId, compId]
            );

            if (relCheck.rows.length === 0) {
                await client.query(`
                    INSERT INTO estudio_componentes (perfil_id, componente_id, orden)
                    VALUES ($1, $2, $3)
                `, [perfilId, compId, orden]);
                console.log(`   ✅ Orden ${orden}: ${codigo}`);
            } else {
                console.log(`   ⚠️ Relación ya existe: ${codigo}`);
            }
            orden++;
        }

        // 4. Insertar referencias por sexo para Depuración
        console.log('\n📊 Insertando referencias por sexo (Depuración)...');
        const depId = insertedIds['DEP-CALC'];
        for (let i = 0; i < refsDepuracion.length; i++) {
            const r = refsDepuracion[i];
            const check = await client.query(
                `SELECT id FROM valores_referencia WHERE estudio_id = $1 AND descripcion = $2`,
                [depId, r.desc]
            );
            if (check.rows.length === 0) {
                await client.query(`
                    INSERT INTO valores_referencia (estudio_id, sexo, valor_min, valor_max, descripcion, orden)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [depId, r.sexo, r.valor_min, r.valor_max, r.desc, i]);
                console.log(`   ✅ ${r.desc}: ${r.valor_min}-${r.valor_max} mL/min`);
            }
        }

        console.log('\n========================================');
        console.log('✅ DEPURACIÓN DE CREATININA INSERTADA');
        console.log('========================================');
        console.log('📦 Perfil: DEP-PERFIL');
        console.log('📦 Componentes: 5 (1 existente + 4 nuevos)');
        console.log('📊 Refs por sexo: M:88-120, H:97-133 mL/min');
        console.log('🧮 Fórmulas: DEP-VOLMIN, DEP-CALC');
        console.log('💰 Precio: $150');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
