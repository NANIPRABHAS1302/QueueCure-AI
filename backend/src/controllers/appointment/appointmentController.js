import * as appointmentService from "../../services/appointment/appointmentService.js";

export const createAppointment = async (req, res) => {
    try {

        const appointment =
            await appointmentService.createAppointment(req.body);

        res.status(201).json({
            success: true,
            appointment
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

export const getAppointments = async (req, res) => {
    try {

        const appointments =
            await appointmentService.getAllAppointments();

        res.json({
            success: true,
            appointments
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getAppointment = async (req, res) => {
    try {

        const appointment =
            await appointmentService.getAppointmentById(
                req.params.id
            );

        res.json({
            success: true,
            appointment
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const updateAppointment = async (req, res) => {
    try {

        const appointment =
            await appointmentService.updateAppointment(
                req.params.id,
                req.body
            );

        res.json({
            success: true,
            appointment
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const deleteAppointment = async (req, res) => {
    try {

        await appointmentService.deleteAppointment(
            req.params.id
        );

        res.json({
            success: true,
            message: "Appointment Deleted"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};