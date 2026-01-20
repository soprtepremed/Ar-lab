/* AR LAB - Caja Logic */

async function checkCajaStatus() {
    const today = new Date().toISOString().split('T')[0];

    try {
        const { data, error } = await supabaseClient
            .from('caja_diaria')
            .select('*')
            .eq('fecha', today)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking caja:', error);
            return;
        }

        cajaAbierta = data;
        updateCajaUI();

    } catch (err) {
        console.error('Error checking caja:', err);
    }
}

function updateCajaUI() {
    const widget = document.getElementById('widgetCaja');
    const statusText = document.getElementById('cajaStatusText');
    const statusSub = document.getElementById('cajaStatusSub');
    const statusIcon = document.getElementById('cajaStatusIcon');
    const balance = document.getElementById('cajaBalance');
    const btn = document.getElementById('btnCajaAction');

    if (!widget) return;

    widget.style.display = 'flex'; // Mostrar widget

    if (cajaAbierta && cajaAbierta.estado === 'abierta') {
        // Caja Abierta
        statusText.textContent = 'Caja Abierta';
        statusSub.textContent = `Apertura: ${new Date(cajaAbierta.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
        statusIcon.className = 'status-icon active';
        statusIcon.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;

        // Calcular balance actual (Ventas hoy)
        // Esto requeriría sumar ventas. Por ahora mostramos monto apertura o ventas
        // Si tenemos totalVenta acumulado en main, podríamos usarlo.
        // Pero mejor mostramos '--' o calculamos.
        balance.textContent = `$${parseFloat(cajaAbierta.monto_apertura).toFixed(2)}`;

        btn.textContent = 'Cerrar Caja';
        btn.onclick = abrirModalCierreCaja;
        btn.classList.add('btn-secondary');
        btn.classList.remove('btn-primary');
    } else if (cajaAbierta && cajaAbierta.estado === 'cerrada') {
        // Caja Cerrada (Ya se abrió y cerró hoy)
        statusText.textContent = 'Caja Cerrada';
        statusSub.textContent = 'Balance Finalizado';
        statusIcon.className = 'status-icon inactive'; // Use inactive style
        statusIcon.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`;

        balance.textContent = `$${parseFloat(cajaAbierta.monto_cierre || 0).toFixed(2)}`;

        btn.textContent = 'Ver Resumen';
        btn.onclick = verResumenCaja;
        btn.classList.add('btn-secondary');
    } else {
        // No se ha abierto
        statusText.textContent = 'Caja Cerrada';
        statusSub.textContent = 'Re requiere apertura';
        statusIcon.className = 'status-icon inactive';
        statusIcon.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`;
        balance.textContent = '$0.00';

        btn.textContent = 'Abrir Caja';
        btn.onclick = abrirCajaModal;
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary'); // Highlight action
    }
}

function abrirCajaModal() {
    document.getElementById('modalCajaApertura').classList.add('active');
}

function cerrarModalCajaApertura() {
    document.getElementById('modalCajaApertura').classList.remove('active');
}

async function realizarApertura(event) {
    event.preventDefault();
    const monto = parseFloat(document.getElementById('montoApertura').value) || 0;
    const today = new Date().toISOString().split('T')[0];

    try {
        const { data, error } = await supabaseClient
            .from('caja_diaria')
            .insert([{
                fecha: today,
                monto_apertura: monto,
                usuario_apertura: currentUser.id,
                estado: 'abierta'
            }])
            .select()
            .single();

        if (error) throw error;

        cajaAbierta = data;
        cerrarModalCajaApertura();
        updateCajaUI();
        showToast('Caja abierta correctamente', 'success');

    } catch (err) {
        console.error('Error abriendo caja:', err);
        showToast('Error al abrir caja: ' + err.message, 'error');
    }
}

function abrirModalCierreCaja() {
    // Calcular totales antes de mostrar
    // Necesitamos sumar todas las citas 'pagadas' de hoy
    calcularCorteDeCaja().then(totales => {
        document.getElementById('resumenVentasSistema').textContent = `$${totales.sistema.toFixed(2)}`;
        document.getElementById('resumenEfectivoCaja').textContent = `$${totales.efectivo.toFixed(2)}`;
        document.getElementById('expectedCierre').textContent = `$${(totales.efectivo + parseFloat(cajaAbierta.monto_apertura)).toFixed(2)}`;
        document.getElementById('modalCajaCierre').classList.add('active');
    });
}

function cerrarModalCajaCierre() {
    document.getElementById('modalCajaCierre').classList.remove('active');
}

async function calcularCorteDeCaja() {
    const today = new Date().toISOString().split('T')[0];
    // Obtener citas de hoy
    const { data: citas, error } = await supabaseClient
        .from('citas')
        .select('*')
        .gte('fecha_hora', `${today}T00:00:00`)
        .lte('fecha_hora', `${today}T23:59:59`);

    let totalSistema = 0;
    let totalEfectivo = 0; // Asumiendo que 'pagado' es efectivo por ahora, o filtrar por metodo_pago

    if (citas) {
        citas.forEach(c => {
            totalSistema += (c.total || 0);
            if (c.metodo_pago === 'efectivo' || !c.metodo_pago) {
                totalEfectivo += (c.pagado || 0);
            }
        });
    }

    return { sistema: totalSistema, efectivo: totalEfectivo };
}

async function realizarCierre(event) {
    event.preventDefault();
    const montoCierre = parseFloat(document.getElementById('montoCierreReal').value) || 0;
    const notas = document.getElementById('notasCierre').value;

    try {
        const { error } = await supabaseClient
            .from('caja_diaria')
            .update({
                monto_cierre: montoCierre,
                fecha_cierre: new Date().toISOString(),
                usuario_cierre: currentUser.id,
                estado: 'cerrada',
                notas: notas
            })
            .eq('id', cajaAbierta.id);

        if (error) throw error;

        cajaAbierta.estado = 'cerrada';
        cajaAbierta.monto_cierre = montoCierre;

        cerrarModalCajaCierre();
        updateCajaUI();
        showToast('Caja cerrada correctamente', 'success');

    } catch (err) {
        console.error('Error cerrando caja:', err);
        showToast('Error al cerrar caja: ' + err.message, 'error');
    }
}

function verResumenCaja() {
    showInfoModal('Resumen de Caja', `Caja cerrada con $${cajaAbierta.monto_cierre.toFixed(2)}.\nApertura: $${cajaAbierta.monto_apertura.toFixed(2)}`);
}
