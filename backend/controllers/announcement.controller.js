import db from "../db.js";
import { sanitizeAnnouncementHtml } from "../utils/sanitizeHtml.js";


/* ------------------ CREATE DRAFT ------------------ */
export async function createAnnouncement(req, res) {
  const { title, body_html, external_link, expires_at } = req.body;

  const cleanHtml = sanitizeAnnouncementHtml(body_html);

  const { rows } = await db.query(
    `
    INSERT INTO announcements
    (title, body_html, external_link, expires_at, created_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [title, cleanHtml, external_link || null, expires_at || null, req.admin.id]
  );

  

  res.status(201).json(rows[0]);
}

/* ------------------ PUBLISH ------------------ */
export async function publishAnnouncement(req, res) {
  const { id } = req.params;

  const { rowCount, rows } = await db.query(
    `
    UPDATE announcements
    SET published_at = now()
    WHERE id = $1
      AND published_at IS NULL
      AND is_archived = false
    RETURNING *
    `,
    [id]
  );

  if (!rowCount) {
    return res.status(400).json({ message: "Cannot publish announcement" });
  }

  

  res.json(rows[0]);
}

/* ------------------ UPDATE ------------------ */
export async function updateAnnouncement(req, res) {
  const { id } = req.params;
  const { title, body_html, external_link, expires_at } = req.body;

  const cleanHtml = sanitizeAnnouncementHtml(body_html);

  const { rowCount, rows } = await db.query(
    `
    UPDATE announcements
    SET title=$1, body_html=$2, external_link=$3, expires_at=$4
    WHERE id=$5 AND is_archived=false
    RETURNING *
    `,
    [title, cleanHtml, external_link || null, expires_at || null, id]
  );

  if (!rowCount) {
    return res.status(404).json({ message: "Announcement not found" });
  }

 

  res.json(rows[0]);
}

/* ------------------ ARCHIVE ------------------ */
export async function archiveAnnouncement(req, res) {
  const { id } = req.params;

  await db.query(
    `UPDATE announcements SET is_archived=true WHERE id=$1`,
    [id]
  );

  

  res.status(204).end();
}

/* ------------------ DELETE ------------------ */
export async function deleteAnnouncement(req, res) {
  const { id } = req.params;

  await db.query(`DELETE FROM announcements WHERE id=$1`, [id]);

  

  res.status(204).end();
}


export async function uploadAnnouncementFilesHandler(req, res) {
  const { id } = req.params;

  for (const file of req.files) {
    await db.query(
      `
      INSERT INTO announcement_files
      (announcement_id, file_path, original_name, mime_type, size_bytes)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        id,
        `/media/announcements/${file.filename}`,
        file.originalname,
        file.mimetype,
        file.size
      ]
    );
  }



  res.status(201).json({ success: true });
}

/* ------------------ PUBLIC: LIST ANNOUNCEMENTS ------------------ */
export async function listPublicAnnouncements(req, res) {
  const { rows } = await db.query(
    `
    SELECT *
    FROM announcements
    WHERE published_at IS NOT NULL
      AND is_archived = false
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY published_at DESC
    `
  );

  res.json(rows);
}

/* ------------------ PUBLIC: GET SINGLE ANNOUNCEMENT ------------------ */
export async function getPublicAnnouncement(req, res) {
  const { id } = req.params;

  const { rows } = await db.query(
    `
    SELECT
      a.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', af.id,
            'original_name', af.original_name
          )
        ) FILTER (WHERE af.id IS NOT NULL),
        '[]'
      ) AS files
    FROM announcements a
    LEFT JOIN announcement_files af
      ON af.announcement_id = a.id
    WHERE a.id = $1
      AND a.published_at IS NOT NULL
      AND a.is_archived = false
      AND (a.expires_at IS NULL OR a.expires_at > now())
    GROUP BY a.id
    `,
    [id]
  );

  if (!rows.length) {
    return res.status(404).json({ message: "Announcement not found" });
  }

  res.json(rows[0]);
}
export async function listAdminAnnouncements(req, res) {
  const { rows } = await db.query(`
    SELECT *
    FROM announcements
    ORDER BY created_at DESC
  `);

  res.json(rows);
}