import * as receptionistService from "../../services/receptionist/receptionistService.js";

export const registerPatient = async (req, res) => {
    try {

        const result =
            await receptionistService.registerPatientAndQueue(req.body);

        res.status(201).json({
            success: true,
            ...result
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};