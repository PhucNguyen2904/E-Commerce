package com.ecommerce.authservice.service;

import com.ecommerce.authservice.domain.entity.RefreshToken;
import com.ecommerce.authservice.domain.entity.User;
import com.ecommerce.authservice.dto.LoginRequest;
import com.ecommerce.authservice.dto.RegisterRequest;
import com.ecommerce.authservice.dto.TokenResponse;
import com.ecommerce.authservice.dto.UserResponse;
import com.ecommerce.authservice.exception.AuthException;
import com.ecommerce.authservice.repository.RefreshTokenRepository;
import com.ecommerce.authservice.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new AuthException("EMAIL_ALREADY_EXISTS", "Email is already registered");
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                "CUSTOMER"
        );

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new AuthException("INVALID_CREDENTIALS", "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthException("INVALID_CREDENTIALS", "Invalid email or password");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenString = jwtService.generateRefreshToken();

        RefreshToken refreshToken = new RefreshToken(
                user,
                refreshTokenString,
                LocalDateTime.now().plusDays(7)
        );
        refreshTokenRepository.save(refreshToken);

        return new TokenResponse(accessToken, refreshTokenString);
    }

    @Transactional
    public TokenResponse refresh(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new AuthException("INVALID_REFRESH_TOKEN", "Refresh token is invalid or does not exist"));

        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new AuthException("INVALID_REFRESH_TOKEN", "Refresh token is expired or revoked");
        }

        User user = refreshToken.getUser();
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshTokenString = jwtService.generateRefreshToken();

        // Xóa token cũ, tạo token mới (Rotation)
        refreshTokenRepository.delete(refreshToken);

        RefreshToken newRefreshToken = new RefreshToken(
                user,
                newRefreshTokenString,
                LocalDateTime.now().plusDays(7)
        );
        refreshTokenRepository.save(newRefreshToken);

        return new TokenResponse(newAccessToken, newRefreshTokenString);
    }

    public UserResponse getCurrentUser(String token) {
        try {
            String userId = jwtService.extractUserId(token);
            User user = userRepository.findById(UUID.fromString(userId))
                    .orElseThrow(() -> new AuthException("USER_NOT_FOUND", "User not found"));
            
            return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.getCreatedAt());
        } catch (Exception e) {
            throw new AuthException("INVALID_TOKEN", "Token is invalid or expired");
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AuthException("USER_NOT_FOUND", "User not found"));
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.getCreatedAt());
    }
}
