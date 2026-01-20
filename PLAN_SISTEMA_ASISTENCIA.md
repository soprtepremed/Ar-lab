# 📋 SISTEMA DE ASISTENCIA Y LISTA DE TRABAJO - AR LAB

## 🎯 OBJETIVO
Crear un flujo de trabajo que separe las **citas programadas** de los **pacientes que realmente llegaron**, asignando un **folio de atención secuencial** según orden de llegada (no por hora de cita).

---

## 🔄 FLUJO COMPLETO

### FASE 1: RECEPCIÓN (Vista Actual Mejorada)
**Ubicación**: Dashboard → Gestión de Citas

**Función**: Recibir pacientes citados

**Estados posibles**:
- ✅ `pendiente` - Paciente citado, no ha llegado
- ❌ `cancelada` - Cita cancelada

**Acciones disponibles**:
1. 👁️ **Ver** - Ver detalles de la cita
2. ✅ **Verificar Asistencia** - Marcar que el paciente llegó
3. ✔️ **Completar** - Marcar como atendida (sin pasar por trabajo)
4. 🎤 **Llamar** - Llamar al paciente por voz

**Proceso al verificar asistencia**:
```javascript
1. Usuario hace clic en "✅ Verificar Asistencia"
2. Sistema muestra modal de confirmación
3. Al confirmar:
   - Genera folio_atencion (001, 002, 003...)
   - Registra fecha_hora_llegada (NOW())
   - Cambia estado: pendiente → verificada
   - Muestra toast: "✅ Folio #023 asignado"
4. Paciente desaparece de "Citas Pendientes"
5. Paciente aparece en "Lista de Trabajo"
```

---

### FASE 2: LISTA DE TRABAJO (Nueva Vista para Químicos)
**Ubicación**: Dashboard → Fase Analítica → Lista de Trabajo

**Función**: Queue de pacientes para toma de muestra

**Estados posibles**:
- 🟡 `verificada` - En cola, esperando atención
- 🔵 `en_proceso` - Químico tomando muestra
- 🟢 `completada` - Muestra tomada

**Vista de tabla**:
| FOLIO | PACIENTE | ESTUDIOS | LLEGADA | TIEMPO EN COLA | ACCIONES |
|-------|----------|----------|---------|----------------|----------|
| 001 | Pedro Pérez | GLU, COL | 08:15 | 5 min | 🧪 Tomar Muestra |
| 002 | Carlos Ruiz | HbA1c | 08:23 | 2 min | 🧪 Tomar Muestra |

**Acciones disponibles**:
1. 🧪 **Tomar Muestra** - Inicia el proceso
   - Cambia estado a `en_proceso`
   - Registra químico que atiende
   - Abre modal con checklist de tubos necesarios

2. ✅ **Completar Toma** - Finaliza
   - Cambia estado a `completada`
   - Paciente sale de la lista
   - Opcional: Imprimir etiquetas de tubos

**Ordenamiento**: Siempre por folio_atencion ASC (orden de llegada)

**Filtros**:
- 🟡 En espera (verificada)
- 🔵 En proceso (en_proceso)
- 🟢 Completados hoy (completada)
- 📋 Todos

---

## 🗄️ CAMBIOS EN BASE DE DATOS

### 1. Nuevos campos en tabla `citas`

```sql
folio_atencion INTEGER          -- Folio secuencial diario (001, 002...)
fecha_hora_llegada TIMESTAMP    -- Hora real de llegada
atendido_por UUID               -- Químico que tomó la muestra
```

### 2. Nuevos estados

| Estado Actual | Nuevos Estados a Agregar |
|--------------|--------------------------|
| pendiente | ✅ (ya existe) |
| confirmada | ✅ (ya existe) |
| cancelada | ✅ (ya existe) |
| completada | ✅ (ya existe) |
| - | **verificada** (nuevo) |
| - | **en_proceso** (nuevo) |

### 3. Función SQL para generar folios

```sql
CREATE FUNCTION generar_folio_atencion() RETURNS INTEGER
```
- Genera folio secuencial por día
- Reinicia en 1 cada día
- Ejemplo: 001, 002, 003... 099, 100...

### 4. Vista SQL optimizada

```sql
CREATE VIEW lista_trabajo_diaria
```
- Pre-calcula datos necesarios
- Incluye estudios agregados
- Filtra solo del día actual
- Ordenado por folio

---

## 🎨 DISEÑO DE UI

### VISTA 1: Recepción - Citas del Día

**Modificaciones a la vista actual**:

#### Botón nuevo: "✅ Verificar Asistencia"

```html
<button onclick="verificarAsistencia(citaId, pacienteNombre)">
  <svg>✅</svg> Verificar
</button>
```

**Estilo**: Verde turquesa, ícono de check

**Modal de confirmación**:
```
┌────────────────────────────────────────┐
│  ✅ Verificar Asistencia                │
├────────────────────────────────────────┤
│                                        │
│  ¿Confirma que el paciente llegó?     │
│                                        │
│  📋 Paciente: Pedro Pérez Jiménez      │
│  🕐 Cita: 08:00 a.m.                   │
│  🧪 Estudios: GLU, COL, HDL            │
│                                        │
│  Se asignará el próximo folio          │
│                                        │
│  [Cancelar]  [✅ Confirmar Asistencia] │
└────────────────────────────────────────┘
```

#### Indicador visual
Después de verificar, mostrar badge temporal:
```
✅ Folio #023 asignado
```

---

### VISTA 2: Lista de Trabajo (NUEVA)

**Ubicación en menú**:
```
Dashboard
├── Fase Pre-Analítica
│   └── Gestión de Citas (actual)
├── Fase Analítica
│   ├── 📋 Lista de Trabajo ⬅️ NUEVO
│   └── Resultados
└── Fase Post-Analítica
```

**Estructura de la vista**:

```html
┌──────────────────────────────────────────────────────┐
│  📊 LISTA DE TRABAJO DEL DÍA                         │
│  📅 Domingo, 19 de enero de 2026                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [En espera: 5] [En proceso: 2] [Completados: 12]   │
│                                                      │
│  Filtrar: [Todos ▼] [🔍 Buscar...]                  │
│                                                      │
├──────────────────────────────────────────────────────┤
│  FOLIO  PACIENTE        ESTUDIOS      LLEGADA   ACC  │
│  ────────────────────────────────────────────────    │
│  🟡 001  Pedro Pérez    GLU, COL      08:15    [🧪]  │
│  🟡 002  Carlos Ruiz    HbA1c         08:23    [🧪]  │
│  🔵 003  Juan Gómez     HDL,TG,LDL    08:45    [✅]  │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

**Códigos de color**:
- 🟡 Amarillo/Naranja: En espera (`verificada`)
- 🔵 Azul: En proceso (`en_proceso`)
- 🟢 Verde: Completado (`completada`)

**Columnas**:
1. **FOLIO** - Número secuencial con color de estado
2. **PACIENTE** - Nombre completo
3. **ESTUDIOS** - Lista de códigos de estudios
4. **LLEGADA** - Hora de llegada real
5. **TIEMPO** - Tiempo en cola (opcional)
6. **ACCIONES** - Botón de acción

**Modal "Tomar Muestra"**:
```
┌────────────────────────────────────────┐
│  🧪 Toma de Muestra                     │
├────────────────────────────────────────┤
│  Folio: #023                           │
│  Paciente: Pedro Pérez Jiménez         │
│                                        │
│  Estudios solicitados:                 │
│  ☑️ GLU - Glucosa                       │
│     └─ Tubo: Rojo/Gel separador        │
│  ☑️ COL - Colesterol                    │
│     └─ Tubo: Rojo/Gel separador        │
│                                        │
│  Resumen de tubos:                     │
│  🔴 1x Tubo rojo/gel separador          │
│                                        │
│  [Cancelar]  [✅ Muestra Tomada]       │
└────────────────────────────────────────┘
```

---

## 💻 ARCHIVOS A CREAR/MODIFICAR

### 1. SQL: `crear_sistema_asistencia.sql` ✅
- Agregar campos a tabla citas
- Crear función generar_folio_atencion()
- Crear vista lista_trabajo_diaria
- Crear índices

### 2. JavaScript: Modificar `dashboard.html`

**Función nueva: verificarAsistencia()**
```javascript
async function verificarAsistencia(citaId, nombrePaciente) {
    // Mostrar modal de confirmación
    // Llamar a función SQL generar_folio_atencion()
    // Actualizar cita con nuevo estado
    // Mostrar toast con folio asignado
    // Recargar lista
}
```

### 3. HTML: Nueva vista `lista_trabajo.html`
- Tabla de pacientes verificados
- Filtros por estado
- Botones de acción
- Auto-refresh cada 30 segundos

### 4. JavaScript: `lista_trabajo.js`
- Cargar pacientes verificados del día
- Función tomarMuestra()
- Función completarToma()
- Mostrar modal con checklist de tubos

---

## 📊 REPORTES Y ESTADÍSTICAS

### Dashboard de Recepción
```
Citas del día: 15
├── Pendientes: 8
├── Verificadas: 5
└── Canceladas: 2
```

### Dashboard de Químicos
```
Pacientes del día: 23
├── En espera: 5
├── En proceso: 2
└── Completados: 16

Tiempo promedio de atención: 8 min
Último paciente: hace 12 min
```

---

## 🔐 PERMISOS Y ROLES

| Rol | Puede verificar asistencia | Puede tomar muestras |
|-----|---------------------------|----------------------|
| Admin | ✅ Sí | ✅ Sí |
| Recepción | ✅ Sí | ❌ No |
| Químico | ✅ Sí | ✅ Sí |
| Operador | ✅ Sí | ✅ Sí |

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### FASE 1: Base de Datos (1 día)
- ✅ Ejecutar `crear_sistema_asistencia.sql`
- ✅ Verificar función de folios
- ✅ Probar vista de lista de trabajo

### FASE 2: Vista de Recepción (1 día)
- 🔧 Agregar botón "Verificar Asistencia"
- 🔧 Crear modal de confirmación
- 🔧 Implementar función verificarAsistencia()
- 🔧 Agregar feedback visual

### FASE 3: Vista de Lista de Trabajo (2 días)
- 🔧 Crear página lista_trabajo.html
- 🔧 Diseñar tabla con filtros
- 🔧 Implementar carga de datos
- 🔧 Crear modal de toma de muestra
- 🔧 Auto-refresh

### FASE 4: Testing y Ajustes (1 día)
- 🔧 Probar flujo completo
- 🔧 Ajustar UI/UX
- 🔧 Optimizar queries

---

## 📝 NOTAS IMPORTANTES

1. **Folio de Atención vs Folio de Venta**
   - `folio_venta`: Número de ticket/recibo (generado al crear cita)
   - `folio_atencion`: Número de orden de llegada (generado al verificar)

2. **Reinicio de folios**
   - Los folios de atención se reinician cada día
   - Formato: 001, 002, ... 099, 100

3. **Estados de transición**
   ```
   pendiente → verificada → en_proceso → completada
   ```

4. **Vista móvil**
   - Lista de trabajo debe ser responsive
   - Priorizar información crítica en móvil

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Ejecutar script SQL en Supabase
- [ ] Agregar botón "Verificar Asistencia" en dashboard
- [ ] Crear función verificarAsistencia()
- [ ] Crear vista "Lista de Trabajo"
- [ ] Implementar función tomarMuestra()
- [ ] Crear modal con checklist de tubos
- [ ] Probar flujo completo
- [ ] Capacitar al personal

---

**Creado por**: Carlos Adolfo Ruiz Lopez
**Fecha**: 19 de Enero 2026
**Versión**: 1.0
