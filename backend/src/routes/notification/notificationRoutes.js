import express from "express";
import { sendManualAlert, sendAppointmentReminder } from "../../controllers/notification/notificationController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth protection for alerts and reminders
router.use(authMiddleware);

router.post("/alert", sendManualAlert);
router.post("/reminders", sendAppointmentReminder);

export default router;
