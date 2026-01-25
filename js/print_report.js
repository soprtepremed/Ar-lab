
// Initialize Supabase
const supabaseUrl = 'https://ebihobjrwcwtjfazcjmv.supabase.co';
const supabaseKey = 'sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

function normalizeText(text) {
    if (!text) return '';
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

async function loadReport() {
    const params = new URLSearchParams(window.location.search);
    const citeId = params.get('id');

    if (!citeId) {
        document.getElementById('loading').textContent = 'Error: No se especificó el ID de la cita.';
        return;
    }

    try {
        // Fetch Quote Data
        const { data: quote, error } = await supabaseClient
            .from('citas')
            .select(`
                *,
                citas_estudios (
                    id,
                    estudio_id,
                    estado_muestra,
                    estado_resultado,
                    resultados,
                    estudios_laboratorio (
                        nombre,
                        area
                    )
                )
            `)
            .eq('id', citeId)
            .single();

        if (error) throw error;
        if (!quote) throw new Error('Cita no encontrada.');

        // Populate Patient Info
        const infoTable = document.querySelector('.patient-info table');
        if (infoTable) {
            // We use specific IDs now
        }

        // Update direct IDs
        document.getElementById('pName').textContent = quote.paciente_nombre || '';

        // EXPEDIENTE: Use System ID (Short segment of UUID)
        document.getElementById('pFolio').textContent = (quote.id || '').split('-')[0].toUpperCase();

        // No. SOLICITUD: Use the Daily Folio (e.g., 1, 2, 3...)
        document.getElementById('pReqId').textContent = (quote.folio || '---').toString().padStart(4, '0');

        // Date
        const dateObj = new Date(quote.fecha_hora);
        const dateStr = dateObj.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
            ' ' + dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('pDate').textContent = dateStr;

        // Age / Gender (Placeholder as not directly in citations table usually)
        // If you add these fields to DB later, map them here.
        document.getElementById('pAgeGender').textContent = '-- AÑOS / --';

        // Medic
        document.getElementById('pMedic').textContent = quote.medico || 'A QUIEN CORRESPONDA';

        // Process Results
        const validatedStudies = quote.citas_estudios.filter(s => (s.estado_muestra || '').toLowerCase() === 'validado');

        if (validatedStudies.length === 0) {
            document.getElementById('resultsBody').innerHTML = '<div style="padding:20px; text-align:center; font-style:italic;">No hay resultados validados disponibles para este reporte.</div>';
            document.getElementById('loading').style.display = 'none';
            document.getElementById('reportContent').style.display = 'block';
            return;
        }

        // Group by Area
        const grouped = {};

        validatedStudies.forEach(study => {
            const rawArea = study.estudios_laboratorio?.area || 'OTROS ESTUDIOS';
            const normalizedAreaKey = normalizeText(rawArea);

            if (!grouped[normalizedAreaKey]) {
                grouped[normalizedAreaKey] = {
                    label: rawArea.toUpperCase(),
                    studies: []
                };
            }
            grouped[normalizedAreaKey].studies.push(study);
        });

        // Blocklist of keys to NOT show as analites in the table
        const IGNORE_KEYS = ['fecha_captura', 'observaciones', 'status', 'validado_por', 'equipo', 'metodo', 'nota', 'comentario', 'hora_toma', 'hora_reporte'];

        // Render Tables
        const container = document.getElementById('resultsBody');
        container.innerHTML = '';

        for (const key in grouped) {
            const group = grouped[key];

            const areaContainer = document.createElement('div');
            areaContainer.className = 'area-container';

            // Area Title
            const areaTitle = document.createElement('div');
            areaTitle.className = 'area-header';
            areaTitle.textContent = group.label;
            areaContainer.appendChild(areaTitle);

            // Table
            const table = document.createElement('table');
            table.className = 'results-table'; // Ensure this class matches CSS if defined, or uses global table styles
            table.innerHTML = `
                <thead>
                    <tr>
                        <th class="col-prueba">PRUEBA</th>
                        <th class="col-res">RESULTADO</th>
                        <th class="col-uni">UNIDADES</th>
                        <th class="col-ref">INTERVALO DE REFERENCIA</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector('tbody');
            let hasRows = false;

            group.studies.forEach(study => {
                const results = study.resultados || {};
                const studyName = study.estudios_laboratorio.nombre;

                // If empty results, skip (or show pending?) -> user said "validado", so it should have results.
                if (!results || Object.keys(results).length === 0) return;

                // Case 1: Simple Result (has specific 'valor' key at top level)
                if ('valor' in results) {
                    const val = results.valor;
                    const unit = results.unidades || '';
                    const ref = results.referencia || '';
                    const method = results.metodo || '';
                    const obs = results.observaciones || '';

                    const row = document.createElement('tr');

                    let nameHtml = `<div class="test-name">${studyName}</div>`;
                    if (method) nameHtml += `<div class="method-note">Metodología: ${method}</div>`;
                    if (obs) nameHtml += `<div class="method-note">Nota: ${obs}</div>`;

                    row.innerHTML = `
                        <td class="col-prueba">${nameHtml}</td>
                        <td class="col-res">${val}</td>
                        <td class="col-uni">${unit}</td>
                        <td class="col-ref">${ref}</td>
                    `;
                    tbody.appendChild(row);
                    hasRows = true;
                }
                // Case 2: Profile/Complex Result
                else {
                    const keys = Object.keys(results).filter(k => !IGNORE_KEYS.includes(k));

                    if (keys.length > 0) {
                        // Profile Header Row
                        if (keys.length > 1) {
                            const headerRow = document.createElement('tr');
                            headerRow.innerHTML = `<td colspan="4" class="profile-header">${studyName}</td>`;
                            tbody.appendChild(headerRow);
                        }

                        keys.forEach(k => {
                            let val, unit = '', ref = '', method = '';
                            const valObj = results[k];

                            if (typeof valObj === 'object' && valObj !== null && 'valor' in valObj) {
                                val = valObj.valor;
                                unit = valObj.unidades || '';
                                ref = valObj.referencia || '';
                                method = valObj.metodo || '';
                            } else {
                                val = valObj;
                            }

                            // Determine display name
                            const displayName = keys.length === 1 ? studyName : k;

                            let nameHtml = `<div class="test-name" style="${keys.length > 1 ? 'padding-left:10px;' : ''}">${displayName}</div>`;
                            if (method) nameHtml += `<div class="method-note" style="${keys.length > 1 ? 'padding-left:10px;' : ''}">Metodología: ${method}</div>`;

                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td class="col-prueba">${nameHtml}</td>
                                <td class="col-res">${val}</td>
                                <td class="col-uni">${unit}</td>
                                <td class="col-ref">${ref}</td>
                            `;
                            tbody.appendChild(row);
                        });
                        hasRows = true;
                    }
                }
            });

            if (hasRows) {
                areaContainer.appendChild(table);
                container.appendChild(areaContainer);
            }
        }

        document.getElementById('loading').style.display = 'none';
        document.getElementById('reportContent').style.display = 'block';

        // Check if preview mode (don't auto-print in preview mode)
        const isPreview = params.get('preview') === '1';

        if (!isPreview) {
            // Auto print after a short delay to ensure rendering
            setTimeout(() => {
                window.print();
            }, 1000);
        }

    } catch (err) {
        console.error(err);
        document.getElementById('loading').textContent = 'Error al cargar el reporte: ' + err.message;
    }
}

document.addEventListener('DOMContentLoaded', loadReport);
