package com.ecommerce.apigateway;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private static final List<String> openApiEndpoints = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/swagger-ui",
            "/v3/api-docs",
            "/api/chatbot"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                io.jsonwebtoken.Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
                
                String userId = claims.getSubject();
                String role = claims.get("role", String.class);
                
                request = exchange.getRequest().mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Role", role)
                        .build();
                        
                exchange = exchange.mutate().request(request).build();
            } catch (Exception e) {
                if (isSecured(request)) {
                    return this.onError(exchange, "Invalid or expired JWT token", HttpStatus.UNAUTHORIZED);
                }
            }
        } else {
            if (isSecured(request)) {
                return this.onError(exchange, "No or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }
        }

        return chain.filter(exchange);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        // Trong hệ thống thực tế có thể trả về JSON chi tiết lỗi ở body
        return response.setComplete();
    }

    private boolean isSecured(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        if (request.getMethod().name().equals("GET")) {
            if (path.startsWith("/api/products") || path.startsWith("/api/categories") || path.startsWith("/api/inventory") || path.startsWith("/api/search")) {
                return false;
            }
        }
        return openApiEndpoints.stream().noneMatch(uri -> path.contains(uri));
    }

    @Override
    public int getOrder() {
        return -1; // Chạy filter này sớm nhất có thể
    }
}
