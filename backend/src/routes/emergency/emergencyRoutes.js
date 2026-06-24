import express from "express";
import { fastTrack, getCritical } from "../../controllers/emergency/emergencyController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth protection for emergency endpoints
router.use(authMiddleware);

router.post("/fast-track", fastTrack);
router.get("/critical", getCritical);

export default router;
