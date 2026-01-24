/**
 * Ar Lab - Unified Navbar Component
 */

function injectNavbar() {
    const navbarHTML = `
    <nav class="navbar">
        <a href="dashboard.html" class="navbar-brand">
            <svg viewBox="0 0 300 100" class="navbar-logo" style="height: 55px; width: auto; filter: drop-shadow(0 0 2px rgba(45, 212, 191, 0.5));">
                <g transform="translate(30,10)">
                    <!-- Neon Flask Body: No Fill, Thick Stroke -->
                    <path d="M30 0 L50 0 L50 20 L75 70 Q80 80 70 80 L10 80 Q0 80 5 70 L30 20 Z" 
                          fill="none" stroke="#2dd4bf" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
                    <rect x="25" y="-5" width="30" height="7" rx="2" fill="none" stroke="#2dd4bf" stroke-width="5"/>
                    
                    <!-- Text 'Ar' inside Flask: White -->
                    <text x="40" y="58" font-family="Arial, sans-serif" font-weight="bold" font-size="28" fill="white" text-anchor="middle">Ar</text>
                </g>
                <!-- Text: Ar (White) lab (Neon) -->
                <text x="115" y="65" font-family="Arial, sans-serif" font-weight="bold" font-size="52" fill="white">Ar</text>
                <text x="175" y="65" font-family="Arial, sans-serif" font-weight="normal" font-size="52" fill="#2dd4bf">lab</text>
                <text x="117" y="88" font-family="Arial, sans-serif" font-weight="normal" font-size="11" fill="rgba(255,255,255,0.6)" letter-spacing="3">GESTIÓN DE LABORATORIO</text>
            </svg>
        </a>

        <div class="navbar-nav">
            <!-- Inicio -->
            <a href="dashboard.html" class="nav-item" id="navInicio">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Inicio
            </a>

            <!-- Favoritos (New) -->
            <div id="navFavoritos" class="nav-dropdown" style="display:none;" onclick="toggleDropdown(this)">
                <div class="nav-dropdown-toggle">
                    <span>Favoritos</span>
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="nav-dropdown-menu" id="navFavoritosMenu">
                    <!-- Dynamic Favorites -->
                </div>
            </div>

            <!-- Fase Pre-Analítica -->
            <div id="probMuestras" class="nav-dropdown" onclick="toggleDropdown(this)">
                <div class="nav-dropdown-toggle">
                    <span>Fase Pre-Analítica</span>
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="nav-dropdown-menu">
                    <a href="dashboard.html?view=citas" class="nav-item" id="navCitas">
                        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Gestión de Citas
                    </a>
                    <a href="pacientes.html" class="nav-item" id="navPacientes">
                        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Pacientes
                    </a>
                    <a href="dashboard.html?view=cotizaciones" class="nav-item" id="navCotizaciones">
                        <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        Cotizaciones
                    </a>
                    <a href="dashboard.html?view=analitica" class="nav-item" id="navAnalitica">
                        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Pacientes del Día
                    </a>
                </div>
            </div>

            <!-- Fase Analítica -->
            <div id="probAnalitica" class="nav-dropdown" onclick="toggleDropdown(this)">
                <div class="nav-dropdown-toggle">
                    <span>Fase Analítica</span>
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="nav-dropdown-menu">
                    <a href="dashboard.html?view=proceso_analitico" class="nav-item" id="navProcesoAnalitico">
                        <svg viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path></svg>
                        Procesamiento de Muestras
                    </a>
                    <a href="resultados.html" class="nav-item" id="navResultados">
                        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Captura de Resultados
                    </a>
                </div>
            </div>

            <!-- Fase Pos-Analítica -->
            <div id="probPosAnalitica" class="nav-dropdown" onclick="toggleDropdown(this)">
                <div class="nav-dropdown-toggle">
                    <span>Fase Pos-Analítica</span>
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="nav-dropdown-menu">
                    <a href="entrega.html" class="nav-item" id="navEntrega">
                        <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        Entrega de Resultados
                    </a>
                </div>
            </div>

            <!-- Sección -->
            <div id="probSeccion" class="nav-dropdown" onclick="toggleDropdown(this)">
                <div class="nav-dropdown-toggle">
                    <span>Sección</span>
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="nav-dropdown-menu">
                    <a href="comprobantes.html" class="nav-item" id="navComprobantes">
                        <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><path d="M7 15h.01"></path><path d="M11 15h.01"></path><path d="M15 15h.01"></path></svg>
                        Comprobantes
                    </a>
                </div>
            </div>

            <!-- Sistema (Solo Admin) -->
            <div class="nav-dropdown" id="menuSistema" onclick="toggleDropdown(this)">
                <div class="nav-dropdown-toggle">
                    <span>Sistema</span>
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="nav-dropdown-menu">
                    <a href="configuracion.html" class="nav-item" id="navConfig">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        Configuración
                    </a>
                </div>
            </div>

        </div>

        <div class="navbar-user">
            <div class="user-avatar" id="navUserAvatar">U</div>
            <div class="user-details">
                <div class="user-info-text"><span id="navUserName">Cargando...</span></div>
                <div class="user-role-text" id="navUserRole">Operador</div>
            </div>
            <button class="logout-btn" onclick="logout()" title="Cerrar sesión">
                <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
        </div>
    </nav>
    `;

    const container = document.getElementById('navbar-container');
    if (container) {
        container.innerHTML = navbarHTML;
        setupNavbar();
    }
}

function toggleDropdown(element) {
    const wasActive = element.classList.contains('active');
    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('active'));
    if (!wasActive) {
        element.classList.add('active');
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('active'));
    }
});

function setupNavbar() {
    // Determine active item based on URL
    const path = window.location.pathname;
    const page = path.split('/').pop();

    if (page === 'dashboard.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        if (!view || view === 'inicio') document.getElementById('navInicio')?.classList.add('active');
        else if (view === 'citas') document.getElementById('navCitas')?.classList.add('active');
        else if (view === 'cotizaciones') document.getElementById('navCotizaciones')?.classList.add('active');
        else if (view === 'analitica') document.getElementById('navAnalitica')?.classList.add('active');
        else if (view === 'proceso_analitico') document.getElementById('navProcesoAnalitico')?.classList.add('active');
        else if (view === 'pos_analitica') document.getElementById('navPosAnalitica')?.classList.add('active');
    } else if (page === 'pacientes.html') {
        document.getElementById('navPacientes')?.classList.add('active');
    } else if (page === 'resultados.html') {
        document.getElementById('navResultados')?.classList.add('active');
    } else if (page === 'reportes.html') {
        document.getElementById('navReportes')?.classList.add('active');
    } else if (page === 'entrega.html') {
        document.getElementById('navEntrega')?.classList.add('active');
    } else if (page === 'comprobantes.html') {
        document.getElementById('navComprobantes')?.classList.add('active');
    } else if (page === 'configuracion.html') {
        document.getElementById('navConfig')?.classList.add('active');
    }

    // Load User Data
    const userData = JSON.parse(localStorage.getItem('arlab_user') || '{}');
    const userName = userData.nombre || userData.usuario || 'Usuario';
    const userRole = userData.rol || 'operador';

    if (document.getElementById('navUserName')) {
        document.getElementById('navUserName').textContent = userName;
        document.getElementById('navUserRole').textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1);
        document.getElementById('navUserAvatar').textContent = userName.charAt(0).toUpperCase();

        // --- ROLE MANAGEMENT ---
        const menus = {
            preAnalitica: document.getElementById('probMuestras'),
            analitica: document.getElementById('probAnalitica'),
            posAnalitica: document.getElementById('probPosAnalitica'),
            seccion: document.getElementById('probSeccion'),
            sistema: document.getElementById('menuSistema')
        };

        // Reset display
        Object.values(menus).forEach(m => { if (m) m.style.display = 'block'; });

        // Apply restrictions
        if (userRole === 'quimico') {
            // Quimico hides Pre-Analitica, Seccion, Sistema
            if (menus.preAnalitica) menus.preAnalitica.style.display = 'none';
            if (menus.seccion) menus.seccion.style.display = 'none';
            if (menus.sistema) menus.sistema.style.display = 'none';
        } else if (userRole === 'recepcion') {
            // Recepcion hides Analitica, PosAnalitica, Sistema
            // Maybe they need Reports? Assuming no for now based on prompt intent (separation of duties)
            if (menus.analitica) menus.analitica.style.display = 'none';
            // if(menus.posAnalitica) menus.posAnalitica.style.display = 'none'; // Keeping reports for everyone for now? Or hide? Hiding as requested "QUITANDO VISTAS"
            if (menus.sistema) menus.sistema.style.display = 'none';

            // Adjust: Recepcion might NOT need Proceso Analitico but might need Resultados? No, Quimicos do Resultados.
        } else if (userRole !== 'admin') {
            // Default/Fallback (Operador) - Hide config usually
            if (menus.sistema) menus.sistema.style.display = 'none';
        }

    } else if (page !== 'index.html' && !localStorage.getItem('arlab_user')) {
        // Redirect to login if not authenticated and not on login page
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('arlab_user');
    window.location.href = 'index.html';
}

// Support for switchView in dashboard.html if called from nav
window.switchViewNav = function (view) {
    if (typeof switchView === 'function') {
        switchView(view);
    } else {
        window.location.href = `dashboard.html?view=${view}`;
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavbar);
} else {
    injectNavbar();
}

/**
 * NEW: Render Favorites based on LocalStorage
 * Relies on logic similar to dashboard-customizer.js, but duplicated here 
 * or shared if we extracted it to a common file (TODO).
 * For now, we will read the same Key.
 */
function renderNavbarFavorites() {
    const container = document.getElementById('navFavoritos');
    const menu = document.getElementById('navFavoritosMenu');
    if (!container || !menu) return;

    const PREF_KEY = 'arlab_shortcuts_prefs';
    const saved = localStorage.getItem(PREF_KEY);

    // If no prefs, or empty, hide "Favoritos"
    if (!saved) {
        container.style.display = 'none';
        return;
    }

    const selectedIds = JSON.parse(saved);
    if (selectedIds.length === 0) {
        container.style.display = 'none';
        return;
    }

    // We do need the module definitions. 
    // Since we can't easily import inside this simple script structure without modules,
    // we will define a minimal set here or rely on the fact that dashboard-customizer might be loaded.
    // Safeguard: If dashboard-customizer is loaded, use its data? 
    // Better approach: Define a minimal map here to avoid dependencies errors if customizer isn't present.

    // Quick Map matching the IDs in dashboard-customizer.js
    const MAP = {
        'new_appointment': { title: 'Nueva Cita', link: 'nueva_cita.html' },
        'register_patient': { title: 'Reg. Paciente', link: 'nueva_cita.html?mode=directo' },
        'delivery': { title: 'Entrega', link: 'entrega.html' },
        'worklist': { title: 'Sala Espera', link: 'dashboard.html?view=analitica' },
        'processing': { title: 'Procesamiento', link: 'dashboard.html?view=proceso_analitico' },
        'results': { title: 'Resultados', link: 'resultados.html' },
        'quotes': { title: 'Cotizaciones', link: 'dashboard.html?view=cotizaciones' },
        'reports': { title: 'Reportes', link: 'reportes.html' }
    };

    let html = '';
    selectedIds.forEach(id => {
        const item = MAP[id];
        if (item) {
            html += `<a href="${item.link}" class="nav-item">
                        <!-- Icon could be generic or specific -->
                        <span style="width:6px; height:6px; background:#2dd4bf; border-radius:50%; margin-right:8px;"></span>
                        ${item.title}
                     </a>`;
        }
    });

    // Add "Edit" link
    if (window.location.pathname.endsWith('dashboard.html') || window.location.pathname === '/') {
        html += `<a href="#" onclick="openCustomizeModal(); return false;" class="nav-item" style="color:#64748b; font-size: 0.8rem; border-top:1px solid #eee; margin-top:4px;">
                    <svg viewBox="0 0 24 24" width="12" height="12" style="margin-right:6px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Personalizar
                </a>`;
    }

    menu.innerHTML = html;
    container.style.display = 'block';
}

// Hook into setupNavbar to trigger this
const originalSetup = setupNavbar;
setupNavbar = function () {
    originalSetup();
    renderNavbarFavorites();
};

// Listen for updates from dashboard-customizer
window.addEventListener('shortcuts-updated', renderNavbarFavorites);
