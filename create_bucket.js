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
    await client.connect();

    // Crear políticas para el bucket comprobantes
    const policies = [
        // Permitir lectura pública
        `CREATE POLICY "Permitir lectura pública comprobantes" 
         ON storage.objects FOR SELECT 
         USING (bucket_id = 'comprobantes')`,

        // Permitir uploads para todos
        `CREATE POLICY "Permitir uploads comprobantes" 
         ON storage.objects FOR INSERT 
         WITH CHECK (bucket_id = 'comprobantes')`,

        // Permitir updates
        `CREATE POLICY "Permitir updates comprobantes" 
         ON storage.objects FOR UPDATE 
         USING (bucket_id = 'comprobantes')`,

        // Permitir deletes
        `CREATE POLICY "Permitir deletes comprobantes" 
         ON storage.objects FOR DELETE 
         USING (bucket_id = 'comprobantes')`
    ];

    for (const policy of policies) {
        try {
            await client.query(policy);
            console.log('✓ Política creada');
        } catch (e) {
            if (e.message.includes('already exists')) {
                console.log('⊙ Política ya existe');
            } else {
                console.error('✗ Error:', e.message);
            }
        }
    }

    console.log('\n✓ Configuración de storage completada');
    await client.end();
}

run().catch(e => console.error(e));
