import * as analyticsService from "../../services/analytics/analyticsService.js";

export const getMetrics = async (req, res) => {
    try {
        const metrics = await analyticsService.getDashboardMetrics();
        res.json({ success: true, metrics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getQueueStatistics = async (req, res) => {
    try {
        const queueStats = await analyticsService.getQueueStats();
        res.json({ success: true, queueStats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDailyReportsData = async (req, res) => {
    try {
        const dailyReports = await analyticsService.getDailyReports();
        res.json({ success: true, dailyReports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDoctorPerformanceData = async (req, res) => {
    try {
        const doctorPerformance = await analyticsService.getDoctorPerformance();
        res.json({ success: true, doctorPerformance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPatientStatistics = async (req, res) => {
    try {
        const patientStats = await analyticsService.getPatientStats();
        res.json({ success: true, patientStats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
