package pe.edu.unas.ctic.diagti.Login.controller;

import pe.edu.unas.ctic.diagti.Login.dto.LoginRequest;
import pe.edu.unas.ctic.diagti.Login.dto.LoginResponse;
import pe.edu.unas.ctic.diagti.Login.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.authenticate(loginRequest);
        return response.isSuccess() 
            ? ResponseEntity.ok(response) 
            : ResponseEntity.status(401).body(response);
    }
}