
const { createClient } = require('@supabase/supabase-js');

// Use the credentials from CONEXIONES.md or previous context
const supabaseUrl = 'https://ebihobjrwcwtjfazcjmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaWhvYmpyd2N3dGpmYXpjam12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0MTY4NTgsImV4cCI6MjA1Mjk5Mjg1OH0.eP_BE7patBPpXNvzXNuE7bkO9TnX5Z17ma5wOLzSJPU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking citas_estudios...');

    // 1. Check distinct states
    const { data: states, error: err1 } = await supabase
        .from('citas_estudios')
        .select('estado_muestra');

    if (err1) {
        console.error('Error fetching states:', err1);
    } else {
        const counts = {};
        states.forEach(s => {
            counts[s.estado_muestra] = (counts[s.estado_muestra] || 0) + 1;
        });
        console.log('Estados de muestra distribution:', counts);
    }

    // 2. Check for 'validado' specifically
    const { data: validated, error: err2 } = await supabase
        .from('citas_estudios')
        .select('id, estudio_id, estado_muestra, resultados')
        .eq('estado_muestra', 'validado');

    if (err2) console.error(err2);
    else console.log(`Found ${validated.length} studies with estado_muestra='validado'.`);

    // 3. Test the nested query used in loadPosAnalitica
    const { data: citations, error: err3 } = await supabase
        .from('citas')
        .select(`
            id,
            paciente_nombre,
            citas_estudios!inner (
                id,
                estado_muestra
            )
        `)
        .eq('citas_estudios.estado_muestra', 'validado');

    if (err3) {
        console.error('Error testing nested query:', err3);
    } else {
        console.log(`Nested query returned ${citations.length} citations.`);
    }
}

checkData();
