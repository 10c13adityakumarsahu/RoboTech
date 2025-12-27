import pool from "../db.js";

export const logAdminEvent = async ({
  eventType,
  adminId = null,
  email = null,
  req,
  success,
  reason = null,
}) => {
  try {
    await pool.query(
      `INSERT INTO admin_audit_logs
       (event_type, admin_id, email, ip_address, user_agent, success, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        eventType,
        adminId,
        email,
        req.ip,
        req.headers["user-agent"],
        success,
        reason,
      ]
    );
  } catch (err) {
    // Audit logging must NEVER break auth flow
    console.error("Audit log failed:", err.message);
  }
};
