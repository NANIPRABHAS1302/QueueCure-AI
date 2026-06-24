import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth/authRoutes.js";
import queueRoutes from "./routes/queue/queueRoutes.js";
import patientRoutes from "./routes/patient/patientRoutes.js";
const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/patients",patientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/queue", queueRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        project: "QueueCure-AI",
        status: "Backend Running Successfully 🚀"
    });
});

export default app;