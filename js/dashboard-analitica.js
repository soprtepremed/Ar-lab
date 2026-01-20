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

        // --- PREPARE DATA ---

        // 1. Normalize Areas to avoid duplicates (Coagulación vs Coagulacion vs COAGULACION)
        const normalizeText = (text) => {
            return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        };

        const capitalize = (text) => {
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        };

        const byArea = {};

        // Helper to get formatted area name
        const getFormattedArea = (rawArea) => {
            if (!rawArea) return 'General';
            // Specific fixes
            const normalized = normalizeText(rawArea);
            if (normalized === 'hematologia') return 'Hematología';
            if (normalized === 'quimica clinica') return 'Química Clínica';
            if (normalized === 'coagulacion') return 'Coagulación';
            if (normalized === 'urianalisis' || normalized === 'uroanalisis') return 'Urianálisis';
            if (normalized === 'inmunologia') return 'Inmunología';

            // Default formatting
            return rawArea.split(' ').map(word => capitalize(word)).join(' ');
        };

        data.forEach(item => {
            const rawArea = item.estudios_laboratorio?.area || 'General';
            const formattedArea = getFormattedArea(rawArea);
            const normalizedKey = normalizeText(formattedArea); // Key for filtering safely

            // Store standardized values
            if (item.estudios_laboratorio) {
                item.estudios_laboratorio.area_formatted = formattedArea;
                item.estudios_laboratorio.area_key = normalizedKey;
            }

            if (!byArea[formattedArea]) byArea[formattedArea] = [];
            byArea[formattedArea].push(item);
        });

        const areas = Object.keys(byArea).sort();
        if (countEl) countEl.textContent = data.length;

        // --- BUILD HTML UI ---

        let html = '';

        // Toolbar Container
        html += `<div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding: 1rem; background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">`;

        // Left Side: Search & Filters
        html += `<div style="display: flex; gap: 1rem; flex-wrap: wrap; flex: 1;">`;

        // 1. SEARCH BAR
        html += `
            <div style="position: relative; flex: 1; min-width: 200px; max-width: 400px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%);">
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" id="analiticaSearch" placeholder="Buscar paciente o folio..." 
                    oninput="applyAnaliticaFilters()"
                    style="width: 100%; padding: 10px 10px 10px 36px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 0.9rem; transition: border-color 0.2s;"
                    onfocus="this.style.borderColor='#0e7490'" onblur="this.style.borderColor='#cbd5e1'">
            </div>
        `;

        // 2. AREA DROPDOWN
        html += `
            <div style="position: relative; min-width: 180px;">
                <select id="analiticaAreaFilter" onchange="applyAnaliticaFilters()" 
                    style="width: 100%; padding: 10px 30px 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 0.9rem; background: white; cursor: pointer; appearance: none; color: #334155; font-weight: 500;">
                    <option value="all">Todas las Áreas (${data.length})</option>
                    ${areas.map(area => `<option value="${normalizeText(area)}">${area} (${byArea[area].length})</option>`).join('')}
                </select>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none;">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
        `;

        html += `</div>`; // End Left Side

        // Right Side: Date Picker & Legend
        html += `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">`;

        // Date Picker
        html += `
            <div style="background: white; padding: 5px 10px; border-radius: 8px; border: 1px solid #cbd5e1; display: flex; align-items: center;">
                 <input type="date" id="analiticaDate" value="${selectedDate}"
                     style="border: none; outline: none; font-family: 'Inter', sans-serif; font-weight: 500; color: #334155; font-size: 0.9rem; background: transparent; cursor: pointer;"
                     onchange="loadFaseAnalitica()">
            </div>
        `;

        // Legend
        html += `<div style="display: flex; gap: 12px; font-size: 0.75rem; color: #64748b; background: #f8fafc; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></div>Pendiente</div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 8px; height: 8px; border-radius: 50%; background: #f97316;"></div>En Proceso</div>
            <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></div>Validado</div>
        </div>`;

        html += `</div>`; // End Right Side Wrapper

        html += `</div>`; // End Toolbar

        // Container for the list (Dynamic content goes here)
        html += `<div id="analiticaListContainer"></div>`;

        container.innerHTML = html;

        // Store raw data globally or in a closure to access it in applyAnaliticaFilters
        // Since we are inside loadFaseAnalitica, we can assign it to a property of the container for easy access
        container.dataset.rawData = JSON.stringify(data);

        // Initial Render
        renderAnaliticaTable(data);

    } catch (err) {
        console.error('Error loading fase analitica:', err);
        container.innerHTML = `<div style="color: #ef4444; text-align: center; padding: 2rem;">Error al cargar: ${err.message}</div>`;
    }
}

// --- NEW FUNCTION: Apply Filters & Render ---
function applyAnaliticaFilters() {
    const container = document.getElementById('analiticaContainer');
    if (!container || !container.dataset.rawData) return;

    const data = JSON.parse(container.dataset.rawData);
    const searchTerm = document.getElementById('analiticaSearch').value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const selectedAreaKey = document.getElementById('analiticaAreaFilter').value;

    // Filter Logic
    let filteredData = data.filter(item => {
        // 1. Filter by Area
        if (selectedAreaKey !== 'all') {
            if (item.estudios_laboratorio.area_key !== selectedAreaKey) return false;
        }
        return true;
    });

    // Group and Filter by Patient Search (Post-aggregation filtering usually cleaner, but let's do pre-filter for speed if needed, or post for better UX)
    // Actually, for search, we usually want to search patient Name or Folio.
    // Since we display by Patient, if the patient name matches, we show the patient (and their relevant studies).

    renderAnaliticaTable(filteredData, searchTerm);
}

function renderAnaliticaTable(data, searchTerm = '') {
    const container = document.getElementById('analiticaListContainer');
    if (!container) return;

    // Group first
    const groupedByPatient = {};
    data.forEach(item => {
        const folio = item.citas?.folio_atencion || 'S/F';
        if (!groupedByPatient[folio]) {
            groupedByPatient[folio] = {
                patientName: item.citas?.paciente_nombre || 'Desconocido',
                citationId: item.cita_id,
                items: []
            };
        }
        groupedByPatient[folio].items.push(item);
    });

    let html = `<table class="appointments-table" style="font-size: 0.9rem;">
            <thead>
                <tr>
                    <th style="width: 15%;">Folio</th>
                    <th style="width: 45%;">Paciente</th>
                    <th style="width: 40%;">Estatus por Área</th>
                </tr>
            </thead>
            <tbody>`;

    let visibleCount = 0;

    Object.keys(groupedByPatient).sort().forEach(folio => {
        const group = groupedByPatient[folio];
        const patientName = group.patientName;

        // SEARCH FILTER: Check if patient name or folio matches search term
        const searchTarget = (patientName + ' ' + folio).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (searchTerm && !searchTarget.includes(searchTerm)) {
            return; // Skip this patient
        }

        visibleCount++;
        const count = group.items.length;

        // Analyze status per area
        const areaStatus = {};
        group.items.forEach(item => {
            const area = item.estudios_laboratorio?.area_formatted || 'General';
            const estado = item.estado_muestra;

            if (!areaStatus[area]) {
                areaStatus[area] = { total: 0, tomadas: 0, procesadas: 0, validadas: 0 };
            }
            areaStatus[area].total++;
            if (estado === 'tomada') areaStatus[area].tomadas++;
            else if (estado === 'procesado') areaStatus[area].procesadas++;
            else if (estado === 'validado') areaStatus[area].validadas++;
        });

        // Generate Badges
        let statusBadgesHtml = '<div style="display: flex; flex-direction: column; gap: 6px;">';
        Object.keys(areaStatus).sort().forEach(area => {
            const stats = areaStatus[area];
            let label = area;
            let dotColor = '#94a3b8';

            if (stats.validadas === stats.total) {
                dotColor = '#22c55e'; // green
                statusBadgesHtml += `<div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #166534; background: #dcfce7; padding: 3px 10px; border-radius: 6px; width: fit-content;"><div style="width: 8px; height: 8px; border-radius: 50%; background: ${dotColor};"></div>${label}</div>`;
            } else if (stats.procesadas > 0 || stats.validadas > 0) {
                dotColor = '#f97316'; // orange
                statusBadgesHtml += `<div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #9a3412; background: #ffedd5; padding: 3px 10px; border-radius: 6px; width: fit-content;"><div style="width: 8px; height: 8px; border-radius: 50%; background: ${dotColor};"></div>${label}</div>`;
            } else {
                dotColor = '#ef4444'; // red
                statusBadgesHtml += `<div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #1e293b; background: #f1f5f9; padding: 3px 10px; border-radius: 6px; width: fit-content;"><div style="width: 8px; height: 8px; border-radius: 50%; background: ${dotColor};"></div>${label}</div>`;
            }
        });
        statusBadgesHtml += '</div>';

        const clickAction = `onclick="abrirCapturaResultados('${group.citationId}', '${patientName}', '${folio}')"`;

        html += `<tr ${clickAction} style="cursor: pointer; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='transparent'">
            <td>
                <span style="font-family: monospace; font-weight: 600; background: #f0fdfa; padding: 6px 10px; border-radius: 6px; color: #0f766e; font-size: 0.95rem;">${folio}</span>
            </td>
            <td>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 600; color: #0f172a; font-size: 1rem; text-decoration: underline; text-decoration-color: transparent; transition: text-decoration-color 0.2s;" onmouseover="this.style.textDecorationColor='#0f172a'" onmouseout="this.style.textDecorationColor='transparent'">${patientName}</span>
                     <span style="font-size: 0.8rem; color: #64748b;">${count} estudio(s) totales</span>
                </div>
            </td>
            <td>
                ${statusBadgesHtml}
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;

    if (visibleCount === 0) {
        html = `<div style="text-align: center; padding: 3rem; color: #64748b;">
            <p>No se encontraron resultados con los filtros actuales.</p>
        </div>`;
    }

    container.innerHTML = html;
}

// Placeholder for new detailed view function
// --- CAPTURA DE RESULTADOS LOGIC ---

let currentCitaIdForCapture = null;
let currentEstudiosList = []; // To store data for saving

function abrirCapturaResultados(citaId, nombrePaciente, folio) {
    loadDetalleCaptura(citaId, nombrePaciente, folio);
}

async function loadDetalleCaptura(citaId, nombrePaciente, folio) {
    currentCitaIdForCapture = citaId;

    // Switch Views
    const viewList = document.getElementById('viewProcesoAnalitico');
    const viewCapture = document.getElementById('viewCapturaResultados');

    if (viewList) viewList.style.display = 'none';
    if (viewCapture) viewCapture.style.display = 'block';

    // Update Header
    const headerInfo = document.getElementById('capturaPacienteInfo');
    if (headerInfo) {
        headerInfo.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:4px;">
                <span style="font-size: 1.5rem; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">${nombrePaciente}</span>
                <span style="font-size: 0.9rem; color: #64748b; font-weight: 500;">Folio Atención: <span style="font-family:'Consolas', monospace; color:#0f766e; background:#e6fffa; padding: 2px 6px; border-radius: 4px; border: 1px solid #ccfbf1;">${folio || 'S/N'}</span></span>
            </div>
        `;
    }

    const container = document.getElementById('capturaFormContainer');
    if (container) container.innerHTML = '<div style="padding:4rem; text-align:center; color:#64748b;">Cargando estudios y formatos...</div>';

    try {
        // Fetch studies with their definitions
        const { data: estudios, error } = await supabaseClient
            .from('citas_estudios')
            .select(`
                id,
                estado_muestra,
                resultados,
                estudios_laboratorio (
                    id,
                    nombre,
                    area,
                    codigo,
                    unidades,
                    referencia
                )
            `)
            .eq('cita_id', citaId);

        if (error) throw error;

        currentEstudiosList = estudios;
        renderCapturaForm(estudios);

    } catch (err) {
        console.error("Error loading capture:", err);
        showErrorModal("Error al Cargar", `No se pudieron cargar los estudios. \nDetalle técnico: ${err.message || JSON.stringify(err)}`);
        cerrarCapturaResultados();
    }
}

function cerrarCapturaResultados() {
    document.getElementById('viewCapturaResultados').style.display = 'none';
    document.getElementById('viewProcesoAnalitico').style.display = 'block';
    currentCitaIdForCapture = null;
    currentEstudiosList = [];
    loadFaseAnalitica(); // Refresh list
}

function normalizeAreaName(area) {
    if (!area) return 'General';
    const lower = area.toLowerCase().trim();
    if (lower.includes('quimica') || lower.includes('sanguinea')) return 'Química Clínica';
    if (lower.includes('hemato')) return 'Hematología';
    if (lower.includes('coagula')) return 'Coagulación';
    if (lower.includes('inmuno')) return 'Inmunología';
    if (lower.includes('micro')) return 'Microbiología';
    if (lower.includes('parasito')) return 'Parasitología';
    if (lower.includes('uro')) return 'Uroanálisis';
    return area.charAt(0).toUpperCase() + area.slice(1);
}

function renderCapturaForm(estudios) {
    const container = document.getElementById('capturaFormContainer');
    if (!container) return;

    if (estudios.length === 0) {
        container.innerHTML = '<div style="padding:2rem; text-align:center;">No hay estudios asignados a esta cita.</div>';
        return;
    }

    // Group by Area
    const groups = {};
    estudios.forEach(item => {
        const area = normalizeAreaName(item.estudios_laboratorio?.area);
        if (!groups[area]) groups[area] = [];
        groups[area].push(item);
    });

    let html = '';

    // Order areas priority
    const priority = ['Hematología', 'Química Clínica', 'Coagulación', 'Inmunología', 'Uroanálisis'];
    const sortedAreas = Object.keys(groups).sort((a, b) => {
        const idxA = priority.indexOf(a);
        const idxB = priority.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    // --- TEMPLATE MATCHING LOGIC ---
    sortedAreas.forEach(area => {
        const areaStudies = groups[area];

        // Contenedor del Área
        html += `
            <div style="margin-bottom: 2.5rem; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="background: #0f172a; padding: 0.8rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-size: 1.1rem; color: white; font-family:'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.05em;">${area}</h3>
                    <span style="font-size:0.75rem; background:rgba(255,255,255,0.1); color:white; padding:2px 10px; border-radius:12px;">${areaStudies.length} parámetros</span>
                </div>
                <div style="padding: 0;">
        `;

        // --- SPECIFIC TEMPLATE: QUÍMICA CLÍNICA ---
        if (area === 'Química Clínica' || area === 'Quimica Sanguinea') {
            html += `
                <table style="width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif;">
                    <thead>
                        <tr style="background: #f1f5f9; border-bottom: 2px solid #e2e8f0;">
                            <th style="text-align: left; padding: 12px 20px; color: #334155; font-weight: 700; font-size: 0.9rem;">ESTUDIO</th>
                            <th style="text-align: center; padding: 12px; color: #334155; font-weight: 700; font-size: 0.9rem; width: 15%;">RESULTADO</th>
                            <th style="text-align: center; padding: 12px; color: #334155; font-weight: 700; font-size: 0.9rem; width: 15%;">UNIDADES</th>
                            <th style="text-align: left; padding: 12px 20px; color: #334155; font-weight: 700; font-size: 0.9rem; width: 35%;">VALORES DE REFERENCIA</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            areaStudies.forEach((item, index) => {
                const estudio = item.estudios_laboratorio;
                const prevResult = item.resultados || {};
                const valor = prevResult.valor || '';
                const referencia = estudio.referencia || ''; // Use DB ref
                const unidades = estudio.unidades || '';
                const obs = prevResult.observaciones || '';
                const bg = index % 2 === 0 ? 'white' : '#f8fafc'; // Zebra striping

                html += `
                    <tr style="background: ${bg}; border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px 16px; font-weight: 500; color: #334155; vertical-align: top;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span>${item.estudios_laboratorio.nombre}</span>
                                <button onclick="toggleNoteInput('${item.id}')" title="Agregar nota" 
                                    style="background:none; border:none; cursor:pointer; color:#94a3b8; transition:color 0.2s;"
                                    onmouseover="this.style.color='#64748b'" onmouseout="this.style.color='#94a3b8'">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                            </div>
                            <input type="text" id="res_obs_${item.id}" value="${obs}" 
                                style="display:${obs ? 'block' : 'none'}; width:100%; margin-top:6px; padding:4px 8px; font-size:0.75rem; border:1px solid #e2e8f0; border-radius:4px; background:#f8fafc; color:#475569;"
                                placeholder="Nota / Observación...">
                        </td>
                        <td style="padding: 8px; text-align: center; position: relative; vertical-align: top;">
                            <div style="display:flex; align-items:center; justify-content:center; gap:8px;">
                                <input type="number" id="res_valor_${item.id}" value="${valor}" 
                                    placeholder="0.00" class="result-input" data-index="${index}"
                                    onkeydown="if(event.key==='Enter'){event.preventDefault(); focusNextInput(this);}"
                                    oninput="checkResult(this, '${item.id}')"
                                    style="width: 100px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 700; text-align: center; color: #0f172a; font-size: 1rem;">
                                <span id="res_alert_${item.id}" style="width: 20px; font-weight:900; font-size:1.2rem;"></span>
                            </div>
                        </td>
                        <td style="padding: 12px; text-align: center; color: #64748b; font-size: 0.9rem; vertical-align: top;">
                            ${unidades}
                        </td>
                        <td style="padding: 8px 20px; vertical-align: top;">
                            <!-- Read-only Reference -->
                            <div style="font-size: 0.85rem; color: #475569; white-space: pre-wrap; line-height: 1.4;">${referencia}</div>
                            <input type="hidden" id="res_ref_${item.id}" value="${referencia}">
                        </td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
                <div style="padding: 12px 20px; background: #fff; border-top: 1px solid #e2e8f0; font-size: 0.85rem; color: #64748b; font-style: italic;">
                    Método: Espectrofotometría. * VALORES FUERA DE REFERENCIA SE MARCARÁN AUTOMÁTICAMENTE (TODO)
                </div>
            `;

        } else {
            // --- GENERIC TEMPLATE FOR OTHER AREAS ---
            html += `<div style="padding: 1rem;">`;
            areaStudies.forEach(item => {
                const estudio = item.estudios_laboratorio;
                const prevResult = item.resultados || {};
                const valor = prevResult.valor || '';
                const obs = prevResult.observaciones || '';
                const unidades = prevResult.unidades || estudio.unidades || '';
                const referencia = prevResult.referencia || estudio.referencia || '';

                html += `
                    <div class="estudio-row" style="display: grid; grid-template-columns: 2fr 1fr 1fr 2fr; gap: 1rem; align-items: start; padding: 1rem 0; border-bottom: 1px dashed #f1f5f9;">
                        <div>
                            <div style="font-weight: 600; color: #0f172a;">${estudio.nombre}</div>
                            <div style="font-size: 0.8rem; color: #94a3b8;">${estudio.codigo || ''}</div>
                        </div>
                        <div>
                            <label style="font-size:0.75rem; color:#64748b; margin-bottom:2px; display:block;">Resultado</label>
                            <div style="display:flex; align-items:center;">
                                <input type="text" id="res_valor_${item.id}" value="${valor}" 
                                    placeholder="Ingrese valor"
                                    style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-weight:600; color:#0f172a;">
                                <span style="margin-left:8px; font-size:0.8rem; color:#64748b; white-space:nowrap;">${unidades}</span>
                            </div>
                        </div>
                        <div>
                            <label style="font-size:0.75rem; color:#64748b; margin-bottom:2px; display:block;">Referencia</label>
                            <input type="text" id="res_ref_${item.id}" value="${referencia}" readonly
                                style="width:100%; padding:6px; border:none; background:transparent; font-size:0.85rem; color:#64748b; font-weight:500;">
                        </div>
                        <div>
                            <label style="font-size:0.75rem; color:#64748b; margin-bottom:2px; display:block;">Observaciones</label>
                            <input type="text" id="res_obs_${item.id}" value="${obs}" 
                                placeholder="..."
                                style="width:100%; padding:6px; border:1px solid #e2e8f0; border-radius:6px; font-size:0.9rem;">
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Initial validation pass
    setTimeout(() => {
        const inputs = container.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            const id = input.id.replace('res_valor_', '');
            if (input.value) checkResult(input, id);
        });
    }, 100);
}

// --- VALIDATION & NAVIGATION HELPERS ---

function focusNextInput(currentInput) {
    const inputs = Array.from(document.querySelectorAll('.result-input'));
    const index = inputs.indexOf(currentInput);
    if (index > -1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
    }
}

function checkResult(input, itemId) {
    const val = parseFloat(input.value);
    const refInput = document.getElementById(`res_ref_${itemId}`);
    const alertSpan = document.getElementById(`res_alert_${itemId}`);
    const refText = refInput ? refInput.value : '';

    // Reset styles
    input.style.borderColor = '#cbd5e1';
    input.style.backgroundColor = 'white';
    input.style.color = '#0f172a';
    if (alertSpan) alertSpan.innerHTML = '';

    if (isNaN(val) || !refText) return;

    // Parser Logic for "Min - Max"
    // Regex matches numbers possibly with decimals
    // Try to match "num - num" pattern
    const rangeMatch = refText.match(/([0-9.]+)\s*-\s*([0-9.]+)/);

    if (rangeMatch) {
        const min = parseFloat(rangeMatch[1]);
        const max = parseFloat(rangeMatch[2]);

        if (val < min) {
            // LOW -> Yellow
            input.style.borderColor = '#eab308'; // yellow-500
            input.style.backgroundColor = '#fefce8'; // yellow-50
            input.style.color = '#ca8a04'; // yellow-700
            if (alertSpan) {
                alertSpan.innerHTML = '↓';
                alertSpan.style.color = '#eab308';
            }
        } else if (val > max) {
            // HIGH -> Red
            input.style.borderColor = '#ef4444'; // red-500
            input.style.backgroundColor = '#fef2f2'; // red-50
            input.style.color = '#dc2626'; // red-600
            if (alertSpan) {
                alertSpan.innerHTML = '↑';
                alertSpan.style.color = '#ef4444';
            }
        }
    }

    // Additional logic for "Menor a 200" or similar
    if (refText.toUpperCase().includes('MENOR A') || refText.toUpperCase().includes('<')) {
        const numMatch = refText.match(/(?:MENOR A|<)\s*([0-9.]+)/i);
        if (numMatch) {
            const max = parseFloat(numMatch[1]);
            if (val > max) {
                input.style.borderColor = '#ef4444';
                input.style.backgroundColor = '#fef2f2';
                input.style.color = '#dc2626';
                if (alertSpan) { alertSpan.innerHTML = '↑'; alertSpan.style.color = '#ef4444'; }
            }
        }
    }
}

function toggleNoteInput(id) {
    const input = document.getElementById(`res_obs_${id}`);
    if (input) {
        if (input.style.display === 'none') {
            input.style.display = 'block';
            input.focus();
        } else {
            // Only hide if empty, otherwise keep showing
            if (!input.value) input.style.display = 'none';
        }
    }
}

// --- SAVING AND VALIDATION LOGIC ---

let temporaryUpdatesToSave = []; // Store updates temporarily for modal

async function validarYPublicarResultados() {
    if (!currentCitaIdForCapture || currentEstudiosList.length === 0) return;

    // Collect Data
    const updates = [];
    currentEstudiosList.forEach(item => {
        const valInput = document.getElementById(`res_valor_${item.id}`);
        const refInput = document.getElementById(`res_ref_${item.id}`);
        const obsInput = document.getElementById(`res_obs_${item.id}`);

        if (valInput) {
            const resultadosData = {
                valor: valInput.value,
                referencia: refInput ? refInput.value : '',
                observaciones: obsInput ? obsInput.value : '',
                unidades: item.estudios_laboratorio.unidades,
                fecha_captura: new Date().toISOString()
            };

            // Only update if there is a value or it was previously processed or has a note
            if (valInput.value.trim() !== '' || (obsInput && obsInput.value.trim() !== '') || item.estado_muestra === 'procesado') {
                updates.push({
                    id: item.id,
                    resultados: resultadosData,
                    estado_muestra: 'validado'
                });
            }
        }
    });

    if (updates.length === 0) {
        showToast('No hay resultados para guardar', 'info');
        return;
    }

    // Open Confirmation Modal
    temporaryUpdatesToSave = updates;
    const countEl = document.getElementById('confResultadosCount');
    const modal = document.getElementById('modalConfirmarResultados');

    if (countEl) countEl.textContent = `${updates.length} resultados`;
    if (modal) modal.classList.add('active');
}

function cerrarModalConfirmarResultados() {
    const modal = document.getElementById('modalConfirmarResultados');
    if (modal) modal.classList.remove('active');
    temporaryUpdatesToSave = [];
}

async function ejecutarGuardadoResultados() {
    const updates = temporaryUpdatesToSave;
    if (!updates || updates.length === 0) {
        cerrarModalConfirmarResultados();
        return;
    }

    const btn = document.getElementById('btnConfirmarResultados');
    const originalText = btn ? btn.innerHTML : 'Confirmar y Guardar';
    if (btn) {
        btn.innerHTML = '<div class="loading-spinner"></div> Guardando...';
        btn.disabled = true;
    }

    try {
        let errorCount = 0;
        for (const update of updates) {
            const { error } = await supabaseClient
                .from('citas_estudios')
                .update({
                    resultados: update.resultados,
                    estado_muestra: update.estado_muestra
                })
                .eq('id', update.id);
            if (error) errorCount++;
        }

        if (errorCount > 0) {
            showErrorModal("Advertencia", `Se guardaron algunos resultados, pero hubo ${errorCount} errores.`);
        } else {
            showSuccessModal("Resultados Publicados", "Los resultados han sido validados correctamente.");
            cerrarModalConfirmarResultados();
            cerrarCapturaResultados(); // Return to list
            loadFaseAnalitica(); // Refresh list
        }

    } catch (err) {
        console.error('Error saving results:', err);
        showToast('Error al guardar resultados: ' + err.message, 'error');
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

async function guardarResultadosBorrador() {
    // Similar to Validar but keeps status as 'procesado' or just saves data
    if (!currentCitaIdForCapture || currentEstudiosList.length === 0) return;

    const updates = [];
    currentEstudiosList.forEach(item => {
        const valInput = document.getElementById(`res_valor_${item.id}`);
        const refInput = document.getElementById(`res_ref_${item.id}`);
        const obsInput = document.getElementById(`res_obs_${item.id}`);

        if (valInput) {
            const resultadosData = {
                valor: valInput.value,
                referencia: refInput ? refInput.value : '',
                observaciones: obsInput ? obsInput.value : '',
                unidades: item.estudios_laboratorio.unidades,
                fecha_captura: new Date().toISOString(),
                es_borrador: true
            };

            updates.push({
                id: item.id,
                resultados: resultadosData
                // Do NOT change status to validated yet
            });
        }
    });

    if (updates.length === 0) return;

    try {
        let errorCount = 0;
        for (const update of updates) {
            const { error } = await supabaseClient
                .from('citas_estudios')
                .update({ resultados: update.resultados })
                .eq('id', update.id);
            if (error) errorCount++;
        }

        if (errorCount === 0) {
            // Toast notification ideally
            alert("Borrador guardado correctamente.");
        } else {
            alert("Error al guardar borrador.");
        }

    } catch (err) {
        console.error("Error saving draft:", err);
        alert("Error al guardar borrador.");
    }
}

// Auto-load checks
document.addEventListener('DOMContentLoaded', () => {
    const checkSection = () => {
        const section = document.getElementById('viewProcesoAnalitico');
        if (section && section.style.display !== 'none') {
            loadFaseAnalitica();
        }
    };
    setTimeout(checkSection, 500);
});

async function loadPosAnalitica() {
    const listBody = document.getElementById('posAnaliticaTableBody');
    const noMsg = document.getElementById('noPosAnaliticaMessage');
    const searchInput = document.getElementById('searchPosAnalitica');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    if (!listBody) return;
    listBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:#64748b;">Cargando resultados listos...</td></tr>';

    try {
        // Query ALL cites with studies (safer client-side filtering)
        const { data: citations, error } = await supabaseClient
            .from('citas')
            .select(`
                *,
                citas_estudios (
                    id,
                    estudio_id,
                    estado_muestra,
                    estado_resultado,
                    estudios_laboratorio (nombre, area)
                )
            `)
            .order('fecha_hora', { ascending: false });

        if (error) throw error;

        // Filter in JS to find any citation with at least one 'validado' study
        // Also handle case-insensitivity
        const filtered = citations.filter(c => {
            const hasValidated = c.citas_estudios && c.citas_estudios.some(s =>
                (s.estado_muestra || '').toLowerCase() === 'validado'
            );

            const matchesSearch = (c.paciente_nombre || '').toLowerCase().includes(searchTerm) ||
                (c.folio || '').toLowerCase().includes(searchTerm);

            return hasValidated && matchesSearch;
        });

        if (filtered.length === 0) {
            listBody.innerHTML = '';
            if (noMsg) noMsg.style.display = 'block';
            return;
        }

        if (noMsg) noMsg.style.display = 'none';

        listBody.innerHTML = filtered.map(cita => {
            const fecha = new Date(cita.fecha_hora);
            const fechaStr = fecha.toLocaleDateString();
            const horaStr = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const validatedStudies = cita.citas_estudios.filter(ce => (ce.estado_muestra || '').toLowerCase() === 'validado');

            // Group by Area
            const studiesByArea = {};
            validatedStudies.forEach(s => {
                const area = s.estudios_laboratorio?.area || 'General';
                if (!studiesByArea[area]) studiesByArea[area] = [];
                studiesByArea[area].push(s.estudios_laboratorio?.nombre || 'Estudio');
            });

            let studiesHtml = '';
            for (const [area, studies] of Object.entries(studiesByArea)) {
                studiesHtml += `
                    <div style="margin-bottom:6px; line-height:1.2;">
                        <div style="font-size:0.7rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">${area}</div>
                        <div style="font-size:0.85rem; color:#334155;">${studies.join(', ')}</div>
                    </div>
                `;
            }

            return `
                <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                    <td style="padding: 16px; vertical-align: top;">
                        <div style="font-family:'Consolas', monospace; font-size:0.9rem; font-weight:700; color:#0f766e; background:#ccfbf1; padding:4px 8px; border-radius:6px; display:inline-block; border:1px solid #99f6e4;">
                            ${cita.folio || 'S/N'}
                        </div>
                    </td>
                    <td style="padding: 16px; vertical-align: top;">
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <div style="font-weight: 700; color: #0f172a; font-size:0.95rem;">${cita.paciente_nombre}</div>
                            <div style="display:flex; gap:12px; font-size:0.75rem; color:#64748b; align-items:center;">
                                ${cita.paciente_telefono ? `
                                    <span style="display:flex; align-items:center; gap:4px;">
                                        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        ${cita.paciente_telefono}
                                    </span>
                                ` : ''}
                                <span style="display:flex; align-items:center; gap:4px;">
                                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    ${fechaStr} ${horaStr}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 16px; vertical-align: top;">
                        ${studiesHtml}
                    </td>
                    <td style="padding: 16px; vertical-align: top;">
                         <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
                             <span style="background:#dbeafe; color:#1e40af; padding:4px 10px; border-radius:20px; font-size:0.75rem; font-weight:700; border:1px solid #bfdbfe; display:inline-flex; align-items:center; gap:6px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                                <span style="width:8px; height:8px; background:#2563eb; border-radius:50%; box-shadow:0 0 0 2px #dbeafe;"></span>
                                Listo para Impresión
                             </span>
                             <span style="font-size:0.7rem; color:#94a3b8; margin-left:8px;">Resultados Validados</span>
                         </div>
                    </td>
                    <td style="padding: 16px; vertical-align: top;">
                        <div style="display:flex; gap:8px;">
                            <button onclick="previewReport('${cita.id}')" title="Imprimir Reporte" class="btn-hover-effect"
                                style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; background: white; border: 1px solid #cbd5e1; border-radius: 8px; cursor: pointer; color: #334155; transition:all 0.2s; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                            </button>
                            <button onclick="sendWhatsApp('${cita.id}', '${cita.paciente_telefono || ''}', '${cita.folio || ''}')" title="Enviar por WhatsApp" class="btn-hover-effect"
                                style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; background: white; border: 1px solid #cbd5e1; border-radius: 8px; cursor: pointer; color: #10b981; transition:all 0.2s; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error("Error loading Pos-Analitica:", err);
        listBody.innerHTML = '<tr><td colspan="5" style="color:#ef4444; text-align:center; padding:2rem;">Error al cargar resultados listos.</td></tr>';
    }
}

function previewReport(id) {
    if (!id) return;
    const url = `print_report.html?id=${id}`;
    window.open(url, '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
}

function sendWhatsApp(id, phone, folio) {
    if (!phone) {
        alert('Este paciente no tiene un número de teléfono registrado.');
        return;
    }

    // Clean phone number
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
        cleanPhone = '52' + cleanPhone; // Assume MX if 10 digits
    }

    const message = `Hola, le informamos que sus resultados de laboratorio (Folio: ${folio}) ya están listos. Puede pasar a recogerlos. Gracia por su preferencia.`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
}
