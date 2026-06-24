import Queue from "../../models/Queue.js";
import { getIO } from "../../socket/socketServer.js";

export const callNextToken = async () => {

    // Find first waiting patient
    const currentPatient = await Queue.findOne({
        status: "WAITING"
    }).sort({
        tokenNumber: 1
    });

    if (!currentPatient) {
        throw new Error("No Patients In Queue");
    }

    // Update status
    currentPatient.status = "CONSULTING";

    await currentPatient.save();

    // Emit Socket Event
    try {

        const io = getIO();

        io.emit("currentTokenUpdated", {

            tokenNumber: currentPatient.tokenNumber,

            patientId: currentPatient.patient,

            status: currentPatient.status

        });

        io.emit("queueUpdated");

    } catch (error) {

        console.log("Socket Event Error:", error.message);

    }

    return currentPatient;

};