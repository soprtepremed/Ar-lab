/* AR LAB - Dashboard QR & Verification Logic */

// Variables globales para el escáner QR
let qrStream = null;
let qrCanvas = null;
let qrContext = null;
let qrAnimationId = null;
let citaActualVerificar = null;

// --- FUNCIONES DE VERIFICACIÓN DE ASISTENCIA ---

function mostrarModalVerificarAsistencia(citaId) {
    const cita = allAppointments.find(c => c.id === citaId);
    if (!cita) return;

    citaActualVerificar = cita;

    const infoContainer = document.getElementById('pacienteInfoVerificar');
    const fecha = new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    infoContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div style="width: 40px; height: 40px; background: rgba(13, 148, 136, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #0d9488;">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div>
                <div style="font-size: 0.75rem; color: #64748b;">Paciente</div>
                <div style="font-weight: 600; color: #1e293b;">${cita.paciente_nombre}</div>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div style="width: 40px; height: 40px; background: rgba(13, 148, 136, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #0d9488;">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            </div>
            <div>
                <div style="font-size: 0.75rem; color: #64748b;">Cita programada</div>
                <div style="font-weight: 600; color: #1e293b;">${fecha}</div>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 40px; height: 40px; background: rgba(13, 148, 136, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #0d9488;">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" stroke-width="2">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
            </div>
            <div>
                <div style="font-size: 0.75rem; color: #64748b;">Estudios</div>
                <div style="font-weight: 600; color: #1e293b; white-space: pre-wrap;">${Array.isArray(cita.estudios) && cita.estudios.length > 0
            ? cita.estudios.map(e => e.nombre).join(', ')
            : (cita.estudios || 'Sin estudios')
        }</div>
            </div>
        </div>
    `;

    document.getElementById('modalVerificarAsistencia').classList.add('active');
}

function cerrarModalVerificarAsistencia() {
    document.getElementById('modalVerificarAsistencia').classList.remove('active');
    citaActualVerificar = null;
}

async function confirmarAsistenciaManual() {
    if (!citaActualVerificar) return;

    try {
        // Get next folio number for today
        // Calcular siguiente folio YYMMDD-NN
        // 1. Prefijo fecha
        const now = new Date();
        const yy = now.getFullYear().toString().slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const prefix = `${yy}${mm}${dd}`;

        // 2. Buscar el folio más alto de hoy (ej: 260119-05 -> extraer 05)
        const { data: existingFolios, error: folioError } = await supabaseClient
            .from('citas')
            .select('folio_atencion')
            .like('folio_atencion', `${prefix}-%`)
            .not('folio_atencion', 'is', null);

        if (folioError) throw folioError;

        let maxNum = 0;
        if (existingFolios && existingFolios.length > 0) {
            existingFolios.forEach(row => {
                if (row.folio_atencion) {
                    const parts = row.folio_atencion.split('-');
                    if (parts.length >= 2) {
                        const num = parseInt(parts[1], 10);
                        if (num > maxNum) maxNum = num;
                    }
                }
            });
        }

        const nextNum = maxNum + 1;
        const nextFolio = `${prefix}-${String(nextNum).padStart(2, '0')}`;

        // Update appointment with arrival info
        const { data, error } = await supabaseClient
            .from('citas')
            .update({
                folio_atencion: nextFolio,
                fecha_hora_llegada: new Date().toISOString(),
                estado: 'verificada',
                atendido_por: currentUser.id
            })
            .eq('id', citaActualVerificar.id)
            .select();

        if (error) throw error;

        // Guardar datos antes de limpiar el estado global
        const citaConfirmada = { ...citaActualVerificar, folio_atencion: nextFolio };

        cerrarModalVerificarAsistencia();

        // Fetch Estudios completos para etiquetas
        const { data: estudiosData } = await supabaseClient
            .from('citas_estudios')
            .select(`
                estudios_laboratorio (nombre, tubo_recipiente)
            `)
            .eq('cita_id', citaConfirmada.id);

        if (estudiosData) {
            citaConfirmada.estudios = estudiosData.map(item => item.estudios_laboratorio);
        }

        // Mostrar Etiquetas Directamente
        if (typeof mostrarModalEtiquetas === 'function') {
            mostrarModalEtiquetas(citaConfirmada);
        } else {
            showSuccessModal(
                '✅ Asistencia Verificada',
                `Paciente: ${citaConfirmada.paciente_nombre}\nFolio de atención: #${nextFolio}`
            );
        }

        // Refresh appointments list
        if (typeof loadAppointments === 'function') {
            await loadAppointments();
        }

    } catch (err) {
        console.error('Error verificando asistencia:', err);
        showErrorModal('Error', 'No se pudo verificar la asistencia: ' + err.message);
    }
}


// --- FUNCIONES DE ESCANEO QR ---

function escanearQRAsistencia() {
    cerrarModalVerificarAsistencia();
    document.getElementById('modalEscanearQR').classList.add('active');
    iniciarCamaraQR();
}

function cerrarModalEscanearQR() {
    document.getElementById('modalEscanearQR').classList.remove('active');
    detenerCamaraQR();
}

async function iniciarCamaraQR() {
    try {
        const video = document.getElementById('qrVideo');
        qrCanvas = document.getElementById('qrCanvas');
        qrContext = qrCanvas.getContext('2d');

        // Solicitar acceso a la cámara
        qrStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' } // Cámara trasera en móviles
        });

        video.srcObject = qrStream;
        video.setAttribute('playsinline', true); // iOS fix
        video.play();

        // Esperar a que el video esté listo
        video.onloadedmetadata = () => {
            qrCanvas.width = video.videoWidth;
            qrCanvas.height = video.videoHeight;
            escanearFrameQR();
        };

    } catch (err) {
        console.error('Error accessing camera:', err);
        let mensaje = 'No se pudo acceder a la cámara.';

        if (err.name === 'NotAllowedError') {
            mensaje = 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración del navegador.';
        } else if (err.name === 'NotFoundError') {
            mensaje = 'No se encontró ninguna cámara en este dispositivo.';
        }

        showErrorModal('Error de Cámara', mensaje);
        cerrarModalEscanearQR();
    }
}

function escanearFrameQR() {
    const video = document.getElementById('qrVideo');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        qrCanvas.width = video.videoWidth;
        qrCanvas.height = video.videoHeight;
        qrContext.drawImage(video, 0, 0, qrCanvas.width, qrCanvas.height);

        const imageData = qrContext.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (code) {
            // QR detectado!
            procesarQRDetectado(code.data);
            return; // Detener escaneo
        }
    }

    // Continuar escaneando
    qrAnimationId = requestAnimationFrame(escanearFrameQR);
}

async function procesarQRDetectado(qrData) {
    // Detener cámara
    detenerCamaraQR();

    try {
        // El QR contiene: "Folio:123|Paciente:Nombre del Paciente"
        // Extraer el folio
        const folioMatch = qrData.match(/Folio:(\d+)/);

        if (!folioMatch) {
            showErrorModal('QR Inválido', 'El código QR no contiene información válida del ticket.');
            cerrarModalEscanearQR();
            return;
        }

        const folioVenta = parseInt(folioMatch[1]);

        // Buscar la cita por folio_venta
        const { data: citas, error } = await supabaseClient
            .from('citas')
            .select('*')
            .eq('folio_venta', folioVenta)
            .single();

        if (error || !citas) {
            showErrorModal('Cita No Encontrada', `No se encontró ninguna cita con el folio ${folioVenta}.`);
            cerrarModalEscanearQR();
            return;
        }

        // Verificar que la cita sea de hoy
        const citaFecha = new Date(citas.fecha_hora).toISOString().split('T')[0];
        const hoy = new Date().toISOString().split('T')[0];

        if (citaFecha !== hoy) {
            showErrorModal('Fecha Incorrecta', `Esta cita está programada para ${citaFecha}, no para hoy.`);
            cerrarModalEscanearQR();
            return;
        }

        // Verificar si ya fue verificada
        if (citas.estado === 'verificada') {
            showInfoModal('Ya Verificada', `Esta cita ya fue verificada previamente con folio de atención #${citas.folio_atencion}.`);
            cerrarModalEscanearQR();
            return;
        }

        // Proceder con la verificación
        cerrarModalEscanearQR();

        // Obtener siguiente folio
        const today = new Date().toISOString().split('T')[0];
        // Calcular siguiente folio YYMMDD-NN
        const now = new Date();
        const yy = now.getFullYear().toString().slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const prefix = `${yy}${mm}${dd}`;

        const { count, error: countError } = await supabaseClient
            .from('citas')
            .select('*', { count: 'exact', head: true })
            .gte('fecha_hora_llegada', today + 'T00:00:00')
            .lte('fecha_hora_llegada', today + 'T23:59:59')
            .not('folio_atencion', 'is', null);

        if (countError) throw countError;

        const nextNum = (count || 0) + 1;
        const nextFolio = `${prefix}-${String(nextNum).padStart(2, '0')}`;

        // Actualizar la cita
        const { error: updateError } = await supabaseClient
            .from('citas')
            .update({
                folio_atencion: nextFolio,
                fecha_hora_llegada: new Date().toISOString(),
                estado: 'verificada',
                atendido_por: currentUser.id
            })
            .eq('id', citas.id);

        if (updateError) throw updateError;

        // Mostrar éxito
        // Fetch Estudios completos para etiquetas
        const { data: estudiosData } = await supabaseClient
            .from('citas_estudios')
            .select(`
                estudios_laboratorio (nombre, tubo_recipiente)
            `)
            .eq('cita_id', citas.id);

        const citaConfirmada = { ...citas, folio_atencion: nextFolio };
        if (estudiosData) {
            citaConfirmada.estudios = estudiosData.map(item => item.estudios_laboratorio);
        }

        // Mostrar Etiquetas Directamente
        if (typeof mostrarModalEtiquetas === 'function') {
            mostrarModalEtiquetas(citaConfirmada);
        } else {
            showSuccessModal(
                '✅ Asistencia Verificada por QR',
                `Paciente: ${citas.paciente_nombre}\nFolio de atención: #${nextFolio}`
            );
        }

        // Recargar lista de citas
        if (typeof loadAppointments === 'function') {
            await loadAppointments();
        }

    } catch (err) {
        console.error('Error procesando QR:', err);
        showErrorModal('Error', 'No se pudo procesar el código QR: ' + err.message);
        cerrarModalEscanearQR();
    }
}

function detenerCamaraQR() {
    // Detener animación
    if (qrAnimationId) {
        cancelAnimationFrame(qrAnimationId);
        qrAnimationId = null;
    }

    // Detener stream de video
    if (qrStream) {
        qrStream.getTracks().forEach(track => track.stop());
        qrStream = null;
    }

    // Limpiar video
    const video = document.getElementById('qrVideo');
    if (video && video.srcObject) {
        video.srcObject = null;
    }
}
