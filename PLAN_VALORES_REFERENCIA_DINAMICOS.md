# Plan de Implementación: Valores de Referencia Dinámicos

Este documento detalla la estrategia técnica para implementar un sistema de valores de referencia biológicos que se ajusten automáticamente según el **Sexo** y la **Edad** del paciente.

## 1. Arquitectura de Base de Datos

Actualmente, los valores de referencia viven en la tabla `estudios_laboratorio`. Debemos migrar esta lógica a una tabla dedicada que permita relaciones "Uno a Muchos" (Un estudio -> Múltiples reglas de referencia).

### Nueva Tabla: `valores_referencia`

```sql
CREATE TABLE valores_referencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudio_id UUID REFERENCES estudios_laboratorio(id) ON DELETE CASCADE,
    
    -- Condiciones Biológicas
    sexo VARCHAR(20) DEFAULT 'Indistinto', -- 'Masculino', 'Femenino', 'Indistinto'
    edad_minima INTEGER NOT NULL DEFAULT 0,
    edad_maxima INTEGER NOT NULL DEFAULT 100,
    unidad_edad VARCHAR(20) DEFAULT 'Años', -- 'Años', 'Meses', 'Dias'
    
    -- Valores Esperados
    tipo_referencia VARCHAR(20) DEFAULT 'rango', -- 'rango', 'texto'
    valor_minimo DECIMAL(10, 4),
    valor_maximo DECIMAL(10, 4),
    valor_texto TEXT, -- Para resultados cualitativos (ej. "Negativo")
    
    -- Metadatos
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Índices Recomendados
*   Índice en `estudio_id` para búsquedas rápidas.

## 2. Cambios en la Interfaz de Configuración (`configuracion.html`)

El modal de edición de estudios debe evolucionar.

### Estado Actual
*   Muestra inputs simples: `Ref Min`, `Ref Max`.

### Estado Futuro
*   Agregar un botón: **"⚙️ Configurar Reglas Avanzadas"**.
*   Este botón abrirá una tabla/modal secundario donde el Químico puede agregar filas:
    *   *Regla 1:* Hombres, 0-12 Años -> 10.5 - 12.0
    *   *Regla 2:* Mujeres, 13-50 Años -> 11.0 - 14.5
    *   *Regla 3:* General, > 50 Años -> 10.0 - 13.0

## 3. Lógica de "Motor de Inferencia" (Resultados)

Cuando se abre la pantalla de captura de resultados (`dashboard.html` / `resultados.html`):

1.  **Obtener Paciente:** El sistema lee la fecha de nacimiento del paciente actual.
2.  **Calcular Edad Exacta:** Convierte la fecha de nacimiento a la unidad más relevante (Años/Meses).
3.  **Consulta Inteligente:**
    *   Al cargar el estudio, en lugar de leer `estudio.valor_min`, el sistema busca en la tabla `valores_referencia`.
    *   Filtra las reglas donde:
        *   `estudio_id` coincide.
        *   `sexo` coincide (o es Indistinto).
        *   `edad_paciente` está entre `edad_minima` y `edad_maxima`.

### Algoritmo de Selección (Pseudocódigo JS)

```javascript
function obtenerRangoAplicable(estudio, paciente) {
    const edad = calcularedad(paciente.fecha_nacimiento);
    const reglas = estudio.reglas_referencia; // Pre-cargadas
    
    // Buscar coincidencia exacta
    const regla = reglas.find(r => 
        (r.sexo === 'Indistinto' || r.sexo === paciente.sexo) &&
        (edad >= r.edad_minima && edad <= r.edad_maxima)
    );

    if (regla) {
        return { min: regla.valor_minimo, max: regla.valor_maximo };
    }
    
    // Fallback: Usar valores genéricos del estudio padre
    return { min: estudio.referencia_min, max: estudio.referencia_max };
}
```

## 4. Reporte PDF

El reporte impreso debe mostrar el valor de referencia **que se aplicó** en ese momento, no el genérico.
*   Esto asegura que el médico vea el rango correcto para la edad del paciente (ej. rango pediátrico).

## 5. Próximos Pasos para Implementación

1.  Ejecutar Script SQL de creación de tabla.
2.  Actualizar la función JS `loadEstudios` para hacer un `join` con esta nueva tabla.
3.  Implementar la UI de gestión de reglas.
