# QueueCure-AI System Design & Algorithms

This document details the core algorithms, socket events, synthetic dataset generation, and rule-based diagnostic configurations implemented in **QueueCure-AI**.

---

## 1. Queue Priority & Wait-Time Algorithm

QueueCure-AI uses a dynamic priority-weighted sorting algorithm to manage lobby queues. Instead of simple First-In-First-Out (FIFO), patient tickets are scheduled based on medical urgency combined with check-in time.

### Priority Levels & Weights
- **EMERGENCY (Weight: 3)**: Instantly fast-tracked to the top (Index #1). Bypass wait estimation.
- **HIGH (Weight: 2)**: Grouped ahead of normal cases, sorted by check-in time.
- **NORMAL (Weight: 1)**: Placed behind high-priority cases, sorted by check-in time.

### Estimated Wait Time Calculation
Each Doctor cabin has an average consultation duration coefficient ($C_{avg} = 15$ minutes).
For a ticket at index $k$ (1-indexed) in a doctor's waiting list:
$$\text{Wait Time} = k \times C_{avg}$$
- **Emergency patients**: Wait time is set to `0` minutes, flashing warning indicators on the kiosk.
- **Queue Shift Notifications**: When an emergency fast-track is triggered, the system recalculates the waiting indexes of all active tickets and dispatches SMS alerts warning about the slight schedule shift.

---

## 2. Real-Time Socket.IO Channels

Socket communication is initiated at client connection. The following real-time events synchronize the dashboard panels:

| Event Name | Sender | Receivers | Payload Description | Trigger Context |
|---|---|---|---|---|
| `patientRegistered` | Server | Receptionist / Admin | `{ patientId, fullName }` | Walk-in patient checked in |
| `queueUpdated` | Server | All Dashboard Clients | None (Triggers refresh fetches) | New token added, fast-tracked, or completed |
| `currentTokenUpdated`| Server | Lobby Display / Patients | `{ tokenNumber, doctorName }` | Doctor calls the next patient |
| `tokenCalled` | Server | Patient Mobile App | `{ tokenNumber, doctorName, phone }` | SMS and email dispatcher alerts |
| `appointmentCreated` | Server | Doctor Console / Admin | `{ appointmentId, date }` | New booking scheduled |

---

## 3. Synthetic Dataset Specifications

To facilitate comprehensive load testing, the embedded database seeder creates structured datasets in CSV format before importing them into MongoDB collections:

1. **`hospitals.csv` (25 records)**: 
   - Fields: `name`, `location`, `address`, `contactNumber`, `capacity`, `departments` (Array).
2. **`doctors.csv` (100 records)**: 
   - Fields: `fullName`, `email`, `phoneNumber`, `specialization`, `department`, `hospitalId` (linked reference).
3. **`patients.csv` (1000 records)**: 
   - Fields: `fullName`, `email`, `phoneNumber`, `age`, `gender`, `priority` (EMERGENCY/HIGH/NORMAL), `symptoms`, `medicalHistory`.
4. **`appointments.csv` (5000 records)**: 
   - Fields: `patientId`, `doctorId`, `hospitalId`, `date`, `status` (CONFIRMED/COMPLETED/CANCELLED), `reason`.
5. **`queue.csv` (2000 records)**: 
   - Fields: `tokenNumber`, `patientId`, `doctorId`, `hospitalId`, `status` (WAITING/CONSULTING/COMPLETED), `estimatedWaitTime`, `createdAt`.

---

## 4. Symptom Chatbot Logic

The rule-based AI chatbot processes patient symptoms and resolves matches to target medical specialties using a localized keyword dictionary:

- **Cardiology**: "chest pain", "shortness of breath", "palpitations", "heart", "left arm pain", "chest discomfort"
- **Pediatrics**: "child fever", "baby cough", "pediatrician", "infant rash", "toddler"
- **Orthopedics**: "bone fracture", "joint pain", "broken arm", "sprain", "knee swelling", "backache"
- **Dermatology**: "skin rash", "eczema", "acne", "itching", "skin allergy", "mole"
- **Neurology**: "severe headache", "migraine", "dizziness", "seizures", "numbness"
- **General Medicine**: Default fallback for standard check-ups, fever, common cold, throat soreness.
