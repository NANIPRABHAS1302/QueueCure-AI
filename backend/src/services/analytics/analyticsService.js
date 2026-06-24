import Patient from "../../models/Patient.js";
import Queue from "../../models/Queue.js";
import Doctor from "../../models/Doctor.js";
import Appointment from "../../models/Appointment.js";

// Get Dashboard Metrics
export const getDashboardMetrics = async () => {
    const totalPatients = await Patient.countDocuments();
    const waitingPatients = await Patient.countDocuments({ status: "WAITING" });
    const activeQueue = await Queue.countDocuments({ status: "WAITING" });
    const consultingPatients = await Queue.countDocuments({ status: "CONSULTING" });
    const completedConsultations = await Queue.countDocuments({ status: "COMPLETED" });
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    return {
        totalPatients,
        waitingPatients,
        activeQueue,
        consultingPatients,
        completedConsultations,
        totalDoctors,
        totalAppointments
    };
};

// Get Queue Statistics
export const getQueueStats = async () => {
    // Average wait time
    const avgWaitResult = await Queue.aggregate([
        { $match: { status: "WAITING" } },
        { $group: { _id: null, avgWaitTime: { $avg: "$estimatedWaitTime" } } }
    ]);
    const avgWaitTime = avgWaitResult.length > 0 ? Math.round(avgWaitResult[0].avgWaitTime) : 0;

    // Distribution by priority
    const priorityStats = await Patient.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    // Queue status distribution
    const statusStats = await Queue.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    return {
        avgWaitTime,
        priorityStats: priorityStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {}),
        statusStats: statusStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {})
    };
};

// Get Daily Reports (registrations/appointments in the last 7 days)
export const getDailyReports = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRegistrations = await Patient.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const dailyAppointments = await Appointment.aggregate([
        { $match: { appointmentDate: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return {
        dailyRegistrations,
        dailyAppointments
    };
};

// Get Doctor Performance Metrics
export const getDoctorPerformance = async () => {
    const doctorStats = await Appointment.aggregate([
        {
            $group: {
                _id: "$doctor",
                totalAppointments: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
                },
                cancelled: {
                    $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] }
                }
            }
        }
    ]);

    const populatedStats = await Doctor.populate(doctorStats, {
        path: "_id",
        select: "fullName specialization"
    });

    return populatedStats.map(stat => ({
        doctorId: stat._id?._id || null,
        doctorName: stat._id?.fullName || "Unknown Doctor",
        specialization: stat._id?.specialization || "General Medicine",
        totalAppointments: stat.totalAppointments,
        completedAppointments: stat.completed,
        cancelledAppointments: stat.cancelled,
        completionRate: stat.totalAppointments > 0 ? Math.round((stat.completed / stat.totalAppointments) * 100) : 0
    }));
};

// Get Patient Demographics/Statistics
export const getPatientStats = async () => {
    const genderStats = await Patient.aggregate([
        { $group: { _id: "$gender", count: { $sum: 1 } } }
    ]);

    const ageStats = await Patient.aggregate([
        {
            $bucket: {
                groupBy: "$age",
                boundaries: [0, 18, 35, 50, 65, 120],
                default: "Other",
                output: { count: { $sum: 1 } }
            }
        }
    ]);

    const bloodGroupStats = await Patient.aggregate([
        { $match: { bloodGroup: { $ne: "" } } },
        { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
    ]);

    return {
        genderStats: genderStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {}),
        ageStats,
        bloodGroupStats: bloodGroupStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {})
    };
};
