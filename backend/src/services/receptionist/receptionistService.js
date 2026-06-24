import Patient from "../../models/Patient.js";
import Queue from "../../models/Queue.js";

export const registerPatientAndQueue = async (data) => {

    const patient = await Patient.create(data);

    const tokenNumber =
        (await Queue.countDocuments()) + 1;

    const queue = await Queue.create({
        patient: patient._id,
        tokenNumber,
        queuePosition: tokenNumber,
        estimatedWaitTime: tokenNumber * 10
    });

    return {
        patient,
        queue
    };
};