-- ============================================================
-- Migración: contraseñas locales (BCrypt) en usuarios.password_hash
-- Fecha: 2026-07-23
--
-- La columna password_hash YA EXISTE en el esquema oficial
-- (DataBase/modules/usuarios.sql) y es nullable (cuentas LDAP).
-- Esta migración es idempotente: no altera datos existentes ni
-- convierte contraseñas en texto plano del seed.
-- ============================================================

-- Garantiza la columna (por si algún entorno antiguo no la tiene).
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

COMMENT ON COLUMN usuarios.password_hash IS
    'Hash BCrypt para cuentas Local; NULL para cuentas LDAP. Nunca texto plano.';

-- No se actualizan password_hash de usuarios existentes:
-- el AuthService mantiene compatibilidad con hashes legacy del seed
-- hasta un restablecimiento explícito.
