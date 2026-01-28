---
description: Importar estudios de laboratorio desde una imagen/captura al catálogo de Supabase
---

# Importar Estudios desde Imagen

Este workflow documenta el proceso para analizar una captura de pantalla con estudios de laboratorio e insertarlos correctamente en la base de datos `estudios_laboratorio` de Supabase.

## Paso 1: Analizar la Imagen

Cuando el usuario comparta una imagen, extraer:
1. **Nombre del Perfil** (título de la sección, ej: "REACCIONES FEBRILES")
2. **Lista de analitos** con sus nombres exactos
3. **Valores de referencia** de cada analito
4. **Metodología** (si aparece al pie, ej: "Método: Aglutinación macroscópica")

## Paso 2: Confirmar Lectura con el Usuario

Presentar un resumen estructurado al usuario:
- Mostrar tabla con analitos detectados
- Mostrar metodología detectada
- Esperar confirmación de que la lectura es correcta

## Paso 3: Solicitar Datos Faltantes

Preguntar al usuario los datos que NO aparecen en la imagen:
- **Categoría**: (ej: Inmunología, Química Clínica, Hematología)
- **Precio del perfil**: (ej: $100)
- **Precio de analitos individuales**: (usualmente $0 si pertenecen a perfil)
- **Tiempo de entrega**: (ej: "Mismo día", "24 horas")
- **Tipo de muestra**: (ej: Suero, Sangre venosa, Orina)
- **Tubo/recipiente**: (ej: Tubo Rojo, Tubo Lila, Frasco Estéril)
- **¿Crear perfil padre?**: (TRUE/FALSE)

## Paso 4: Generar Códigos

Usar el prefijo basado en el perfil. Ejemplos:
- Reacciones Febriles → `RF-`
- Biometría Hemática → `BH-`
- Química Sanguínea → `QS-`
- Examen General de Orina → `EGO-`
- Perfil Hepático → `PH-`
- Perfil Lipídico → `PL-`

El perfil padre: `[PREFIJO]-PERFIL` (ej: `RF-PERFIL`)
Los analitos: `[PREFIJO]-[ABREVIATURA]` (ej: `RF-TIF-O`, `RF-BRUC`)

## Paso 5: Mostrar Plan de Inserción

Presentar al usuario exactamente qué se insertará:

### Perfil Padre (si aplica)
| Campo | Valor |
|-------|-------|
| codigo | [código generado] |
| nombre | [nombre del perfil] |
| categoria | [categoría] |
| precio | [precio del perfil] |
| es_perfil | TRUE |
| tipo_muestra | [tipo] |
| tubo_recipiente | [tubo] |
| metodologia | [metodología] |
| tiempo_entrega | [tiempo] |
| activo | TRUE |

### Analitos Individuales
Tabla con: codigo, nombre, precio, tipo_referencia, referencia_texto/min/max

### Relaciones (estudio_componentes)
Tabla mostrando el orden de vinculación

## Paso 6: Esperar Confirmación

**NO INSERTAR HASTA QUE EL USUARIO CONFIRME EXPLÍCITAMENTE**

Preguntar: "¿Confirmas que proceda con la inserción? ✅"

## Paso 6.5: Verificar Analitos Existentes (CRÍTICO)

Antes de insertar, ejecutar consulta para verificar qué analitos YA existen:

```sql
SELECT id, codigo, nombre FROM estudios_laboratorio 
WHERE nombre ILIKE '%glucosa%' OR nombre ILIKE '%colesterol%' -- etc
```

### Lógica de Reutilización:
- **Si el analito EXISTE**: Usar su ID existente para la relación
- **Si el analito NO EXISTE**: Crear nuevo analito y usar el nuevo ID
- **NUNCA crear duplicados** de analitos

### Beneficios:
- Un analito universal puede pertenecer a múltiples perfiles
- Ejemplo: `QS-GLU` (Glucosa) → QS3, QS6, QS27, Perfil Diabético

## Paso 7: Crear Script de Inserción

// turbo
Crear un archivo JavaScript en la raíz del proyecto que:
1. Conecte a Supabase usando las credenciales del proyecto
2. Inserte primero los analitos individuales
3. Inserte el perfil padre
4. Obtenga los IDs generados
5. Cree las relaciones en `estudio_componentes`
6. Muestre confirmación de éxito

Nombre del archivo: `insertar_[nombre_perfil].js`

## Paso 8: Ejecutar Script

// turbo
```powershell
node insertar_[nombre_perfil].js
```

## Paso 9: Verificar Inserción

Confirmar al usuario:
- Número de analitos insertados
- Perfil creado
- Relaciones establecidas

---

## Estructura de Tablas Referencia

### `estudios_laboratorio`
- `id` (UUID, auto)
- `codigo` (VARCHAR, UNIQUE, NOT NULL)
- `nombre` (VARCHAR, NOT NULL)
- `categoria` (VARCHAR)
- `precio` (DECIMAL)
- `es_perfil` (BOOLEAN)
- `tipo_muestra` (VARCHAR)
- `tubo_recipiente` (VARCHAR)
- `metodologia` (VARCHAR)
- `tiempo_entrega` (VARCHAR)
- `unidades` (TEXT)
- `tipo_referencia` (TEXT: "rango" o "texto")
- `referencia_min` (NUMERIC)
- `referencia_max` (NUMERIC)
- `referencia_texto` (TEXT)
- `area` (TEXT)
- `activo` (BOOLEAN, default TRUE)

### `estudio_componentes`
- `perfil_id` (FK → estudios_laboratorio.id)
- `componente_id` (FK → estudios_laboratorio.id)
- `orden` (INTEGER)

### `valores_referencia` (NUEVO - Referencias por Edad)
- `id` (UUID, auto)
- `estudio_id` (FK → estudios_laboratorio.id)
- `edad_min_dias` (INT) - Edad mínima en días (0 = recién nacido)
- `edad_max_dias` (INT) - Edad máxima en días (NULL = sin límite)
- `sexo` (VARCHAR(1)) - 'M', 'F', NULL = ambos
- `valor_min` (NUMERIC)
- `valor_max` (NUMERIC)
- `valor_texto` (VARCHAR)
- `descripcion` (VARCHAR) - Ej: "Adultos", "0-1 mes"
- `orden` (INT)

---

## Paso 9.5: Consultar UPC para Referencias por Edad (OPCIONAL)

Si el usuario proporciona URL de UPC o desea valores por edad:

1. Usar skill `/consultar-valores-referencia` para obtener datos de UPC
2. Parsear los rangos por edad del texto (ej: "Menores de 40 años: 0.0-4.0")
3. Insertar en tabla `valores_referencia`:

```javascript
// Ejemplo de conversión de edad a días
const rangos = [
    { desc: 'Cordón', min_dias: 0, max_dias: 0, valor_min: 45, valor_max: 96 },
    { desc: '0-1 mes', min_dias: 1, max_dias: 30, valor_min: 30, valor_max: 60 },
    { desc: 'Adultos', min_dias: 6570, max_dias: null, valor_min: 70, valor_max: 100 }
];

// Insertar cada rango
for (const r of rangos) {
    await supabaseClient.from('valores_referencia').insert({
        estudio_id: estudioId,
        edad_min_dias: r.min_dias,
        edad_max_dias: r.max_dias,
        valor_min: r.valor_min,
        valor_max: r.valor_max,
        descripcion: r.desc
    });
}
```

### Tabla de Conversión Edad → Días

| Descripción | Días |
|-------------|------|
| Recién nacido | 0 |
| 1 mes | 30 |
| 1 año | 365 |
| 15 años | 5475 |
| 18 años | 6570 |
| 40 años | 14600 |
| 75 años | 27375 |

