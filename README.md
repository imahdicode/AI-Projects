# MediScript - Clinic Management System

A full-stack clinic management application built with React frontend and Spring Boot backend.

## Overview

MediScript is a comprehensive clinic management software that streamlines patient registration, consultation visit recording, prescription generation, doctor onboarding, and multi-branch management.

## Project Structure

```
mediscript---clinic-management-system/
├── frontend/          # React + Vite frontend
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   └── ...
├── backend/           # Spring Boot backend
│   ├── mvnw / mvnw.cmd# Embedded Maven Wrapper
│   └── src/main/java/com/mediscript/clinic/
└── README.md
```

## Features

- **Doctor Onboarding & Auth**: Secure login via username or license number, admin doctor registration, and self-service account activation.
- **Doctor-Patient Data Isolation**: Multi-tenant data segregation ensuring doctors only access their assigned patients while admins retain system-wide visibility.
- **Patient Management**: Full CRUD operations for patient records, medical history, and vitals.
- **Visit & Prescription Recorder**: Fast consultation recording with customizable prescription items, lab order requests, and printable receipts/certificates.
- **Clinic Branch Management**: Multi-branch tracking and configuration.
- **Medicine Inventory & Templates**: Pre-configured prescription templates for rapid entry.

---

## 🚀 How to Run the Project

You will need **two terminal windows**: one for the Backend (Spring Boot) and one for the Frontend (React).

### Method 1: Quick Start with H2 In-Memory Database (No Database Installation Needed)

This is the easiest way to run the project instantly without setting up PostgreSQL or Docker.

#### Step 1: Start Backend (Terminal 1)
Open PowerShell or Terminal in the project root:
```powershell
cd backend
.\mvnw spring-boot:run -Dspring-boot.run.profiles=h2
```
*(On Linux/macOS, use `./mvnw spring-boot:run -Dspring-boot.run.profiles=h2`)*

The backend server will start on **`http://localhost:8080`**.

#### Step 2: Start Frontend (Terminal 2)
Open a new PowerShell or Terminal window in the project root:
```powershell
cd frontend
npm install
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

### Method 2: Running with PostgreSQL Database

If you have PostgreSQL installed on your system:

#### Step 1: Ensure PostgreSQL Database Exists
Ensure PostgreSQL is running and create the database `mediscript_db`:
```sql
CREATE DATABASE mediscript_db;
```
*(Optionally adjust username/password in `backend/src/main/resources/application.properties`)*

#### Step 2: Start Backend (Terminal 1)
```powershell
cd backend
.\mvnw spring-boot:run
```

#### Step 3: Start Frontend (Terminal 2)
```powershell
cd frontend
npm run dev
```

---

## Default Login Credentials

| Role | Username / License | Password | Notes |
|---|---|---|---|
| **Admin** | `mahdi` | `admin123` | System Administrator & Owner |
| **Doctor** | Use Admin panel to register new doctors | Set via First Login tab | Doctors use License Number to activate account |

---

## License

This project is licensed under the MIT License.
