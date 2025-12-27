import db from "../db.js";

/* ================= PUBLIC ================= */

// Get all years
export const getTeamYears = async (_, res) => {
  const { rows } = await db.query(
    "SELECT id, label, is_active FROM team_years ORDER BY created_at DESC"
  );
  res.json(rows);
};

// Get team for a year
export const getPublicTeam = async (req, res) => {
  const { year } = req.query;

  const yearQuery = year
    ? "SELECT id FROM team_years WHERE label = $1"
    : "SELECT id FROM team_years WHERE is_active = TRUE";

  const yearRes = await db.query(yearQuery, year ? [year] : []);
  if (!yearRes.rows.length) return res.json([]);

  const yearId = yearRes.rows[0].id;

  const { rows } = await db.query(
    `
    SELECT
      m.id, m.name, m.role, m.description, m.image_path,
      m.linkedin, m.instagram, m.github,
      g.name AS team
    FROM team_members m
    JOIN team_groups g ON g.id = m.team_id
    WHERE m.year_id = $1 AND m.is_deleted = FALSE
    ORDER BY g.name, m.display_order
    `,
    [yearId]
  );

  res.json(rows);
};

/* ================= ADMIN ================= */

// Admin: get team by year
export const getAdminTeam = async (req, res) => {
  const { year } = req.query;

  const yearRes = await db.query(
    "SELECT id FROM team_years WHERE label = $1",
    [year]
  );
  if (!yearRes.rows.length) return res.json([]);

  const { rows } = await db.query(
    `
    SELECT m.*, g.name AS team
    FROM team_members m
    JOIN team_groups g ON g.id = m.team_id
    WHERE m.year_id = $1
    ORDER BY g.name, m.display_order
    `,
    [yearRes.rows[0].id]
  );

  res.json(rows);
};

// Create member
import { processTeamImage } from "../utils/processTeamImage.js";

export async function createMember(req, res) {
  let imagePath = null;

  if (req.file) {
    imagePath = await processTeamImage(req.file.buffer);
  }

  await db.query(
    `INSERT INTO team_members
     (id, name, role, description, year_id, team_id, linkedin, instagram, github, image_path)
     VALUES (gen_random_uuid(), $1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      req.body.name,
      req.body.role,
      req.body.description,
      req.body.year_id,
      req.body.team_id,
      req.body.linkedin,
      req.body.instagram,
      req.body.github,
      imagePath,
    ]
  );

  res.json({ success: true });
}

// Update member
export async function updateMember(req, res) {
  const { id } = req.params;
  const fields = [];
  const values = [];
  let i = 1;

  for (const key of [
    "name",
    "role",
    "description",
    "year_id",
    "team_id",
    "linkedin",
    "instagram",
    "github",
  ]) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = $${i++}`);
      values.push(req.body[key]);
    }
  }

  if (req.file) {
    const imagePath = await processTeamImage(req.file.buffer);
    fields.push(`image_path = $${i++}`);
    values.push(imagePath);
  }

  values.push(id);

  await db.query(
    `UPDATE team_members SET ${fields.join(", ")} WHERE id = $${i}`,
    values
  );

  res.json({ success: true });
}

export async function deleteMember(req, res) {
  const { id } = req.params;

  await db.query(
    "DELETE FROM team_members WHERE id = $1",
    [id]
  );

  res.json({ success: true });
}
