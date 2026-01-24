/* AR LAB - Modal & Notification Logic */

// --- TOAST NOTIFICATIONS ---

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '';
    switch (type) {
        case 'success':
            icon = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            break;
        case 'error':
            icon = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
            break;
        default:
            icon = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `
        <span style="color: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#0d9488'}">
            ${icon}
        </span>
        <span style="font-weight: 500; font-size: 0.9rem; color: #1e293b;">${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}


// --- GENERIC MODAL SYSTEM ---

function closeGenericModal() {
    document.getElementById('genericModal').classList.remove('active');
}

function showSuccessModal(title, message) {
    const modal = document.getElementById('genericModal');
    const icon = document.getElementById('genericModalIcon');
    const titleEl = document.getElementById('genericModalTitle');
    const messageEl = document.getElementById('genericModalMessage');
    const detailsEl = document.getElementById('genericModalDetails');

    icon.innerHTML = `
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;
    icon.style.background = 'rgba(16, 185, 129, 0.15)';
    icon.style.color = '#10b981';
    titleEl.textContent = title;
    titleEl.style.color = '#047857';
    messageEl.innerText = message; // Use innerText to preserve newlines
    detailsEl.style.display = 'none';

    modal.classList.add('active');
}

function showErrorModal(title, message) {
    const modal = document.getElementById('genericModal');
    const icon = document.getElementById('genericModalIcon');
    const titleEl = document.getElementById('genericModalTitle');
    const messageEl = document.getElementById('genericModalMessage');
    const detailsEl = document.getElementById('genericModalDetails');

    icon.innerHTML = `
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    `;
    icon.style.background = 'rgba(239, 68, 68, 0.15)';
    icon.style.color = '#ef4444';
    titleEl.textContent = title;
    titleEl.style.color = '#991b1b';
    messageEl.textContent = message;
    detailsEl.style.display = 'none';

    modal.classList.add('active');
}

function showInfoModal(title, message) {
    const modal = document.getElementById('genericModal');
    const icon = document.getElementById('genericModalIcon');
    const titleEl = document.getElementById('genericModalTitle');
    const messageEl = document.getElementById('genericModalMessage');
    const detailsEl = document.getElementById('genericModalDetails');

    icon.innerHTML = `
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    `;
    icon.style.background = 'rgba(59, 130, 246, 0.15)';
    icon.style.color = '#3b82f6';
    titleEl.textContent = title;
    titleEl.style.color = '#1e40af';
    messageEl.textContent = message;
    detailsEl.style.display = 'none';

    modal.classList.add('active');
}

function showDetailsModal(apt, fecha) {
    const modal = document.getElementById('genericModal');
    const icon = document.getElementById('genericModalIcon');
    const titleEl = document.getElementById('genericModalTitle');
    const messageEl = document.getElementById('genericModalMessage');
    const detailsEl = document.getElementById('genericModalDetails');

    // Procesar lista de estudios
    let estudiosHtml = '<span style="color: #94a3b8; font-style: italic;">Sin estudios registrados</span>';

    if (apt.estudios && Array.isArray(apt.estudios) && apt.estudios.length > 0) {
        estudiosHtml = '<ul style="margin: 0; padding-left: 1.2rem; margin-top: 0.5rem; color: #1e293b;">' +
            apt.estudios.map(e => `<li style="margin-bottom: 0.25rem;">${e.nombre || e.codigo || 'Estudio sin nombre'}</li>`).join('') +
            '</ul>';
    } else if (typeof apt.estudios === 'string' && apt.estudios !== '[object Object]') {
        estudiosHtml = apt.estudios;
    }

    icon.innerHTML = `
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" fill="none" stroke-width="2.5">
            <path d="M9 11l3 3 8-8M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    `;
    icon.style.background = 'rgba(13, 148, 136, 0.15)';
    icon.style.color = '#0d9488';
    titleEl.textContent = 'Detalles de Cita';
    titleEl.style.color = '#0f766e';
    messageEl.textContent = '';

    detailsEl.innerHTML = `
        <div class="detail-item">
            <span class="detail-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </span>
            <div>
                <div class="detail-label">Paciente</div>
                <div class="detail-value">${apt.paciente_nombre}</div>
            </div>
        </div>
        <div class="detail-item">
            <span class="detail-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
            </span>
            <div>
                <div class="detail-label">Teléfono</div>
                <div class="detail-value">${apt.paciente_telefono || 'No registrado'} ${apt.paciente_sexo ? `(${apt.paciente_sexo})` : ''}</div>
            </div>
        </div>
        <div class="detail-item">
            <span class="detail-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            </span>
            <div>
                <div class="detail-label">Fecha programada</div>
                <div class="detail-value">${fecha}</div>
            </div>
        </div>
        <div class="detail-item">
            <span class="detail-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" stroke-width="2">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
            </span>
            <div style="width: 100%;">
                <div class="detail-label">Estudios Solicitados</div>
                <div class="detail-value">${estudiosHtml}</div>
            </div>
        </div>
        ${apt.folio_atencion ? `
        <div class="detail-item" style="background: rgba(16, 185, 129, 0.1);">
            <span class="detail-icon" style="color: #059669; background: white;">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                </svg>
            </span>
            <div>
                <div class="detail-label">Folio Atención</div>
                <div class="detail-value" style="color: #059669;">#${apt.folio_atencion}</div>
            </div>
        </div>
        ` : ''}
    `;

    detailsEl.style.display = 'block';
    modal.classList.add('active');
}

// --- CALENDAR MODAL ---

function openCalendarModal() {
    document.getElementById('modalCalendar').classList.add('active');
}

function closeCalendarModal() {
    document.getElementById('modalCalendar').classList.remove('active');
}

// --- OTHER MODALS ---

function closeModal() {
    // Deprecated?
    document.getElementById('appointmentModal_deprecated').style.display = 'none';
}

function openCajaModal() {
    document.getElementById('modalCajaId').classList.add('active');
}

function cerrarCajaModal() {
    document.getElementById('modalCajaId').classList.remove('active');
}

function cerrarResumenModal() {
    document.getElementById('modalResumenCierre').classList.remove('active');
}
