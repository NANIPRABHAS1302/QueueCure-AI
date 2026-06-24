import express from "express";
import {
    getMetrics,
    getQueueStatistics,
    getDailyReportsData,
    getDoctorPerformanceData,
    getPatientStatistics
} from "../../controllers/analytics/analyticsController.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import roleMiddleware from "../../middleware/roleMiddleware.js";

const router = express.Router();

// Apply auth protection for analytics endpoints
router.use(authMiddleware);

router.get("/metrics", getMetrics);
router.get("/queue-stats", getQueueStatistics);
router.get("/daily-reports", getDailyReportsData);
router.get("/doctor-performance", getDoctorPerformanceData);
router.get("/patient-stats", getPatientStatistics);

export default router;
