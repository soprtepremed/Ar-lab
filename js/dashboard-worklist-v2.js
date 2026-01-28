/* --- WORK LIST (LISTA DE PACIENTES DEL DIA - SALA DE ESPERA) --- */

let currentWorkList = [];
let citaAConfirmar = null;

async function loadWorkList() {
    const tbody = document.getElementById('workListTableBody');
    const noData = document.getElementById('noWorkListMessage');
    const countEl = document.getElementById('workListCount');
    const dateInput = document.getElementById('workListDate');

    // Inicializar input de fecha si está vacío
    if (dateInput && !dateInput.value) {
        const now = new Date();
        const localISO = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0');
        dateInput.value = localISO;
    }

    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 4rem; color: var(--text-light);"><div class="loading-spinner"></div> Cargando lista...</td></tr>';

    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    console.log('Cargando lista para fecha:', selectedDate);

    try {
        // Consultar citas del día seleccionado
        const { data, error } = await supabaseClient
            .from('citas')
            .select('*')
            .gte('fecha_hora', selectedDate + 'T00:00:00')
            .lte('fecha_hora', selectedDate + 'T23:59:59')
            .in('estado', ['verificada', 'llamado', 'muestra_parcial'])
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
                    estudios_laboratorio (id, nombre, codigo, tubo_recipiente)
                `)
                .in('cita_id', citaIds);

            if (!estError && citasEstudios) {
                const estudiosMap = {};
                citasEstudios.forEach(ce => {
                    if (!estudiosMap[ce.cita_id]) {
                        estudiosMap[ce.cita_id] = [];
                    }
                    if (ce.estudios_laboratorio) {
                        // Include estudio_id for later updates
                        estudiosMap[ce.cita_id].push({
                            ...ce.estudios_laboratorio,
                            estudio_id: ce.estudio_id
                        });
                    }
                });
                data.forEach(apt => {
                    apt.estudios = estudiosMap[apt.id] || [];
                });
            }
            // ----------------------------

            currentWorkList = data; // Guardar en variable global

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
                const fechaNacRaw = apt.fecha_nacimiento || apt.paciente_fecha_nacimiento;
                if (fechaNacRaw) {
                    const birthDate = new Date(fechaNacRaw);
                    const ageDifMs = Date.now() - birthDate.getTime();
                    const ageDate = new Date(ageDifMs);
                    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                    edadStr = age + ' años';
                }

                const row = document.createElement('tr');
                if (apt.estado === 'llamado') row.style.backgroundColor = rowBg;

                let buttonHtml = '';

                if (apt.estado === 'muestra_parcial') {
                    // Estado: Muestra Parcial -> Solo botón para recibir muestra pendiente (sin llamar)
                    buttonHtml = `
                        <div style="display: flex; justify-content: center;">
                            <button class="action-btn" onclick="verificarMuestra('${apt.id}')" title="Recibir Muestra Pendiente" style="height: 36px; padding: 0 12px; justify-content: center; background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 0.8rem;">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                Recibir
                            </button>
                        </div>
                    `;
                } else if (apt.estado === 'llamado') {
                    // Estado: Ya llamado -> Botón RE-LLAMAR + VERIFICAR MUESTRA (solo iconos)
                    buttonHtml = `
                        <div style="display: flex; gap: 6px; justify-content: center;">
                            <button class="action-btn" onclick="callPatient('${apt.id}', '${apt.paciente_nombre}'); setTimeout(loadWorkList, 2000);" title="Re-Llamar Paciente" style="width: 40px; height: 40px; justify-content: center; background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; border-radius: 10px; cursor: pointer; display: flex; align-items: center;">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                            </button>
                            <button class="action-btn" onclick="verificarMuestra('${apt.id}')" title="Muestra Tomada" style="width: 40px; height: 40px; justify-content: center; background: #ecfdf5; color: #047857; border: 1px solid #6ee7b7; border-radius: 10px; cursor: pointer; display: flex; align-items: center;">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </button>
                        </div>
                    `;
                } else {
                    // Estado: Verificada (Aún no llamado) -> Solo icono de llamar
                    buttonHtml = `
                        <div style="display: flex; justify-content: center;">
                            <button class="action-btn" onclick="callPatient('${apt.id}', '${apt.paciente_nombre}'); setTimeout(loadWorkList, 2000);" title="Llamar a Sala" style="width: 40px; height: 40px; justify-content: center; background: #f0fdfa; color: #0d9488; border: 1px solid #ccfbf1; border-radius: 10px; cursor: pointer; display: flex; align-items: center;">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                            </button>
                        </div>
                    `;
                }

                row.innerHTML = `
                    <td style="padding: 4px 6px;">
                        <div style="font-size: 0.75rem; font-weight: 700; color: #1e293b; text-align: center; background: ${apt.estado === 'llamado' ? '#ffedd5' : '#f0fdfa'}; padding: 0.15rem 0.3rem; border-radius: 4px; font-family: 'Consolas', monospace;">
                            ${apt.folio_atencion || '--'}
                        </div>
                    </td>
                    <td style="padding: 4px 6px;">
                        <div style="font-weight: 600; color: #0f172a; font-size: 0.75rem; line-height: 1.2; display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
                            ${apt.paciente_nombre}
                            ${(() => {
                        if (!apt.paciente_sexo) return '';
                        const s = apt.paciente_sexo.toLowerCase();
                        if (s === 'masculino' || s === 'm') return `<span style="font-size: 0.55rem; background: #e0f2fe; color: #0369a1; padding: 1px 4px; border-radius: 3px; font-weight: 700;">M</span>`;
                        if (s === 'femenino' || s === 'f') return `<span style="font-size: 0.55rem; background: #fce7f3; color: #db2777; padding: 1px 4px; border-radius: 3px; font-weight: 700;">F</span>`;
                        return `<span style="font-size: 0.55rem; background: #f1f5f9; color: #64748b; padding: 1px 4px; border-radius: 3px;">${apt.paciente_sexo.charAt(0)}</span>`;
                    })()}
                        </div>
                        <div style="font-size: 0.6rem; color: #64748b; margin-top: 2px; display: flex; align-items: center; gap: 8px;">
                            <span style="display: inline-flex; align-items: center; gap: 2px;" title="Fecha de Nacimiento">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                ${(() => {
                        const rawDate = apt.fecha_nacimiento || apt.paciente_fecha_nacimiento;
                        if (!rawDate) return 'N/A';
                        const parts = rawDate.split('T')[0].split('-');
                        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                        return rawDate;
                    })()} 
                                <span style="color: var(--primary); font-weight: 600;">(${edadStr})</span>
                            </span>
                            <span style="display: inline-flex; align-items: center; gap: 2px;" title="Teléfono">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                ${apt.paciente_telefono || '--'}
                            </span>
                        </div>
                    </td>
                    <td style="padding: 4px 6px;">
                        <div style="font-size: 0.65rem; color: #334155; line-height: 1.3; max-width: 280px;">
                             ${apt.estudios && apt.estudios.length > 0
                        ? apt.estudios.map(e => e.nombre).join(', ')
                        : '<span style="color: #94a3b8; font-style: italic;">Sin estudios</span>'}
                        </div>
                    </td>
                    <td style="padding: 4px 6px;">${badge}</td>
                    <td style="padding: 4px 6px;">
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
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="color: #ef4444; text-align:center; padding: 2rem;">Error al cargar la lista. Verifica la conexión.</td></tr>';
    }
}


// --- MODAL CONFIRMATION LOGIC ---

async function verificarMuestra(citaId) {
    if (!currentWorkList) return;
    citaAConfirmar = currentWorkList.find(c => c.id === citaId);
    if (!citaAConfirmar) return;

    // Fetch current estado_muestra for each study
    const { data: estadosEstudios } = await supabaseClient
        .from('citas_estudios')
        .select('estudio_id, estado_muestra')
        .eq('cita_id', citaId);

    const estadoMap = {};
    if (estadosEstudios) {
        estadosEstudios.forEach(e => {
            estadoMap[e.estudio_id] = e.estado_muestra || 'pendiente';
        });
    }

    // Populate Modal
    const pacienteEl = document.getElementById('confirmarMuestraPaciente');
    const estudiosEl = document.getElementById('confirmarMuestraEstudios');
    const tubosEl = document.getElementById('confirmarMuestraTubos');

    if (pacienteEl) pacienteEl.textContent = citaAConfirmar.paciente_nombre;
    if (estudiosEl) estudiosEl.innerHTML = '';
    if (tubosEl) tubosEl.innerHTML = '';

    const tubosPendientesSet = new Set();
    const tubosTomadosSet = new Set();

    if (citaAConfirmar.estudios && citaAConfirmar.estudios.length > 0) {
        citaAConfirmar.estudios.forEach(est => {
            const estado = estadoMap[est.estudio_id] || 'pendiente';

            // Chip estudio - color based on status
            const span = document.createElement('span');
            if (estado === 'tomado') {
                span.style.cssText = 'background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 16px; font-size: 0.85rem; font-weight: 600; border: 1px solid #86efac; display: inline-block; text-decoration: line-through;';
                span.textContent = est.nombre + ' ✓';
            } else {
                span.style.cssText = 'background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 16px; font-size: 0.85rem; font-weight: 600; border: 1px solid #fcd34d; display: inline-block;';
                span.textContent = est.nombre + ' (Pendiente)';
            }
            if (estudiosEl) estudiosEl.appendChild(span);

            // Tubos - only add pending ones
            if (est.tubo_recipiente) {
                const tubosRaw = est.tubo_recipiente.split(',');
                tubosRaw.forEach(t => {
                    if (estado === 'tomado') {
                        tubosTomadosSet.add(t.trim());
                    } else {
                        tubosPendientesSet.add(t.trim());
                    }
                });
            }
        });
    } else {
        if (estudiosEl) estudiosEl.innerHTML = '<span style="color:#94a3b8; font-style:italic;">Sin estudios registrados</span>';
    }

    if (tubosEl) {
        tubosEl.innerHTML = ''; // Clear first

        // Show already collected tubes (disabled)
        if (tubosTomadosSet.size > 0) {
            tubosTomadosSet.forEach((tubo) => {
                const doneDiv = document.createElement('div');
                doneDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #dcfce7; border-radius: 8px; margin-bottom: 6px; border: 1px solid #86efac;';
                doneDiv.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="3">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span style="flex: 1; font-weight: 500; color: #166534; text-decoration: line-through;">${tubo}</span>
                    <span style="font-size: 0.75rem; color: #166534;">Ya recolectado</span>
                `;
                tubosEl.appendChild(doneDiv);
            });
        }

        // Show pending tubes as checkboxes
        if (tubosPendientesSet.size > 0) {
            let index = 0;
            tubosPendientesSet.forEach((tubo) => {
                const checkDiv = document.createElement('div');
                checkDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #fef3c7; border-radius: 8px; margin-bottom: 6px; border: 1px solid #fcd34d;';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `tubo-check-${index}`;
                checkbox.name = 'tubo-muestra';
                checkbox.value = tubo;
                checkbox.checked = true; // Default checked
                checkbox.style.cssText = 'width: 20px; height: 20px; accent-color: #0d9488; cursor: pointer;';

                const label = document.createElement('label');
                label.htmlFor = `tubo-check-${index}`;
                label.textContent = tubo;
                label.style.cssText = 'flex: 1; font-weight: 500; color: #92400e; cursor: pointer;';

                const pendingTag = document.createElement('span');
                pendingTag.style.cssText = 'font-size: 0.75rem; color: #92400e; background: #fde68a; padding: 2px 8px; border-radius: 4px;';
                pendingTag.textContent = 'Pendiente';

                checkDiv.appendChild(checkbox);
                checkDiv.appendChild(label);
                checkDiv.appendChild(pendingTag);
                tubosEl.appendChild(checkDiv);
                index++;
            });
        } else if (tubosTomadosSet.size === 0) {
            const li = document.createElement('li');
            li.textContent = 'Verificar requerimientos en sistema (No especificado)';
            li.style.color = '#94a3b8';
            tubosEl.appendChild(li);
        }
    }

    const modal = document.getElementById('modalConfirmarMuestra');
    if (modal) modal.classList.add('active');
}

function cerrarModalConfirmarMuestra() {
    const modal = document.getElementById('modalConfirmarMuestra');
    if (modal) modal.classList.remove('active');
    citaAConfirmar = null;
}

async function ejecutarConfirmacionMuestra() {
    if (!citaAConfirmar) return;

    const btn = document.querySelector('#modalConfirmarMuestra .btn-confirm');
    const originalText = btn ? btn.innerHTML : 'Confirmar';
    if (btn) {
        btn.innerHTML = '<div class="loading-spinner" style="width:16px; height:16px;"></div> Confirmando...';
        btn.disabled = true;
    }

    try {
        // 1. Get checked and unchecked tubes
        const checkboxes = document.querySelectorAll('input[name="tubo-muestra"]');
        const tubosRecibidos = [];
        const tubosPendientes = [];

        checkboxes.forEach(cb => {
            if (cb.checked) {
                tubosRecibidos.push(cb.value);
            } else {
                tubosPendientes.push(cb.value);
            }
        });

        console.log('Tubos recibidos:', tubosRecibidos);
        console.log('Tubos pendientes:', tubosPendientes);

        // 2. Get estudios for this cita and update their estado_muestra
        if (citaAConfirmar.estudios && citaAConfirmar.estudios.length > 0) {
            for (const est of citaAConfirmar.estudios) {
                // Determine if this study's tube was collected
                const tuboEstudio = est.tubo_recipiente || '';
                let muestraRecibida = false;

                // Check if any of the received tubes matches this study's tube
                for (const tuboR of tubosRecibidos) {
                    if (tuboEstudio.includes(tuboR) || tuboR.includes(tuboEstudio.split(',')[0]?.trim())) {
                        muestraRecibida = true;
                        break;
                    }
                }

                // Update citas_estudios
                const nuevoEstado = muestraRecibida ? 'tomado' : 'pendiente';
                await supabaseClient
                    .from('citas_estudios')
                    .update({ estado_muestra: nuevoEstado })
                    .eq('cita_id', citaAConfirmar.id)
                    .eq('estudio_id', est.estudio_id);
            }
        }

        // 3. Determine overall appointment status
        let nuevoEstadoCita = 'completada';
        if (tubosPendientes.length > 0) {
            nuevoEstadoCita = 'muestra_parcial'; // Still has pending samples
        }

        // 4. Update appointment
        const { data, error } = await supabaseClient
            .from('citas')
            .update({ estado: nuevoEstadoCita })
            .eq('id', citaAConfirmar.id)
            .select();

        if (error) throw error;

        // Success
        cerrarModalConfirmarMuestra();

        if (tubosPendientes.length > 0) {
            showInfoModal(
                'Muestras Parciales',
                `Se registraron ${tubosRecibidos.length} muestra(s).\n${tubosPendientes.length} muestra(s) quedan pendientes.`
            );
        } else {
            showSuccessModal('Muestras Completas', `Todas las muestras han sido registradas correctamente.`);
        }

        loadWorkList();

    } catch (err) {
        console.error('Error completo:', err);
        showErrorModal('Error', 'No se pudo actualizar: ' + (err.message || JSON.stringify(err)));
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

// --- ETIQUETAS LOGIC ---

function mostrarModalEtiquetas(cita) {
    const modal = document.getElementById('modalImprimirEtiquetas');
    const container = document.getElementById('labelsContainer');
    if (!modal || !container) return;

    container.innerHTML = '';

    // Group studies by Tube - store full study objects
    const tubesMap = new Map(); // 'Rojo' -> [{nombre, codigo}, ...]

    // Default fallback if no tubes
    if (!cita.estudios || cita.estudios.length === 0) {
        tubesMap.set('MUESTRA', [{ nombre: 'General', codigo: 'GEN' }]);
    } else {
        cita.estudios.forEach(est => {
            // Get tube type(s) - handle empty or null
            let rawTubes = ['SIN TUBO'];
            if (est.tubo_recipiente && est.tubo_recipiente.trim()) {
                rawTubes = est.tubo_recipiente.split(',');
            }

            rawTubes.forEach(t => {
                const tubeType = t.trim();
                if (!tubesMap.has(tubeType)) tubesMap.set(tubeType, []);
                // Store full study object for code access
                tubesMap.get(tubeType).push({
                    nombre: est.nombre,
                    codigo: est.codigo || ''
                });
            });
        });
    }

    let tubeIndex = 0;

    tubesMap.forEach((studies, tubeType) => {
        tubeIndex++;
        const tubeCode = `${cita.folio_atencion}-${tubeIndex}`; // Ex: 260119-01-1

        // Ensure studies are unique by codigo or nombre
        const seen = new Set();
        const uniqueStudies = studies.filter(s => {
            const key = s.codigo || s.nombre;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Get study codes - prioritize codigo, then abbreviate nombre
        const studyCodes = uniqueStudies.map(s => {
            if (s.codigo && s.codigo.trim()) return s.codigo.toUpperCase();
            // Create 3-4 letter abbreviation from name
            const words = s.nombre.split(' ').filter(w => w.length > 2);
            if (words.length >= 2) {
                return (words[0].substring(0, 2) + words[1].substring(0, 2)).toUpperCase();
            }
            return s.nombre.substring(0, 4).toUpperCase();
        });
        const studyCodesStr = studyCodes.join(', ');

        // Tube type abbreviation - extract color name
        let tubeAbbrev = tubeType;
        if (tubeType.toLowerCase().includes('lila')) tubeAbbrev = 'LILA';
        else if (tubeType.toLowerCase().includes('celeste')) tubeAbbrev = 'CELES';
        else if (tubeType.toLowerCase().includes('rojo')) tubeAbbrev = 'ROJO';
        else if (tubeType.toLowerCase().includes('amarillo')) tubeAbbrev = 'AMAR';
        else if (tubeType.toLowerCase().includes('verde')) tubeAbbrev = 'VERDE';
        else if (tubeType.toLowerCase().includes('gris')) tubeAbbrev = 'GRIS';
        else if (tubeType.toLowerCase().includes('estéril') || tubeType.toLowerCase().includes('esteril') || tubeType.toLowerCase().includes('orina')) tubeAbbrev = 'REP EST';
        else if (tubeType.toLowerCase().includes('recipiente')) tubeAbbrev = 'REP EST';
        else tubeAbbrev = tubeType.split(' ')[0].substring(0, 5).toUpperCase();

        // Format DOB
        let dobStr = '';
        if (cita.paciente_fecha_nacimiento) {
            const [year, month, day] = cita.paciente_fecha_nacimiento.split('-');
            dobStr = `${day}/${month}/${year}`;
        } else if (cita.fecha_nacimiento) {
            const [year, month, day] = cita.fecha_nacimiento.split('-');
            dobStr = `${day}/${month}/${year}`;
        } else {
            dobStr = 'N/A';
        }

        const labelDiv = document.createElement('div');
        labelDiv.className = 'label-preview';
        labelDiv.style.cssText = 'background: white; padding: 10px; border-radius: 4px; display: flex; justify-content: center; align-items: center;';

        // Container simulating ~50mm x 25mm label
        const contentDiv = document.createElement('div');
        contentDiv.className = 'print-content';
        contentDiv.style.cssText = 'width: 320px; height: 105px; border: 1px solid #000; padding: 3px 6px; display: flex; flex-direction: column; align-items: stretch; justify-content: space-between; box-sizing: border-box; background: white; font-family: Consolas, monospace;';

        // Updated Layout:
        // [Name (left)          DOB (right, small)]
        // [Barcode - full width]
        // [Folio - Large]
        // [Tube | Studies Codes]

        contentDiv.innerHTML = `
            <div style="position: relative; width: 100%; min-height: 28px; margin-bottom: 2px;">
                <div style="font-weight: 700; font-size: 10px; text-transform: uppercase; text-align: left; word-wrap: break-word; color: black; padding-right: 60px; line-height: 1.1;">
                    ${cita.paciente_nombre}
                </div>
                <div style="position: absolute; top: 0; right: 0; font-size: 8px; font-weight: 700; color: black; background: white; padding-left: 2px;">
                    ${dobStr}
                </div>
            </div>
            <svg id="barcode-${tubeIndex}" style="width: 100%; height: 35px;"></svg>
            <div style="font-size: 13px; font-weight: 800; width: 100%; text-align: center; letter-spacing: 2px; color: black; background: #e5e5e5; padding: 1px 0; border-radius: 2px; line-height: 1;">
                ${tubeCode}
            </div>
            <div style="font-size: 9px; font-weight: 700; width: 100%; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: black; margin-top: 2px;">
                ${tubeAbbrev} | ${studyCodesStr}
            </div>
        `;

        labelDiv.appendChild(contentDiv);
        container.appendChild(labelDiv);

        // Generate Barcode
        try {
            if (typeof JsBarcode !== 'function') {
                throw new Error("Librería JsBarcode no cargada.");
            }
            JsBarcode(`#barcode-${tubeIndex}`, tubeCode, {
                format: "CODE128",
                lineColor: "#000",
                width: 2,
                height: 35,
                displayValue: false,
                margin: 0
            });
        } catch (e) {
            console.error("Barcode error:", e);
            contentDiv.innerHTML += `<div style="color:red; font-size:10px;">Error: ${e.message}</div>`;
        }
    });

    modal.classList.add('active');
}

function cerrarModalEtiquetas() {
    document.getElementById('modalImprimirEtiquetas').classList.remove('active');
}

function imprimirEtiquetas() {
    const container = document.getElementById('labelsContainer');

    const win = window.open('', '', 'height=400,width=600');
    win.document.write('<html><head><title>Imprimir Etiquetas</title>');
    win.document.write(`
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                background: white;
                font-family: 'Consolas', monospace;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            @page {
                size: 50mm 25mm;
                margin: 0;
            }

            .label-wrapper { 
                width: 50mm;
                height: 25mm;
                page-break-after: always;
                display: flex;
                flex-direction: column;
                padding: 1mm 1.5mm;
                background: white;
                overflow: hidden;
                justify-content: space-between;
            }

            .label-header {
                position: relative;
                width: 100%;
                min-height: 7mm; /* Espacio para hasta 2 líneas de nombre */
                margin-bottom: 0.5mm;
            }

            .patient-name {
                font-size: 8pt;
                font-weight: 700;
                text-transform: uppercase;
                display: block;
                width: 100%;
                line-height: 1.1;
                word-wrap: break-word;
                color: #000;
                padding-right: 18mm; /* Espacio reservado para la fecha a la derecha */
            }

            .patient-dob {
                position: absolute;
                top: 0;
                right: 0;
                font-size: 7.5pt;
                font-weight: 700;
                color: #000;
                background: white;
                padding-left: 2px;
            }

            .barcode-area {
                width: 100%;
                height: 5mm;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0.3mm 0;
            }

            .barcode-svg {
                width: 100%;
                height: 100%;
            }

            .folio-box {
                font-size: 8pt;
                font-weight: 800;
                text-align: center;
                background: #000;
                color: #fff;
                width: 100%;
                padding: 0.3mm 0;
                letter-spacing: 0.3mm;
                line-height: 1;
                border-radius: 0.5mm;
            }

            .label-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 6.5pt;
                font-weight: 700;
                margin-top: 0.3mm;
                gap: 1mm;
            }

            .tube-tag {
                background: #e0e0e0;
                padding: 0.2mm 1mm;
                border-radius: 0.5mm;
                border: 0.2mm solid #888;
                font-weight: 800;
                white-space: nowrap;
            }

            .studies-text {
                flex: 1;
                text-align: right;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            @media print {
                body { margin: 0; }
            }
        </style>
    `);
    win.document.write('</head><body>');

    const labels = container.querySelectorAll('.print-content');
    labels.forEach(lbl => {
        // Extraer datos para reconstruir con dimensiones exactas
        const name = lbl.querySelector('.patient-name')?.innerText || lbl.querySelector('div[style*="font-weight: 700"]')?.innerText || 'PACIENTE';
        const dobEl = lbl.querySelector('.patient-dob') || lbl.querySelector('div[style*="font-size: 8px"]');
        const dob = dobEl?.innerText?.trim() || 'N/A';

        const folio = lbl.querySelector('.folio-box')?.innerText.trim() || lbl.querySelector('div[style*="font-size: 13px"]')?.innerText.trim() || 'N/A';
        const info = lbl.querySelector('.label-info')?.innerText || lbl.querySelector('div[style*="font-size: 9px"]')?.innerText || '';

        // Parse tube and studies from info (format: "TUBO | ESTUDIO1, ESTUDIO2")
        const [tubeType, studiesStr] = info.split('|').map(s => s?.trim() || '');

        win.document.write(`
            <div class="label-wrapper">
                <div class="label-header">
                    <span class="patient-name">${name}</span>
                    <span class="patient-dob">${dob}</span>
                </div>
                <div class="barcode-area">
                    <svg class="print-barcode" data-code="${folio}"></svg>
                </div>
                <div class="folio-box">${folio}</div>
                <div class="label-info">
                    <span class="tube-tag">${tubeType || 'TUBO'}</span>
                    <span class="studies-text">${studiesStr || ''}</span>
                </div>
            </div>
        `);
    });

    win.document.write(`
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
        <script>
            window.onload = function() {
                const barcodes = document.querySelectorAll('.print-barcode');
                barcodes.forEach(bc => {
                    JsBarcode(bc, bc.getAttribute('data-code'), {
                        format: "CODE128",
                        lineColor: "#000",
                        width: 1.5,
                        height: 18,
                        displayValue: false,
                        margin: 0
                    });
                });
                
                setTimeout(() => {
                    window.print();
                    window.close();
                }, 400);
            };
        <\/script>
    </body></html>`);
    win.document.close();
}
