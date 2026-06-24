import Queue from "../../models/Queue.js";
import Patient from "../../models/Patient.js";
import { getIO } from "../../socket/socketServer.js";
import { sendQueueKioskAlert } from "../notification/smsService.js";
import { sendQueueTokenEmail } from "../notification/emailService.js";

export const addToQueue = async (patientId) => {

    const totalPatients = await Queue.countDocuments();

    const tokenNumber = totalPatients + 1;

    const queuePosition = totalPatients + 1;

    const estimatedWaitTime = queuePosition * 10;

    const queue = await Queue.create({

        tokenNumber,

        patient: patientId,

        queuePosition,

        estimatedWaitTime

    });

    const patient = await Patient.findByIdAndUpdate(
        patientId,
        {
            tokenNumber,
            queuePosition,
            estimatedWaitTime,
            status: "IN_QUEUE"
        },
        { new: true }
    );

    // 1. Send SMS and Email Alerts
    if (patient) {
        if (patient.phone) {
            await sendQueueKioskAlert(patient.phone, tokenNumber, queuePosition, estimatedWaitTime);
        }
        if (patient.email) {
            await sendQueueTokenEmail(patient.email, patient.fullName, tokenNumber, queuePosition, estimatedWaitTime);
        }
    }

    // 2. Emit Socket Events
    try {
        const io = getIO();
        io.emit("queueUpdated");
        io.emit("patientRegistered", {
            tokenNumber,
            patientId,
            queuePosition,
            fullName: patient?.fullName
        });
    } catch (error) {
        console.log("Socket connection in queueService bypassed:", error.message);
    }

    return queue;

};