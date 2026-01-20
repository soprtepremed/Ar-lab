// dashboard-cotizaciones.js
// Lógica para el módulo de Cotizaciones (Presupuestos)

let cotizacionEstudios = [];
let allEstudiosCotizacion = [];
let historialCotizaciones = [];

document.addEventListener('DOMContentLoaded', () => {
    // Check if view is active logic is handled by switchView usually
    loadEstudiosForCotizacion();
});

// --- Tabs Logic ---
function switchCotizacionTab(tab) {
    const tabNuevo = document.getElementById('tabCotNuevo');
    const tabHistorial = document.getElementById('tabCotHistorial');
    const viewNuevo = document.getElementById('cotizadorNuevo');
    const viewHistorial = document.getElementById('cotizadorHistorial');

    if (tab === 'nuevo') {
        tabNuevo.classList.add('active');
        tabNuevo.style.borderColor = '#0f766e';
        tabNuevo.style.color = '#0f766e';

        tabHistorial.classList.remove('active');
        tabHistorial.style.borderColor = 'transparent';
        tabHistorial.style.color = '#64748b';

        viewNuevo.style.display = 'grid';
        viewHistorial.style.display = 'none';
    } else {
        tabHistorial.classList.add('active');
        tabHistorial.style.borderColor = '#0f766e';
        tabHistorial.style.color = '#0f766e';

        tabNuevo.classList.remove('active');
        tabNuevo.style.borderColor = 'transparent';
        tabNuevo.style.color = '#64748b';

        viewNuevo.style.display = 'none';
        viewHistorial.style.display = 'block';

        loadCotizacionesHistory();
    }
}

// --- Loading Data ---
async function loadEstudiosForCotizacion() {
    try {
        const { data, error } = await supabaseClient
            .from('estudios_laboratorio')
            .select('*')
            .eq('activo', true)
            .order('nombre', { ascending: true });

        if (error) throw error;
        allEstudiosCotizacion = data || [];
        console.log("Estudios cargados para cotización:", allEstudiosCotizacion.length);
    } catch (err) {
        console.error("Error al cargar estudios para cotizar:", err);
    }
}

function initCotizadorView() {
    // Reset state
    cotizacionEstudios = [];
    document.getElementById('cotPaciente').value = '';
    renderCotizacionTable();
    setupCotizacionSearch();
}

function setupCotizacionSearch() {
    const searchInput = document.getElementById('cotBuscarEstudio');
    const resultsContainer = document.getElementById('cotResultadosBusqueda');

    if (!searchInput || !resultsContainer) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        if (term.length < 2) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            return;
        }

        const filtered = allEstudiosCotizacion.filter(est =>
            est.nombre.toLowerCase().includes(term) ||
            (est.codigo && est.codigo.toLowerCase().includes(term))
        );

        renderBusquedaResultados(filtered);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });

    // Focus handler
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.length >= 2) {
            resultsContainer.style.display = 'block';
        }
    });
}

function renderBusquedaResultados(estudios) {
    const container = document.getElementById('cotResultadosBusqueda');
    if (!container) return;

    if (estudios.length === 0) {
        container.innerHTML = '<div style="padding:10px; color:#64748b;">No se encontraron estudios.</div>';
        container.style.display = 'block';
        return;
    }

    let html = '';
    estudios.slice(0, 10).forEach(est => {
        html += `
            <div class="cot-search-item" onclick="agregarEstudioCotizacion('${est.id}')" style="padding: 10px; border-bottom: 1px solid #f1f5f9; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; color: #1e293b;">${est.nombre}</div>
                    <div style="font-size: 0.8rem; color: #64748b;">${est.categoria || 'General'}</div>
                </div>
                <div style="font-weight: 700; color: #0d9488;">$${parseFloat(est.precio).toFixed(2)}</div>
            </div>
        `;
    });

    container.innerHTML = html;
    container.style.display = 'block';
}

function agregarEstudioCotizacion(id) {
    const estudio = allEstudiosCotizacion.find(e => e.id === id);
    if (!estudio) return;

    // Check duplicate
    if (cotizacionEstudios.some(e => e.id === id)) {
        alert("Este estudio ya está en la cotización.");
        return;
    }

    cotizacionEstudios.push(estudio);
    renderCotizacionTable();

    // Clear search
    const searchInput = document.getElementById('cotBuscarEstudio');
    const resultsContainer = document.getElementById('cotResultadosBusqueda');
    if (searchInput) searchInput.value = '';
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (searchInput) searchInput.focus();
}

function removerEstudioCotizacion(index) {
    cotizacionEstudios.splice(index, 1);
    renderCotizacionTable();
}

function renderCotizacionTable() {
    const tbody = document.getElementById('cotTableBody');
    const totalEl = document.getElementById('cotTotalAmount');
    const countEl = document.getElementById('cotTotalCount');

    if (!tbody) return;

    let html = '';
    let total = 0;

    if (cotizacionEstudios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #94a3b8;">Agregue estudios para cotizar</td></tr>';
        if (totalEl) totalEl.textContent = '0.00';
        if (countEl) countEl.textContent = '0';
        return;
    }

    cotizacionEstudios.forEach((est, index) => {
        const precio = parseFloat(est.precio || 0);
        total += precio;
        html += `
            <tr>
                <td style="padding: 12px;">${est.codigo || '-'}</td>
                <td style="padding: 12px; font-weight: 500;">${est.nombre}</td>
                <td style="padding: 12px; text-align: right;">$${precio.toFixed(2)}</td>
                <td style="padding: 12px; text-align: center;">
                    <button onclick="removerEstudioCotizacion(${index})" style="background:none; border:none; color: #ef4444; cursor:pointer;" title="Eliminar">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    if (totalEl) totalEl.textContent = total.toFixed(2);
    if (countEl) countEl.textContent = cotizacionEstudios.length;
}

// --- Saving and Printing ---
async function imprimirTicketCotizacion() {
    if (cotizacionEstudios.length === 0) {
        alert("Agregue al menos un estudio para generar la cotización.");
        return;
    }

    const nombrePaciente = document.getElementById('cotPaciente').value.trim() || 'A quien corresponda';
    const total = cotizacionEstudios.reduce((sum, e) => sum + parseFloat(e.precio), 0);

    // 1. Generar impresión INMEDIATAMENTE
    generarDocumentoImpresion(nombrePaciente, total);

    // 2. Guardar en DB en segundo plano
    if (typeof showToast === 'function') showToast('Procesando historial...', 'info');

    // Generate Client-Side UUID
    const newId = crypto.randomUUID();

    guardarCotizacionDB(newId, nombrePaciente, total, cotizacionEstudios).then(success => {
        if (success) {
            if (typeof showToast === 'function') showToast('Guardado en historial', 'success');
            // Refresh history if visible
            const historialTab = document.getElementById('cotizadorHistorial');
            if (historialTab && historialTab.style.display !== 'none') {
                loadCotizacionesHistory();
            }
        } else {
            if (typeof showToast === 'function') showToast('No se pudo guardar historial', 'warning');
        }
    });
}

async function guardarCotizacionDB(uuid, nombre, total, estudios) {
    try {
        const user = JSON.parse(localStorage.getItem('arlab_user') || '{}');

        const payload = {
            id: uuid,
            nombre_paciente: nombre,
            total: total,
            estudios: estudios.map(e => ({ id: e.id, nombre: e.nombre, precio: e.precio, codigo: e.codigo })),
            fecha: new Date().toISOString()
        };

        const { error } = await supabaseClient
            .from('cotizaciones')
            .insert([payload]);

        if (error) {
            console.error('Error guardando cotización:', error);
            // No bloqueamos la impresión, solo alertamos
            return false;
        } else {
            console.log('Cotización guardada exitosamente');
            return true;
        }
    } catch (err) {
        console.error('Excepción al guardar cotización:', err);
        return false;
    }
}

function generarDocumentoImpresion(nombrePaciente, total) {
    const fecha = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    const config = window.currentLabConfig || {
        nombre_laboratorio: 'AR LAB',
        direccion: 'Calle Principal #123, Veracruz, Ver.',
        telefono: '228 123 4567',
        cedula_profesional: '1234567',
        responsable_sanitario: 'Q.F.B. Adolfo Ruiz'
    };

    const itemsHtml = cotizacionEstudios.map((est, index) => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e0e7ff;">${index + 1}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e0e7ff; font-weight: 500;">${est.nombre}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e0e7ff; text-align: center; color: #666;">${est.indicaciones || 'Ayuno 8 horas'}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e0e7ff; text-align: right; font-weight: bold; color: #0d9488;">$${parseFloat(est.precio).toFixed(2)}</td>
        </tr>
    `).join('');

    const ticketWindow = window.open('', 'COTIZACION', 'height=800,width=1000');

    // Background Pattern (Subtle dots)
    const bgPattern = `data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230f766e' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E`;

    ticketWindow.document.write(`
        <html>
        <head>
            <title>Cotización - ${config.nombre_laboratorio}</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
            <style>
                @page { size: letter; margin: 0mm; }
                body { 
                    font-family: 'Outfit', sans-serif; 
                    font-size: 11pt; 
                    line-height: 1.6; 
                    color: #1e293b; 
                    margin: 0; 
                    padding: 0;
                    background-color: white;
                    -webkit-print-color-adjust: exact;
                }
                .page-container {
                    position: relative;
                    width: 100%;
                    max-width: 216mm;
                    min-height: 98vh; 
                    margin: 0 auto;
                    padding: 20mm;
                    box-sizing: border-box;
                    background-image: url("${bgPattern}");
                    overflow: hidden;
                }
                .corner-decoration {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 200px;
                    height: 200px;
                    background: linear-gradient(135deg, transparent 50%, rgba(13, 148, 136, 0.1) 50%);
                    z-index: 0;
                }
                .header-container { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-start; 
                    margin-bottom: 40px; 
                    position: relative;
                    z-index: 1;
                }
                .logo-img { 
                    max-height: 120px; 
                    object-fit: contain;
                }
                .lab-info { 
                    text-align: right; 
                    font-size: 9pt; 
                    color: #475569; 
                }
                .lab-name-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 24pt;
                    color: #0f766e;
                    font-weight: 700;
                    margin: 0;
                    line-height: 1;
                }
                .date-line { 
                    text-align: right; 
                    margin-bottom: 40px; 
                    color: #64748b;
                    font-size: 10pt;
                }
                .recipient-card {
                    background: rgba(255,255,255,0.8);
                    border-left: 4px solid #0d9488;
                    padding: 15px 20px;
                    margin-bottom: 30px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }
                .doc-title { 
                    font-family: 'Playfair Display', serif; 
                    font-weight: 600; 
                    font-size: 22pt; 
                    color: #0f172a; 
                    text-align: center;
                    margin: 30px 0 20px 0;
                    letter-spacing: 1px;
                }
                table { 
                    width: 100%; 
                    border-collapse: separate; 
                    border-spacing: 0;
                    margin-bottom: 30px; 
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                th { 
                    background: #0d9488; 
                    color: white; 
                    text-align: left; 
                    padding: 12px; 
                    font-weight: 600;
                    font-size: 10pt;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .total-section { 
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 20px;
                }
                .total-box {
                    background: #f0fdfa;
                    padding: 15px 30px;
                    border-radius: 8px;
                    border: 1px solid #ccfbf1;
                    text-align: right;
                }
                .total-label { font-size: 10pt; color: #64748b; text-transform: uppercase; }
                .total-amount { font-size: 20pt; font-weight: 700; color: #0f766e; font-family: 'Playfair Display', serif; }
                .terms {
                    margin-top: 50px;
                    font-size: 9pt;
                    color: #64748b;
                    border-top: 1px dashed #cbd5e1;
                    padding-top: 20px;
                }
                .footer { 
                    position: absolute;
                    bottom: 15mm;
                    left: 25mm;
                    right: 25mm;
                    text-align: center; 
                    font-size: 8pt; 
                    color: #94a3b8; 
                }
                @media print { 
                    .page-container { width: 100%; height: auto; padding: 0; margin: 0; box-shadow: none; min-height: auto; }
                    body { margin: 0; padding: 15mm; } 
                    th { background: #0d9488 !important; color: white !important; -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="page-container">
                <div class="corner-decoration"></div>
                <div class="header-container">
                    <div><img src="arlab_logo.png" class="logo-img" alt="Logo"></div>
                    <div class="lab-info">
                        <div class="lab-name-title">${config.nombre_laboratorio}</div>
                        <div style="margin-top:5px; color: #0d9488; font-weight: 600; letter-spacing: 2px;">LABORATORIO CLÍNICO</div>
                        <div style="margin-top:10px;">${config.direccion}<br>Tel: ${config.telefono}</div>
                    </div>
                </div>
                <div class="date-line">H. Veracruz, Ver. a ${fecha}</div>
                <div class="recipient-card">
                    <div style="font-size: 9pt; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Atención a:</div>
                    <div style="font-size: 16pt; font-weight: 600; color: #0f172a; font-family: 'Playfair Display', serif;">${nombrePaciente}</div>
                </div>
                <div class="doc-title">COTIZACIÓN DE SERVICIOS</div>
                <table>
                    <thead><tr><th style="width: 8%;">#</th><th style="width: 52%;">Descripción del Estudio</th><th style="width: 20%; text-align: center;">Indicaciones</th><th style="width: 20%; text-align: right;">Importe</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <div class="total-section">
                    <div class="total-box">
                        <div class="total-label">Total Presupuestado</div>
                        <div class="total-amount">$${total.toFixed(2)}</div>
                    </div>
                </div>
                <div class="terms">
                    <strong>Información Importante:</strong>
                    <ul style="padding-left: 20px; margin-top: 5px;">
                        <li>La presente cotización tiene una vigencia de 30 días a partir de la fecha de emisión.</li>
                        <li>Los tiempos de entrega pueden variar según el tipo de estudio.</li>
                        <li>Para estudios especiales, se requiere pago anticipado del 50%.</li>
                    </ul>
                </div>
                <div class="signature-line" style="margin-top: 60px; text-align: center;">
                    <div style="width: 200px; border-bottom: 1px solid #1e293b; margin: 0 auto 10px auto;"></div>
                    <div style="font-weight: 600; color: #0f172a;">${config.responsable_sanitario}</div>
                    <div style="font-size: 9pt; color: #64748b;">Responsable Sanitario | Céd. ${config.cedula_profesional}</div>
                </div>
                <div class="footer">${config.nombre_laboratorio} | ${config.direccion} | Documento Informativo</div>
            </div>
        </body>
        </html>
    `);

    // CRITICAL FIX: Close the document to stop the spinner and allow onload/ready state to complete
    ticketWindow.document.close();
    ticketWindow.focus();

    // Small timeout to ensure styles and fonts are rendered before print dialog
    setTimeout(() => {
        ticketWindow.print();
    }, 500);
}

function limpiarCotizador() {
    if (confirm('¿Borrar formulario actual?')) {
        initCotizadorView();
    }
}

// --- Historial Functions ---
async function loadCotizacionesHistory() {
    const tbody = document.getElementById('cotHistorialTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 1rem;">Cargando...</td></tr>';

    try {
        const { data, error } = await supabaseClient
            .from('cotizaciones')
            .select('*')
            .order('fecha', { ascending: false })
            .limit(50); // Últimas 50

        if (error) throw error;

        historialCotizaciones = data || [];
        renderCotizacionesHistory(historialCotizaciones);

    } catch (err) {
        console.error('Error cargando historial:', err);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 1rem; color:red;">Error al cargar historial</td></tr>';
    }
}

function renderCotizacionesHistory(cotizaciones) {
    const tbody = document.getElementById('cotHistorialTableBody');
    if (!tbody) return;

    if (cotizaciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 1rem; color:#64748b;">No hay cotizaciones registradas.</td></tr>';
        return;
    }

    let html = '';
    cotizaciones.forEach(c => {
        const fecha = new Date(c.fecha).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        const total = parseFloat(c.total).toFixed(2);
        const estudiosList = Array.isArray(c.estudios) ? c.estudios.map(e => e.nombre).join(', ') : 'Sin detalle';

        // Truncate studies
        const estudiosDisplay = estudiosList.length > 50 ? estudiosList.substring(0, 50) + '...' : estudiosList;

        html += `
            <tr>
                <td>${fecha}</td>
                <td style="font-weight:500;">${c.nombre_paciente || 'S/N'}</td>
                <td title="${estudiosList}" style="color:#64748b;">${estudiosDisplay}</td>
                <td style="text-align:center;">$${total}</td>
                <td style="text-align:center;">
                    <button class="btn btn-sm" onclick="cargarCotizacionParaCita('${c.id}')" style="background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; padding: 4px 10px; font-size: 0.8rem;">
                        Agendar Cita
                    </button>
                    <!-- Opción de reimprimir si se desea -->
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function filterCotizacionesHistory() {
    const term = document.getElementById('searchCotHistorial').value.toLowerCase();
    const filtered = historialCotizaciones.filter(c =>
        (c.nombre_paciente || '').toLowerCase().includes(term)
    );
    renderCotizacionesHistory(filtered);
}

// --- CONVERTIR A CITA ---
function cargarCotizacionParaCita(id) {
    const quote = historialCotizaciones.find(c => c.id === id);
    if (!quote) return;

    if (!confirm(`¿Desea crear una nueva cita usando los datos de la cotización de "${quote.nombre_paciente}"?`)) return;

    // Save to session storage
    const quoteData = {
        nombre: quote.nombre_paciente,
        estudios: quote.estudios // These are simple objects {id, nombre, precio}
    };

    // Attempt redirect
    try {
        sessionStorage.setItem('pendingQuotation', JSON.stringify(quoteData));
        window.location.href = 'nueva_cita.html';
    } catch (e) {
        console.error("Error saving session", e);
        alert("Error al redireccionar.");
    }
}
