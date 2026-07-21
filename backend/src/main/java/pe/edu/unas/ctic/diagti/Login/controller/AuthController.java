package pe.edu.unas.ctic.diagti.Login.controller;

import pe.edu.unas.ctic.diagti.Login.dto.LoginRequest;
import pe.edu.unas.ctic.diagti.Login.dto.LoginResponse;
import pe.edu.unas.ctic.diagti.Login.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.authenticate(loginRequest);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            LoginResponse errorResponse = new LoginResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Error en el servidor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Servicio de autenticación funcionando correctamente");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifySession(@RequestBody Map<String, Object> sessionData) {
        Map<String, Object> response = new HashMap<>();
        // Verificar si la sesión es válida
        String username = (String) sessionData.get("username");
        String rol = (String) sessionData.get("rol");
        
        // Aquí podrías verificar contra la base de datos
        response.put("valid", true);
        response.put("username", username);
        response.put("rol", rol);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testCors() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "CORS funciona correctamente");
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }
}