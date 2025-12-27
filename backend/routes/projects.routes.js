import express from "express";
import db from "../db.js";

const router = express.Router();

/* =====================================================
   GET /api/projects
   Landing Page – Project Cards
===================================================== */
router.get("/", async (req, res) => {
  const { rows } = await db.query(`
    SELECT
      p.*,
      (
        SELECT image_path
        FROM project_media
        WHERE project_id = p.id
        ORDER BY is_primary DESC, created_at ASC
        LIMIT 1
      ) AS cover_image
    FROM projects p
    ORDER BY created_at DESC
  `);

  res.json(rows);
});

/* =====================================================
   GET /api/projects/:id
   Modal View – Full Project
===================================================== */
router.get("/:id", async (req, res) => {
  const { rows } = await db.query(
    `
    SELECT
      p.*,
      ARRAY(
        SELECT image_path
        FROM project_media
        WHERE project_id = p.id
        ORDER BY created_at ASC
      ) AS images
    FROM projects p
    WHERE p.id=$1
    `,
    [req.params.id]
  );

  res.json(rows[0]);
});

export default router;
