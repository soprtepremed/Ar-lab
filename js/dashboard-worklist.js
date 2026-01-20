/* --- WORK LIST (LISTA DE PACIENTES DEL DIA - SALA DE ESPERA) --- */

async function loadWorkList() {
    const tbody = document.getElementById('workListTableBody');
    const noData = document.getElementById('noWorkListMessage');
    const countEl = document.getElementById('workListCount');
    const dateInput = document.getElementById('workListDate');

    // Inicializar input de fecha si está vacío
    if (dateInput && !dateInput.value) {
        const now = new Date();
        // Formato local YYYY-MM-DD
        const localISO = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0');
        dateInput.value = localISO;
    }

    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 4rem; color: var(--text-light);"><div class="loading-spinner"></div> Cargando lista...</td></tr>';

    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    console.log('Cargando lista para fecha:', selectedDate);

    try {
        // Consultar citas del día seleccionado
        const { data, error } = await supabaseClient
            .from('citas')
            .select('*')
            .gte('fecha_hora', selectedDate + 'T00:00:00')
            .lte('fecha_hora', selectedDate + 'T23:59:59')
            .in('estado', ['verificada', 'llamado'])
            .order('folio_atencion', { ascending: true });

        if (error) throw error;

        console.log('Resultados encontrados:', data ? data.length : 0);

        tbody.innerHTML = '';

        if (data && data.length > 0) {
            noData.style.display = 'none';
            if (countEl) countEl.textContent = data.length;

            // --- Fetch Estudios Logic ---
            const citaIds = data.map(c => c.id);
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
                data.forEach(apt => {
                    apt.estudios = estudiosMap[apt.id] || [];
                });
            }
            // ----------------------------

            data.forEach(apt => {
                // Badge
                let statusClass = 'verified';
                let statusText = 'En Espera';
                let rowBg = '#ffffff';

                if (apt.estado === 'llamado') {
                    statusClass = 'llamado';
                    statusText = 'Llamando...';
                    rowBg = '#fff7ed'; // Naranja muy claro para destacar
                }

                // Semaforo Logic (Traffic Lights)
                let dotsHtml = '';

                // Dot 1: Registro (Always done)
                dotsHtml += '<div class="step-dot completed" data-title="Registro/Caja: Completado"></div>';

                // Dot 2: Sala Espera (Always done for this view)
                dotsHtml += '<div class="step-dot completed" data-title="Sala de Espera: Verificado"></div>';

                // Dot 3: Llamado
                if (apt.estado === 'llamado') {
                    dotsHtml += '<div class="step-dot active" data-title="Llamando: En curso..."></div>';
                } else {
                    dotsHtml += '<div class="step-dot" data-title="Llamado: Pendiente"></div>';
                }

                // Dot 4: Toma de Muestra
                dotsHtml += '<div class="step-dot" data-title="En Toma: Siguiente Paso"></div>';

                const badge = `<div class="semaforo-steps" style="justify-content:center;">${dotsHtml}</div>`;

                // Calcular Edad
                let edadStr = 'N/A';
                if (apt.paciente_fecha_nacimiento) {
                    const birthDate = new Date(apt.paciente_fecha_nacimiento);
                    const ageDifMs = Date.now() - birthDate.getTime();
                    const ageDate = new Date(ageDifMs);
                    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                    edadStr = age + ' años';
                }

                const row = document.createElement('tr');
                if (apt.estado === 'llamado') row.style.backgroundColor = rowBg;

                let buttonHtml = '';

                if (apt.estado === 'llamado') {
                    // Estado: Ya llamado -> Botón prominente de RE-LLAMAR + Botón de VERIFICAR MUESTRA
                    buttonHtml = `
                        <div style="display: flex; gap: 8px;">
                            <button class="action-btn" onclick="callPatient('${apt.id}', '${apt.paciente_nombre}'); setTimeout(loadWorkList, 2000);" title="Volver a llamar" style="flex: 1; height: 40px; justify-content: center; background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; transition: all 0.2s; box-shadow: 0 2px 4px rgba(249, 115, 22, 0.1);">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                <span style="font-weight: 700; margin-left: 6px; font-size: 0.8rem;">RE-LLAMAR</span>
                            </button>
                            <button class="action-btn" onclick="verificarMuestra('${apt.id}', '${apt.paciente_nombre}')" title="Muestra Tomada / Cerrar Turno" style="flex: 1; height: 40px; justify-content: center; background: #ecfdf5; color: #047857; border: 1px solid #6ee7b7; transition: all 0.2s; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span style="font-weight: 700; margin-left: 6px; font-size: 0.8rem;">TOMADA</span>
                            </button>
                        </div>
                    `;
                } else {
                    // Estado: Verificada (Aún no llamado) -> Botón de Icono discreto (Primera llamada)
                    buttonHtml = `
                        <button class="action-btn" onclick="callPatient('${apt.id}', '${apt.paciente_nombre}'); setTimeout(loadWorkList, 2000);" title="Llamar a Sala" style="width: 100%; height: 40px; justify-content: center; background: #f0fdfa; color: #0d9488; border: 1px solid #ccfbf1; border-radius: 10px; margin: 0 auto; display: flex; transition: all 0.2s; gap: 8px;">
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                            <span style="font-weight: 600;">LLAMAR AHORA</span>
                        </button>
                    `;
                }

                row.innerHTML = `
                    <td>
                        <div style="font-size: 1.5rem; font-weight: 800; color: #1e293b; text-align: center; background: ${apt.estado === 'llamado' ? '#ffedd5' : '#f0fdfa'}; padding: 0.5rem; border-radius: 8px; font-family: 'Consolas', 'Monaco', monospace; letter-spacing: 1px; width: 100%;">
                            ${apt.folio_atencion || '--'}
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 700; color: #0f172a; font-size: 1.1rem; margin-bottom: 2px;">${apt.paciente_nombre}</div>
                    </td>
                    <td>
                        <div style="display:flex; flex-wrap:wrap; gap:4px;">
                             ${apt.estudios && apt.estudios.length > 0
                        ? apt.estudios.map(e => `<span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; font-weight:500; border: 1px solid #bae6fd;">${e.nombre}</span>`).join('')
                        : '<span style="color: #94a3b8; font-style: italic;">Sin estudios</span>'}
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 500; color: #334155;">${edadStr}</div>
                        <div style="font-size: 0.8rem; color: #94a3b8;">${apt.paciente_fecha_nacimiento || ''}</div>
                    </td>
                    <td>
                        <div style="color: #475569; font-family: monospace; font-size: 0.95rem;">${apt.paciente_telefono || '--'}</div>
                    </td>
                    <td>${badge}</td>
                    <td>
                        ${buttonHtml}
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            noData.style.display = 'block';
            if (countEl) countEl.textContent = '0';
        }

    } catch (e) {
        console.error('Error loading daily list:', e);
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="color: #ef4444; text-align:center; padding: 2rem;">Error al cargar la lista. Verifica la conexión.</td></tr>';
    }
}

async function verificarMuestra(citaId, pacienteNombre) {
    if (!confirm('�Confirmar que se ha tomado la muestra para ' + pacienteNombre + '?')) return;

    try {
        const { error } = await supabaseClient
            .from('citas')
            .update({ estado: 'en_proceso' }) // Cambia a 'en_proceso' para Fase Anal�tica
            .eq('id', citaId);

        if (error) throw error;

        // Mostrar �xito
        showSuccessModal('Muestra Tomada', 'El paciente ha pasado a la Fase Anal�tica.');
        
        // Recargar lista
        loadWorkList();

    } catch (err) {
        console.error('Error al verificar muestra:', err);
        showErrorModal('Error', 'No se pudo actualizar el estado.');
    }
}

