import Queue from "../../models/Queue.js";
import { getIO } from "../../socket/socketServer.js";
import { sendTokenCallAlert } from "../notification/smsService.js";
import { sendTokenCallEmail } from "../notification/emailService.js";
import Doctor from "../../models/Doctor.js";

export const callNextToken = async () => {

    // Find first waiting patient and populate details
    const currentPatient = await Queue.findOne({
        status: "WAITING"
    }).sort({
        tokenNumber: 1
    }).populate("patient");

    if (!currentPatient) {
        throw new Error("No Patients In Queue");
    }

    // Update status
    currentPatient.status = "CONSULTING";
    await currentPatient.save();

    // Update patient status in collection
    if (currentPatient.patient) {
        currentPatient.patient.status = "CONSULTING";
        currentPatient.patient.queuePosition = 0;
        currentPatient.patient.estimatedWaitTime = 0;
        await currentPatient.patient.save();
    }

    // Find a doctor (just use the one assigned to the patient, or a fallback doctor name)
    let doctorName = "General Doctor";
    if (currentPatient.patient && currentPatient.patient.assignedDoctor) {
        const doc = await Doctor.findById(currentPatient.patient.assignedDoctor);
        if (doc) doctorName = doc.fullName;
    }

    // 1. Send SMS and Email Alerts
    if (currentPatient.patient) {
        const patientObj = currentPatient.patient;
        if (patientObj.phone) {
            await sendTokenCallAlert(patientObj.phone, currentPatient.tokenNumber, doctorName);
        }
        if (patientObj.email) {
            await sendTokenCallEmail(patientObj.email, patientObj.fullName, currentPatient.tokenNumber, doctorName);
        }
    }

    // 2. Emit Socket Events
    try {
        const io = getIO();

        // Emit currentTokenUpdated
        io.emit("currentTokenUpdated", {
            tokenNumber: currentPatient.tokenNumber,
            patientId: currentPatient.patient?._id,
            status: currentPatient.status
        });

        // Emit tokenCalled event
        io.emit("tokenCalled", {
            tokenNumber: currentPatient.tokenNumber,
            patientId: currentPatient.patient?._id,
            doctorName
        });

        // Emit general queueUpdated
        io.emit("queueUpdated");

    } catch (error) {
        console.log("Socket Event Error:", error.message);
    }

    return currentPatient;

};