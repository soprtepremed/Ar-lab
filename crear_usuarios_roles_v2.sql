-- MODIFICAR RESTRICCIÓN DE CHECK PARA ROLES
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check CHECK (rol IN ('admin', 'operador', 'quimico', 'recepcion'));

-- 1. USUARIO ADMINISTRADOR
INSERT INTO usuarios (usuario, password, rol) 
VALUES ('ADMINISTRADOR', 'admin2026', 'admin')
ON CONFLICT (usuario) DO UPDATE SET password = 'admin2026', rol = 'admin';

-- 2. QUÍMICOS OPERATIVOS
INSERT INTO usuarios (usuario, password, rol) VALUES 
('QUIMICO_JUAN', 'quimico123', 'quimico'),
('QUIMICO_ANA', 'quimico123', 'quimico'),
('QUIMICO_PEDRO', 'quimico123', 'quimico')
ON CONFLICT (usuario) DO UPDATE SET password = 'quimico123', rol = 'quimico';

-- 3. RECEPCIONISTA
INSERT INTO usuarios (usuario, password, rol) 
VALUES ('RECEPCION_MARIA', 'recepcion123', 'recepcion')
ON CONFLICT (usuario) DO UPDATE SET password = 'recepcion123', rol = 'recepcion';

SELECT usuario, rol FROM usuarios;
