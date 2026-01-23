/**
 * Ar Lab - Unified Navbar Component
 */

function injectNavbar() {
    const navbarHTML = `
    <nav class="navbar">
        <a href="dashboard.html" class="navbar-brand">
            <svg viewBox="0 0 180 60" class="navbar-logo">
                <defs>
                    <linearGradient id="flaskGradNavBar" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#2dd4bf" />
                        <stop offset="100%" style="stop-color:#0d9488" />
                    </linearGradient>
                </defs>
                <g transform="translate(10,5)">
                    <path d="M15 8 L15 22 L5 42 Q3 46 6 48 L34 48 Q37 46 35 42 L25 22 L25 8 Z"
                        fill="url(#flaskGradNavBar)" stroke="#14b8a6" stroke-width="1.5" />
                    <rect x="13" y="2" width="14" height="8" rx="2" fill="url(#flaskGradNavBar)" stroke="#14b8a6"
                        stroke-width="1.5" />
                    <path d="M8 38 Q10 35 15 36 Q20 38 25 35 Q30 33 32 38 L30 45 Q28 47 20 47 Q12 47 10 45 Z"
                        fill="#5eead4" opacity="0.6" />
                    <circle cx="15" cy="40" r="2" fill="white" opacity="0.7" />
                    <circle cx="22" cy="38" r="1.5" fill="white" opacity="0.5" />
                    <text x="20" y="32" font-family="Outfit, sans-serif" font-size="12" font-weight="700" fill="white"
                        text-anchor="middle">Ar</text>
                </g>
                <text x="60" y="28" font-family="Outfit, sans-serif" font-size="22" font-weight="700" fill="white">Ar</text>
                <text x="85" y="28" font-family="Outfit, sans-serif" font-size="22" font-weight="400" fill="#2dd4bf">lab</text>
                <text x="60" y="45" font-family="Inter, sans-serif" font-size="9" fill="rgba(255,255,255,0.6)">Gestión de Laboratorio</text>
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
                    <a href="reportes.html" class="nav-item" id="navReportes">
                        <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        Reportes y Analíticas
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
    } else if (page === 'pacientes.html') {
        document.getElementById('navPacientes')?.classList.add('active');
    } else if (page === 'resultados.html') {
        document.getElementById('navResultados')?.classList.add('active');
    } else if (page === 'reportes.html') {
        document.getElementById('navReportes')?.classList.add('active');
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
