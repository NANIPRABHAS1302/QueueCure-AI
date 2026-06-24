import express from "express";
import { createQueue } from "../../controllers/queue/queueController.js";
import { nextToken } from "../../controllers/queue/callNextController.js";
import {
    getCurrentToken,
    getWaitingQueue
} from "../../controllers/queue/dashboardController.js";
const router = express.Router();

router.post("/", createQueue);
router.post("/next",nextToken);
router.get("/current", getCurrentToken);
router.get("/waiting", getWaitingQueue);
export default router;