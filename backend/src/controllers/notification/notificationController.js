import * as smsService from "../../services/notification/smsService.js";
import * as emailService from "../../services/notification/emailService.js";
import Appointment from "../../models/Appointment.js";

export const sendManualAlert = async (req, res) => {
    try {
        const { type, recipient, body, subject } = req.body;

        if (!recipient || !body) {
            return res.status(400).json({ success: false, message: "Recipient and message body are required" });
        }

        let result;
        if (type === "SMS") {
            result = await smsService.sendSMS(recipient, body);
        } else if (type === "EMAIL") {
            result = await emailService.sendEmail(recipient, subject || "QueueCure System Notification", `<div>${body}</div>`);
        } else {
            return res.status(400).json({ success: false, message: "Invalid type: Must be SMS or EMAIL" });
        }

        if (result.success) {
            return res.json({ success: true, message: "Manual alert sent successfully", result });
        } else {
            return res.status(500).json({ success: false, message: "Failed to send notification", error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendAppointmentReminder = async (req, res) => {
    try {
        const { id } = req.body;

        const appointment = await Appointment.findById(id).populate("patient").populate("doctor");

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        const patientName = appointment.patient?.fullName || "Patient";
        const doctorName = appointment.doctor?.fullName || "Doctor";
        const phone = appointment.patient?.phone;
        const email = appointment.patient?.email;

        let smsResult = { success: false };
        let emailResult = { success: false };

        if (phone) {
            smsResult = await smsService.sendAppointmentReminderAlert(phone, appointment.appointmentDate, doctorName);
        }
        if (email) {
            emailResult = await emailService.sendAppointmentEmail(email, patientName, appointment.appointmentDate, doctorName, "REMINDER");
        }

        res.json({
            success: true,
            message: "Reminders triggered",
            smsSent: smsResult.success,
            emailSent: emailResult.success
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
