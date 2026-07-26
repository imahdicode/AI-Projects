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

## Prerequisites

- **Frontend:** Node.js (v20.19.0 or v22.12.0+)
- **Backend:** JDK 21 (or JDK 17+) and Maven 3.9+
- **Database:** PostgreSQL 18 (or local H2 in-memory)

---

## Getting Started

### 1. Backend Setup

#### Running with PostgreSQL (Default)
1. Start PostgreSQL server or container:
   ```bash
   docker-compose up -d
   ```
2. Configure credentials in `backend/src/main/resources/application.properties` (or set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`).
3. Run the Spring Boot application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

#### Running with H2 In-Memory Database (No Setup Required)
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

The backend server listens on `http://localhost:8080` exposing REST APIs under `/api`.

### 2. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be accessible at `http://localhost:5173`.

---

## License

This project is licensed under the MIT License.
