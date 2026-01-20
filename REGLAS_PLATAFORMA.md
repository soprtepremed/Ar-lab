# REGLAS DE DESARROLLO - ARLAB PLATAFORMA

Este documento define los estándares de codificación y arquitectura para el proyecto AR Lab. El objetivo principal es mantener el código limpio, escalable y fácil de mantener.

## 1. PRINCIPIO FUNDAMENTAL: MODULARIDAD
**REGLA DE ORO:** Nunca crear archivos monolíticos o secciones excesivamente grandes. Si un archivo es difícil de leer de una pasada, es demasiado grande.

### Directriz de Refactorización
- **HTML:** Si un archivo HTML supera las **600-800 líneas**, debe ser revisado para extraer componentes o lógica.
- **JavaScript:** Funciones o lógicas que no estén relacionadas directamente deben vivir en archivos separados.

---

## 2. ESTRUCTURA DE ARCHIVOS

Todo nuevo desarrollo debe adherirse a la siguiente estructura de directorios:

```
/
├── css/                  # TODOS los estilos. No usar <style> inline grandes.
│   ├── dashboard.css
│   └── navbar.css
│
├── js/                   # Lógica JavaScript separada por dominio.
│   ├── dashboard-main.js     # Lógica orquestadora / principal
│   ├── dashboard-qr.js       # Funcionalidad específica (ej. QR)
│   ├── dashboard-caja.js     # Funcionalidad específica (ej. Caja)
│   ├── dashboard-modals.js   # UI Helpers y componentes reutilizables
│   └── dashboard-init.js     # Configuración e inicialización (ej. Supabase)
│
├── components/           # Fragmentos HTML de referencia para modales/vistas.
│   ├── modal_qr.html
│   └── modal_verificar.html
│
└── [page].html           # Archivo entry-point limpio, importando recursos.
```

---

## 3. REGLAS DE IMPLEMENTACIÓN

### A. CSS (Estilos)
- **Prohibido:** Bloques `<style>` de más de 50 líneas dentro del HTML.
- **Mandatorio:** Extraer estilos a archivos `.css` en la carpeta `css/`.
- **Naming:** Usar nombres clases semánticas y variables CSS (`:root`) para colores y temas.

### B. JavaScript (Lógica)
- **Separación de Responsabilidades:**
    - No mezclar lógica de base de datos (Supabase) con lógica de UI compleja en el mismo bloque.
    - Crear archivos específicos para funcionalidades grandes (ej: `dashboard-caja.js`).
- **Scripts en HTML:** El HTML solo debe contener las importaciones de scripts: `<script src="js/mi-funcionalidad.js"></script>`.

### C. HTML (Estructura)
- Mantener el HTML "plano" y semántico.
- Los modales deben residir al final del `<body>` para no ensuciar la estructura principal, o cargarse dinámicamente si el framework lo permite.

---

## 4. FLUJO DE TRABAJO SUGERIDO
1. **Planificar:** Antes de codificar una nueva feature, decidir si necesita su propio archivo JS/CSS.
2. **Implementar:** Escribir el código de forma modular desde el principio.
3. **Refactorizar:** Si una feature existente crece demasiado, detenerse y dividirla en módulos antes de continuar.

> "Un código limpio no es el que se escribe una vez, sino el que se puede leer mil veces."
