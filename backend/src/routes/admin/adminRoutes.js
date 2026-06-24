import express from "express";
import {
    getMetrics,
    getUsers,
    updateRole,
    toggleStatus,
    removeUser
} from "../../controllers/admin/adminController.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import roleMiddleware from "../../middleware/roleMiddleware.js";

const router = express.Router();

// Route Guard: Authentication & Admin Role Required
router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

router.get("/metrics", getMetrics);
router.get("/users", getUsers);
router.put("/users/:id/role", updateRole);
router.put("/users/:id/status", toggleStatus);
router.delete("/users/:id", removeUser);

export default router;
