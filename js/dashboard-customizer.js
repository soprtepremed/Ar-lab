/**
 * Dashboard Customizer & Shortcuts Logic
 * Helper for managing user preferences for quick access links.
 */

const DASHBOARD_MODULES = [
    {
        id: 'new_appointment',
        title: 'Nueva Cita',
        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="10" y1="16" x2="14" y2="16"></line></svg>',
        link: 'nueva_cita.html',
        color: '#0d9488', // teal
        role: 'all'
    },
    {
        id: 'new_appointment',
        title: 'Nueva Cita',
        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="10" y1="16" x2="14" y2="16"></line></svg>',
        link: 'nueva_cita.html',
        color: '#0d9488', // teal
        role: 'all'
    },
    {
        id: 'register_patient',
        title: 'Registrar Paciente',
        icon: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="16" y1="11" x2="22" y2="11"></line></svg>',
        link: 'nueva_cita.html?mode=directo',
        color: '#0d9488', // teal
        role: 'all'
    },
    {
        id: 'delivery',
        title: 'Entrega Resultados',
        icon: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
        link: 'entrega.html',
        color: '#0d9488', // teal
        role: 'all'
    },
    {
        id: 'worklist',
        title: 'Sala de Espera',
        icon: '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        link: 'dashboard.html?view=analitica',
        color: '#0d9488', // teal
        role: 'all'
    },
    {
        id: 'processing',
        title: 'Procesamiento',
        icon: '<svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>',
        link: 'dashboard.html?view=proceso_analitico',
        color: '#0d9488', // teal
        role: 'quimico,admin'
    },
    {
        id: 'results',
        title: 'Captura Resultados',
        icon: '<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
        link: 'resultados.html',
        color: '#0d9488', // teal
        role: 'quimico,admin'
    },
    {
        id: 'quotes',
        title: 'Cotizaciones',
        icon: '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
        link: 'dashboard.html?view=cotizaciones',
        color: '#0d9488', // teal
        role: 'recepcion,admin'
    },
    {
        id: 'reports',
        title: 'Reportes',
        icon: '<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
        link: 'reportes.html',
        color: '#0d9488', // teal
        role: 'admin'
    }
];

const PREF_KEY = 'arlab_shortcuts_prefs';

function getAvailableModules() {
    const userData = JSON.parse(localStorage.getItem('arlab_user') || '{}');
    const userRole = userData.rol || 'operador';

    return DASHBOARD_MODULES.filter(mod => {
        if (mod.role === 'all') return true;
        return mod.role.includes(userRole);
    });
}

function getUserPreferences() {
    const saved = localStorage.getItem(PREF_KEY);
    if (saved) return JSON.parse(saved);

    // Default: First 3 available modules
    const avail = getAvailableModules();
    return avail.slice(0, 3).map(m => m.id);
}

function saveUserPreferences(selectedIds) {
    localStorage.setItem(PREF_KEY, JSON.stringify(selectedIds));
    // Trigger update on other components
    window.dispatchEvent(new Event('shortcuts-updated'));
}

function renderDashboardShortcuts(containerId = 'quickActionsGrid') {
    const container = document.getElementById(containerId);
    if (!container) return; // Might not be on dashboard

    const prefs = getUserPreferences();
    const modules = getAvailableModules().filter(m => prefs.includes(m.id));

    if (modules.length === 0) {
        container.innerHTML = `
            <div class="empty-shortcuts" onclick="openCustomizeModal()" style="grid-column: 1 / -1; text-align: center; padding: 2rem; border: 2px dashed #cbd5e1; border-radius: 12px; color: #64748b; cursor: pointer; transition: all 0.2s;">
                <p style="margin-bottom:0.5rem">No tienes accesos directos configurados</p> 
                <strong>+ Personalizar</strong>
            </div>
        `;
        return;
    }

    container.innerHTML = modules.map(mod => `
        <a href="${mod.link}" class="action-card shortcut-card" style="border-top: 4px solid ${mod.color}">
            <div style="color: ${mod.color}; margin-bottom: 0.5rem;">${mod.icon}</div>
            <h3>${mod.title}</h3>
        </a>
    `).join('') + `
        <div class="action-card add-more-card" onclick="openCustomizeModal()" style="border: 2px dashed #e2e8f0; display: flex; align-items: center; justify-content: center; opacity: 0.7; cursor: pointer;">
             <div style="text-align:center">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#64748b" fill="none" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.5rem;">Editar</div>
             </div>
        </div>
    `;
}

function renderCustomizeModal() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('modalStartCustomizer')) {
        const modalHtml = `
            <div id="modalStartCustomizer" class="modal-overlay" style="z-index: 10000;">
                <div class="modal" style="max-width: 500px; border-radius: 16px;">
                    <div class="modal-header">
                        <h3 class="modal-title">Personalizar Accesos</h3>
                        <button class="modal-close" onclick="closeCustomizeModal()">
                            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem;">Selecciona los elementos que quieres ver en tu pantalla de inicio y barra de navegación.</p>
                        <div id="customizerList" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <!-- Checkboxes go here -->
                        </div>
                        <div style="margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem;">
                            <button class="btn btn-secondary" onclick="closeCustomizeModal()">Cancelar</button>
                            <button class="btn btn-primary" onclick="saveCustomizations()">Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    const listContainer = document.getElementById('customizerList');
    const available = getAvailableModules();
    const selected = getUserPreferences();

    listContainer.innerHTML = available.map(mod => `
        <label class="customizer-option" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
            <input type="checkbox" value="${mod.id}" ${selected.includes(mod.id) ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #0d9488;">
            <span style="font-weight: 500; font-size: 0.9rem; color: #334155;">${mod.title}</span>
        </label>
    `).join('');

    document.getElementById('modalStartCustomizer').classList.add('active');
}

function closeCustomizeModal() {
    document.getElementById('modalStartCustomizer')?.classList.remove('active');
}

function saveCustomizations() {
    const checkboxes = document.querySelectorAll('#customizerList input[type="checkbox"]:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);

    saveUserPreferences(selectedIds);

    // Re-render
    renderDashboardShortcuts();
    closeCustomizeModal();

    // Dispatch event for Navbar
    window.dispatchEvent(new Event('shortcuts-updated'));
}

// Global exposure
window.openCustomizeModal = renderCustomizeModal;
window.closeCustomizeModal = closeCustomizeModal;
window.saveCustomizations = saveCustomizations;
window.renderDashboardShortcuts = renderDashboardShortcuts; // For init

// Auto-init specific to dashboard logic if imported there
if (document.location.pathname.endsWith('dashboard.html') || document.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a tick for DOM
        setTimeout(() => renderDashboardShortcuts(), 100);
    });
}

// Listener for external updates (e.g. if we have multiple customizers?)
window.addEventListener('shortcuts-updated', () => {
    renderDashboardShortcuts();
});
