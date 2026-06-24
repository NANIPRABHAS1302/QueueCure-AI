import express from "express";

import {
    createHospital,
    getHospitals,
    getHospital,
    updateHospital,
    deleteHospital
} from "../../controllers/hospital/hospitalController.js";

const router = express.Router();

router.post("/", createHospital);

router.get("/", getHospitals);

router.get("/:id", getHospital);

router.put("/:id", updateHospital);

router.delete("/:id", deleteHospital);

export default router;