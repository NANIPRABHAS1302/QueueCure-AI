import fs from "fs";
import path from "path";
import Doctor from "../../models/Doctor.js";
import Hospital from "../../models/Hospital.js";
import Patient from "../../models/Patient.js";
import Appointment from "../../models/Appointment.js";
import Queue from "../../models/Queue.js";
import User from "../../models/user.js";
import bcrypt from "bcryptjs";

const DATASETS_DIR = path.resolve("C:/Queuecure-AI/datasets");

// Helper: Ensure directory exists
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Data lists for synthetic generation
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
const getRandomPhone = () => `+1-${getRandomInt(200, 999)}-${getRandomInt(200, 999)}-${getRandomInt(1000, 9999)}`;

export const generateAndSeed = async () => {
    try {
        ensureDirectoryExists(DATASETS_DIR);

        console.log("🚀 Starting database seeding check...");

        // Ensure at least one default Admin user exists
        const adminCount = await User.countDocuments({ role: "ADMIN" });
        if (adminCount === 0) {
            const adminPass = await bcrypt.hash("admin123", 10);
            await User.create({
                fullName: "System Admin",
                email: "admin@queuecure.com",
                phone: "+1-800-555-0199",
                password: adminPass,
                role: "ADMIN",
                isVerified: true
            });
            console.log("✅ Default Admin created: admin@queuecure.com / admin123");
        }

        // 1. HOSPITAL SEEDING & CSV
        let hospitals = await Hospital.find();
        if (hospitals.length === 0) {
            console.log("🏥 Seeding 25 hospitals...");
            const hospitalList = [];
            let csvContent = "hospitalName,address,city,state,contactNumber,email\n";

            for (let i = 1; i <= 25; i++) {
                const hospitalName = `General Hospital Clinic ${i}`;
                const address = `${getRandomInt(100, 999)} Main St`;
                const cityIdx = getRandomInt(0, CITIES.length - 1);
                const city = CITIES[cityIdx];
                const state = STATES[cityIdx];
                const contactNumber = getRandomPhone();
                const email = `contact@hospital${i}.com`;

                hospitalList.push({ hospitalName, address, city, state, contactNumber, email });
                csvContent += `"${hospitalName}","${address}","${city}","${state}","${contactNumber}","${email}"\n`;
            }

            hospitals = await Hospital.insertMany(hospitalList);
            fs.writeFileSync(path.join(DATASETS_DIR, "hospitals.csv"), csvContent);
            console.log("✅ Seeding & CSV created for Hospitals (25 records)");
        }

        // 2. DOCTOR SEEDING & CSV
        let doctors = await Doctor.find();
        if (doctors.length === 0) {
            console.log("👨‍⚕️ Seeding 100 doctors...");
            const doctorList = [];
            let csvContent = "fullName,specialization,phone,email,experience,isAvailable\n";

            for (let i = 1; i <= 100; i++) {
                const fullName = `Dr. ${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
                const specialization = getRandomElement(SPECIALTIES);
                const phone = `+1-800-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`;
                const email = `doctor.${i}@queuecure.com`;
                const experience = getRandomInt(2, 35);
                const isAvailable = Math.random() > 0.1; // 90% available

                doctorList.push({ fullName, specialization, phone, email, experience, isAvailable });
                csvContent += `"${fullName}","${specialization}","${phone}","${email}",${experience},${isAvailable}\n`;
            }

            doctors = await Doctor.insertMany(doctorList);
            fs.writeFileSync(path.join(DATASETS_DIR, "doctors.csv"), csvContent);
            console.log("✅ Seeding & CSV created for Doctors (100 records)");
        }

        // 3. PATIENT SEEDING & CSV
        let patients = await Patient.find();
        if (patients.length === 0) {
            console.log("🤒 Seeding 1000 patients...");
            const patientList = [];
            let csvContent = "patientId,fullName,age,gender,phone,email,bloodGroup,address,symptoms,priority,status,tokenNumber,queuePosition,estimatedWaitTime,assignedDoctor\n";

            for (let i = 1; i <= 1000; i++) {
                const patientId = `PAT-SYN-${String(i).padStart(4, "0")}`;
                const fullName = `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
                const age = getRandomInt(1, 95);
                const gender = getRandomElement(["Male", "Female", "Other"]);
                const phone = `+1-900-${getRandomInt(100, 999)}-${String(i).padStart(4, "0")}`;
                const email = `patient.${i}@gmail.com`;
                const bloodGroup = getRandomElement(BLOOD_GROUPS);
                const address = `${getRandomInt(10, 9999)} Oak Ave, ${getRandomElement(CITIES)}`;
                const symptoms = getRandomElement(SYMPTOMS);
                const priority = getRandomElement(PRIORITIES);
                const status = getRandomElement(PATIENT_STATUSES);
                const tokenNumber = getRandomInt(0, 500);
                const queuePosition = getRandomInt(0, 50);
                const estimatedWaitTime = queuePosition * 10;
                const assignedDoctor = getRandomElement(doctors)._id;

                patientList.push({
                    patientId,
                    fullName,
                    age,
                    gender,
                    phone,
                    email,
                    bloodGroup,
                    address,
                    symptoms,
                    priority,
                    status,
                    tokenNumber,
                    queuePosition,
                    estimatedWaitTime,
                    assignedDoctor
                });

                csvContent += `"${patientId}","${fullName}",${age},"${gender}","${phone}","${email}","${bloodGroup}","${address}","${symptoms}","${priority}","${status}",${tokenNumber},${queuePosition},${estimatedWaitTime},"${assignedDoctor}"\n`;
            }

            patients = await Patient.insertMany(patientList);
            fs.writeFileSync(path.join(DATASETS_DIR, "patients.csv"), csvContent);
            console.log("✅ Seeding & CSV created for Patients (1000 records)");
        }

        // 4. APPOINTMENT SEEDING & CSV
        let appointments = await Appointment.find();
        if (appointments.length === 0) {
            console.log("📅 Seeding 5000 appointments...");
            const appointmentList = [];
            let csvContent = "patient,doctor,appointmentDate,status\n";

            for (let i = 1; i <= 5000; i++) {
                const patientObj = getRandomElement(patients);
                const doctorObj = getRandomElement(doctors);
                const status = getRandomElement(APPT_STATUSES);

                // Date in last 30 days or next 30 days
                const appointmentDate = new Date();
                appointmentDate.setDate(appointmentDate.getDate() + getRandomInt(-30, 30));
                appointmentDate.setHours(getRandomInt(9, 17), getRandomElement([0, 15, 30, 45]), 0, 0);

                appointmentList.push({
                    patient: patientObj._id,
                    doctor: doctorObj._id,
                    appointmentDate,
                    status
                });

                csvContent += `"${patientObj._id}","${doctorObj._id}","${appointmentDate.toISOString()}","${status}"\n`;
            }

            // Write chunked to avoid memory load during massive insert
            const CHUNK_SIZE = 1000;
            for (let c = 0; c < appointmentList.length; c += CHUNK_SIZE) {
                const chunk = appointmentList.slice(c, c + CHUNK_SIZE);
                await Appointment.insertMany(chunk);
            }

            fs.writeFileSync(path.join(DATASETS_DIR, "appointments.csv"), csvContent);
            console.log("✅ Seeding & CSV created for Appointments (5000 records)");
        }

        // 5. QUEUE SEEDING & CSV
        let queues = await Queue.find();
        if (queues.length === 0) {
            console.log("🚶 Seeding 2000 queue records...");
            const queueList = [];
            let csvContent = "tokenNumber,patient,status,queuePosition,estimatedWaitTime\n";

            for (let i = 1; i <= 2000; i++) {
                const patientObj = getRandomElement(patients);
                const status = getRandomElement(QUEUE_STATUSES);
                const queuePosition = status === "WAITING" ? getRandomInt(1, 100) : 0;
                const estimatedWaitTime = queuePosition * 10;

                queueList.push({
                    tokenNumber: i,
                    patient: patientObj._id,
                    status,
                    queuePosition,
                    estimatedWaitTime
                });

                csvContent += `${i},"${patientObj._id}","${status}",${queuePosition},${estimatedWaitTime}\n`;
            }

            // Chunked insert
            const CHUNK_SIZE = 1000;
            for (let c = 0; c < queueList.length; c += CHUNK_SIZE) {
                const chunk = queueList.slice(c, c + CHUNK_SIZE);
                await Queue.insertMany(chunk);
            }

            fs.writeFileSync(path.join(DATASETS_DIR, "queue.csv"), csvContent);
            console.log("✅ Seeding & CSV created for Queues (2000 records)");
        }

        console.log("⭐ Database Seeding and CSV files generation completely done!");
    } catch (error) {
        console.error("❌ Seeding & CSV generation error:", error.message);
    }
};
