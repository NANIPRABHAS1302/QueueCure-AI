import os from "os";
import mongoose from "mongoose";
import User from "../../models/user.js";

// Retrieve system diagnostics and database counters
export const getSystemMetrics = async () => {
    // 1. Gather OS Level Telemetry
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg()[0]; // 1 min load average
    const systemUptime = os.uptime();

    // 2. Fetch Mongoose/Database Stats
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    const dbName = mongoose.connection.name || "queuecure";

    // 3. Count documents in collections
    const collections = mongoose.connection.collections;
    const dbCounters = {};

    for (const key in collections) {
        try {
            dbCounters[key] = await collections[key].countDocuments();
        } catch (e) {
            dbCounters[key] = 0;
        }
    }

    return {
        telemetry: {
            cpuLoad: parseFloat(cpuLoad.toFixed(2)),
            totalMemoryGB: parseFloat((totalMem / (1024 * 1024 * 1024)).toFixed(2)),
            usedMemoryGB: parseFloat((usedMem / (1024 * 1024 * 1024)).toFixed(2)),
            freeMemoryGB: parseFloat((freeMem / (1024 * 1024 * 1024)).toFixed(2)),
            memoryUsagePercent: parseFloat(((usedMem / totalMem) * 100).toFixed(1)),
            uptimeSeconds: systemUptime
        },
        database: {
            status: dbStatus,
            name: dbName,
            counters: dbCounters
        }
    };
};

// Retrieve all system users
export const getAllUsers = async () => {
    return await User.find().select("-password").sort({ createdAt: -1 });
};

// Change user role
export const updateUserRole = async (userId, role) => {
    if (!["ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"].includes(role)) {
        throw new Error("Invalid user role specified");
    }
    return await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
};

// Toggle active status
export const toggleUserStatus = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    user.isActive = !user.isActive;
    await user.save();
    return { id: user._id, fullName: user.fullName, isActive: user.isActive };
};

// Delete user
export const deleteUser = async (userId) => {
    return await User.findByIdAndDelete(userId);
};
