import * as hospitalService from "../../services/hospital/hospitalService.js";

export const createHospital = async (req, res) => {
    try {
        const hospital =
            await hospitalService.createHospital(req.body);

        res.status(201).json({
            success: true,
            hospital
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

export const getHospitals = async (req, res) => {
    try {

        const hospitals =
            await hospitalService.getAllHospitals();

        res.json({
            success: true,
            hospitals
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getHospital = async (req, res) => {
    try {

        const hospital =
            await hospitalService.getHospitalById(req.params.id);

        res.json({
            success: true,
            hospital
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const updateHospital = async (req, res) => {
    try {

        const hospital =
            await hospitalService.updateHospital(
                req.params.id,
                req.body
            );

        res.json({
            success: true,
            hospital
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const deleteHospital = async (req, res) => {
    try {

        await hospitalService.deleteHospital(req.params.id);

        res.json({
            success: true,
            message: "Hospital Deleted"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};