package com.ecommerce.authservice.service;

import com.ecommerce.authservice.domain.entity.RefreshToken;
import com.ecommerce.authservice.domain.entity.User;
import com.ecommerce.authservice.dto.LoginRequest;
import com.ecommerce.authservice.dto.RegisterRequest;
import com.ecommerce.authservice.exception.AuthException;
import com.ecommerce.authservice.repository.RefreshTokenRepository;
import com.ecommerce.authservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtService jwtService;

    private AuthService authService;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepository, refreshTokenRepository, jwtService);
    }

    @Test
    void testRegister_EmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@test.com");
        request.setPassword("password");
        request.setFullName("Test User");

        when(userRepository.existsByEmail("test@test.com")).thenReturn(true);

        AuthException exception = assertThrows(AuthException.class, () -> authService.register(request));
        assertEquals("EMAIL_ALREADY_EXISTS", exception.getCode());
    }

    @Test
    void testLogin_InvalidPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("wrongpassword");

        User user = new User("test@test.com", passwordEncoder.encode("correctpassword"), "Test User", "CUSTOMER");
        
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        AuthException exception = assertThrows(AuthException.class, () -> authService.login(request));
        assertEquals("INVALID_CREDENTIALS", exception.getCode());
    }

    @Test
    void testRefresh_TokenExpired() {
        User user = new User("test@test.com", "hash", "Test", "CUSTOMER");
        RefreshToken refreshToken = new RefreshToken(user, "sometoken", LocalDateTime.now().minusDays(1));

        when(refreshTokenRepository.findByToken("sometoken")).thenReturn(Optional.of(refreshToken));

        AuthException exception = assertThrows(AuthException.class, () -> authService.refresh("sometoken"));
        assertEquals("INVALID_REFRESH_TOKEN", exception.getCode());
        verify(refreshTokenRepository).delete(refreshToken);
    }
}
