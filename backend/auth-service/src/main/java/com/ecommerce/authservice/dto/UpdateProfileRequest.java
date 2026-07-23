package com.ecommerce.authservice.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateProfileRequest {
    
    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;
    
    private String phone;

    public UpdateProfileRequest() {}

    public UpdateProfileRequest(String fullName, String phone) {
        this.fullName = fullName;
        this.phone = phone;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
