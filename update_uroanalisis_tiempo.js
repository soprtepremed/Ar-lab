const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ebihobjrwcwtjfazcjmv.supabase.co';
const supabaseKey = 'sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateUroanalisisTiempo() {
    console.log('🔄 Actualizando tiempo de entrega para estudios de Uroanálisis...\n');

    try {
        // Update all studies where categoria contains 'uro' (case insensitive)
        const { data, error, count } = await supabase
            .from('estudios_laboratorio')
            .update({
                tiempo_entrega: 'Mismo día',
                tubo_recipiente: 'Frasco estéril'
            })
            .or('categoria.ilike.%uro%,categoria.ilike.%urin%')
            .select('id, codigo, nombre, categoria');

        if (error) throw error;

        console.log(`✅ ${data?.length || 0} estudios actualizados:\n`);

        if (data) {
            data.forEach(e => {
                console.log(`   • ${e.codigo || '---'} - ${e.nombre} (${e.categoria})`);
            });
        }

        console.log('\n✅ ¡Actualización completada!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

updateUroanalisisTiempo();
