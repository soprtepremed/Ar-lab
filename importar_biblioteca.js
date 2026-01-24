const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function importCatalog() {
    try {
        const filePath = path.join(__dirname, 'biblioteca estudios', 'estudios de laboratorio catalogo  d.txt');
        console.log(`Leyendo archivo de biblioteca: ${filePath}`);
        const content = fs.readFileSync(filePath, 'utf8');

        const studies = [];
        const studyRegex = /\{\s*"clave_estudio":[\s\S]*?"tiempo_entrega":\s*".*?"\s*\}/g;

        let match;
        while ((match = studyRegex.exec(content)) !== null) {
            try {
                const cleanJson = match[0].trim().replace(/,$/, '');
                const study = JSON.parse(cleanJson);
                studies.push(study);
            } catch (e) { }
        }

        if (studies.length === 0) {
            throw new Error('No se pudo extraer ningún estudio del archivo.');
        }

        await client.connect();
        console.log(`✅ Conectado a Supabase. Se extrajeron ${studies.length} estudios.`);
        console.log('🚀 Iniciando carga masiva...');

        let count = 0;
        let errors = 0;

        for (const est of studies) {
            const rawCodigo = est.clave_estudio ? est.clave_estudio.toString().trim() : null;
            const codigo = rawCodigo === "" ? null : rawCodigo;
            const nombre = est.nombre_estudio.trim().substring(0, 200);
            const metodologia = (est.metodologia || 'No especificada').substring(0, 200);
            const tipo_muestra = (est.tipo_muestra || 'No especificada').substring(0, 100);
            const tiempo_entrega = (est.tiempo_entrega || 'N/A').substring(0, 50);
            const indicaciones = (est.contenido && est.contenido !== 'N/A') ? est.contenido : 'Sin indicaciones especiales.';

            // Categorización básica
            let categoria = 'GENERAL';
            const n = nombre.toUpperCase();
            if (n.includes('GLUCOSA') || n.includes('COLESTEROL') || n.includes('QUIMICA') || n.includes('PERFIL')) categoria = 'QUIMICA CLINICA';
            if (n.includes('ORINA') || n.includes('UROCULTIVO')) categoria = 'UROANALISIS';
            if (n.includes('SANGRE') || n.includes('HEMOGLOBINA') || n.includes('HEMATOCRITO')) categoria = 'HEMATOLOGIA';
            if (n.includes('HORMONA') || n.includes('TIROID')) categoria = 'ENDOCRINOLOGIA';
            if (n.includes('INMUNO') || n.includes('ANTICUERPOS')) categoria = 'INMUNOLOGIA';
            if (n.includes('CULTIVO') || n.includes('COPPRO')) categoria = 'MICROBIOLOGIA';
            if (n.includes('DROGA') || n.includes('MARIHUANA')) categoria = 'TOXICOLOGIA';

            try {
                if (codigo) {
                    await client.query(`
                        INSERT INTO estudios_laboratorio (codigo, nombre, categoria, metodologia, tipo_muestra, tiempo_entrega, indicaciones, precio, activo)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        ON CONFLICT (codigo) DO UPDATE SET
                            nombre = EXCLUDED.nombre,
                            categoria = EXCLUDED.categoria,
                            metodologia = EXCLUDED.metodologia,
                            tipo_muestra = EXCLUDED.tipo_muestra,
                            tiempo_entrega = EXCLUDED.tiempo_entrega,
                            indicaciones = EXCLUDED.indicaciones,
                            activo = true
                    `, [codigo, nombre, categoria, metodologia, tipo_muestra, tiempo_entrega, indicaciones, 0.00, true]);
                } else {
                    await client.query(`
                        INSERT INTO estudios_laboratorio (nombre, categoria, metodologia, tipo_muestra, tiempo_entrega, indicaciones, precio, activo)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `, [nombre, categoria, metodologia, tipo_muestra, tiempo_entrega, indicaciones, 0.00, true]);
                }
                count++;
                if (count % 20 === 0) process.stdout.write(`\r🚀 Procesados: ${count}/${studies.length}...`);
            } catch (err) {
                if (!err.message.includes('unique constraint')) {
                    errors++;
                }
            }
        }

        console.log(`\n\n🎉 ¡CARGA COMPLETADA!`);
        console.log(`✅ Estudios cargados/actualizados: ${count}`);
        if (errors > 0) console.log(`⚠️ Estudios omitidos o con error: ${errors}`);

    } catch (err) {
        console.error('❌ Error fatal:', err.message);
    } finally {
        await client.end();
    }
}

importCatalog();
