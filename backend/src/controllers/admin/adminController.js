import * as adminService from "../../services/admin/adminService.js";

export const getMetrics = async (req, res) => {
    try {
        const metrics = await adminService.getSystemMetrics();
        res.json({ success: true, metrics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await adminService.getAllUsers();
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ success: false, message: "role is required" });
        }

        const user = await adminService.updateUserRole(id, role);
        res.json({ success: true, message: "User role updated successfully", user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await adminService.toggleUserStatus(id);
        res.json({ success: true, message: "User status toggled successfully", ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeUser = async (req, res) => {
    try {
        const { id } = req.params;
        await adminService.deleteUser(id);
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
