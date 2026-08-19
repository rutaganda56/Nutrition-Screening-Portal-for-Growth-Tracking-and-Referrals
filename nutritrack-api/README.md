# NutriTrack API

Spring Boot REST API for the NutriTrack nutrition screening system.

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+

## PostgreSQL Setup

```sql
CREATE DATABASE nutritrack_db;
CREATE USER nutritrack_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE nutritrack_db TO nutritrack_user;
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DB_USERNAME` | PostgreSQL username | `nutritrack_user` |
| `DB_PASSWORD` | PostgreSQL password | `your_password` |
| `DB_HOST` | DB host (optional, default: localhost) | `localhost` |
| `DB_PORT` | DB port (optional, default: 5432) | `5432` |
| `DB_NAME` | DB name (optional, default: nutritrack_db) | `nutritrack_db` |
| `JWT_SECRET` | Base64-encoded JWT secret (min 32 chars) | `dGVzdC1zZWNyZXQta2V5...` |
| `JWT_EXPIRATION_MS` | JWT lifetime in milliseconds (optional, default: 86400000) | `86400000` |

## Running the App

```bash
# Set environment variables (Windows)
set DB_USERNAME=nutritrack_user
set DB_PASSWORD=your_password
set JWT_SECRET=dGVzdC1zZWNyZXQta2V5Zm9ydGVzdGluZ29ubHkzMmNoYXJz

# Run
mvn spring-boot:run
```

The API starts on `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

## Running Tests

```bash
mvn test
```

## Endpoint Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `api/auth/register` | Register new user |
| POST | `api/auth/login` | Login, returns JWT auth payload |

Successful login response:

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "fullName": "Example User",
    "email": "user@example.com",
    "phone": "+250700000000",
    "role": "DOCTOR",
    "status": "ACTIVE",
    "facilityName": "Health Center",
    "facilityId": 1,
    "createdAt": "2026-07-02T12:00:00"
  }
}
```

### Users (Admin)
| Method | Endpoint | Description |
|---|---|---|
| GET | `api/users` | List all users |
| GET | `api/users/{id}` | Get user by ID |
| PUT | `api/users/{id}` | Update user |
| PATCH | `api/users/{id}/toggle-status` | Enable/disable user |
| DELETE | `api/users/{id}` | Delete user |

### Health Facilities (Admin)
| Method | Endpoint | Description |
|---|---|---|
| GET | `api/facilities` | List all facilities |
| GET | `api/facilities/{id}` | Get facility by ID |
| POST | `api/facilities` | Create facility |
| PUT | `api/facilities/{id}` | Update facility |
| PATCH | `api/facilities/{id}/toggle-status` | Enable/disable facility |
| DELETE | `api/facilities/{id}` | Delete facility |

### Patients (CHW)
| Method | Endpoint | Description |
|---|---|---|
| POST | `api/patients` | Register new patient |
| GET | `api/patients` | List all patients |
| GET | `api/patients/{id}` | Get patient by ID |
| GET | `api/patients/facility/{facilityId}` | Patients by facility |
| GET | `api/patients/status/{status}` | Filter by status (NORMAL/MAM/SAM) |

### Screenings (CHW)
| Method | Endpoint | Description |
|---|---|---|
| POST | `api/screenings` | Create screening (auto-classifies) |
| GET | `api/screenings` | List all screenings |
| GET | `api/screenings/{id}` | Get screening by ID |
| GET | `api/screenings/patient/{patientId}` | Screenings for a patient |

### Service Requests (CHW → Doctor)
| Method | Endpoint | Description |
|---|---|---|
| POST | `api/service-requests` | Submit service request |
| GET | `api/service-requests` | List all |
| GET | `api/service-requests/{id}` | Get by ID |
| GET | `api/service-requests/doctor/{doctorId}` | Requests assigned to doctor |
| GET | `api/service-requests/status/{status}` | Filter by status |
| PATCH | `api/service-requests/{id}/status?status=IN_REVIEW` | Update status |

### Nutrition Orders (CHW / Doctor)
| Method | Endpoint | Description |
|---|---|---|
| POST | `api/nutrition-orders` | Create nutrition order |
| GET | `api/nutrition-orders` | List all |
| GET | `api/nutrition-orders/{id}` | Get by ID |
| GET | `api/nutrition-orders/patient/{patientId}` | Orders for a patient |
| PATCH | `api/nutrition-orders/{id}/status?status=COMPLETED` | Update status |

### Clinical Assessments (Doctor)
| Method | Endpoint | Description |
|---|---|---|
| POST | `api/clinical-assessments` | Confirm clinical diagnosis |
| GET | `api/clinical-assessments/{id}` | Get by ID |
| GET | `api/clinical-assessments/patient/{patientId}` | Assessments for a patient |

### Referrals (Doctor)
| Method | Endpoint | Description |
|---|---|---|
| POST | `api/referrals` | Create referral |
| GET | `api/referrals` | List all |
| GET | `api/referrals/{id}` | Get by ID |
| GET | `api/referrals/doctor/{doctorId}` | Referrals by doctor |
| GET | `api/referrals/patient/{patientId}` | Referrals for a patient |
| PATCH | `api/referrals/{id}/status?status=ACCEPTED` | Update status |

### Alerts (Doctor)
| Method | Endpoint | Description |
|---|---|---|
| POST | `api/alerts` | Create alert |
| GET | `api/alerts` | List all |
| GET | `api/alerts/doctor/{doctorId}` | Alerts for a doctor |
| PATCH | `api/alerts/{id}/status?status=READ` | Update status |

### Follow-Ups (Doctor)
| Method | Endpoint | Description |
|---|---|---|
| POST | `api/follow-ups` | Create follow-up |
| GET | `api/follow-ups` | List all |
| GET | `api/follow-ups/doctor/{doctorId}` | Follow-ups for a doctor |
| PATCH | `api/follow-ups/{id}/status?status=COMPLETED` | Update status |

## Business Rules

- Patient must be **under 5 years old** to be registered for nutrition screening
- Nutritional classification is **server-calculated** using WHO standards:
  - SAM: MUAC < 11.5 cm
  - MAM: 11.5 cm ≤ MUAC < 12.5 cm
  - NORMAL: MUAC ≥ 12.5 cm
- **No overlapping active nutrition orders** for the same patient
- Doctors access patients **only through service requests**
- All endpoints except `api/auth/**` and Swagger require a valid JWT (`Authorization: Bearer <token>`)
