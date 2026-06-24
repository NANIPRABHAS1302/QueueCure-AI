import os
import csv
import random
from datetime import datetime, timedelta

# Output directory
DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))
os.makedirs(DATASETS_DIR, exist_ok=True)

# Helper lists
FIRST_NAMES = ["John", "Jane", "Robert", "Mary", "William", "Patricia", "David", "Elizabeth", "Richard", "Barbara", "Joseph", "Susan", "Thomas", "Jessica", "Charles", "Sarah", "Michael", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Paul", "Kimberly", "Steven", "Emily", "Andrew", "Donna", "Kenneth", "Michelle", "Joshua", "Carol", "Kevin", "Amanda", "Brian", "Melissa", "George", "Deborah", "Edward", "Stephanie", "Ronald", "Rebecca"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"]
SPECIALTIES = ["Cardiology", "Neurology", "General Medicine", "Dermatology", "Orthopedics", "Gastroenterology", "Pediatrics"]
CITIES = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"]
STATES = ["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "CA"]
BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
SYMPTOMS = ["Chest pain", "Shortness of breath", "Headache", "Dizziness", "Fever", "Cough", "Skin rash", "Joint pain", "Stomach ache", "Child fever", "Mild body ache", "Nausea", "Vomiting", "Fatigue", "Heart palpitations"]
PRIORITIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"]
PATIENT_STATUSES = ["WAITING", "IN_QUEUE", "CONSULTING", "COMPLETED", "CANCELLED"]
APPT_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]
QUEUE_STATUSES = ["WAITING", "CONSULTING", "COMPLETED"]

def generate_hospitals():
    path = os.path.join(DATASETS_DIR, "hospitals.csv")
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["hospitalName", "address", "city", "state", "contactNumber", "email"])
        for i in range(1, 26):
            name = f"General Hospital Clinic {i}"
            address = f"{random.randint(100, 999)} Main St"
            idx = random.randint(0, len(CITIES) - 1)
            city = CITIES[idx]
            state = STATES[idx]
            phone = f"+1-800-555-{i:04d}"
            email = f"contact@hospital{i}.com"
            writer.writerow([name, address, city, state, phone, email])
    print(f"Generated {path} (25 records)")

def generate_doctors():
    path = os.path.join(DATASETS_DIR, "doctors.csv")
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["fullName", "specialization", "phone", "email", "experience", "isAvailable"])
        for i in range(1, 101):
            name = f"Dr. {random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            spec = random.choice(SPECIALTIES)
            phone = f"+1-800-555-{1000 + i}"
            email = f"doctor.{i}@queuecure.com"
            exp = random.randint(2, 35)
            avail = str(random.random() > 0.1).upper()
            writer.writerow([name, spec, phone, email, exp, avail])
    print(f"Generated {path} (100 records)")

def generate_patients():
    path = os.path.join(DATASETS_DIR, "patients.csv")
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["patientId", "fullName", "age", "gender", "phone", "email", "bloodGroup", "address", "symptoms", "priority", "status", "tokenNumber", "queuePosition", "estimatedWaitTime"])
        for i in range(1, 1001):
            pid = f"PAT-SYN-{i:04d}"
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            age = random.randint(1, 95)
            gender = random.choice(["Male", "Female", "Other"])
            phone = f"+1-900-555-{i:04d}"
            email = f"patient.{i}@gmail.com"
            bg = random.choice(BLOOD_GROUPS)
            addr = f"{random.randint(10, 9999)} Oak Ave, {random.choice(CITIES)}"
            sym = random.choice(SYMPTOMS)
            priority = random.choice(PRIORITIES)
            status = random.choice(PATIENT_STATUSES)
            token = random.randint(100, 999)
            pos = random.randint(0, 50)
            wait = pos * 10
            writer.writerow([pid, name, age, gender, phone, email, bg, addr, sym, priority, status, token, pos, wait])
    print(f"Generated {path} (1000 records)")

def generate_appointments():
    path = os.path.join(DATASETS_DIR, "appointments.csv")
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["patientIndex", "doctorIndex", "appointmentDate", "status"])
        for i in range(1, 5001):
            p_idx = random.randint(1, 1000)
            d_idx = random.randint(1, 100)
            status = random.choice(APPT_STATUSES)
            date = datetime.now() + timedelta(days=random.randint(-30, 30))
            date = date.replace(hour=random.randint(9, 17), minute=random.choice([0, 15, 30, 45]), second=0, microsecond=0)
            writer.writerow([f"PAT-SYN-{p_idx:04d}", f"doctor.{d_idx}@queuecure.com", date.isoformat(), status])
    print(f"Generated {path} (5000 records)")

def generate_queues():
    path = os.path.join(DATASETS_DIR, "queue.csv")
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["tokenNumber", "patientIndex", "status", "queuePosition", "estimatedWaitTime"])
        for i in range(1, 2001):
            p_idx = random.randint(1, 1000)
            status = random.choice(QUEUE_STATUSES)
            pos = random.randint(1, 50) if status == "WAITING" else 0
            wait = pos * 10
            writer.writerow([i, f"PAT-SYN-{p_idx:04d}", status, pos, wait])
    print(f"Generated {path} (2000 records)")

if __name__ == "__main__":
    print("📊 Starting Programmatic Synthetic Dataset Generation...")
    generate_hospitals()
    generate_doctors()
    generate_patients()
    generate_appointments()
    generate_queues()
    print("⭐ Synthetic Datasets generation completed successfully!")
