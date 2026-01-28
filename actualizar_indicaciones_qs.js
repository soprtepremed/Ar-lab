const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ebihobjrwcwtjfazcjmv.supabase.co';
const supabaseKey = 'sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd';

const supabase = createClient(supabaseUrl, supabaseKey);

// Indicaciones específicas para cada tipo de Química Sanguínea
const indicacionesQS = {
    // Química Sanguínea por número de elementos
    'QS3': 'Ayuno de 8 a 12 horas. Incluye: Glucosa, Urea, Creatinina.',
    'QS6': 'Ayuno de 8 a 12 horas. Incluye: Glucosa, Urea, Creatinina, Ácido Úrico, Colesterol, Triglicéridos.',
    'QS12': 'Ayuno de 12 horas. Incluye QS6 + Bilirrubinas, Transaminasas (TGO, TGP), Fosfatasa Alcalina, DHL, Proteínas.',
    'QS24': 'Ayuno de 12 horas. Panel completo de química clínica.',
    'QS27': 'Ayuno de 12 horas. Panel extendido de química clínica.',

    // Perfiles relacionados
    'PERFIL LIPIDICO': 'Ayuno estricto de 12 a 14 horas. Cena ligera la noche anterior. No alcohol 48h antes.',
    'PERFIL HEPATICO': 'Ayuno de 8 a 12 horas. Evitar alcohol 72 horas antes.',
    'PERFIL RENAL': 'Ayuno de 8 horas. Hidratación normal.',

    // Estudios individuales de Química
    'GLUCOSA': 'Ayuno de 8 a 12 horas. No ingerir bebidas alcohólicas 24h antes.',
    'UREA': 'Ayuno de 8 horas.',
    'CREATININA': 'Ayuno de 8 horas. Evitar ejercicio intenso 24h antes.',
    'ACIDO URICO': 'Ayuno de 8 horas. Evitar carnes rojas y mariscos 24h antes.',
    'COLESTEROL': 'Ayuno de 12 horas.',
    'TRIGLICERIDOS': 'Ayuno estricto de 12 a 14 horas. No alcohol 48h antes.',
    'BUN': 'Ayuno de 8 horas.',
    'BILIRRUBINAS': 'Ayuno de 8 horas.',
    'TGO': 'Ayuno de 8 horas. Evitar ejercicio intenso.',
    'TGP': 'Ayuno de 8 horas. Evitar alcohol 72h antes.',
    'FOSFATASA ALCALINA': 'Ayuno de 8 horas.',
    'GGT': 'Ayuno de 8 horas. Evitar alcohol 72h antes.',
    'DHL': 'Ayuno de 8 horas. Evitar ejercicio intenso 24h antes.',
    'PROTEINAS TOTALES': 'Ayuno de 8 horas.',
    'ALBUMINA': 'Ayuno de 8 horas.',
    'GLOBULINAS': 'Ayuno de 8 horas.'
};

async function actualizarIndicacionesQS() {
    console.log('🔄 Actualizando indicaciones de Química Sanguínea...\n');

    try {
        // Obtener TODOS los estudios del catálogo
        const { data: estudios, error } = await supabase
            .from('estudios_laboratorio')
            .select('id, codigo, nombre, categoria, indicaciones');

        if (error) throw error;

        console.log(`📋 Total estudios en catálogo: ${estudios.length}\n`);

        let actualizados = 0;

        for (const estudio of estudios) {
            let nuevaIndicacion = null;
            const nombreUpper = estudio.nombre.toUpperCase();
            const codigoUpper = (estudio.codigo || '').toUpperCase();

            // Buscar coincidencia por código o nombre
            for (const [key, indicacion] of Object.entries(indicacionesQS)) {
                if (nombreUpper.includes(key) || codigoUpper.includes(key) ||
                    nombreUpper.includes(key.replace(' ', '')) ||
                    (key === 'QS3' && nombreUpper.includes('QUIMICA SANGUINEA 3')) ||
                    (key === 'QS6' && nombreUpper.includes('QUIMICA SANGUINEA 6'))) {
                    nuevaIndicacion = indicacion;
                    break;
                }
            }

            // Si encontró indicación específica, actualizar
            if (nuevaIndicacion && nuevaIndicacion !== estudio.indicaciones) {
                const { error: updateError } = await supabase
                    .from('estudios_laboratorio')
                    .update({ indicaciones: nuevaIndicacion })
                    .eq('id', estudio.id);

                if (updateError) {
                    console.log(`❌ Error actualizando ${estudio.nombre}: ${updateError.message}`);
                } else {
                    console.log(`✅ ${estudio.codigo || 'N/A'} - ${estudio.nombre}`);
                    console.log(`   📝 ${nuevaIndicacion}\n`);
                    actualizados++;
                }
            }
        }

        console.log(`\n✅ Actualizados: ${actualizados} estudios`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

actualizarIndicacionesQS();
