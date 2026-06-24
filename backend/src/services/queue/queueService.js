import Queue from "../../models/Queue.js";
import Patient from "../../models/Patient.js";
import { getIO } from "../../socket/socketServer.js";
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

    await Patient.findByIdAndUpdate(
        patientId,
        {
            tokenNumber,
            queuePosition,
            estimatedWaitTime,
            status: "IN_QUEUE"
        }
    );

    return queue;

};