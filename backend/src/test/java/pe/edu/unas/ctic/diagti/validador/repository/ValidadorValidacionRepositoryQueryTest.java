package pe.edu.unas.ctic.diagti.validador.repository;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.Query;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Garantiza que la cola de pendientes no incluya BORRADOR ni estados finales.
 */
class ValidadorValidacionRepositoryQueryTest {

    @Test
    void findPendientes_soloPendienteYSubsanado() throws Exception {
        Method m = ValidadorValidacionRepository.class.getMethod("findPendientes");
        Query query = m.getAnnotation(Query.class);
        assertNotNull(query);
        String jpql = String.join(" ", query.value()).toUpperCase();

        assertTrue(jpql.contains("'PENDIENTE'"));
        assertTrue(jpql.contains("'SUBSANADO'"));
        assertFalse(jpql.contains("'BORRADOR'"));
        assertFalse(jpql.contains("'VALIDADO'"));
        assertFalse(jpql.contains("'RECHAZADO'"));
    }
}
