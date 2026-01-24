// dashboard-analitica-v2.js - Fase Analítica con tabla y agrupación por categoría

let analiticaData = [];
let currentCategoryFilter = 'all';
let pacientesParaEtiquetas = {}; // Mapa para guardar datos de pacientes para etiquetas

// Colores del semáforo
const estadoColores = {
    'pendiente': '#ef4444',    // Rojo
    'tomado': '#f97316',       // Naranja
    'en_area': '#eab308',      // Amarillo
    'liberada': '#22c55e'      // Verde
};

const estadoLabels = {
    'pendiente': 'Pendiente',
    'tomado': 'Tomado',
    'en_area': 'En Área',
    'liberada': 'Liberada'
};

async function loadFaseAnalitica() {
    const tbody = document.getElementById('analiticaTableBody');
    const countEl = document.getElementById('analiticaCount');
    const dateEl = document.getElementById('analiticaDate');
    const selectCategoria = document.getElementById('selectCategoria');
    const emptyEl = document.getElementById('analiticaEmpty');

    // Inicializar fecha si está vacía
    if (dateEl && !dateEl.value) {
        const now = new Date();
        const localISO = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0');
        dateEl.value = localISO;
    }

    const selectedDate = dateEl ? dateEl.value : new Date().toISOString().split('T')[0];

    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">Cargando pacientes...</td></tr>';
    if (emptyEl) emptyEl.style.display = 'none';

    try {
        // Obtener citas con muestras tomadas
        const { data: citas, error } = await supabaseClient
            .from('citas')
            .select('*')
            .gte('fecha_hora', selectedDate + 'T00:00:00')
            .lte('fecha_hora', selectedDate + 'T23:59:59')
            .in('estado', ['muestra_parcial', 'en_proceso', 'completada'])
            .order('folio_atencion', { ascending: true });

        if (error) throw error;

        if (!citas || citas.length === 0) {
            if (tbody) tbody.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            if (countEl) countEl.textContent = '0';
            if (selectCategoria) {
                selectCategoria.innerHTML = '<option value="all">Todas las categorías</option>';
            }
            return;
        }

        // Obtener estudios de cada cita
        const citaIds = citas.map(c => c.id);
        const { data: citasEstudios, error: estError } = await supabaseClient
            .from('citas_estudios')
            .select(`
                cita_id,
                estudio_id,
                estado_muestra,
                estudios_laboratorio (id, nombre, codigo, categoria, area, tubo_recipiente)
            `)
            .in('cita_id', citaIds);

        // Función para normalizar nombres de área (quitar acentos, capitalizar)
        function normalizarArea(area) {
            if (!area) return 'SIN AREA';
            return area
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // quitar acentos
                .toUpperCase()
                .trim();
        }

        // Agrupar por FOLIO (el identificador único de la atención)
        const pacientesMap = {};
        const categoriasSet = new Set();

        citas.forEach(cita => {
            // Usar folio como clave para agrupar
            const folioKey = cita.folio_atencion || cita.folio_venta || cita.id;

            if (!pacientesMap[folioKey]) {
                pacientesMap[folioKey] = {
                    id: cita.id,
                    citaIds: [cita.id],
                    folio: folioKey,
                    nombre: cita.paciente_nombre,
                    telefono: cita.paciente_telefono,
                    fechaNacimiento: cita.fecha_nacimiento,
                    estudios: [],
                    categorias: {}
                };
            } else {
                // Si el mismo folio tiene otra cita, agregar ID
                pacientesMap[folioKey].citaIds.push(cita.id);
            }
        });

        // Agregar estudios a cada paciente agrupados por área
        if (citasEstudios) {
            citasEstudios.forEach(ce => {
                if (ce.estudios_laboratorio) {
                    // Buscar a qué paciente pertenece esta cita
                    const pacienteEntry = Object.values(pacientesMap).find(p => p.citaIds.includes(ce.cita_id));

                    if (pacienteEntry) {
                        // Normalizar nombre del área
                        const areaNorm = normalizarArea(ce.estudios_laboratorio.area || ce.estudios_laboratorio.categoria);
                        categoriasSet.add(areaNorm);

                        if (!pacienteEntry.categorias[areaNorm]) {
                            pacienteEntry.categorias[areaNorm] = [];
                        }

                        // Evitar duplicados de estudios
                        const yaExiste = pacienteEntry.categorias[areaNorm].some(e => e.id === ce.estudios_laboratorio.id);
                        if (!yaExiste) {
                            pacienteEntry.categorias[areaNorm].push({
                                ...ce.estudios_laboratorio,
                                citaId: ce.cita_id,
                                estado: ce.estado_muestra || 'pendiente',
                                tubo_recipiente: ce.estudios_laboratorio.tubo_recipiente
                            });

                            pacienteEntry.estudios.push({
                                ...ce.estudios_laboratorio,
                                citaId: ce.cita_id,
                                estado: ce.estado_muestra || 'pendiente',
                                tubo_recipiente: ce.estudios_laboratorio.tubo_recipiente
                            });
                        }
                    }
                }
            });
        }

        analiticaData = Object.values(pacientesMap);
        const categorias = Array.from(categoriasSet).sort();

        // Actualizar contador
        if (countEl) countEl.textContent = analiticaData.length;

        // Llenar select de áreas (Siempre mostrar todas)
        if (selectCategoria) {
            // Guardar selección actual
            const prevSelection = selectCategoria.value;

            // Obtener todas las categorías/áreas distintias de la BD
            const { data: catData } = await supabaseClient
                .from('estudios_laboratorio')
                .select('categoria, area')
                .eq('activo', true);

            const todasCategorias = new Set();
            if (catData) {
                catData.forEach(item => {
                    // Priorizar Área, luego Categoría
                    const cat = item.area || item.categoria;
                    if (cat) todasCategorias.add(normalizarArea(cat));
                });
            }

            // También incluir las que vienen en las citas actuales (por si acaso hay discrepancias)
            Array.from(categoriasSet).forEach(c => todasCategorias.add(c));

            const categoriasOrdenadas = Array.from(todasCategorias).sort();

            selectCategoria.innerHTML = '<option value="all">Todas las áreas</option>';
            categoriasOrdenadas.forEach(cat => {
                const selected = (prevSelection === cat || currentCategoryFilter === cat) ? 'selected' : '';
                selectCategoria.innerHTML += `<option value="${cat}" ${selected}>${cat}</option>`;
            });
        }

        // Renderizar tabla
        renderAnaliticaTable(analiticaData, tbody, currentCategoryFilter);

    } catch (err) {
        console.error('Error loading fase analitica:', err);
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #ef4444;">Error: ${err.message}</td></tr>`;
    }
}

function filterByCategory(cat) {
    currentCategoryFilter = cat;
    const tbody = document.getElementById('analiticaTableBody');
    renderAnaliticaTable(analiticaData, tbody, cat);
}

function renderAnaliticaTable(pacientes, tbody, categoryFilter = 'all') {
    if (!tbody) return;

    const emptyEl = document.getElementById('analiticaEmpty');

    // Filtrar pacientes si hay filtro de categoría
    let pacientesFiltrados = pacientes;
    if (categoryFilter !== 'all') {
        pacientesFiltrados = pacientes.filter(p => p.categorias[categoryFilter] && p.categorias[categoryFilter].length > 0);
    }

    if (pacientesFiltrados.length === 0) {
        tbody.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    let html = '';

    pacientesFiltrados.forEach(paciente => {
        // Guardar datos del paciente para modal de etiquetas
        pacientesParaEtiquetas[paciente.folio] = paciente;

        // Formatear fecha de nacimiento
        const fechaNac = paciente.fechaNacimiento
            ? new Date(paciente.fechaNacimiento).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : '';

        // Determinar qué categorías mostrar
        const categoriasAMostrar = categoryFilter === 'all'
            ? Object.keys(paciente.categorias).sort()
            : [categoryFilter];

        // Generar HTML de áreas con semáforo (solo nombre del área, sin estudios individuales)
        let estudiosHtml = '<div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">';

        categoriasAMostrar.forEach(cat => {
            const estudios = paciente.categorias[cat];
            if (!estudios || estudios.length === 0) return;

            // Calcular estado general del área (el peor estado de sus estudios)
            const estados = estudios.map(e => e.estado);
            let estadoArea = 'liberada';

            // Orden de prioridad (Semaforización): 
            // 1. Rojo (pendiente)
            // 2. Naranja (tomado/tomada)
            // 3. Amarillo (en_area)
            // 4. Verde (liberada)
            if (estados.some(e => e === 'pendiente')) {
                estadoArea = 'pendiente';
            } else if (estados.some(e => e === 'tomado' || e === 'tomada')) {
                estadoArea = 'tomado';
            } else if (estados.some(e => e === 'en_area')) {
                estadoArea = 'en_area';
            }

            const color = estadoColores[estadoArea];
            const totalEstudios = estudios.length;

            estudiosHtml += `
                <span style="display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; border: 1px solid #e2e8f0; background: white;"
                    title="${cat}: ${totalEstudios} estudio(s) - ${estadoLabels[estadoArea]}">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: ${color};"></span>
                    <span style="font-weight: 500; color: #334155;">${cat}</span>
                </span>
            `;
        });

        estudiosHtml += '</div>';

        html += `
            <tr>
                <td style="font-family: 'Consolas', 'Courier New', monospace; font-weight: 700; color: #000; font-size: 0.85rem;">${paciente.folio || 'N/A'}</td>
                <td>
                    <div style="font-weight: 500; color: #1e293b;">
                        <a href="resultados.html?id=${paciente.citaIds[0]}" target="_self" style="text-decoration: none; color: inherit; cursor: pointer;" onmouseover="this.style.color='#0d9488'" onmouseout="this.style.color='inherit'">
                            ${paciente.nombre}
                        </a>
                        ${paciente.paciente_sexo ? `<span style="font-size: 0.75rem; color: #64748b; font-weight: normal; margin-left: 5px;">(${paciente.paciente_sexo.charAt(0)})</span>` : ''}
                    </div>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 3px; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                        ${fechaNac ? `<span style="display: inline-flex; align-items: center; gap: 3px;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${fechaNac}</span>` : ''}
                        ${paciente.telefono ? `<span style="display: inline-flex; align-items: center; gap: 3px;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${paciente.telefono}</span>` : ''}
                    </div>
                </td>
                <td>${estudiosHtml}</td>
                <td>
                    <div style="display: flex; gap: 0.3rem; flex-wrap: wrap;">
                        <button onclick="abrirModalEtiquetasPorFolio('${paciente.folio}')" title="Imprimir etiquetas"
                            style="background: #fef3c7; border: none; padding: 0.4rem 0.6rem; border-radius: 4px; font-size: 0.7rem; color: #b45309; cursor: pointer; display: flex; align-items: center; gap: 0.2rem;">
                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2">
                                <path d="M6 9V2h12v7"></path>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                            Etiquetas
                        </button>
                        <button onclick="procesarTodosPaciente('${paciente.citaIds[0]}')" title="Liberar todos"
                            style="background: #dbeafe; border: none; padding: 0.4rem 0.6rem; border-radius: 4px; font-size: 0.7rem; color: #1d4ed8; cursor: pointer; display: flex; align-items: center; gap: 0.2rem;">
                            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2">
                                <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                            Liberar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Función para cambiar estado de un estudio individual
async function cambiarEstadoEstudio(citaId, estudioId) {
    const estados = ['pendiente', 'tomado', 'en_area', 'liberada'];

    // Obtener estado actual
    const { data, error } = await supabaseClient
        .from('citas_estudios')
        .select('estado_muestra')
        .eq('cita_id', citaId)
        .eq('estudio_id', estudioId)
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    const estadoActual = data?.estado_muestra || 'pendiente';
    const indexActual = estados.indexOf(estadoActual);
    const nuevoEstado = estados[(indexActual + 1) % estados.length];

    // Actualizar en BD
    const { error: updateError } = await supabaseClient
        .from('citas_estudios')
        .update({ estado_muestra: nuevoEstado })
        .eq('cita_id', citaId)
        .eq('estudio_id', estudioId);

    if (updateError) {
        console.error('Error updating:', updateError);
        if (typeof showToast === 'function') showToast('Error al actualizar estado', 'error');
        return;
    }

    if (typeof showToast === 'function') showToast(`Estado: ${estadoLabels[nuevoEstado]}`, 'success');
    loadFaseAnalitica();
}

// Función para procesar todos los estudios de un paciente
async function procesarTodosPaciente(citaId) {
    if (!confirm('¿Marcar todos los estudios de este paciente como "Liberada"?')) return;

    const { error } = await supabaseClient
        .from('citas_estudios')
        .update({ estado_muestra: 'liberada' })
        .eq('cita_id', citaId);

    if (error) {
        console.error('Error:', error);
        if (typeof showToast === 'function') showToast('Error al procesar', 'error');
        return;
    }

    if (typeof showToast === 'function') showToast('Todos los estudios liberados', 'success');
    loadFaseAnalitica();
}

// Función de filtro de búsqueda
function filterAnalitica(searchTerm) {
    const tbody = document.getElementById('analiticaTableBody');
    if (!tbody) return;

    const searchNormalized = normalizarTexto(searchTerm);

    if (!searchTerm || searchTerm.trim() === '') {
        renderAnaliticaTable(analiticaData, tbody, currentCategoryFilter);
        return;
    }

    const pacientesFiltrados = analiticaData.filter(p => {
        const nombreNorm = normalizarTexto(p.nombre);
        const folioNorm = normalizarTexto(String(p.folio || ''));
        const estudiosNorm = p.estudios.map(e => normalizarTexto(e.nombre + ' ' + (e.codigo || ''))).join(' ');

        return nombreNorm.includes(searchNormalized) ||
            folioNorm.includes(searchNormalized) ||
            estudiosNorm.includes(searchNormalized);
    });

    renderAnaliticaTable(pacientesFiltrados, tbody, currentCategoryFilter);

    // Actualizar contador
    const countEl = document.getElementById('analiticaCount');
    if (countEl) {
        countEl.textContent = `${pacientesFiltrados.length}/${analiticaData.length}`;
    }
}

// ============================================
// MODAL DE ETIQUETAS INDIVIDUALES
// ============================================

let etiquetasSeleccionadas = [];
let datosEtiquetaActual = { folio: '', nombre: '', estudios: [] };

// Función para abrir modal usando folio (obtiene datos del mapa)
function abrirModalEtiquetasPorFolio(folio) {
    const paciente = pacientesParaEtiquetas[folio];
    if (!paciente) {
        console.error('No se encontró paciente con folio:', folio);
        if (typeof showToast === 'function') showToast('Error: Paciente no encontrado', 'error');
        return;
    }
    abrirModalEtiquetasAnalitica(paciente.folio, paciente.nombre, paciente.estudios);
}

// Abrir modal de etiquetas
function abrirModalEtiquetasAnalitica(folio, nombre, estudios) {
    datosEtiquetaActual = { folio, nombre, estudios };
    etiquetasSeleccionadas = [];

    // Crear modal si no existe
    let modal = document.getElementById('modalEtiquetasAnalitica');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalEtiquetasAnalitica';
        document.body.appendChild(modal);
    }

    // Aplicar estilos inline al modal overlay
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 99999;';

    // Generar contenido del modal
    let estudiosHtml = '';
    estudios.forEach((est, idx) => {
        const areaLabel = est.area || est.categoria || 'Sin área';
        estudiosHtml += `
            <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;"
                onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                <input type="checkbox" id="etq_${idx}" value="${idx}" onchange="toggleEtiqueta(${idx})"
                    style="width: 18px; height: 18px; cursor: pointer;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1e293b;">${est.nombre}</div>
                    <div style="font-size: 0.75rem; color: #64748b;">${est.codigo || 'Sin código'} · ${areaLabel}</div>
                </div>
                <button onclick="event.preventDefault(); imprimirEtiquetaIndividual(${idx})" title="Imprimir solo esta"
                    style="background: #0d9488; color: white; border: none; padding: 0.3rem 0.5rem; border-radius: 4px; font-size: 0.7rem; cursor: pointer;">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                </button>
            </label>
        `;
    });

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 550px; width: 95%; background: white; border-radius: 12px; max-height: 90vh; display: flex; flex-direction: column;">
            <div style="padding: 1.5rem; border-bottom: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="background: #fef3c7; padding: 0.75rem; border-radius: 10px;">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="#b45309" fill="none" stroke-width="2">
                            <path d="M6 9V2h12v7"></path>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem; color: #1e293b;">Imprimir Etiquetas</h3>
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #64748b;">${nombre} · Folio: ${folio}</p>
                    </div>
                </div>
            </div>
            
            <div style="padding: 1rem 1.5rem; overflow-y: auto; flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <span style="font-size: 0.85rem; color: #64748b;">${estudios.length} estudio(s) disponible(s)</span>
                    <button onclick="seleccionarTodasEtiquetas()" style="background: #f1f5f9; border: 1px solid #e2e8f0; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; color: #475569; cursor: pointer;">
                        Seleccionar todas
                    </button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${estudiosHtml}
                </div>
            </div>
            
            <div style="padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                <span id="contadorEtiquetas" style="font-size: 0.85rem; color: #64748b;">0 seleccionada(s)</span>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="cerrarModalEtiquetasAnalitica()" style="padding: 0.6rem 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 500; cursor: pointer;">
                        Cerrar
                    </button>
                    <button onclick="imprimirEtiquetasSeleccionadas()" id="btnImprimirSeleccionadas" disabled
                        style="padding: 0.6rem 1.25rem; border-radius: 8px; border: none; background: #0d9488; color: white; font-weight: 500; cursor: pointer; opacity: 0.5;">
                        Imprimir Seleccionadas
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

// Cerrar modal
function cerrarModalEtiquetasAnalitica() {
    const modal = document.getElementById('modalEtiquetasAnalitica');
    if (modal) modal.style.display = 'none';
}

// Toggle selección de etiqueta
function toggleEtiqueta(idx) {
    const checkbox = document.getElementById(`etq_${idx}`);
    if (checkbox.checked) {
        if (!etiquetasSeleccionadas.includes(idx)) etiquetasSeleccionadas.push(idx);
    } else {
        etiquetasSeleccionadas = etiquetasSeleccionadas.filter(i => i !== idx);
    }
    actualizarContadorEtiquetas();
}

// Seleccionar todas
function seleccionarTodasEtiquetas() {
    const checkboxes = document.querySelectorAll('[id^="etq_"]');
    const todasSeleccionadas = etiquetasSeleccionadas.length === checkboxes.length;

    checkboxes.forEach((cb, idx) => {
        cb.checked = !todasSeleccionadas;
    });

    if (todasSeleccionadas) {
        etiquetasSeleccionadas = [];
    } else {
        etiquetasSeleccionadas = Array.from({ length: checkboxes.length }, (_, i) => i);
    }
    actualizarContadorEtiquetas();
}

// Actualizar contador
function actualizarContadorEtiquetas() {
    const contador = document.getElementById('contadorEtiquetas');
    const btn = document.getElementById('btnImprimirSeleccionadas');
    if (contador) contador.textContent = `${etiquetasSeleccionadas.length} seleccionada(s)`;
    if (btn) {
        btn.disabled = etiquetasSeleccionadas.length === 0;
        btn.style.opacity = etiquetasSeleccionadas.length === 0 ? '0.5' : '1';
    }
}

// Imprimir etiqueta individual
function imprimirEtiquetaIndividual(idx) {
    const estudio = datosEtiquetaActual.estudios[idx];
    generarVentanaImpresionEtiquetas([estudio]);
}

// Imprimir seleccionadas
function imprimirEtiquetasSeleccionadas() {
    const estudiosAImprimir = etiquetasSeleccionadas.map(idx => datosEtiquetaActual.estudios[idx]);
    generarVentanaImpresionEtiquetas(estudiosAImprimir);
}

// Generar ventana de impresión (ESTILO PROFESIONAL Y COMPATIBLE CON IMPRESORAS TÉRMICAS)
function generarVentanaImpresionEtiquetas(estudiosAImprimir) {
    const { folio, nombre } = datosEtiquetaActual;
    const paciente = pacientesParaEtiquetas[folio];
    const fechaHoy = new Date().toLocaleDateString('es-MX');

    if (!estudiosAImprimir || estudiosAImprimir.length === 0) return;

    // Group studies by Tube
    const tubesMap = new Map(); // 'Rojo' -> [Estudio1, Estudio2]

    estudiosAImprimir.forEach(est => {
        // Get tube type(s) - handle empty or null
        let rawTubes = ['SIN TUBO'];
        if (est.tubo_recipiente && est.tubo_recipiente.trim()) {
            rawTubes = est.tubo_recipiente.split(',');
        }

        rawTubes.forEach(t => {
            const tubeType = t.trim();
            if (!tubesMap.has(tubeType)) tubesMap.set(tubeType, []);

            if (!tubesMap.get(tubeType).find(s => s.id === est.id)) {
                tubesMap.get(tubeType).push(est);
            }
        });
    });

    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <head>
            <title>Imprimir Etiquetas - ${nombre}</title>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Consolas', monospace; 
                    background: white; 
                    -webkit-print-color-adjust: exact;
                }
                @page {
                    size: 50mm 25mm;
                    margin: 0;
                }
                .label-wrapper { 
                    width: 50mm;
                    height: 25mm;
                    page-break-after: always;
                    display: flex;
                    flex-direction: column;
                    padding: 0.5mm 1.5mm;
                    background: white;
                    overflow: hidden;
                    justify-content: space-between;
                }
                .label-header {
                    position: relative;
                    width: 100%;
                    height: auto;
                    min-height: 5mm;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .patient-name {
                    font-size: 7.5pt;
                    font-weight: 700;
                    text-transform: uppercase;
                    display: block;
                    flex: 1;
                    line-height: 1;
                    word-wrap: break-word; /* or word-break: break-all? word-wrap is safer */
                    overflow: hidden;
                    color: #000;
                    padding-right: 1mm;
                }
                .patient-dob {
                    font-size: 7pt;
                    font-weight: 700;
                    color: #000;
                    background: white;
                    text-align: right;
                    white-space: nowrap;
                    flex: 0 0 auto;
                }
                .barcode-area {
                    width: 100%;
                    height: 6mm;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .barcode-img {
                    width: 100%;
                    height: 100%;
                }
                .folio-box {
                    font-size: 10pt;
                    font-weight: 800;
                    text-align: center;
                    background: #000;
                    color: #fff;
                    width: 100%;
                    padding: 0.1mm 0;
                    border: 0.5mm solid #000;
                    letter-spacing: 0.3mm;
                    line-height: 1;
                    border-radius: 1mm;
                }
                .label-footer {
                    font-size: 6.5pt;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-top: 0.2mm;
                    width: 100%;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body onload="renderAndPrint()">
            <div id="labelsContainer">
    `);

    let tubeIndex = 0;
    tubesMap.forEach((studies, tubeType) => {
        tubeIndex++;
        const tubeCode = `${folio}-${tubeIndex}`;
        const studyCodesStr = studies.map(s => s.codigo || s.nombre.substring(0, 4).toUpperCase()).join(', ');

        // Tube type abbreviation
        let tubeAbbrev = tubeType;
        if (tubeType.toLowerCase().includes('lila')) tubeAbbrev = 'LILA';
        else if (tubeType.toLowerCase().includes('celeste')) tubeAbbrev = 'CELES';
        else if (tubeType.toLowerCase().includes('rojo')) tubeAbbrev = 'ROJO';
        else if (tubeType.toLowerCase().includes('amarillo')) tubeAbbrev = 'AMAR';
        else if (tubeType.toLowerCase().includes('verde')) tubeAbbrev = 'VERDE';
        else if (tubeType.toLowerCase().includes('gris')) tubeAbbrev = 'GRIS';
        else if (tubeType.toLowerCase().includes('estéril') || tubeType.toLowerCase().includes('esteril') || tubeType.toLowerCase().includes('orina')) tubeAbbrev = 'REP EST';
        else tubeAbbrev = tubeType.split(' ')[0].substring(0, 5).toUpperCase();

        // Format DOB
        let dobStr = 'N/A';
        const fechaNacRaw = paciente?.fechaNacimiento || paciente?.fecha_nacimiento;
        if (fechaNacRaw) {
            const d = new Date(fechaNacRaw);
            dobStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }

        win.document.write(`
            <div class="label-wrapper">
                <div class="label-header">
                    <span class="patient-name">${nombre}</span>
                    <span class="patient-dob">${dobStr}</span>
                </div>
                <div class="barcode-area">
                    <svg class="barcode-img" data-code="${tubeCode}"></svg>
                </div>
                <div class="folio-box">${tubeCode}</div>
                <div class="label-footer">${tubeAbbrev} | ${studyCodesStr}</div>
            </div>
        `);
    });

    win.document.write(`
            </div>
            <script>
                function renderAndPrint() {
                    const svgs = document.querySelectorAll('.barcode-img');
                    svgs.forEach(svg => {
                        const code = svg.getAttribute('data-code');
                        JsBarcode(svg, code, {
                            format: "CODE128",
                            lineColor: "#000",
                            width: 2,
                            height: 35,
                            displayValue: false,
                            margin: 0
                        });
                    });
                    
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 450);
                }
            </script>
        </body>
        </html>
    `);
    win.document.close();
}
