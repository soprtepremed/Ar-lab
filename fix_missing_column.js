
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://ebihobjrwcwtjfazcjmv.supabase.co';
const supabaseKey = 'sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumn() {
    console.log('Intentando agregar columna mostrar_en_reporte...');

    // Usamos rpc si existe una función para ejecutar SQL, o intentamos una query directa si es posible (limitado en cliente)
    // Como no podemos ejecutar DDL directo desde el cliente JS sin una función RPC específica,
    // y parece que la conexión directa falló, vamos a intentar usar el "truco" de llamar a una función SQL si existe
    // o simplemente informar al usuario que debe correr el SQL manualmente.

    // PERO, si tenemos una función 'exec_sql' o similar habilitada (común en setups de desarrollo), la usamos.
    // Si no, tendremos que pedirle al usuario que corra el SQL en el dashboard de Supabase.

    // INTENTO 2: Usar 'postgres' library si fuera entorno local con acceso, pero es remoto.

    // ESTRATEGIA: Dado que falló la conexión directa en pasos anteriores,
    // voy a generar un archivo .sql claro y pedirle al usuario que lo ejecute en su dashboard de Supabase,
    // O intentar una conexión PG con 'pg' module si está instalado (check package.json).

    try {
        const { error } = await supabase.rpc('exec_sql', { sql: "ALTER TABLE citas_estudios ADD COLUMN IF NOT EXISTS mostrar_en_reporte BOOLEAN DEFAULT true;" });
        if (error) {
            console.error('Error RPC:', error);
            // Fallback: Check if we can select, maybe it exists now?
            const { error: selError } = await supabase.from('citas_estudios').select('mostrar_en_reporte').limit(1);
            if (selError) {
                console.log('La columna definitivamente no existe o no es accesible.');
            } else {
                console.log('Parece que la columna YA existe. El error anterior puede haber sido de caché.');
            }
        } else {
            console.log('Columna agregada exitosamente vía RPC.');
        }
    } catch (e) {
        console.error('Excepción:', e);
    }
}

// Check dependencies first
try {
    require('pg');
    console.log('PG module available. Trying direct connection if RPC fails...');
} catch (e) {
    console.log('PG module not available.');
}

addColumn();
