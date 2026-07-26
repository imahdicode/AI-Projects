package com.mediscript.clinic.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Vitals {

    private String bp;
    private String weight;
    private String temp;

    public String getBp() {
        return bp;
    }

    public void setBp(String bp) {
        this.bp = bp;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    public String getTemp() {
        return temp;
    }

    public void setTemp(String temp) {
        this.temp = temp;
    }
}