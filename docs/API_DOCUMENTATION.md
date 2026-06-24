# QueueCure-AI API Documentation

This document lists the complete API routing table, HTTP methods, authorization requirements, request payloads, and response structures for **QueueCure-AI**.

---

## 1. Authentication Module (`/api/auth`)

### POST `/api/auth/register`
Registers a new user (Patient, Doctor, Receptionist, Admin).
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "phoneNumber": "+1555019999",
    "role": "PATIENT"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "_id": "60d0fe4f5311236168a109a1",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "PATIENT",
      "isActive": true
    }
  }
  ```

### POST `/api/auth/login`
Authenticates a user and returns a JSON Web Token (JWT).
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "60d0fe4f5311236168a109a1",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "PATIENT",
      "isActive": true
    }
  }
  ```

---

## 2. Queue Management Module (`/api/queue`)

### GET `/api/queue`
Retrieves all queue tickets currently in the database.
- **Auth:** Protected (JWT)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "queues": [
      {
        "_id": "60d0fe4f5311236168a109b2",
        "tokenNumber": 1004,
        "patient": { "_id": "...", "fullName": "John Doe", "priority": "HIGH" },
        "doctor": { "_id": "...", "fullName": "Dr. Smith" },
        "status": "WAITING",
        "estimatedWaitTime": 15
      }
    ]
  }
  ```

### GET `/api/queue/current`
Gets the patient ticket currently marked as `CONSULTING` in the doctor cabin.
- **Auth:** Protected (JWT)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "currentToken": {
      "_id": "60d0fe4f5311236168a109b2",
      "tokenNumber": 1004,
      "patient": { "fullName": "John Doe", "age": 45, "gender": "Male", "symptoms": "Chest discomfort" },
      "status": "CONSULTING"
    }
  }
  ```

### GET `/api/queue/waiting`
Lists all patient tickets with `WAITING` status.
- **Auth:** Protected (JWT)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "totalWaiting": 5,
    "waitingPatients": [ ... ]
  }
  ```

### POST `/api/queue/next`
Selects the next patient from the lobby waiting list, marks the previous patient completed, and moves the new patient to `CONSULTING` status. Emits Socket.io alerts.
- **Auth:** Protected (JWT - DOCTOR/RECEPTIONIST/ADMIN)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Called next patient successfully",
    "token": {
      "_id": "60d0fe4f5311236168a109c3",
      "tokenNumber": 1005,
      "status": "CONSULTING"
    }
  }
  ```

---

## 3. Emergency Module (`/api/emergency`)

### POST `/api/emergency/fast-track`
Forces a critical/emergency patient to the absolute top of the waiting queue (Position #1). Emits `queueUpdated` event.
- **Auth:** Protected (JWT - DOCTOR/RECEPTIONIST/ADMIN)
- **Request Body:**
  ```json
  {
    "patientId": "60d0fe4f5311236168a109a1"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Patient fast-tracked to the top of the queue successfully",
    "ticket": {
      "tokenNumber": 1009,
      "status": "WAITING",
      "priority": "EMERGENCY"
    }
  }
  ```

### GET `/api/emergency/critical`
Lists all active emergency queue tickets currently waiting or consulting.
- **Auth:** Protected (JWT)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 2,
    "criticalPatients": [ ... ]
  }
  ```

---

## 4. Analytics Module (`/api/analytics`)

### GET `/api/analytics/metrics`
Gathers comprehensive system-wide metrics and aggregates counts.
- **Auth:** Protected (JWT - DOCTOR/ADMIN)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "metrics": {
      "totalPatients": 1000,
      "totalAppointments": 5000,
      "waitingCount": 12,
      "averageWaitTime": 18.5
    }
  }
  ```

### GET `/api/analytics/queue-stats`
Retrieves detailed queue distribution metrics by hour, department, and priority tags.
- **Auth:** Protected (JWT - DOCTOR/ADMIN)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "stats": {
      "byPriority": { "EMERGENCY": 4, "HIGH": 22, "NORMAL": 85 },
      "hourlyFlow": [ { "hour": 9, "count": 14 }, { "hour": 10, "count": 28 } ]
    }
  }
  ```

---

## 5. AI Chatbot Module (`/api/chatbot`)

### POST `/api/chatbot/message`
Exposes the symptom-matching and medical FAQ chatbot service.
- **Auth:** Public / Protected
- **Request Body:**
  ```json
  {
    "message": "I have severe chest pain that spreads to my left arm."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "reply": "I detected symptoms related to: Chest Discomfort / Cardiology. We highly recommend consulting a Cardiologist immediately. For urgent matters, please use the Emergency fast-track.",
    "symptoms": ["chest pain", "left arm pain"],
    "recommendedSpecialty": "Cardiology",
    "faqMatched": false
  }
  ```

---

## 6. Admin Module (`/api/admin`)

### GET `/api/admin/metrics`
Obtains database counters and host OS level CPU and Memory diagnostics.
- **Auth:** Protected (JWT - ADMIN)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "metrics": {
      "telemetry": {
        "cpuLoad": 1.45,
        "memoryUsagePercent": 56.4,
        "usedMemoryGB": 9.02,
        "totalMemoryGB": 16.0
      },
      "database": {
        "status": "Connected",
        "name": "queuecure",
        "counters": { "users": 102, "patients": 1000, "queues": 2000 }
      }
    }
  }
  ```

### GET `/api/admin/users`
Lists all user accounts registered in the database (excluding password strings).
- **Auth:** Protected (JWT - ADMIN)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "users": [ ... ]
  }
  ```

### PUT `/api/admin/users/:id/role`
Updates a user's system role.
- **Auth:** Protected (JWT - ADMIN)
- **Request Body:**
  ```json
  {
    "role": "DOCTOR"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User role updated successfully"
  }
  ```

### PUT `/api/admin/users/:id/status`
Toggles a user account's isActive status (suspend/activate).
- **Auth:** Protected (JWT - ADMIN)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "isActive": false,
    "message": "User status toggled successfully"
  }
  ```

### DELETE `/api/admin/users/:id`
Deletes a user credential record permanently.
- **Auth:** Protected (JWT - ADMIN)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```
