package com.ecommerce.authservice.controller;

import com.ecommerce.authservice.dto.LoginRequest;
import com.ecommerce.authservice.dto.RegisterRequest;
import com.ecommerce.authservice.dto.TokenResponse;
import com.ecommerce.authservice.dto.UserResponse;
import com.ecommerce.authservice.exception.AuthException;
import com.ecommerce.authservice.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@RequestHeader("X-User-Id") String userIdHeader) {
        // userIdHeader is injected by API Gateway
        return ResponseEntity.ok(authService.getUserById(UUID.fromString(userIdHeader)));
    }

    @GetMapping("/internal/users/{id}")
    public ResponseEntity<UserResponse> getInternalUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestParam("token") String token) {
        return ResponseEntity.ok(authService.refresh(token));
    }
}
