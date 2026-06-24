import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASETS_DIR = path.resolve(__dirname, "..", "datasets");
if (!fs.existsSync(DATASETS_DIR)) {
    fs.mkdirSync(DATASETS_DIR, { recursive: true });
}

const FIRST_NAMES = ["John", "Jane", "Robert", "Mary", "William", "Patricia", "David", "Elizabeth", "Richard", "Barbara", "Joseph", "Susan", "Thomas", "Jessica", "Charles", "Sarah", "Michael", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Paul", "Kimberly", "Steven", "Emily", "Andrew", "Donna", "Kenneth", "Michelle", "Joshua", "Carol", "Kevin", "Amanda", "Brian", "Melissa", "George", "Deborah", "Edward", "Stephanie", "Ronald", "Rebecca"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];
const SPECIALTIES = ["Cardiology", "Neurology", "General Medicine", "Dermatology", "Orthopedics", "Gastroenterology", "Pediatrics"];
const CITIES = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"];
const STATES = ["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "CA"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const SYMPTOMS = ["Chest pain", "Shortness of breath", "Headache", "Dizziness", "Fever", "Cough", "Skin rash", "Joint pain", "Stomach ache", "Child fever", "Mild body ache", "Nausea", "Vomiting", "Fatigue", "Heart palpitations"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"];
const PATIENT_STATUSES = ["WAITING", "IN_QUEUE", "CONSULTING", "COMPLETED", "CANCELLED"];
const APPT_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
const QUEUE_STATUSES = ["WAITING", "CONSULTING", "COMPLETED"];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateHospitals() {
    const file = path.join(DATASETS_DIR, "hospitals.csv");
    let content = "hospitalName,address,city,state,contactNumber,email\n";
    for (let i = 1; i <= 25; i++) {
        const name = `General Hospital Clinic ${i}`;
        const address = `${getRandomInt(100, 999)} Main St`;
        const idx = getRandomInt(0, CITIES.length - 1);
        const city = CITIES[idx];
        const state = STATES[idx];
        const phone = `+1-800-555-${String(i).padStart(4, "0")}`;
        const email = `contact@hospital${i}.com`;
        content += `"${name}","${address}","${city}","${state}","${phone}","${email}"\n`;
    }
    fs.writeFileSync(file, content);
    console.log(`Generated ${file} (25 records)`);
}

function generateDoctors() {
    const file = path.join(DATASETS_DIR, "doctors.csv");
    let content = "fullName,specialization,phone,email,experience,isAvailable\n";
    for (let i = 1; i <= 100; i++) {
        const name = `Dr. ${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
        const spec = getRandomElement(SPECIALTIES);
        const phone = `+1-800-555-${1000 + i}`;
        const email = `doctor.${i}@queuecure.com`;
        const exp = getRandomInt(2, 35);
        const avail = String(Math.random() > 0.1).toUpperCase();
        content += `"${name}","${spec}","${phone}","${email}",${exp},${avail}\n`;
    }
    fs.writeFileSync(file, content);
    console.log(`Generated ${file} (100 records)`);
}

function generatePatients() {
    const file = path.join(DATASETS_DIR, "patients.csv");
    let content = "patientId,fullName,age,gender,phone,email,bloodGroup,address,symptoms,priority,status,tokenNumber,queuePosition,estimatedWaitTime\n";
    for (let i = 1; i <= 1000; i++) {
        const pid = `PAT-SYN-${String(i).padStart(4, "0")}`;
        const name = `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
        const age = getRandomInt(1, 95);
        const gender = getRandomElement(["Male", "Female", "Other"]);
        const phone = `+1-900-555-${String(i).padStart(4, "0")}`;
        const email = `patient.${i}@gmail.com`;
        const bg = getRandomElement(BLOOD_GROUPS);
        const addr = `${getRandomInt(10, 9999)} Oak Ave, ${getRandomElement(CITIES)}`;
        const sym = getRandomElement(SYMPTOMS);
        const priority = getRandomElement(PRIORITIES);
        const status = getRandomElement(PATIENT_STATUSES);
        const token = getRandomInt(100, 999);
        const pos = getRandomInt(0, 50);
        const wait = pos * 10;
        content += `"${pid}","${name}",${age},"${gender}","${phone}","${email}","${bg}","${addr}","${sym}","${priority}","${status}",${token},${pos},${wait}\n`;
    }
    fs.writeFileSync(file, content);
    console.log(`Generated ${file} (1000 records)`);
}

function generateAppointments() {
    const file = path.join(DATASETS_DIR, "appointments.csv");
    let content = "patientIndex,doctorIndex,appointmentDate,status\n";
    for (let i = 1; i <= 5000; i++) {
        const p_idx = getRandomInt(1, 1000);
        const d_idx = getRandomInt(1, 100);
        const status = getRandomElement(APPT_STATUSES);
        const date = new Date();
        date.setDate(date.getDate() + getRandomInt(-30, 30));
        date.setHours(getRandomInt(9, 17), getRandomElement([0, 15, 30, 45]), 0, 0);
        content += `"PAT-SYN-${String(p_idx).padStart(4, "0")}","doctor.${d_idx}@queuecure.com","${date.toISOString()}","${status}"\n`;
    }
    fs.writeFileSync(file, content);
    console.log(`Generated ${file} (5000 records)`);
}

function generateQueues() {
    const file = path.join(DATASETS_DIR, "queue.csv");
    let content = "tokenNumber,patientIndex,status,queuePosition,estimatedWaitTime\n";
    for (let i = 1; i <= 2000; i++) {
        const p_idx = getRandomInt(1, 1000);
        const status = getRandomElement(QUEUE_STATUSES);
        const pos = status === "WAITING" ? getRandomInt(1, 50) : 0;
        const wait = pos * 10;
        content += `${i},"PAT-SYN-${String(p_idx).padStart(4, "0")}","${status}",${pos},${wait}\n`;
    }
    fs.writeFileSync(file, content);
    console.log(`Generated ${file} (2000 records)`);
}

console.log("📊 Starting Node.js Synthetic Dataset Generation...");
generateHospitals();
generateDoctors();
generatePatients();
generateAppointments();
generateQueues();
console.log("⭐ Synthetic Datasets generation completed successfully!");
