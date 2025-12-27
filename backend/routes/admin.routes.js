import express from "express";
import { getAdminAuditLogs } from "../controllers/audit.controller.js";
import { protectAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/audit-logs", protectAdmin, getAdminAuditLogs);

export default router;
