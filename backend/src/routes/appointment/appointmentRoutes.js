import express from "express";

import {
    createAppointment,
    getAppointments,
    getAppointment,
    updateAppointment,
    deleteAppointment
} from "../../controllers/appointment/appointmentController.js";

const router = express.Router();

router.post("/", createAppointment);

router.get("/", getAppointments);

router.get("/:id", getAppointment);

router.put("/:id", updateAppointment);

router.delete("/:id", deleteAppointment);

export default router;