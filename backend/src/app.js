import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import appointmentRoutes from "./routes/appointment/appointmentRoutes.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth/authRoutes.js";
import queueRoutes from "./routes/queue/queueRoutes.js";
import doctorRoutes from "./routes/doctor/doctorRoutes.js";
import patientRoutes from "./routes/patient/patientRoutes.js";
import receptionistRoutes from "./routes/receptionist/receptionistRoutes.js";
import hospitalRoutes from "./routes/hospital/hospitalRoutes.js";

// Import New Modules
import analyticsRoutes from "./routes/analytics/analyticsRoutes.js";
import notificationRoutes from "./routes/notification/notificationRoutes.js";
import emergencyRoutes from "./routes/emergency/emergencyRoutes.js";
import chatbotRoutes from "./routes/chatbot/chatbotRoutes.js";
import adminRoutes from "./routes/admin/adminRoutes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Working Routes
app.use("/api/patients", patientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/receptionist", receptionistRoutes);

// Register New Modules
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        project: "QueueCure-AI",
        status: "Backend Running Successfully 🚀"
    });
});

export default app;