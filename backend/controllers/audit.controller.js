import pool from "../db.js";

export const getAdminAuditLogs = async (req, res) => {
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "20");
  const offset = (page - 1) * limit;
  const eventType = req.query.eventType;

  let baseQuery = `
    SELECT
      id,
      event_type,
      email,
      ip_address,
      user_agent,
      success,
      reason,
      created_at
    FROM admin_audit_logs
  `;

  let countQuery = `
    SELECT COUNT(*) FROM admin_audit_logs
  `;

  const params = [];
  let whereClause = "";

  if (eventType) {
    whereClause = " WHERE event_type = $1";
    params.push(eventType);
  }

  const finalQuery = `
    ${baseQuery}
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const finalCountQuery = countQuery + whereClause;

  const logs = await pool.query(finalQuery, params);
  const count = await pool.query(finalCountQuery, params);

  res.json({
    data: logs.rows,
    page,
    total: parseInt(count.rows[0].count),
  });
};
