package com.mediscript.clinic.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "clinic_branches")
public class ClinicBranch {

    @Id
    private String id;
    private String name;
    private String code;
    private String address;
    private String phone;
    private int doctorCount;
    private String status;

    public ClinicBranch() {
    }

    public ClinicBranch(String id, String name, String code, String address, String phone, int doctorCount, String status) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.address = address;
        this.phone = phone;
        this.doctorCount = doctorCount;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public int getDoctorCount() {
        return doctorCount;
    }

    public void setDoctorCount(int doctorCount) {
        this.doctorCount = doctorCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
