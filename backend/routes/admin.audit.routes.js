import express from "express";
import { protectAdmin } from "../middleware/auth.middleware.js";
import { getAdminAuditLogs } from "../controllers/audit.controller.js";

const router = express.Router();

/**
 * GET /api/admin/audit-logs
 * Read-only audit logs (paginated)
 */
router.get("/audit-logs", protectAdmin, getAdminAuditLogs);

export default router;
