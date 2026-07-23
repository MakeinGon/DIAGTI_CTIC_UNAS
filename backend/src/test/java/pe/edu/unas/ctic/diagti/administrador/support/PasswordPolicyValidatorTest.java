package pe.edu.unas.ctic.diagti.administrador.support;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordPolicyValidatorTest {

    @Test
    void validaOk() {
        assertNull(PasswordPolicyValidator.validar("ClaveSegura123", "ClaveSegura123", "79999991"));
    }

    @Test
    void rechazaEspaciosExtremos() {
        assertNotNull(PasswordPolicyValidator.validar(" ClaveSegura123", " ClaveSegura123", "79999991"));
    }

    @Test
    void rechazaMax72() {
        String longPwd = "Aa1" + "x".repeat(70);
        assertNotNull(PasswordPolicyValidator.validar(longPwd, longPwd, "79999991"));
    }
}
