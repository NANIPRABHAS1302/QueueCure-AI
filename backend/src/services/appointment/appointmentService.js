import Appointment from "../../models/Appointment.js";
import Patient from "../../models/Patient.js";
import Doctor from "../../models/Doctor.js";
import { getIO } from "../../socket/socketServer.js";
import { sendAppointmentReminderAlert } from "../notification/smsService.js";
import { sendAppointmentEmail } from "../notification/emailService.js";

export const createAppointment = async (data) => {
    const appointment = await Appointment.create(data);

    // Fetch details for notifications and socket events
    const patientObj = await Patient.findById(data.patient);
    const doctorObj = await Doctor.findById(data.doctor);

    if (patientObj && doctorObj) {
        // Send SMS & Email confirmation
        if (patientObj.phone) {
            await sendAppointmentReminderAlert(patientObj.phone, data.appointmentDate, doctorObj.fullName);
        }
        if (patientObj.email) {
            await sendAppointmentEmail(patientObj.email, patientObj.fullName, data.appointmentDate, doctorObj.fullName, "CONFIRMED");
        }

        // Emit Socket Event
        try {
            const io = getIO();
            io.emit("appointmentCreated", {
                appointmentId: appointment._id,
                patientId: patientObj._id,
                patientName: patientObj.fullName,
                doctorName: doctorObj.fullName,
                appointmentDate: data.appointmentDate
            });
        } catch (error) {
            console.log("Socket connection in appointmentService bypassed:", error.message);
        }
    }

    return appointment;
};

export const getAllAppointments = async () => {
    return await Appointment
        .find()
        .populate("patient")
        .populate("doctor")
        .sort({ createdAt: -1 });
};

export const getAppointmentById = async (id) => {
    return await Appointment
        .findById(id)
        .populate("patient")
        .populate("doctor");
};

export const updateAppointment = async (id, data) => {
    return await Appointment.findByIdAndUpdate(
        id,
        data,
        { new: true }
    );
};

export const deleteAppointment = async (id) => {
    return await Appointment.findByIdAndDelete(id);
};