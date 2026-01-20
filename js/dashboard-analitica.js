// dashboard-analitica.js - Fase Analítica (Lab Processing)

let currentAreaFilter = 'all';

async function loadFaseAnalitica() {
    const container = document.getElementById('analiticaContainer');
    const countEl = document.getElementById('analiticaCount');
    const dateEl = document.getElementById('analiticaDate');

    // Set default date if empty
    if (dateEl && !dateEl.value) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateEl.value = `${year}-${month}-${day}`;
    }

    const selectedDate = dateEl ? dateEl.value : new Date().toISOString().split('T')[0];

    if (!container) return;

    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #64748b;">Cargando muestras...</div>';

    try {
        // Get start and end of selected date for filtering
        const startDate = `${selectedDate}T00:00:00`;
        const endDate = `${selectedDate}T23:59:59`;

        // Get all studies with estado_muestra = 'tomada' (ready for processing)
        // Filter by date on the related 'citas' table is tricky in one go with Supabase JS client deep filtering sometimes,
        // but we can try inner join filtering if supported, or filter client side if volume is low.
        // Let's try to filter by date range on the join.

        const { data, error } = await supabaseClient
            .from('citas_estudios')
            .select(`
                id,
                cita_id,
                estudio_id,
                estado_muestra,
                citas!inner (
                    id,
                    folio_atencion,
                    paciente_nombre,
                    fecha_hora
                ),
                estudios_laboratorio (
                    id,
                    nombre,
                    codigo,
                    area,
                    tubo_recipiente
                )
            `)
            .eq('estado_muestra', 'tomada')
            .gte('citas.fecha_hora', startDate)
            .lte('citas.fecha_hora', endDate);

        if (error) throw error;

        console.log('Muestras para procesar:', data?.length || 0);

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #64748b;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin: 0 auto 1rem;">
                        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path>
                    </svg>
                    <h3 style="color: #475569; margin-bottom: 0.5rem;">No hay muestras pendientes</h3>
                    <p>Todas las muestras han sido procesadas o no hay muestras tomadas.</p>
                </div>
            `;
            if (countEl) countEl.textContent = '0';
            return;
        }

        // Group by area
        const byArea = {};
        data.forEach(item => {
            const area = item.estudios_laboratorio?.area || 'General';
            if (!byArea[area]) byArea[area] = [];
            byArea[area].push(item);
        });

        // Count
        if (countEl) countEl.textContent = data.length;

        // Build HTML
        let html = '';

        // Area tabs
        const areas = Object.keys(byArea).sort();
        html += `<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0;">`;
        html += `<button onclick="filterArea('all')" class="area-tab ${currentAreaFilter === 'all' ? 'active' : ''}" style="padding: 8px 16px; border-radius: 20px; border: 1px solid #e2e8f0; background: ${currentAreaFilter === 'all' ? '#0d9488' : 'white'}; color: ${currentAreaFilter === 'all' ? 'white' : '#475569'}; font-weight: 600; cursor: pointer;">
            Todas (${data.length})
        </button>`;

        areas.forEach(area => {
            const isActive = currentAreaFilter === area;
            html += `<button onclick="filterArea('${area}')" class="area-tab ${isActive ? 'active' : ''}" style="padding: 8px 16px; border-radius: 20px; border: 1px solid #e2e8f0; background: ${isActive ? '#0d9488' : 'white'}; color: ${isActive ? 'white' : '#475569'}; font-weight: 500; cursor: pointer;">
                ${area} (${byArea[area].length})
            </button>`;
        });
        html += `</div>`;

        // Table
        html += `<table class="appointments-table" style="font-size: 0.85rem;">
            <thead>
                <tr>
                    <th style="width: 12%;">Folio</th>
                    <th style="width: 25%;">Paciente</th>
                    <th style="width: 20%;">Estudio</th>
                    <th style="width: 15%;">Área</th>
                    <th style="width: 12%;">Tubo</th>
                    <th style="width: 16%;">Acción</th>
                </tr>
            </thead>
            <tbody>`;

        // Filter by selected area
        const filteredData = currentAreaFilter === 'all'
            ? data
            : data.filter(d => (d.estudios_laboratorio?.area || 'General') === currentAreaFilter);

        filteredData.forEach(item => {
            const folio = item.citas?.folio_atencion || '--';
            const paciente = item.citas?.paciente_nombre || 'Desconocido';
            const estudio = item.estudios_laboratorio?.nombre || 'Estudio';
            const codigo = item.estudios_laboratorio?.codigo || '';
            const area = item.estudios_laboratorio?.area || 'General';
            const tubo = item.estudios_laboratorio?.tubo_recipiente?.split(',')[0]?.trim() || '--';

            // Get tube abbreviation
            let tuboAbbr = tubo;
            if (tubo.toLowerCase().includes('lila')) tuboAbbr = 'LILA';
            else if (tubo.toLowerCase().includes('celeste')) tuboAbbr = 'CELES';
            else if (tubo.toLowerCase().includes('rojo')) tuboAbbr = 'ROJO';
            else if (tubo.toLowerCase().includes('amarillo')) tuboAbbr = 'AMAR';
            else if (tubo.toLowerCase().includes('estéril') || tubo.toLowerCase().includes('orina')) tuboAbbr = 'REP EST';

            html += `<tr>
                <td>
                    <span style="font-family: monospace; font-weight: 600; background: #f0fdfa; padding: 4px 8px; border-radius: 4px;">${folio}</span>
                </td>
                <td style="font-weight: 500;">${paciente}</td>
                <td>
                    <span style="font-weight: 600; color: #0369a1;">${codigo}</span>
                    <span style="color: #64748b; font-size: 0.8rem; display: block;">${estudio}</span>
                </td>
                <td>
                    <span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">${area}</span>
                </td>
                <td>
                    <span style="font-weight: 500; color: #475569;">${tuboAbbr}</span>
                </td>
                <td>
                    <button onclick="marcarProcesado('${item.id}')" title="Marcar como Procesado" style="padding: 6px 12px; background: #ecfdf5; color: #047857; border: 1px solid #6ee7b7; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.8rem; display: flex; align-items: center; gap: 4px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Procesado
                    </button>
                </td>
            </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (err) {
        console.error('Error loading fase analitica:', err);
        container.innerHTML = `<div style="color: #ef4444; text-align: center; padding: 2rem;">Error al cargar: ${err.message}</div>`;
    }
}

function filterArea(area) {
    currentAreaFilter = area;
    loadFaseAnalitica();
}

async function marcarProcesado(citaEstudioId) {
    try {
        const { error } = await supabaseClient
            .from('citas_estudios')
            .update({ estado_muestra: 'procesado' })
            .eq('id', citaEstudioId);

        if (error) throw error;

        showSuccessModal('✅ Procesado', 'El estudio ha sido marcado como procesado.');
        loadFaseAnalitica();

    } catch (err) {
        console.error('Error:', err);
        showErrorModal('Error', 'No se pudo actualizar: ' + err.message);
    }
}

// Auto-load when section becomes visible
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the analitica section
    const checkSection = () => {
        const section = document.getElementById('section-analitica');
        if (section && section.style.display !== 'none') {
            loadFaseAnalitica();
        }
    };

    // Initial check
    setTimeout(checkSection, 500);
});
