import * as doctorService from "../../services/doctor/doctorService.js";

export const createDoctor = async (req, res) => {
    try {

        const doctor = await doctorService.createDoctor(req.body);

        res.status(201).json({
            success: true,
            doctor
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

export const getDoctors = async (req, res) => {
    try {

        const doctors = await doctorService.getAllDoctors();

        res.json({
            success: true,
            doctors
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getDoctor = async (req, res) => {
    try {

        const doctor =
            await doctorService.getDoctorById(req.params.id);

        res.json({
            success: true,
            doctor
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const updateDoctor = async (req, res) => {
    try {

        const doctor =
            await doctorService.updateDoctor(
                req.params.id,
                req.body
            );

        res.json({
            success: true,
            doctor
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const deleteDoctor = async (req, res) => {
    try {

        await doctorService.deleteDoctor(req.params.id);

        res.json({
            success: true,
            message: "Doctor Deleted"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};