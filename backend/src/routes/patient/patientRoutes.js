import express from "express";

import {

createPatient,

getPatients,

getPatient,

updatePatient,

deletePatient

}

from "../../controllers/patient/patientController.js";

const router = express.Router();

router.post("/",createPatient);

router.get("/",getPatients);

router.get("/:id",getPatient);

router.put("/:id",updatePatient);

router.delete("/:id",deletePatient);

export default router;