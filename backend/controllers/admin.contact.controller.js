import pool from "../db.js";

/**
 * GET /api/admin/contactMessages
 * Server-side pagination + filtering
 */
export async function getContactMessages(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      isRead,
      isReplied,
      email,
      subject,
      fromDate,
      toDate,
    } = req.query;

    const filters = [];
    const values = [];
    let idx = 1;

    if (isRead !== undefined) {
      filters.push(`is_read = $${idx++}`);
      values.push(isRead === "true");
    }

    if (isReplied !== undefined) {
      filters.push(`is_replied = $${idx++}`);
      values.push(isReplied === "true");
    }

    if (email) {
      filters.push(`email ILIKE $${idx++}`);
      values.push(`%${email}%`);
    }

    if (subject) {
      filters.push(`subject ILIKE $${idx++}`);
      values.push(`%${subject}%`);
    }

    if (fromDate) {
      filters.push(`created_at >= $${idx++}`);
      values.push(fromDate);
    }

    if (toDate) {
      filters.push(`created_at <= $${idx++}`);
      values.push(toDate);
    }

    const whereClause = filters.length
      ? `WHERE ${filters.join(" AND ")}`
      : "";

    const offset = (page - 1) * limit;

    const dataQuery = `
      SELECT *
      FROM contact_messages
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${idx++}
      OFFSET $${idx++}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM contact_messages ${whereClause}
    `;

    const messagesResult = await pool.query(dataQuery, [
      ...values,
      limit,
      offset,
    ]);

    const countResult = await pool.query(countQuery, values);

    res.json({
      messages: messagesResult.rows,
      total: Number(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error("Get contact messages error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

/**
 * PATCH /api/admin/contactMessages/:id/read
 */
export async function markRead(req, res) {
  await pool.query(
    `UPDATE contact_messages SET is_read = true WHERE id = $1`,
    [req.params.id]
  );
  res.json({ success: true });
}

/**
 * PATCH /api/admin/contactMessages/:id/replied
 * (Kept for compatibility, but OPTIONAL in your workflow)
 */
export async function markReplied(req, res) {
  await pool.query(
    `UPDATE contact_messages SET is_replied = true WHERE id = $1`,
    [req.params.id]
  );
  res.json({ success: true });
}

/**
 * DELETE /api/admin/contactMessages/:id
 * Hard delete after reply (with frontend confirmation)
 */
export async function deleteMessage(req, res) {
  await pool.query(
    `DELETE FROM contact_messages WHERE id = $1`,
    [req.params.id]
  );
  res.json({ success: true });
}
