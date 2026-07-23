package pe.edu.unas.ctic.diagti.desarrollador.support;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Verificación conceptual de la migración de backfill (idempotencia por NOT EXISTS).
 */
class BackfillValidacionesEnviadosMigrationTest {

    @Test
    void migracionEsIdempotentePorNotExists() throws Exception {
        Path migration = Path.of("..", "DataBase", "migrations", "20260723_backfill_validaciones_enviados.sql")
                .toAbsolutePath()
                .normalize();
        if (!Files.exists(migration)) {
            migration = Path.of("DataBase", "migrations", "20260723_backfill_validaciones_enviados.sql")
                    .toAbsolutePath()
                    .normalize();
        }
        assertTrue(Files.exists(migration), "Debe existir la migración de backfill");

        String sql = Files.readString(migration, StandardCharsets.UTF_8).toUpperCase();
        assertTrue(sql.contains("BEGIN"));
        assertTrue(sql.contains("COMMIT"));
        assertTrue(sql.contains("INSERT INTO VALIDACIONES"));
        assertTrue(sql.contains("NOT EXISTS"));
        assertTrue(sql.contains("'ENVIADO'"));
        assertTrue(sql.contains("'PENDIENTE'"));
        assertFalse(sql.contains("DROP "));
        assertFalse(sql.contains("TRUNCATE"));
        assertFalse(sql.contains("UPDATE SISTEMAS"));
    }
}
