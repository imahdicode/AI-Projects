package com.mediscript.clinic.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Gender {
    MALE("Male"),
    FEMALE("Female"),
    OTHER("Other");

    private final String value;

    Gender(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Gender fromValue(String text) {
        if (text == null || text.isBlank()) {
            return MALE;
        }
        for (Gender b : Gender.values()) {
            if (b.name().equalsIgnoreCase(text) || b.value.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return MALE;
    }
}