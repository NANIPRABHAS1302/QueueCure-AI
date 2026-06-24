import express from "express";

import {
    createDoctor,
    getDoctors,
    getDoctor,
    updateDoctor,
    deleteDoctor
} from "../../controllers/doctor/doctorController.js";

const router = express.Router();

router.post("/", createDoctor);

router.get("/", getDoctors);

router.get("/:id", getDoctor);

router.put("/:id", updateDoctor);

router.delete("/:id", deleteDoctor);

export default router;