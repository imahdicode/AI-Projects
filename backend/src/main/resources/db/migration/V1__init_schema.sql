-- MediScript Initial Schema Migration V1
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    name VARCHAR(255),
    specialization VARCHAR(255),
    license_number VARCHAR(255) UNIQUE,
    phone VARCHAR(255),
    role VARCHAR(255),
    assigned_branch_id VARCHAR(255),
    status VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(50),
    phone VARCHAR(255),
    address VARCHAR(2000),
    medical_history VARCHAR(4000),
    allergies VARCHAR(1000),
    blood_group VARCHAR(50),
    doctor_id VARCHAR(255),
    created_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);

CREATE TABLE IF NOT EXISTS visits (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(255),
    doctor_name VARCHAR(255),
    date TIMESTAMP,
    symptoms VARCHAR(4000),
    diagnosis VARCHAR(4000),
    notes VARCHAR(4000),
    lab_orders VARCHAR(2000),
    follow_up_date VARCHAR(255),
    bp VARCHAR(255),
    weight VARCHAR(255),
    temp VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_doctor_id ON visits(doctor_id);

CREATE TABLE IF NOT EXISTS visit_prescriptions (
    visit_id VARCHAR(255) NOT NULL,
    id VARCHAR(255),
    medicine VARCHAR(255),
    dosage VARCHAR(255),
    frequency VARCHAR(255),
    duration VARCHAR(255),
    instructions VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS clinic_branches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    code VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(255),
    doctor_count INT,
    status VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS clinic_settings (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(255),
    doctor_name VARCHAR(255),
    specialization VARCHAR(255),
    license_number VARCHAR(255),
    footer_text VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS medicine_templates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    dosage VARCHAR(255),
    frequency VARCHAR(255),
    duration VARCHAR(255),
    instructions VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS opd_queue (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255),
    patient_name VARCHAR(255),
    age INT,
    gender VARCHAR(255),
    status VARCHAR(255),
    registered_at VARCHAR(255),
    token_number INT,
    doctor_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    stock_quantity INT,
    unit_price DOUBLE PRECISION,
    category VARCHAR(255),
    expiry_date VARCHAR(255),
    batch_number VARCHAR(255)
);
