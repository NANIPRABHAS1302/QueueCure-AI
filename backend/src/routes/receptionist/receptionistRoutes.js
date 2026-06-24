import express from "express";

import {
    registerPatient
} from "../../controllers/receptionist/receptionistController.js";

const router = express.Router();

router.post("/register", registerPatient);

export default router;