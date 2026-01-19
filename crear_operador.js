// Script para crear un usuario operador de prueba en Supabase
const { Client } = require('pg');

const client = new Client({
    host: 'db.ebihobjrwcwtjfazcjmv.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function crearOperador() {
    console.log('🔧 Creando usuario operador de prueba...\n');

    const nuevoOperador = {
        usuario: 'OPERADOR PRUEBA',
        password: '123456',
        rol: 'operador'
    };

    try {
        await client.connect();

        // Verificar si ya existe
        const checkResult = await client.query(
            "SELECT * FROM usuarios WHERE usuario = $1",
            [nuevoOperador.usuario]
        );

        if (checkResult.rows.length > 0) {
            console.log('⚠️  El usuario ya existe:');
            console.log(`   Usuario: ${checkResult.rows[0].usuario}`);
            console.log(`   Rol: ${checkResult.rows[0].rol}`);
            console.log(`   Password: ${nuevoOperador.password}`);
            await client.end();
            return;
        }

        // Crear nuevo usuario
        await client.query(
            "INSERT INTO usuarios (usuario, password, rol) VALUES ($1, $2, $3)",
            [nuevoOperador.usuario, nuevoOperador.password, nuevoOperador.rol]
        );

        console.log('✅ Usuario operador creado exitosamente!\n');
        console.log('📋 Credenciales de acceso:');
        console.log('   ─────────────────────────');
        console.log(`   Usuario:  ${nuevoOperador.usuario}`);
        console.log(`   Password: ${nuevoOperador.password}`);
        console.log(`   Rol:      ${nuevoOperador.rol}`);
        console.log('   ─────────────────────────\n');
        console.log('💡 Usa estas credenciales para probar el acceso restringido.');

        await client.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        try { await client.end(); } catch (e) { }
    }
}

crearOperador();
