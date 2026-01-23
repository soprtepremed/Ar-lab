
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function wipe() {
    try {
        await client.connect();
        console.log('Iniciando borrado de catálogo...');

        // 0. Delete citation/appointment links first (Foreign Key Constraint)
        console.log('Borrando relación citas-estudios...');
        await client.query('DELETE FROM citas_estudios');

        // 1. Delete dependencies first
        console.log('Borrando componentes de perfiles...');
        await client.query('DELETE FROM estudio_componentes');

        // 2. Delete main studies
        console.log('Borrando estudios y perfiles...');
        await client.query('DELETE FROM estudios_laboratorio');

        console.log('¡Catálogo eliminado exitosamente!');
    } catch (e) {
        console.error('Error al borrar:', e);
    } finally {
        await client.end();
    }
}

wipe();
