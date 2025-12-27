import db from "../db.js";
import path from "path";
import fs from "fs/promises";
import { processAndSaveImage } from "../utils/imageProcessor.js";

/* ================= CREATE PROJECT ================= */
export async function createProject(req, res) {
  const {
    title,
    description,
    project_lead,
    is_open_source,
    github_url,
    is_featured,
    display_order,
    members = [],
  } = req.body;

  const { rows } = await db.query(
    `INSERT INTO projects
     (title, description, project_lead, is_open_source, github_url, is_featured, display_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      title,
      description,
      project_lead,
      is_open_source,
      github_url,
      is_featured,
      display_order || 0,
    ]
  );

  const project = rows[0];

  /* Members */
  for (const name of members) {
    await db.query(
      `INSERT INTO project_members (project_id, member_name)
       VALUES ($1,$2)`,
      [project.id, name]
    );
  }

  res.json(project);
}

/* ================= UPLOAD PROJECT IMAGE ================= */
export async function uploadProjectImage(req, res) {
  const { projectId } = req.params;
  const { is_cover = false, display_order = 0 } = req.body;

  if (!req.file) return res.status(400).json({ message: "No image provided" });

  const filename = await processAndSaveImage({
    buffer: req.file.buffer,
    outputDir: "uploads/projects",
    filenameBase: `${projectId}-${Date.now()}`,
    width: 1400,
    quality: 80,
  });

  await db.query(
    `INSERT INTO project_media
     (project_id, media_path, is_cover, display_order)
     VALUES ($1,$2,$3,$4)`,
    [projectId, filename, is_cover, display_order]
  );

  res.json({ success: true });
}

/* ================= DELETE PROJECT ================= */
export async function deleteProject(req, res) {
  const { id } = req.params;

  const media = await db.query(
    `SELECT media_path FROM project_media WHERE project_id=$1`,
    [id]
  );

  for (const m of media.rows) {
    await fs.unlink(path.join("uploads/projects", m.media_path)).catch(() => {});
  }

  await db.query(`DELETE FROM projects WHERE id=$1`, [id]);

  res.json({ success: true });
}
