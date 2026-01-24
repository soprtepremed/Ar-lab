-- =====================================================
-- SCRIPT DE CREACIÓN DE USUARIOS
-- ROLES: admin, quimico, recepcion
-- =====================================================

-- 1. USUARIO ADMINISTRADOR (Si ya existe, actualiza contraseña)
INSERT INTO usuarios (usuario, password, rol) 
VALUES ('ADMINISTRADOR', 'admin2026', 'admin')
ON CONFLICT (usuario) DO UPDATE SET password = 'admin2026', rol = 'admin';

-- 2. QUÍMICOS OPERATIVOS (3 Usuarios)
INSERT INTO usuarios (usuario, password, rol) VALUES 
('QUIMICO_JUAN', 'quimico123', 'quimico'),
('QUIMICO_ANA', 'quimico123', 'quimico'),
('QUIMICO_PEDRO', 'quimico123', 'quimico')
ON CONFLICT (usuario) DO UPDATE SET password = 'quimico123', rol = 'quimico';

-- 3. RECEPCIONISTA (1 Usuario)
INSERT INTO usuarios (usuario, password, rol) 
VALUES ('RECEPCION_MARIA', 'recepcion123', 'recepcion')
ON CONFLICT (usuario) DO UPDATE SET password = 'recepcion123', rol = 'recepcion';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT usuario, rol, password FROM usuarios ORDER BY rol;
