import pool from "../db.js";

async function createInquiry(data) {
  const query = `
    INSERT INTO sponsorship_inquiries
    (name, organization, phone, email, message)
    VALUES ($1, $2, $3, $4, $5)
  `;
  await pool.query(query, [
    data.name,
    data.organization || null,
    data.phone || null,
    data.email,
    data.message
  ]);
}

async function getAllInquiries() {
  const { rows } = await pool.query(`
    SELECT *
    FROM sponsorship_inquiries
    WHERE is_deleted = FALSE
    ORDER BY created_at DESC
  `);
  return rows;
}

async function softDeleteInquiry(id) {
  await pool.query(
    "UPDATE sponsorship_inquiries SET is_deleted = TRUE WHERE id = $1",
    [id]
  );
}

/* ===== ESM EXPORT ===== */
export default {
  createInquiry,
  getAllInquiries,
  softDeleteInquiry
};
