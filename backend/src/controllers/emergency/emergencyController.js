import * as emergencyService from "../../services/emergency/emergencyService.js";

export const fastTrack = async (req, res) => {
    try {
        const { patientId } = req.body;
        if (!patientId) {
            return res.status(400).json({ success: false, message: "patientId is required" });
        }

        const result = await emergencyService.fastTrackPatient(patientId);
        res.status(200).json({
            success: true,
            message: "Patient fast-tracked to the top of the queue successfully",
            ...result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCritical = async (req, res) => {
    try {
        const criticalPatients = await emergencyService.getCriticalPatients();
        res.json({ success: true, count: criticalPatients.length, criticalPatients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
