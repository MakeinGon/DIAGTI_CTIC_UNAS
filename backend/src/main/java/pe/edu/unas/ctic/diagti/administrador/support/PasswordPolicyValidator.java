package pe.edu.unas.ctic.diagti.administrador.support;

/**
 * Política de contraseñas locales (BCrypt, máx. 72 bytes útiles).
 * No registra ni retorna el valor de la contraseña.
 */
public final class PasswordPolicyValidator {

    public static final int MIN_LENGTH = 8;
    public static final int MAX_LENGTH = 72;

    private PasswordPolicyValidator() {
    }

    /**
     * @return mensaje de error, o null si es válida
     */
    public static String validar(String password, String confirmPassword, String dni) {
        if (password == null || password.isEmpty()) {
            return "La contraseña inicial es obligatoria";
        }
        if (confirmPassword == null || confirmPassword.isEmpty()) {
            return "La confirmación de contraseña es obligatoria";
        }
        if (!password.equals(confirmPassword)) {
            return "Las contraseñas no coinciden";
        }
        if (!password.equals(password.strip())) {
            return "La contraseña no debe tener espacios al inicio o al final";
        }
        if (password.length() < MIN_LENGTH) {
            return "La contraseña debe tener al menos " + MIN_LENGTH + " caracteres";
        }
        if (password.length() > MAX_LENGTH) {
            return "La contraseña no debe superar " + MAX_LENGTH + " caracteres";
        }
        if (!password.chars().anyMatch(Character::isUpperCase)) {
            return "La contraseña debe incluir al menos una letra mayúscula";
        }
        if (!password.chars().anyMatch(Character::isLowerCase)) {
            return "La contraseña debe incluir al menos una letra minúscula";
        }
        if (!password.chars().anyMatch(Character::isDigit)) {
            return "La contraseña debe incluir al menos un número";
        }
        if (dni != null && !dni.isBlank() && password.equals(dni.trim())) {
            return "La contraseña no puede ser igual al DNI";
        }
        return null;
    }
}
