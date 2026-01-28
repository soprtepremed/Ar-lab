---
description: Consultar valores de referencia de estudios de laboratorio desde el catálogo UPC
---

# /consultar-valores-referencia

Consulta valores de referencia de estudios desde UPC (https://upc.com.mx).

## Flujo de Filtrado

### 1. Filtrar por letra inicial
```
read_url_content("https://upc.com.mx/estudios/index/mostrar:{LETRA}")
```
Ejemplo: Para "Colesterol" → usar letra `C`

### 2. Buscar el estudio en los chunks
```
view_content_chunk(document_id, position)
```
Recorrer chunks hasta encontrar el nombre. Formato:
```
[ID](https://upc.com.mx/examenes/v/{REF_ID})
[NOMBRE DEL ESTUDIO]
```

### 3. Extraer valores de referencia
Con el `REF_ID` encontrado:
```
read_url_content("https://upc.com.mx/referencias/view/{REF_ID}")
view_content_chunk(document_id, 2)
```

## Estructura de URLs

| Acción | URL |
|--------|-----|
| Catálogo completo | `https://upc.com.mx/estudios/` |
| Filtrar por letra | `https://upc.com.mx/estudios/index/mostrar:{LETRA}` |
| Ver estudio | `https://upc.com.mx/examenes/v/{ID}` |
| Ver referencias | `https://upc.com.mx/referencias/view/{REF_ID}` |

## Datos que se obtienen

- Método analítico
- Indicaciones del paciente (ayuno, preparación)
- Indicaciones de la muestra (tipo, cantidad, conservación)
- Valores de referencia (por edad/sexo)
- Interferencias
- Aplicaciones clínicas
