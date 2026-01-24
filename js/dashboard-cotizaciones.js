// dashboard-cotizaciones.js
// Módulo de Cotizaciones para Ar-lab

let cotizacionEstudios = [];
let allEstudiosCotizacion = [];
let historialCotizaciones = [];

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadEstudiosForCotizacion();
});

// ==========================================
// TABS
// ==========================================
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

// ==========================================
// CARGAR ESTUDIOS
// ==========================================
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
        console.error("Error al cargar estudios:", err);
    }
}

// ==========================================
// INICIALIZAR VISTA
// ==========================================
function initCotizadorView() {
    cotizacionEstudios = [];
    const nombreInput = document.getElementById('cotPaciente');
    if (nombreInput) nombreInput.value = '';
    renderCotizacionTable();
    setupCotizacionSearch();
}

// ==========================================
// BÚSQUEDA DE ESTUDIOS
// ==========================================
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

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });

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
        container.innerHTML = '<div style="padding:12px; color:#64748b;">No se encontraron estudios.</div>';
        container.style.display = 'block';
        return;
    }

    let html = '';
    estudios.slice(0, 10).forEach(est => {
        html += `
            <div class="cot-search-item" onclick="agregarEstudioCotizacion('${est.id}')" 
                 style="padding: 12px; border-bottom: 1px solid #f1f5f9; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s;"
                 onmouseover="this.style.background='#f0fdfa'" onmouseout="this.style.background='white'">
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

// ==========================================
// AGREGAR/QUITAR ESTUDIOS
// ==========================================
function agregarEstudioCotizacion(id) {
    const estudio = allEstudiosCotizacion.find(e => e.id === id);
    if (!estudio) return;

    if (cotizacionEstudios.some(e => e.id === id)) {
        if (typeof showToast === 'function') showToast('Este estudio ya está en la cotización', 'warning');
        return;
    }

    cotizacionEstudios.push(estudio);
    renderCotizacionTable();

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

// ==========================================
// RENDERIZAR TABLA
// ==========================================
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
                <td style="padding: 12px; text-align: right; color: #0d9488; font-weight: 600;">$${precio.toFixed(2)}</td>
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

// ==========================================
// GENERAR COTIZACIÓN (TICKET CON QR)
// ==========================================
async function generarCotizacion() {
    const nombrePaciente = document.getElementById('cotPaciente').value.trim() || 'A quien corresponda';

    if (cotizacionEstudios.length === 0) {
        if (typeof showToast === 'function') showToast('Agregue al menos un estudio', 'warning');
        return;
    }

    const total = cotizacionEstudios.reduce((sum, e) => sum + parseFloat(e.precio), 0);
    const folio = `COT-${Date.now()}`;

    // Calcular fecha de vencimiento (15 días)
    const fechaEmision = new Date();
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);

    // Guardar en DB
    const saved = await guardarCotizacionDB(folio, nombrePaciente, total, cotizacionEstudios, fechaVencimiento);

    if (saved) {
        // Generar ticket
        generarTicketCotizacion(folio, nombrePaciente, total, fechaEmision, fechaVencimiento);
        if (typeof showToast === 'function') showToast('Cotización generada y guardada', 'success');
    }
}

async function guardarCotizacionDB(folio, nombre, total, estudios, fechaVencimiento) {
    try {
        // Usar fecha local del navegador (no UTC)
        const ahora = new Date();
        const fechaLocal = new Date(ahora.getTime() - (ahora.getTimezoneOffset() * 60000)).toISOString();

        // Payload simplificado que coincide con la estructura de la tabla existente
        const payload = {
            id: crypto.randomUUID(),
            nombre_paciente: nombre,
            total: total,
            estudios: estudios.map(e => ({ id: e.id, nombre: e.nombre, precio: e.precio, codigo: e.codigo })),
            fecha: fechaLocal
        };

        console.log('Guardando cotización:', payload);

        const { error } = await supabaseClient
            .from('cotizaciones')
            .insert([payload]);

        if (error) {
            console.error('Error guardando cotización:', error);
            if (typeof showToast === 'function') showToast('Error al guardar: ' + error.message, 'error');
            return false;
        }
        return true;
    } catch (err) {
        console.error('Excepción:', err);
        if (typeof showToast === 'function') showToast('Error: ' + err.message, 'error');
        return false;
    }
}

function generarTicketCotizacion(folio, nombrePaciente, total, fechaEmision, fechaVencimiento) {
    const config = window.currentLabConfig || {
        nombre_laboratorio: 'AR LAB',
        direccion: 'Calle Principal #123, Veracruz, Ver.',
        telefono: '228 123 4567',
        responsable_sanitario: 'Q.F.B. Adolfo Ruiz',
        cedula_profesional: '1234567'
    };

    const fechaEmisionStr = fechaEmision.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    const fechaVencimientoStr = fechaVencimiento.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

    // QR con datos de la cotización
    const qrData = encodeURIComponent(`Folio:${folio}|Total:$${total.toFixed(2)}|Vence:${fechaVencimientoStr}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

    const itemsHtml = cotizacionEstudios.map((est, i) => `
        <tr>
            <td style="padding: 6px 4px; border-bottom: 1px dashed #000;">${i + 1}</td>
            <td style="padding: 6px 4px; border-bottom: 1px dashed #000;">${est.nombre}</td>
            <td style="padding: 6px 4px; border-bottom: 1px dashed #000; text-align: right; font-weight: bold;">$${parseFloat(est.precio).toFixed(2)}</td>
        </tr>
    `).join('');

    const ticketWindow = window.open('', 'COTIZACION', 'height=800,width=400');
    ticketWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cotización ${folio}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Courier New', monospace; 
                    padding: 15px; 
                    max-width: 350px; 
                    margin: 0 auto; 
                    color: #000; 
                    font-size: 12px;
                    line-height: 1.4;
                }
                .header { text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px dashed #000; }
                .logo-img { max-width: 100px; margin-bottom: 8px; }
                .lab-name { font-size: 20px; font-weight: bold; }
                .subtitle { font-size: 10px; letter-spacing: 1px; margin-top: 3px; }
                .section { border: 1px solid #000; padding: 8px; margin: 10px 0; }
                .section-title { font-size: 10px; text-transform: uppercase; margin-bottom: 3px; }
                .section-value { font-size: 14px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th { background: #000; color: #fff; padding: 6px 4px; text-align: left; font-size: 11px; }
                .total-box { 
                    border: 2px solid #000; 
                    padding: 12px; 
                    text-align: center; 
                    margin: 15px 0; 
                }
                .total-label { font-size: 11px; margin-bottom: 3px; }
                .total-amount { font-size: 28px; font-weight: bold; }
                .validity { 
                    border: 1px dashed #000; 
                    padding: 10px; 
                    text-align: center; 
                    margin: 10px 0; 
                }
                .validity-label { font-size: 10px; }
                .validity-date { font-size: 14px; font-weight: bold; margin-top: 3px; }
                .qr-section { text-align: center; margin: 15px 0; }
                .qr-text { font-size: 9px; margin-top: 5px; }
                .footer { 
                    text-align: center; 
                    margin-top: 15px; 
                    padding-top: 10px; 
                    border-top: 1px dashed #000; 
                    font-size: 10px; 
                }
                .btn-print { 
                    background: #000; 
                    color: #fff; 
                    border: none; 
                    padding: 10px 25px; 
                    font-size: 12px; 
                    font-weight: bold; 
                    cursor: pointer; 
                    margin-top: 15px; 
                }
                @media print { 
                    .no-print { display: none; } 
                    body { padding: 5px; max-width: 100%; } 
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="arlab_logo.png" class="logo-img" onerror="this.style.display='none'">
                <div class="lab-name">${config.nombre_laboratorio}</div>
                <div class="subtitle">LABORATORIO CLINICO</div>
            </div>
            
            <div class="section" style="text-align: center;">
                <div class="section-title">COTIZACION</div>
                <div class="section-value">${folio}</div>
                <div style="font-size: 10px; margin-top: 3px;">${fechaEmisionStr}</div>
            </div>
            
            <div class="section">
                <div class="section-title">CLIENTE</div>
                <div class="section-value">${nombrePaciente}</div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 25px;">#</th>
                        <th>ESTUDIO</th>
                        <th style="text-align: right; width: 70px;">PRECIO</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="total-box">
                <div class="total-label">TOTAL COTIZADO</div>
                <div class="total-amount">$${total.toFixed(2)}</div>
            </div>
            
            <div class="validity">
                <div class="validity-label">*** VIGENCIA ***</div>
                <div class="validity-date">Valido hasta: ${fechaVencimientoStr}</div>
            </div>
            
            <div class="qr-section">
                <img src="${qrUrl}" alt="QR" style="width: 100px; height: 100px;">
                <div class="qr-text">Escanea para validar</div>
            </div>
            
            <div class="footer">
                <p><strong>${config.responsable_sanitario}</strong></p>
                <p>Ced. Prof. ${config.cedula_profesional}</p>
                <p style="margin-top: 5px;">${config.direccion}</p>
                <p>Tel: ${config.telefono}</p>
            </div>
            
            <div class="no-print" style="text-align: center;">
                <button class="btn-print" onclick="window.print()">IMPRIMIR</button>
            </div>
        </body>
        </html>
    `);
    ticketWindow.document.close();
    ticketWindow.focus();
}

// ==========================================
// HISTORIAL
// ==========================================
async function loadCotizacionesHistory() {
    const tbody = document.getElementById('cotHistorialTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">Cargando...</td></tr>';

    try {
        const { data, error } = await supabaseClient
            .from('cotizaciones')
            .select('*')
            .order('fecha', { ascending: false })
            .limit(50);

        if (error) throw error;
        historialCotizaciones = data || [];
        renderCotizacionesHistory(historialCotizaciones);
    } catch (err) {
        console.error('Error cargando historial:', err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error al cargar</td></tr>';
    }
}

function renderCotizacionesHistory(cotizaciones) {
    const tbody = document.getElementById('cotHistorialTableBody');
    if (!tbody) return;

    if (cotizaciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color:#64748b;">No hay cotizaciones registradas.</td></tr>';
        return;
    }

    const hoy = new Date();
    let html = '';

    // Íconos SVG
    const iconRegistrar = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`;
    const iconImprimir = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`;

    cotizaciones.forEach(c => {
        // Formato de fecha legible
        const fechaCotizacion = new Date(c.fecha);
        const fecha = fechaCotizacion.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Calcular vigencia: 15 días desde la fecha de cotización
        const fechaVencimiento = new Date(fechaCotizacion);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);
        const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
        const estaVigente = diasRestantes > 0;

        const estadoBadge = estaVigente
            ? `<span style="background: #d1fae5; color: #059669; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Vigente (${diasRestantes}d)</span>`
            : `<span style="background: #fee2e2; color: #dc2626; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Vencida</span>`;

        // Mostrar nombres de estudios
        let estudiosHtml = '-';
        if (Array.isArray(c.estudios) && c.estudios.length > 0) {
            estudiosHtml = c.estudios.map(e =>
                `<span style="display: inline-block; background: #f0fdfa; color: #0f766e; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin: 2px;">${e.nombre || e.codigo || 'Estudio'}</span>`
            ).join('');
        }

        html += `
            <tr>
                <td style="padding: 12px;">${fecha}</td>
                <td style="padding: 12px; font-weight: 500;">${c.nombre_paciente || 'S/N'}</td>
                <td style="padding: 12px; max-width: 300px;">${estudiosHtml}</td>
                <td style="padding: 12px; text-align: center; font-weight: 600; color: #0d9488;">$${parseFloat(c.total).toFixed(2)}</td>
                <td style="padding: 12px; text-align: center;">${estadoBadge}</td>
                <td style="padding: 12px; text-align: center; white-space: nowrap;">
                    <button onclick="registrarPacienteDesdeCotizacion('${c.id}')" style="background: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;" title="Registrar como nuevo paciente">
                        ${iconRegistrar} Registrar
                    </button>
                    <button onclick="reimprimirCotizacion('${c.id}')" style="background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 8px 10px; border-radius: 6px; cursor: pointer; margin-left: 4px; display: inline-flex; align-items: center;" title="Reimprimir ticket">
                        ${iconImprimir}
                    </button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function registrarPacienteDesdeCotizacion(id) {
    const quote = historialCotizaciones.find(c => c.id === id);
    if (!quote) return;

    // Crear modal de confirmación elegante
    const estudiosListHtml = (quote.estudios || []).map(e =>
        `<li style="padding: 4px 0; color: #0f766e;">${e.nombre || e.codigo}</li>`
    ).join('');

    const modalHtml = `
        <div id="confirmRegistroModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 450px; width: 90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <line x1="19" y1="8" x2="19" y2="14"/>
                            <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                    </div>
                    <h3 style="margin: 0; font-size: 1.25rem; color: #0f172a;">Registrar Nuevo Paciente</h3>
                </div>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem;">
                    <p style="margin: 0 0 0.5rem; color: #64748b; font-size: 0.85rem;">Paciente:</p>
                    <p style="margin: 0; font-weight: 600; color: #0f172a; font-size: 1.1rem;">${quote.nombre_paciente}</p>
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <p style="margin: 0 0 0.5rem; color: #64748b; font-size: 0.85rem;">Estudios a registrar:</p>
                    <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.9rem;">${estudiosListHtml}</ul>
                </div>
                <div style="background: #f0fdfa; padding: 0.75rem; border-radius: 8px; text-align: center; margin-bottom: 1.5rem;">
                    <span style="color: #0f766e; font-weight: 600; font-size: 1.1rem;">Total: $${parseFloat(quote.total).toFixed(2)}</span>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button onclick="cerrarModalRegistro()" style="flex: 1; padding: 12px; border: 1px solid #e2e8f0; background: white; border-radius: 8px; font-weight: 500; cursor: pointer; color: #64748b;">
                        Cancelar
                    </button>
                    <button onclick="confirmarRegistroPaciente('${id}')" style="flex: 1; padding: 12px; border: none; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Registrar
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insertar modal en el DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function cerrarModalRegistro() {
    const modal = document.getElementById('confirmRegistroModal');
    if (modal) modal.remove();
}

function confirmarRegistroPaciente(id) {
    cerrarModalRegistro();

    const quote = historialCotizaciones.find(c => c.id === id);
    if (!quote) return;

    // Guardar en sessionStorage para nueva_cita.html
    const quoteData = {
        nombre: quote.nombre_paciente,
        estudios: quote.estudios,
        total: quote.total,
        fromCotizacion: true
    };

    try {
        sessionStorage.setItem('pendingQuotation', JSON.stringify(quoteData));
        window.location.href = 'nueva_cita.html';
    } catch (e) {
        console.error("Error:", e);
        if (typeof showToast === 'function') {
            showToast('Error al redireccionar', 'error');
        }
    }
}

function reimprimirCotizacion(id) {
    const quote = historialCotizaciones.find(c => c.id === id);
    if (!quote) return;

    const fechaEmision = new Date(quote.fecha);
    // Calcular fecha de vencimiento: 15 días después de la emisión
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);

    // Generar folio basado en la fecha
    const folio = 'COT-' + fechaEmision.getFullYear() +
        String(fechaEmision.getMonth() + 1).padStart(2, '0') +
        String(fechaEmision.getDate()).padStart(2, '0') +
        '-' + id.substring(0, 4).toUpperCase();

    // Reconstruir array de estudios para imprimir
    cotizacionEstudios = quote.estudios || [];
    generarTicketCotizacion(folio, quote.nombre_paciente, quote.total, fechaEmision, fechaVencimiento);
}

function limpiarCotizador() {
    if (confirm('¿Borrar el formulario actual?')) {
        initCotizadorView();
    }
}

function filterCotizacionesHistory() {
    const term = document.getElementById('searchCotHistorial').value.toLowerCase();
    const filtered = historialCotizaciones.filter(c =>
        (c.nombre_paciente || '').toLowerCase().includes(term)
    );
    renderCotizacionesHistory(filtered);
}
