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

        await client.query(`
            UPDATE estudios_laboratorio 
            SET referencia_min = 0.01,
                referencia_max = 0.1,
                rango_referencia = '0.01 - 0.1',
                indicaciones = 'Marcador de sepsis bacteriana. Normal: <0.1, Infección local: 0.1-0.5, Sepsis: 0.5-2, Sepsis severa: >2'
            WHERE codigo = 'PCT'
        `);

        console.log('✅ PCT actualizada con valores UPC');
        console.log('\n========================================');
        console.log('✅ PROCALCITONINA ACTUALIZADA');
        console.log('========================================');
        console.log('📊 Referencia: 0.01 - 0.1 ng/mL (UPC)');
        console.log('🔬 Método: Electroquimioluminiscencia');
        console.log('========================================');

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await client.end();
    }
}

run();
