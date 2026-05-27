# RadFlow API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.yourdomain.com/api
```

## Authentication

All endpoints (except `/auth/login` and `/auth/forgot-password`) require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Login
```
POST /auth/login

Request Body:
{
  "email": "user@hospital.com",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@hospital.com",
    "full_name": "Dr. John Doe",
    "role": "Doctor",
    "department": "Radiation Oncology"
  }
}

Error (401):
{
  "error": "Invalid credentials"
}
```

### Register New User (Coordinator Only)
```
POST /auth/register

Request Headers:
Authorization: Bearer <token>

Request Body:
{
  "email": "newuser@hospital.com",
  "full_name": "Dr. Jane Smith",
  "role": "Doctor",
  "department": "Radiation Oncology",
  "phone": "+91-9876543210",
  "password": "TempPassword123!"
}

Response (200):
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "email": "newuser@hospital.com",
    "full_name": "Dr. Jane Smith",
    "role": "Doctor"
  },
  "temporary_password": "TempPassword123!"
}
```

### Forgot Password
```
POST /auth/forgot-password

Request Body:
{
  "email": "user@hospital.com"
}

Response (200):
{
  "message": "Reset link sent to email"
}
```

### Reset Password
```
POST /auth/reset-password

Request Body:
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123!"
}

Response (200):
{
  "message": "Password reset successfully"
}
```

### Change Password
```
POST /auth/change-password

Request Headers:
Authorization: Bearer <token>

Request Body:
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}

Response (200):
{
  "message": "Password changed successfully"
}
```

---

## Patient Endpoints

### List Patients
```
GET /patients?search=john&consultant_id=5&machine_type=Elekta

Query Parameters:
- search: Search by name or patient ID (partial match)
- consultant_id: Filter by consultant ID
- machine_type: Filter by machine (Elekta or Tomo)

Response (200):
[
  {
    "id": 1,
    "patient_id": "RAD2024001",
    "name": "John Doe",
    "phone": "+91-9876543210",
    "diagnosis": "Breast Cancer",
    "date_first_visit": "2024-01-15",
    "primary_consultant_id": 5,
    "primary_consultant_name": "Dr. Abhijit Das",
    "payment_mode": "Cash",
    "date_simulation": "2024-01-20",
    "contouring_done": true,
    "date_contouring": "2024-01-22",
    "planning_done": true,
    "date_planning": "2024-01-25",
    "tentative_start_date": "2024-02-01",
    "treatment_started": true,
    "date_treatment_started": "2024-02-01",
    "machine_type": "Elekta",
    "pending_issue": null,
    "is_cancelled": false,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-02-01T14:30:00Z",
    "consultants": [
      {
        "id": 5,
        "name": "Dr. Abhijit Das",
        "is_primary": true
      },
      {
        "id": 6,
        "name": "Dr. Jane Smith",
        "is_primary": false
      }
    ]
  }
]
```

### Get Patient Details
```
GET /patients/:id

Response (200):
{
  "id": 1,
  "patient_id": "RAD2024001",
  "name": "John Doe",
  // ... all patient fields
}

Error (404):
{
  "error": "Patient not found"
}
```

### Create Patient
```
POST /patients

Request Body:
{
  "patient_id": "RAD2024001",
  "name": "John Doe",
  "phone": "+91-9876543210",
  "diagnosis": "Breast Cancer",
  "date_first_visit": "2024-01-15",
  "primary_consultant_id": 5,
  "payment_mode": "Cash"
}

Response (200):
{
  "id": 1,
  "patient_id": "RAD2024001",
  "name": "John Doe",
  // ... created patient object
}

Error (400):
{
  "error": "Missing required fields"
}
```

### Update Patient
```
PUT /patients/:id

Request Body (send only fields to update):
{
  "contouring_done": true,
  "date_contouring": "2024-01-22",
  "pending_issue": null,
  "planning_done": true,
  "tentative_start_date": "2024-02-01"
}

Note: Field access depends on user role:
- Coordinator: All fields
- Doctor: diagnosis, primary_consultant_id, payment_mode, contouring_done, 
          planning_done, tentative_start_date, machine_type, pending_issue, 
          is_cancelled, cancellation_reason
- Physicist: planning_done, machine_type
- RTT: date_simulation, treatment_started, date_treatment_started, machine_type

Response (200):
{
  "id": 1,
  // ... updated patient object
}

Error (403):
{
  "error": "No permission to update these fields"
}
```

### Add Consultant to Patient
```
POST /patients/:id/consultants

Request Body:
{
  "consultant_id": 6,
  "is_primary": false
}

Response (200):
{
  "id": 1,
  "patient_id": 1,
  "consultant_id": 6,
  "is_primary": false,
  "assigned_at": "2024-02-01T15:00:00Z"
}
```

---

## Consultant Endpoints

### List Consultants
```
GET /consultants

Response (200):
[
  {
    "id": 5,
    "user_id": 1,
    "name": "Dr. Abhijit Das",
    "specialization": "Radiation Oncology",
    "contact_number": "+91-9876543210",
    "is_active": true,
    "created_at": "2024-01-01T10:00:00Z",
    "email": "abhijit@hospital.com",
    "full_name": "Dr. Abhijit Das"
  }
]
```

---

## Notification Endpoints

### Get Notifications
```
GET /notifications

Query Parameters:
- limit: Number of notifications to retrieve (default: 50)
- offset: Number of notifications to skip for pagination

Response (200):
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Patient Simulated",
    "message": "RAD2024001 - John Doe has been simulated",
    "type": "simulation",
    "patient_id": 1,
    "is_read": false,
    "created_at": "2024-02-01T10:00:00Z",
    "read_at": null
  }
]
```

### Mark Notification as Read
```
PATCH /notifications/:id/read

Response (200):
{
  "id": 1,
  "is_read": true,
  "read_at": "2024-02-01T10:05:00Z"
}
```

### Register Push Notification Token
```
POST /notifications/register-token

Request Body:
{
  "token": "firebase-cloud-messaging-token"
}

Response (200):
{
  "message": "Token registered"
}
```

---

## User Management Endpoints (Coordinator Only)

### List Users
```
GET /users

Response (200):
[
  {
    "id": 1,
    "email": "coordinator@hospital.com",
    "full_name": "Admin User",
    "role": "Coordinator",
    "department": "Administration",
    "phone": "+91-9876543210",
    "is_active": true,
    "created_at": "2024-01-01T10:00:00Z",
    "last_login": "2024-02-01T09:30:00Z"
  }
]
```

### Deactivate User
```
DELETE /users/:id

Response (200):
{
  "message": "User deactivated"
}
```

### Change User Role
```
PUT /users/:id/role

Request Body:
{
  "role": "Doctor"
}

Allowed roles: Doctor, Physicist, RTT, Coordinator

Response (200):
{
  "id": 2,
  "role": "Doctor",
  // ... updated user object
}
```

---

## Export Endpoints

### Export Patients to Excel
```
POST /export/patients

Request Body:
{
  "filters": {
    "consultant_id": 5,
    "machine_type": "Elekta",
    "started_only": false
  }
}

Response:
File download (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

Exported Columns:
- Patient ID
- Name
- Phone
- Diagnosis
- First Visit Date
- Consultant Name
- Simulation Date
- Contouring Done
- Planning Done
- Treatment Started
- Start Date
- Machine Type
- Issues

Example with curl:
curl -X POST http://localhost:5000/api/export/patients \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"filters":{"consultant_id":5}}' \
  -o export.xlsx
```

---

## Health Check

### Get Server Status
```
GET /health

Response (200):
{
  "status": "OK"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- Login attempts: 5 per 15 minutes per IP
- General API: 100 requests per minute per user
- Export: 10 exports per hour per user

---

## Response Headers

```
Content-Type: application/json
X-Request-ID: unique-request-id
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

---

## Example Workflows

### Complete Patient Journey

```bash
# 1. Create patient
POST /patients
{
  "patient_id": "RAD2024001",
  "name": "John Doe",
  "primary_consultant_id": 5,
  "diagnosis": "Breast Cancer",
  "payment_mode": "Cash"
}

# 2. Update simulation date (RTT)
PUT /patients/1
{
  "date_simulation": "2024-02-01"
}

# 3. Mark contouring done (Doctor)
PUT /patients/1
{
  "contouring_done": true,
  "date_contouring": "2024-02-03"
}

# 4. Mark planning done (Physicist)
PUT /patients/1
{
  "planning_done": true,
  "date_planning": "2024-02-05"
}

# 5. Start treatment (RTT)
PUT /patients/1
{
  "treatment_started": true,
  "date_treatment_started": "2024-02-08",
  "machine_type": "Elekta"
}

# 6. Export final report
POST /export/patients
{
  "filters": {
    "consultant_id": 5,
    "started_only": true
  }
}
```

### User Onboarding

```bash
# 1. Create new user
POST /auth/register
{
  "email": "newdoctor@hospital.com",
  "full_name": "Dr. Jane Smith",
  "role": "Doctor",
  "password": "TempPass123!"
}

# 2. User changes password on first login
POST /auth/change-password
{
  "currentPassword": "TempPass123!",
  "newPassword": "NewSecurePassword123!"
}

# 3. Assign patients to new doctor
POST /patients/1/consultants
{
  "consultant_id": <new_doctor_consultant_id>,
  "is_primary": true
}
```

---

## Testing with cURL

```bash
# Save token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@hospital.com","password":"password"}' \
  | jq -r '.token')

# Use token in requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/patients

# Create patient
curl -X POST http://localhost:5000/api/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "RAD2024001",
    "name": "Test Patient",
    "primary_consultant_id": 5,
    "payment_mode": "Cash"
  }'
```

---

## Testing with Postman

1. Import provided Postman collection
2. Set environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (auto-filled after login)
3. Run requests in sequence
4. Use tests tab for assertions

---

## Webhook Events (Future)

Future versions will support webhooks for:
- patient.created
- patient.updated
- notification.sent
- treatment.started
- treatment.completed

---

Version: 1.0.0
Last Updated: 2024
For detailed examples: See Postman collection
