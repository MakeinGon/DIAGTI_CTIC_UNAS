package pe.edu.unas.ctic.diagti.Login.dto;

public class LoginRequest {
    private String username; // DNI
    private String password;
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}