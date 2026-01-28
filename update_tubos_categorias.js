const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ebihobjrwcwtjfazcjmv.supabase.co';
const supabaseKey = 'sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTubosPorCategoria() {
    console.log('🔄 Actualizando tubos y tiempo de entrega por categoría...\n');

    try {
        // 1. HEMATOLOGÍA - Tubo Lila, Mismo día
        console.log('📌 Actualizando HEMATOLOGÍA...');
        const { data: hema, error: hemaError } = await supabase
            .from('estudios_laboratorio')
            .update({
                tubo_recipiente: 'Tubo Lila',
                tiempo_entrega: 'Mismo día'
            })
            .ilike('categoria', '%hematolog%')
            .select('codigo, nombre');

        if (hemaError) throw hemaError;
        console.log(`   ✅ ${hema?.length || 0} estudios de Hematología actualizados\n`);
        hema?.forEach(e => console.log(`      • ${e.codigo || '---'} - ${e.nombre}`));

        // 2. QUÍMICA CLÍNICA - Tubo Rojo o Amarillo, Mismo día
        console.log('\n📌 Actualizando QUÍMICA CLÍNICA...');
        const { data: quim, error: quimError } = await supabase
            .from('estudios_laboratorio')
            .update({
                tubo_recipiente: 'Tubo Rojo o Amarillo',
                tiempo_entrega: 'Mismo día'
            })
            .ilike('categoria', '%quim%')
            .select('codigo, nombre');

        if (quimError) throw quimError;
        console.log(`   ✅ ${quim?.length || 0} estudios de Química Clínica actualizados\n`);
        quim?.forEach(e => console.log(`      • ${e.codigo || '---'} - ${e.nombre}`));

        console.log('\n✅ ¡Actualización completada!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

updateTubosPorCategoria();
