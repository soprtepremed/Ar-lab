# 📋 CONEXIONES - Ar Lab

## Documentación de conexión a bases de datos y servicios externos

---

## 🔐 SUPABASE - Base de Datos Principal

### Credenciales de Acceso

| Campo | Valor |
|-------|-------|
| **Email** | qfbadolforuiz@gmail.com |
| **Password Dashboard** | RDF6lvPNdCZWFeAT |
| **Project URL** | https://ebihobjrwcwtjfazcjmv.supabase.co |
| **Project ID** | ebihobjrwcwtjfazcjmv |

### Llaves API

```
Publishable Key (Anon): sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd
```

### Conexión Directa PostgreSQL

```
Host: aws-1-us-east-2.pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.ebihobjrwcwtjfazcjmv
Password: RDF6lvPNdCZWFeAT

URI Completa:
postgresql://postgres.ebihobjrwcwtjfazcjmv:RDF6lvPNdCZWFeAT@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

---

## 🔧 Cómo Conectarse (Para el Asistente)

### Método 1: Node.js con pg (RECOMENDADO)

Si necesitas ejecutar SQL directamente en Supabase desde una red sin IPv6, usa este script con Node.js:

```javascript
const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-us-east-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.ebihobjrwcwtjfazcjmv',
    password: 'RDF6lvPNdCZWFeAT',
    ssl: { rejectUnauthorized: false }
});

async function ejecutarSQL(sql) {
    await client.connect();
    const result = await client.query(sql);
    console.log(result.rows);
    await client.end();
}

// Ejemplo:
ejecutarSQL('SELECT * FROM usuarios');
```

**Archivo de ejemplo**: `setup_db.js`

### Método 2: API REST de Supabase

Para operaciones CRUD simples (requiere Service Role Key para escritura):

```bash
# Lectura (GET)
curl "https://ebihobjrwcwtjfazcjmv.supabase.co/rest/v1/usuarios" \
  -H "apikey: sb_publishable_31x2oYQjyxNJ2otN6TF-Kw_5VGXaGJd"
```

**Nota**: La Publishable Key solo permite lectura. Para escritura se necesita la Service Role Key.

---

## 📊 Estructura de Tablas

### Tabla: usuarios
```sql
CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    rol VARCHAR(20) DEFAULT 'operador',
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: citas
```sql
CREATE TABLE citas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_nombre VARCHAR(200) NOT NULL,
    paciente_telefono VARCHAR(20),
    paciente_email VARCHAR(100),
    fecha_hora TIMESTAMP NOT NULL,
    tipo_servicio VARCHAR(50) DEFAULT 'laboratorio',
    notas TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 👤 Usuarios del Sistema

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | admin |
| operador | operador123 | operador |
| ADOLFO RUIZ | 9611062651 | admin |

---

## 🔗 Enlaces Útiles

- **Dashboard Supabase**: https://supabase.com/dashboard/project/ebihobjrwcwtjfazcjmv
- **SQL Editor**: https://supabase.com/dashboard/project/ebihobjrwcwtjfazcjmv/sql/new
- **Table Editor**: https://supabase.com/dashboard/project/ebihobjrwcwtjfazcjmv/editor

---

## ⚠️ IMPORTANTE

> **NOTA PARA EL ASISTENTE**: Si el usuario te pide modificar datos en Supabase, 
> usa el **Método 1 (Node.js con pg)** ejecutando un script similar a `setup_db.js`.
> Esto permite conexión directa a la base de datos sin necesidad de Service Role Key.

---

**Última actualización**: 18 de Enero 2026
**Creador**: Carlos Adolfo Ruiz Lopez (ADOLFO RUIZ)
