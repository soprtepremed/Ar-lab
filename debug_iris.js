
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env or hardcoded (using hardcoded from previous files for speed as I saw it in entrega.html)
// Actually I should find the keys. querying entrega.html to find them.
const supabaseUrl = 'https://ebihobjrwcwtjfazcjmv.supabase.co';
const supabaseKey = 'sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPatient() {
    console.log("Searching for Iris Allin...");
    const { data: patients, error: searchError } = await supabase
        .from('citas')
        .select('id, paciente_nombre, fecha_hora')
        .ilike('paciente_nombre', '%Iris Allin%')
        .order('fecha_hora', { ascending: false })
        .limit(1);

    if (searchError || !patients.length) {
        console.error("Patient not found", searchError);
        return;
    }

    const patient = patients[0];
    console.log(`Found Patient: ${patient.paciente_nombre} (ID: ${patient.id})`);

    const { data: studies, error: studiesError } = await supabase
        .from('citas_estudios')
        .select(`
            id, estado_resultado,
            estudios_laboratorio (
                id, nombre, area, categoria, es_perfil
            )
        `)
        .eq('cita_id', patient.id);

    if (studiesError) {
        console.error("Error fetching studies", studiesError);
        return;
    }

    console.log("\n--- STUDIES ANALYSIS ---");
    let allValid = true;
    studies.forEach(s => {
        const est = s.estudios_laboratorio;
        const name = est.nombre;
        const status = s.estado_resultado;
        const isProfile = est.es_perfil;

        // Simulating the Logic
        const lowerName = name.toLowerCase();
        const isHeader = isProfile ||
            lowerName.includes('elementos') ||
            lowerName.includes('perfil') ||
            lowerName.includes('paquete') ||
            lowerName.includes('electrolitos');

        const isOk = ['validado', 'entregado'].includes(status);
        const ignored = isHeader;

        let logStatus = isOk ? "OK" : "PENDING";
        if (!isOk && ignored) logStatus = "IGNORED (Header)";
        if (!isOk && !ignored) {
            logStatus = "BLOCKING !!";
            allValid = false;
        }

        console.log(`[${logStatus}] ${name} | Status: ${status} | EsPerfil: ${isProfile}`);
    });

    console.log("\nFinal Calculation: ", allValid ? "COMPLETADO" : "PENDIENTE");
}

checkPatient();
