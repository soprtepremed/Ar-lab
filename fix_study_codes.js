
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ebihobjrwcwtjfazcjmv.supabase.co';
const supabaseKey = 'sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCodes() {
    console.log('Corrigiendo códigos de estudios...');

    const updates = [
        { old: 'QS-CREA', new: 'CREA', name: 'Creatinina' },
        { old: 'QS-UREA', new: 'UREA', name: 'Urea' },
        { old: 'QS-BUN', new: 'BUN', name: 'Nitrógeno Ureico (BUN)' }
    ];

    for (const item of updates) {
        // 1. Find by ID to be safe, or just update by current code/name
        // Let's update by current code to be safe
        const { error } = await supabase
            .from('estudios_laboratorio')
            .update({ codigo: item.new })
            .ilike('nombre', `%${item.name}%`); // Match by name to be sure we get the right one
        // .eq('codigo', item.old); // Or match by old code. Let's do name as it's more robust if code is messy.

        if (error) {
            console.error(`Error actualizando ${item.name}:`, error);
        } else {
            console.log(`✅ ${item.name}: Código actualizado a '${item.new}'`);
        }
    }
}

fixCodes();
