/* AR LAB - Dashboard Main Logic */

// --- GLOBAL VARIABLES ---
let currentUser = null;
let allAppointments = [];
let editingId = null;
let currentMonth = new Date();
let selectedDate = new Date();

// Variables de Venta
let totalVenta = 0;
let montoPagado = 0;
let cambioVenta = 0;

// Estudios y Médicos
let todosEstudios = [];
let todosMedicos = [];
let estudiosSeleccionados = [];
let cajaAbierta = null; // Estado de caja del día
let currentLabConfig = {
    nombre_laboratorio: 'AR LAB',
    responsable_sanitario: 'Q.F.B. Adolfo Ruiz',
    cedula_profesional: '1234567',
    direccion: 'Calle Principal #123, Veracruz, Ver.',
    telefono: '228 123 4567'
};

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await loadLabConfig();

    // Manejar vista inicial desde URL
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view') || 'inicio';
    switchView(view);

    renderCalendar();
    loadAllAppointments();
    loadEstudios();
    loadMedicos();
    setupEstudioSearch();
});

async function loadLabConfig() {
    try {
        const { data, error } = await supabaseClient
            .from('configuracion_laboratorio')
            .select('*')
            .eq('id', 1)
            .single();

        if (data) {
            currentLabConfig = data;
        }
    } catch (err) {
        console.error('Error loading config:', err);
    }
}

function checkAuth() {
    const userData = localStorage.getItem('arlab_user');
    if (!userData) {
        currentUser = { usuario: 'Demo', rol: 'admin' };
    } else {
        currentUser = JSON.parse(userData);
    }

    if (currentUser) {
        applyRolePermissions();
    }
}

function applyRolePermissions() {
    const isAdmin = currentUser && currentUser.rol === 'admin';

    // Menú Sistema (solo admin)
    const menuSistema = document.getElementById('menuSistema');
    if (menuSistema) {
        menuSistema.style.display = isAdmin ? 'flex' : 'none';
    }

    // Control de Caja (solo admin)
    if (typeof checkCajaStatus === 'function') {
        checkCajaStatus();
    }
}

function logout() {
    localStorage.removeItem('arlab_user');
    window.location.href = 'index.html';
}

// --- CALENDAR FUNCTIONS ---

function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    document.getElementById('calendarMonth').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    let html = '';
    const today = new Date();

    // Previous month days
    for (let i = startingDay - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        html += `<div class="calendar-day other-month">${day}</div>`;
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDate(date);
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const hasAppointments = allAppointments.some(a => {
            const aptDate = new Date(a.fecha_hora).toDateString();
            return aptDate === date.toDateString();
        });

        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (isSelected && !isToday) classes += ' selected';
        if (hasAppointments) classes += ' has-appointments';

        html += `<div class="${classes}" onclick="selectDate('${dateStr}')">${day}</div>`;
    }

    // Next month days
    const remainingDays = 42 - (startingDay + totalDays);
    for (let day = 1; day <= remainingDays; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }

    document.getElementById('calendarDays').innerHTML = html;
}

function changeMonth(delta) {
    currentMonth.setMonth(currentMonth.getMonth() + delta);
    renderCalendar();
}

function selectDate(dateStr) {
    selectedDate = new Date(dateStr + 'T00:00:00');
    renderCalendar();
    renderAppointmentsList();
    updateSelectedDateTitle();
    closeCalendarModal();
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function updateSelectedDateTitle() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const formattedDate = selectedDate.toLocaleDateString('es-MX', options);
    const formattedDateCap = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    const titleEl = document.getElementById('currentDateDisplay');
    if (titleEl) {
        titleEl.textContent = selectedDate.toDateString() === new Date().toDateString()
            ? 'Citas de Hoy'
            : `Citas para el ${formattedDateCap}`;
    }
}

// --- APPOINTMENTS LOADING & RENDERING ---

// Alias for compatibility
const loadAppointments = loadAllAppointments;

async function loadAllAppointments() {
    try {
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);

        const { data, error } = await supabaseClient
            .from('citas')
            .select('*')
            .gte('fecha_hora', startOfMonth.toISOString())
            .lte('fecha_hora', endOfMonth.toISOString())
            .order('fecha_hora', { ascending: true });

        if (error) throw error;

        allAppointments = data || [];

        // Cargar estudios para cada cita
        if (allAppointments.length > 0) {
            const citaIds = allAppointments.map(c => c.id);

            const { data: citasEstudios, error: estError } = await supabaseClient
                .from('citas_estudios')
                .select(`
                    cita_id,
                    estudio_id,
                    estudios_laboratorio (id, nombre, codigo)
                `)
                .in('cita_id', citaIds);

            if (!estError && citasEstudios) {
                const estudiosMap = {};
                citasEstudios.forEach(ce => {
                    if (!estudiosMap[ce.cita_id]) {
                        estudiosMap[ce.cita_id] = [];
                    }
                    if (ce.estudios_laboratorio) {
                        estudiosMap[ce.cita_id].push(ce.estudios_laboratorio);
                    }
                });

                allAppointments.forEach(apt => {
                    apt.estudios = estudiosMap[apt.id] || [];
                });
            }
        }

        renderCalendar();
        renderAppointmentsList();
        updateStats();

    } catch (err) {
        console.error('Error loading appointments:', err);
        allAppointments = [];
        renderAppointmentsList();
    }
}

function renderAppointmentsList() {
    const tableBody = document.getElementById('appointmentsTableBody');
    const noAppointmentsMsg = document.getElementById('noAppointmentsMessage');

    const getLocalDateString = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const selectedDateStr = getLocalDateString(selectedDate);

    const dayAppointments = allAppointments.filter(a => {
        return getLocalDateString(a.fecha_hora) === selectedDateStr;
    });

    // Update stats count in summary card
    const totalCitasDiaEl = document.getElementById('totalCitasDia');
    if (totalCitasDiaEl) {
        totalCitasDiaEl.textContent = dayAppointments.length;
    }

    if (dayAppointments.length === 0) {
        if (tableBody) tableBody.innerHTML = '';
        if (noAppointmentsMsg) noAppointmentsMsg.style.display = 'block';
        return;
    }

    if (noAppointmentsMsg) noAppointmentsMsg.style.display = 'none';

    const statusLabels = {
        'pendiente': '<span class="status-badge pending">Pendiente</span>',
        'confirmada': '<span class="status-badge confirmed">Confirmada</span>',
        'verificada': '<span class="status-badge verified">Verificada ✓</span>',
        'llamado': '<span class="status-badge llamado">Llamado 📢</span>',
        'en_proceso': '<span class="status-badge inprogress">En Proceso</span>',
        'completada': '<span class="status-badge completed">Completada</span>',
        'cancelada': '<span class="status-badge cancelled">Cancelada</span>'
    };

    let html = '';
    dayAppointments.forEach(apt => {
        const dateObj = new Date(apt.fecha_hora);
        const time = dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

        // Lógica Semáforo (Simplificada: Gris = Pendiente, Verde = Verificado/Asistió)
        let semaforoClass = '';
        if (['verificada', 'llamado', 'en_proceso', 'completada'].includes(apt.estado)) {
            semaforoClass = 'active';
        }

        html += `
        <tr>
            <td>
                <div style="display:flex; align-items:center;">
                    <span class="semaforo-dot ${semaforoClass}"></span>
                    <strong style="color: #0d9488;">${time}</strong>
                </div>
            </td>
            <td>
                <div class="patient-info">
                    <div class="patient-avatar" style="width: 30px; height: 30px; font-size: 0.75rem;">${apt.paciente_nombre.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="patient-name" style="font-size: 0.85rem;">${apt.paciente_nombre}</div>
                        <div class="patient-phone">${apt.paciente_telefono || ''}</div>
                    </div>
                </div>
            </td>
            <td style="font-size: 0.8rem; color: #64748b;">
                ${apt.estudios && apt.estudios.length > 0
                ? apt.estudios.map(e => `<span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; margin: 2px; font-size: 0.75rem;">${e.codigo || ''} ${e.nombre}</span>`).join('')
                : '<span style="color: #94a3b8; font-style: italic;">Sin estudios</span>'}
            </td>
            <td>${statusLabels[apt.estado] || apt.status}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" onclick="showDetailsModal(allAppointments.find(a => a.id === '${apt.id}'), '${time}')" title="Ver Detalles">
                        <svg viewBox="0 0 24 24" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    ${apt.estado === 'pendiente' ? `
                    <button class="action-btn" onclick="mostrarModalVerificarAsistencia('${apt.id}')" title="Verificar Asistencia" style="width: 28px; height: 28px; color: #059669; border-color: #059669; background: #d1fae5;">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </button>
                    ` : ''}
                    <button class="action-btn" onclick="updateStatus('${apt.id}', 'completada')" title="Completar">
                        <svg viewBox="0 0 24 24" width="14" height="14"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>

                </div>
            </td>
        </tr>
    `;
    });

    if (tableBody) tableBody.innerHTML = html;
}

function updateStats() {
    const getLocalDateString = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const todayStr = getLocalDateString(new Date());
    const todayAppointments = allAppointments.filter(a => {
        return getLocalDateString(a.fecha_hora) === todayStr;
    });

    // Safety checks for elements
    if (document.getElementById('statToday')) document.getElementById('statToday').textContent = todayAppointments.length;
    if (document.getElementById('statPending')) document.getElementById('statPending').textContent = todayAppointments.filter(a => a.estado === 'pendiente').length;
    if (document.getElementById('statCompleted')) document.getElementById('statCompleted').textContent = todayAppointments.filter(a => a.estado === 'completada').length;
    if (document.getElementById('statCancelled')) document.getElementById('statCancelled').textContent = todayAppointments.filter(a => a.estado === 'cancelada').length;

    const badge = document.getElementById('citasCount');
    if (badge) badge.textContent = todayAppointments.filter(a => a.estado === 'pendiente').length;
}

// --- APPOINTMENT ACTIONS ---

async function saveAppointment(event) {
    if (event) event.preventDefault();

    if (estudiosSeleccionados.length === 0) {
        showToast('Debe seleccionar al menos un estudio.', 'error');
        return;
    }

    if (!editingId && montoPagado < totalVenta) {
        if (!confirm(`El monto pagado ($${montoPagado.toFixed(2)}) es menor al total ($${totalVenta.toFixed(2)}). ¿Desea registrar como deuda (Saldo pendiente)?`)) {
            return;
        }
    }

    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const fechaHora = `${date}T${time}:00`;

    const primerNombre = document.getElementById('primerNombre').value;
    const segundoNombre = document.getElementById('segundoNombre').value || '';
    const primerApellido = document.getElementById('primerApellido').value;
    const segundoApellido = document.getElementById('segundoApellido').value || '';

    const nombreCompleto = `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.replace(/\s+/g, ' ').trim();
    const medicoActual = document.getElementById('medicoReferente').value;

    // Verificar y Guardar Nuevo Médico
    if (medicoActual && !todosMedicos.some(m => m.nombre.toLowerCase() === medicoActual.toLowerCase())) {
        try {
            await supabaseClient.from('medicos').insert([{ nombre: medicoActual }]);
            loadMedicos();
        } catch (errMed) {
            console.error('Error procesando médico:', errMed);
        }
    }

    const folioVenta = Math.floor(Date.now() / 1000);

    const appointmentData = {
        paciente_nombre: nombreCompleto,
        paciente_telefono: document.getElementById('patientPhone').value,
        fecha_hora: fechaHora,
        tipo_servicio: 'laboratorio',
        notas: document.getElementById('appointmentNotes').value || null,
        estado: 'pendiente',

        primer_nombre: primerNombre,
        segundo_nombre: segundoNombre || null,
        primer_apellido: primerApellido,
        segundo_apellido: segundoApellido || null,
        fecha_nacimiento: document.getElementById('fechaNacimiento').value,
        diagnostico: document.getElementById('diagnostico').value || null,

        total: totalVenta,
        subtotal: totalVenta,
        pagado: montoPagado,
        metodo_pago: document.getElementById('metodoPago').value,
        folio_venta: folioVenta,
        medico_referente_nombre: medicoActual
    };

    try {
        let result;
        let citaId;

        if (editingId) {
            result = await supabaseClient.from('citas').update(appointmentData).eq('id', editingId).select();
            if (result.data) citaId = editingId;
        } else {
            result = await supabaseClient.from('citas').insert([appointmentData]).select();
            if (result.data) citaId = result.data[0].id;
        }

        if (result.error) throw result.error;

        // Relación de estudios
        if (editingId) {
            await supabaseClient.from('citas_estudios').delete().eq('cita_id', citaId);
        }

        if (estudiosSeleccionados.length > 0) {
            const estudiosRel = estudiosSeleccionados.map(est => ({
                cita_id: citaId,
                estudio_id: est.id
            }));
            await supabaseClient.from('citas_estudios').insert(estudiosRel);
        }

        if (!editingId) {
            generateTicket(appointmentData, folioVenta);
        }

        closeModal();
        loadAllAppointments();
        showToast(editingId ? 'Cita actualizada correctamente' : 'Cita registrada exitosamente', 'success');

    } catch (err) {
        console.error('Error saving appointment:', err);
        showToast('Error al guardar la cita: ' + err.message, 'error');
    }
}

async function updateStatus(id, status) {
    const labels = { 'completada': 'completar', 'cancelada': 'cancelar' };
    if (!confirm(`¿Estás seguro de ${labels[status] || status} esta cita?`)) return;

    try {
        const { error } = await supabaseClient
            .from('citas')
            .update({ estado: status })
            .eq('id', id);

        if (error) throw error;
        loadAllAppointments();
        showToast('Estado actualizado correctamente', 'success');

    } catch (err) {
        console.error('Error updating status:', err);
        showToast('Error al actualizar el estado', 'error');
    }
}

// --- ESTUDIOS HANDLING ---

async function loadEstudios() {
    try {
        const { data, error } = await supabaseClient
            .from('estudios_laboratorio')
            .select('*')
            .eq('activo', true)
            .order('categoria', { ascending: true });

        todosEstudios = data || [];
        renderEstudiosList();
        loadCategorias();

    } catch (err) {
        console.error('Error loading estudios:', err);
    }
}

async function loadMedicos() {
    try {
        const { data } = await supabaseClient
            .from('medicos_referentes')
            .select('*')
            .eq('activo', true)
            .order('nombre', { ascending: true });

        todosMedicos = data || [];
        renderMedicosDatalist();

    } catch (err) {
        console.error('Error loading medicos:', err);
    }
}

function loadCategorias() {
    if (todosEstudios.length === 0) return;
    const categorias = [...new Set(todosEstudios.map(e => e.categoria))].sort();
    const select = document.getElementById('filtroCategoria');
    if (select) {
        select.innerHTML = '<option value="">Todas las categorías</option>';
        categorias.forEach(cat => {
            select.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
    }
}

function renderEstudiosList(filtro = '', categoria = '') {
    const container = document.getElementById('listaEstudios');
    if (!container) return;

    let estudiosFiltrados = todosEstudios.filter(e => {
        const matchNombre = e.nombre.toLowerCase().includes(filtro.toLowerCase());
        const matchCategoria = !categoria || e.categoria === categoria;
        return matchNombre && matchCategoria;
    });

    if (estudiosFiltrados.length === 0) {
        container.innerHTML = '<div style="padding: 1rem; text-align: center; color: #94a3b8;">No se encontraron estudios</div>';
        return;
    }

    let html = '';
    estudiosFiltrados.forEach(est => {
        const isSelected = estudiosSeleccionados.some(s => s.id === est.id);
        const precio = parseFloat(est.precio || 0).toFixed(2);

        html += `
        <div class="estudio-item ${isSelected ? 'selected' : ''}" onclick="toggleEstudio('${est.id}')">
            <div style="display: flex; flex-direction: column;">
                <span class="estudio-nombre">${est.nombre}</span>
                <span style="font-size: 0.75rem; color: #64748b;">${est.indicaciones || 'Ayuno default'}</span>
            </div>
            <div style="text-align: right;">
                <span style="font-weight: 600; color: #0d9488;">$${precio}</span>
                <br>
                <span class="estudio-categoria">${est.categoria}</span>
            </div>
        </div>
    `;
    });

    container.innerHTML = html;
}

function toggleEstudio(id) {
    const estudio = todosEstudios.find(e => e.id === id);
    if (!estudio) return;

    const index = estudiosSeleccionados.findIndex(s => s.id === id);
    if (index > -1) {
        estudiosSeleccionados.splice(index, 1);
    } else {
        estudiosSeleccionados.push(estudio);
    }

    renderEstudiosList(
        document.getElementById('buscarEstudio').value,
        document.getElementById('filtroCategoria').value
    );
    renderEstudiosSeleccionados();
    calcularTotal();
}

function renderEstudiosSeleccionados() {
    const container = document.getElementById('estudiosSeleccionados');
    if (!container) return;

    if (estudiosSeleccionados.length === 0) {
        container.innerHTML = '<span style="color: #94a3b8; font-size: 0.85rem;">Ningún estudio seleccionado</span>';
        return;
    }

    let html = `<div style="width: 100%;"><strong style="font-size: 0.8rem; color: #64748b;">${estudiosSeleccionados.length} estudio(s) seleccionado(s):</strong></div>`;
    estudiosSeleccionados.forEach((est) => {
        const precio = parseFloat(est.precio || 0).toFixed(2);
        html += `
        <div class="estudio-seleccionado-item" style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0.5rem 0.75rem; background: #f0fdfa; border-radius: 8px; margin-top: 0.5rem;">
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-weight: 600; color: #0d9488;">${est.codigo || '---'}</span>
                    <span style="color: #334155;">${est.nombre}</span>
                </div>
                <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">
                    ⚠️ ${est.indicaciones || 'Ayuno general 8h'}
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-weight: 700; color: #0f766e;">$${precio}</span>
                <button type="button" onclick="toggleEstudio('${est.id}')" style="background: #ef4444; border: none; color: white; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2.5;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        </div>
    `;
    });

    container.innerHTML = html;
}

function renderMedicosDatalist() {
    const datalist = document.getElementById('listaMedicos');
    if (!datalist) return;
    datalist.innerHTML = '';
    todosMedicos.forEach(med => {
        datalist.innerHTML += `<option value="${med.nombre}">`;
    });
}

function setupEstudioSearch() {
    const searchInput = document.getElementById('buscarEstudio');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderEstudiosList(e.target.value, document.getElementById('filtroCategoria').value);
        });
    }

    const catInput = document.getElementById('filtroCategoria');
    if (catInput) {
        catInput.addEventListener('change', (e) => {
            renderEstudiosList(document.getElementById('buscarEstudio').value, e.target.value);
        });
    }
}

function calcularTotal() {
    totalVenta = estudiosSeleccionados.reduce((sum, item) => sum + parseFloat(item.precio || 0), 0);

    const totalEl = document.getElementById('totalVenta');
    if (totalEl) totalEl.textContent = totalVenta.toFixed(2);

    const countEl = document.getElementById('cantidadEstudiosVenta');
    if (countEl) countEl.textContent = estudiosSeleccionados.length;

    calcularCambio();
}

function calcularCambio() {
    const montoInput = document.getElementById('montoPagado');
    if (!montoInput) return;

    montoPagado = parseFloat(montoInput.value) || 0;
    cambioVenta = montoPagado - totalVenta;

    const cambioEl = document.getElementById('cambioVenta');
    if (cambioEl) {
        cambioEl.textContent = cambioVenta.toFixed(2);
        if (cambioVenta < 0) {
            cambioEl.style.color = '#ef4444';
        } else {
            cambioEl.style.color = '#0f766e';
        }
    }
}

function openNewAppointmentModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Nueva Cita de Laboratorio';
    document.getElementById('appointmentForm').reset();
    const now = new Date();
    // Default: Today's date
    const localDate = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).split('/').reverse().join('-');

    document.getElementById('appointmentDate').value = localDate;
    document.getElementById('appointmentTime').value = '23:59';

    estudiosSeleccionados = [];
    renderEstudiosSeleccionados();
    document.getElementById('buscarEstudio').value = '';
    document.getElementById('filtroCategoria').value = '';
    renderEstudiosList();

    document.getElementById('appointmentModal').classList.add('active');
}

// --- TICKET GENERATOR ---

function generateTicket(citaData, folio) {
    const fecha = new Date().toLocaleString('es-MX');
    const paciente = citaData.paciente_nombre;
    const medicoStr = document.getElementById('medicoReferente') ? document.getElementById('medicoReferente').value : '';
    const medico = medicoStr ? medicoStr : 'Particular / Referencia General';
    const metodoPago = (citaData.metodo_pago || 'efectivo').toUpperCase();

    // QR Code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=Folio:${folio}|Paciente:${paciente}`;

    const itemsHtml = estudiosSeleccionados.map(est => `
    <tr>
        <td style="padding: 5px 0;">${est.nombre}</td>
        <td style="text-align: right;">$${parseFloat(est.precio).toFixed(2)}</td>
    </tr>
    <tr>
        <td colspan="2" style="font-size: 11px; color: #000; padding-bottom: 8px; line-height: 1.2;">
            <strong>Indicaciones:</strong> ${est.indicaciones || 'Sin indicaciones especiales.'}
        </td>
    </tr>
`).join('');

    const ticketWindow = window.open('', 'PRINT', 'height=700,width=450');

    ticketWindow.document.write(`
    <html>
    <head>
        <title>Ticket #${folio} - ${currentLabConfig.nombre_laboratorio}</title>
        <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; max-width: 350px; margin: 0 auto; padding: 20px; color: #000; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo-img { max-width: 150px; margin-bottom: 10px; }
            .lab-name { font-size: 22px; font-weight: bold; color: #0f766e; }
            .info { margin-bottom: 15px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            .totals { border-top: 2px solid black; margin-top: 10px; padding-top: 10px; }
            .qr-container { text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 1px solid #ccc; padding-top: 10px;}
            @media print { .no-print { display: none; } }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="arlab_logo.png" class="logo-img" onerror="this.style.display='none'">
            <div class="lab-name">${currentLabConfig.nombre_laboratorio}</div>
            <div style="margin-top:5px; font-weight:bold;">LABORATORIO CLÍNICO</div>
            <div>Folio: #${folio}</div>
            <div>${fecha}</div>
        </div>
        
        <div class="info">
            <strong>PACIENTE:</strong> ${paciente}<br>
            <strong>MÉDICO:</strong> ${medico}<br>
            <strong>PAGO:</strong> ${metodoPago}
        </div>

        <table>
            <thead>
                <tr style="border-bottom: 1px solid black;">
                    <th style="text-align: left;">CONCEPTO</th>
                    <th style="text-align: right;">IMPORTE</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr>
                    <td><strong>NETO A PAGAR:</strong></td>
                    <td style="text-align: right;"><strong>$${totalVenta.toFixed(2)}</strong></td>
                </tr>
                <tr>
                    <td>EFECTIVO/PAGO:</td>
                    <td style="text-align: right;">$${montoPagado.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>CAMBIO:</td>
                    <td style="text-align: right;">$${cambioVenta.toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <div class="qr-container">
            <img src="${qrUrl}" alt="QR Code">
            <div style="font-size: 9px; margin-top: 5px;">Escanea para validar folio</div>
        </div>

        <div class="footer">
            <p><strong>GRACIAS POR SU CONFIANZA</strong></p>
            <p>${currentLabConfig.responsable_sanitario}</p>
            <p>Céd. Prof. ${currentLabConfig.cedula_profesional}</p>
            <p>${currentLabConfig.direccion}</p>
            <p><strong>Tel: ${currentLabConfig.telefono}</strong></p>
        </div>
        <script>
            window.onload = function() { window.print(); window.close(); }
        <\/script>
    </body>
    </html>
    `);
}

// UI NAVIGATION HELPERS
// UI NAVIGATION HELPERS
function switchView(viewName) {
    // Lista explícita de IDs de vistas
    const allViews = ['viewInicio', 'viewCitas', 'viewPacientes', 'viewResultados', 'viewConfiguracion', 'viewAnalitica', 'viewProcesoAnalitico', 'viewCotizaciones'];

    // 1. Ocultar todas las vistas primero
    allViews.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // 2. Calcular ID de la vista destino
    // Si viewName llega como 'inicio', 'citas', etc.
    const normalized = viewName.toLowerCase();

    // Handle special case where 'analitica' refers to pre-analytical waiting room
    let targetId = 'view' + normalized.charAt(0).toUpperCase() + normalized.slice(1);

    // Special handling for underscore names if needed, but since we use 'viewProcesoAnalitico' (camelCase in HTML ID) vs 'proceso_analitico' (snake_case in URL param), 
    // the automated conversion 'viewProceso_analitico' won't match 'viewProcesoAnalitico'.
    if (normalized === 'proceso_analitico') {
        targetId = 'viewProcesoAnalitico';
    }

    // 3. Mostrar la vista destino
    const target = document.getElementById(targetId);
    if (target) {
        target.style.display = 'block';

        // Actualizar título de la página
        const titles = {
            'inicio': 'Inicio',
            'citas': 'Gestión de Citas',
            'pacientes': 'Directorio de Pacientes',
            'resultados': 'Resultados de Estudios',
            'configuracion': 'Configuración del Sistema',
            'analitica': 'Fase Pre-Analítica - Sala de Espera',
            'proceso_analitico': 'Fase Analítica - Procesamiento de Muestras',
            'cotizaciones': 'Cotizador de Servicios'
        };
        const titleEl = document.getElementById('pageTitle');
        if (titleEl) {
            titleEl.textContent = titles[normalized] || 'Ar Lab';
        }

        // Controlar visibilidad de botones de acción (Nuevo Paciente, Nueva Cita)
        const topBarActions = document.querySelector('.top-bar-actions');
        if (topBarActions) {
            if (normalized === 'analitica' || normalized === 'proceso_analitico' || normalized === 'cotizaciones') {
                topBarActions.style.display = 'none';
            } else {
                topBarActions.style.display = 'flex';
            }
        }

        // Cargar datos específicos si es necesario
        if (normalized === 'analitica') {
            loadWorkList();
        } else if (normalized === 'proceso_analitico') {
            loadFaseAnalitica();
        } else if (normalized === 'cotizaciones') {
            if (typeof initCotizadorView === 'function') initCotizadorView();
        }

    } else {
        console.warn('View not found:', viewName, targetId);
        // Fallback: Mostrar inicio si la vista solicitada no existe
        const home = document.getElementById('viewInicio');
        if (home) home.style.display = 'block';
    }
}

/* --- PATIENT CALLING SYSTEM --- */
async function callPatient(id, patientName) {
    if (!('speechSynthesis' in window)) {
        showToast('Su navegador no soporta llamadas por voz', 'error');
        return;
    }

    // 1. Actualizar estado en DB (solo si no está completada/cancelada)
    // Usamos Supabase para persistir el "naranja"
    try {
        const { error } = await supabaseClient
            .from('citas')
            .update({ estado: 'llamado' })
            .eq('id', id)
            // Evitar sobrescribir estados finales si se hace click accidentalmente
            .neq('estado', 'completada')
            .neq('estado', 'cancelada');

        if (error) throw error;

        // Refrescar tabla para ver el semáforo naranja
        await loadAllAppointments();

    } catch (err) {
        console.error('Error updating call status:', err);
        // Continuamos con el audio aunque falle la DB
    }

    // 2. Audio TTS
    window.speechSynthesis.cancel();

    // Texto a pronunciar
    const frases = [
        `Paciente ${patientName}, favor de pasar a toma de muestras.`,
        `Atención, paciente ${patientName}, su turno ha llegado.`
    ];
    const texto = frases[0];

    const utterance = new SpeechSynthesisUtterance(texto);

    utterance.volume = 1.0;
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('es-MX')) ||
        voices.find(v => v.lang.includes('es'));

    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
    showToast('📢 Llamando a ' + patientName, 'info');
}

// Cargar voces al inicio (necesario en Chrome)
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        // Pre-load logic if needed
        window.speechSynthesis.getVoices();
    };
}
