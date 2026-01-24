
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ebihobjrwcwtjfazcjmv.supabase.co';
const supabaseKey = 'sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verificando códigos de estudios...');

    const { data: studies, error } = await supabase
        .from('estudios_laboratorio')
        .select('id, nombre, codigo, formula')
        .or('nombre.ilike.%Creatinina%,nombre.ilike.%Urea%,nombre.ilike.%BUN%'); // Check related studies too

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.table(studies.map(s => ({
        id: s.id,
        nombre: s.nombre,
        codigo: s.codigo,
        formula: s.formula
    })));
}

verify();
