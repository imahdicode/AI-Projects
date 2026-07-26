<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MediScript - Clinic Management System

A full-stack clinic management application with React frontend and Spring Boot backend.

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

## Prerequisites

- **Frontend:** Node.js (v20.19.0 or v22.12.0+)
- **Backend:** JDK 17 and Maven

### Backend Database Setup

The backend supports **PostgreSQL** by default, with an optional **H2 in-memory profile** for quick local testing.

#### Option 1: Running with PostgreSQL (Default)
1. Start PostgreSQL (e.g., via Docker):
   ```bash
   docker-compose up -d
   ```
2. Or configure your local PostgreSQL credentials in `backend/src/main/resources/application.properties` (or environment variables `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`).
3. Run the API:
   ```bash
   mvn spring-boot:run
   ```

#### Option 2: Running with H2 In-Memory Database (No Setup Required)
Run with the `h2` active profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

### Backend Execution

The backend listens on `http://localhost:8080` and exposes REST endpoints under `/api` for patients, visits, settings, templates, and login.

### Frontend

1. Open a terminal in the `frontend` folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   - The backend URL is set in `.env` (defaults to `http://localhost:8080`)
   - Optionally set `GEMINI_API_KEY` in `.env.local` for AI features
4. Run the app:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Features

- Patient management (CRUD operations)
- Visit recording with prescriptions
- AI-powered symptom analysis (requires Gemini API key)
- Medicine templates for quick prescription entry
- Clinic settings management
- Printable prescriptions
- Recent visits tracking
