const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ebihobjrwcwtjfazcjmv.supabase.co';
const supabaseKey = 'sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Probando conexión via Supabase JS Client...');
    const { data, error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log('✅ Conexión exitosa via API REST.');
        console.log('📊 Usuarios encontrados (count):', data);
    }
}

test();
