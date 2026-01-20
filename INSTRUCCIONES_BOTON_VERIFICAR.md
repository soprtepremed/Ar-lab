# CÓMO USAR EL MODAL DE VERIFICAR ASISTENCIA

## ✅ YA ESTÁ IMPLEMENTADO

El modal de "Verificar Asistencia" ya está completamente integrado en `dashboard.html`. 

## 🎯 CÓMO AGREGARLO A TU TABLA DE CITAS

### Opción 1: Agregar botón en la columna de ACCIONES

Busca en tu `dashboard.html` donde se renderizan los botones de acciones de cada cita (por ejemplo, donde está el botón de "ver" o "editar") y agrega este botón:

```html
<button onclick="mostrarModalVerificarAsistencia('${cita.id}')" 
        class="action-btn" 
        title="Verificar Asistencia"
        style="background: rgba(13, 148, 136, 0.1); color: #0d9488; border-color: #0d9488;">
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2">
        <path d="M9 11l3 3 8-8M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
</button>
```

### Opción 2: Si usas JavaScript para renderizar

Si construyes la tabla dinámicamente con JavaScript, agrega en el HTML de acciones:

```javascript
const accionesHTML = `
    <div class="action-btns">
        <button onclick="mostrarModalVerificarAsistencia('${cita.id}')" 
                class="action-btn" 
                title="Verificar Asistencia"
                style="background: rgba(13, 148, 136, 0.1); color: #0d9488;">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2">
                <path d="M9 11l3 3 8-8M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        </button>
        <!-- otros botones... -->
    </div>
`;
```

## 📋 FUNCIONES DISPONIBLES

### `mostrarModalVerificarAsistencia(citaId)`
Abre el modal con la información del paciente y las 2 opciones:
- **Escanear QR** (próximamente)
- **Confirmar** (funcional - verifica asistencia)

### `confirmarAsistenciaManual()`
Se ejecuta automáticamente cuando el usuario hace clic en "Confirmar". Esta función:
1. Obtiene el siguiente folio del día
2. Registra la hora de llegada
3. Cambia el estado a "verificada"
4. Registra quién atendió al paciente
5. Muestra un modal de éxito con el folio asignado

## 🎨 ESTILOS

El botón se verá como un icono circular con check ✓ en color turquesa, igual que el resto de botones de acción.

## 🔍 DÓNDE BUSCAR EN TU CÓDIGO

Busca en `dashboard.html`:
- La palabra "action-btn" 
- O donde se renderiza la tabla de citas
- O la función que construye las filas de la tabla

Y agrega el botón ahí.

## ✅ TODO ESTÁ LISTO

Solo falta que agregues el botón en la ubicación que prefieras. El modal y todas las funcionalidades ya están implementadas y funcionando.
