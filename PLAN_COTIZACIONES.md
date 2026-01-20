## Plan de Implementación: Módulo de Cotizaciones

Este plan describe la creación del submenú "Cotizaciones" dentro de la Fase Pre-Analítica, diseñado exclusivamente para generar presupuestos sin afectar la caja ni registrar pacientes formalmente.

### 1. Modificación de `dashboard.html`
- **Objetivo**: Insertar el contenedor de la vista de cotizaciones y vincular el nuevo script.
- **Cambios**:
  - Agregar `<div id="viewCotizaciones" style="display:none;">` en el área de contenido principal.
  - Diseñar una interfaz limpia:
    - **Encabezado**: Título "Cotizador de Servicios".
    - **Panel Izquierdo**: Búsqueda de estudios y listado de resultados (similar a Nueva Cita pero simplificado).
    - **Panel Derecho**: "Ticket Virtual" mostrando el resumen de la cotización en tiempo real.
    - **Pie de Página**: Botones para "Imprimir Cotización" (Ticket) y "Nueva Cotización".
  - Incluir referencia a `js/dashboard-cotizaciones.js`.

### 2. Creación de `js/dashboard-cotizaciones.js`
- **Objetivo**: Manejar la lógica independiente del cotizador.
- **Funcionalidades Clave**:
  - **Carga de Estudios**: Reutilizar la consulta a Supabase `estudios_laboratorio` pero gestionada localmente para este módulo.
  - **Carrito de Cotización**: Array temporal para almacenar estudios seleccionados.
  - **Cálculo en Tiempo Real**: Suma de precios sin procesar pagos.
  - **Generación de Ticket**: Función `printQuoteTicket()` que abre una ventana de impresión con formato específico:
    - Título: "PRESUPUESTO / COTIZACIÓN" (No "Ticket de Venta").
    - Texto legal: "Precios sujetos a cambio sin previo aviso. Validez 30 días."
    - Sin folio fiscal ni de venta.
  - **Entrada de Datos**: Campo simple para "Nombre del Paciente/Interesado" (Texto libre, no validado).

### 3. Integración en Navegación
- Asegurar que `navbar.js` active correctamente la vista `viewCotizaciones` y oculte las demás (`viewInicio`, `viewCitas`, etc.) al hacer clic en el submenú.
- Actualizar el script de inicialización (`dashboard-main.js` o similar) para detectar `?view=cotizaciones`.

### 4. Estilo Visual (Aesthetics)
- Mantener el diseño "Clean & Premium".
- Uso de tarjetas blancas con sombras suaves.
- Colores distintivos para diferenciarlo de una venta real (ej. usar tonos Teal/Turquesa para ventas y quizá un tono Azul/Slate para cotizaciones).
