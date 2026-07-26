package com.mediscript.clinic.dto;

import com.mediscript.clinic.model.User;

public class UserDto {
    private String id;
    private String username;
    private String name;
    private String specialization;
    private String licenseNumber;
    private String phone;
    private String role;
    private String status;
    private String token;

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setName(user.getName());
        dto.setSpecialization(user.getSpecialization());
        dto.setLicenseNumber(user.getLicenseNumber());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole() != null ? user.getRole() : "DOCTOR");
        dto.setStatus(user.getStatus() != null ? user.getStatus() : "ACTIVE");
        dto.setToken(user.getToken());
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
