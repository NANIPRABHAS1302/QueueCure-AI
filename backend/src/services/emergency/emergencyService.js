import Patient from "../../models/Patient.js";
import Queue from "../../models/Queue.js";
import { getIO } from "../../socket/socketServer.js";

// Fast-track Emergency Patient
export const fastTrackPatient = async (patientId) => {
    // 1. Update Patient details
    const patient = await Patient.findById(patientId);
    if (!patient) {
        throw new Error("Patient not found");
    }

    patient.priority = "EMERGENCY";
    patient.status = "IN_QUEUE";
    await patient.save();

    // 2. See if patient is already in Queue
    let queueRecord = await Queue.findOne({ patient: patientId });

    // 3. Shift all current WAITING patients in the queue down
    // Increments queuePosition by 1 and wait times by 10 mins
    await Queue.updateMany(
        { status: "WAITING", patient: { $ne: patientId } },
        { $inc: { queuePosition: 1, estimatedWaitTime: 10 } }
    );

    // 4. Update the Patient's records in the queue to be position #1
    if (queueRecord) {
        queueRecord.status = "WAITING";
        queueRecord.queuePosition = 1;
        queueRecord.estimatedWaitTime = 0; // Immediate attention
        await queueRecord.save();
    } else {
        queueRecord = await Queue.create({
            tokenNumber: (await Queue.countDocuments()) + 1,
            patient: patientId,
            status: "WAITING",
            queuePosition: 1,
            estimatedWaitTime: 0
        });
    }

    // 5. Update patient's fields to match queue position
    patient.queuePosition = 1;
    patient.estimatedWaitTime = 0;
    patient.tokenNumber = queueRecord.tokenNumber;
    await patient.save();

    // 6. Push Socket updates
    try {
        const io = getIO();
        io.emit("queueUpdated");
        io.emit("tokenCalled", {
            tokenNumber: queueRecord.tokenNumber,
            patientId: patient._id,
            status: "EMERGENCY"
        });
    } catch (error) {
        console.log("Socket connection in Emergency service bypassed:", error.message);
    }

    return { patient, queueRecord };
};

// Retrieve all critical patients in queue
export const getCriticalPatients = async () => {
    return await Patient.find({ priority: "EMERGENCY", status: "IN_QUEUE" })
        .populate("assignedDoctor")
        .sort({ updatedAt: 1 });
};
