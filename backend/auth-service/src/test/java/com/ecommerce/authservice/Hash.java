package com.ecommerce.authservice;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class Hash {
    public static void main(String[] args) {
        System.out.println("BCRYPT_HASH_RESULT=" + new BCryptPasswordEncoder().encode("123456"));
    }
}
